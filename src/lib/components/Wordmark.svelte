<script lang="ts">
  import { onMount } from 'svelte';
  let dot: HTMLSpanElement;
  let rays: SVGSVGElement;
  let flare: HTMLSpanElement;
  let animations: Animation[] = [];

  function shine() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    animations.forEach((animation) => animation.cancel());
    const timing = { duration: 1150, easing: 'cubic-bezier(0.2, 0.65, 0.3, 1)' };
    animations = [
      dot.animate(
        [
          { transform: 'rotate(0deg) scale(1)', filter: 'drop-shadow(0 0 0 transparent)' },
          { transform: 'rotate(-24deg) scale(0.9)', offset: 0.12 },
          {
            transform: 'rotate(12deg) scale(1.5)',
            filter: 'drop-shadow(0 0 6px currentColor)',
            offset: 0.3,
          },
          {
            transform: 'rotate(0deg) scale(1)',
            filter: 'drop-shadow(0 0 0 transparent)',
            offset: 0.65,
          },
          { transform: 'rotate(0deg) scale(1)', filter: 'drop-shadow(0 0 0 transparent)' },
        ],
        timing,
      ),
      flare.animate(
        [
          { opacity: 0, transform: 'scale(0.1)' },
          { opacity: 0, transform: 'scale(0.15)', offset: 0.12 },
          { opacity: 1, transform: 'scale(0.8)', offset: 0.25 },
          { opacity: 0.5, transform: 'scale(1.4)', offset: 0.45 },
          { opacity: 0, transform: 'scale(1.8)', offset: 0.8 },
          { opacity: 0, transform: 'scale(1.8)' },
        ],
        timing,
      ),
      rays.animate(
        [
          { opacity: 0, transform: 'rotate(-24deg) scale(0.05)' },
          { opacity: 0, transform: 'rotate(-24deg) scale(0.1)', offset: 0.14 },
          { opacity: 0.95, transform: 'rotate(-18deg) scale(0.9)', offset: 0.32 },
          { opacity: 0.7, transform: 'rotate(45deg) scale(1.15)', offset: 0.55 },
          { opacity: 0, transform: 'rotate(210deg) scale(1.65)' },
        ],
        timing,
      ),
    ];
  }

  onMount(() => {
    const timer = window.setTimeout(shine, 180);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => {
      if (motion.matches) animations.forEach((animation) => animation.cancel());
    };
    motion.addEventListener('change', stop);
    return () => {
      clearTimeout(timer);
      animations.forEach((animation) => animation.cancel());
      motion.removeEventListener('change', stop);
    };
  });
</script>

<a class="wordmark" href="#top" aria-label="NLB.DEV" onmouseenter={shine} onfocus={shine}>
  NLB<span class="wordmark-dot" aria-hidden="true"
    ><span class="dot-core" bind:this={dot}>.</span><span class="dot-flare" bind:this={flare}
    ></span><svg bind:this={rays} class="dot-rays" viewBox="0 0 40 40" fill="none">
      {#each Array(8) as _, i}
        <path
          d="M19.3 15L20 0L20.7 15Z"
          transform={`rotate(${i * 45} 20 20)`}
          fill="currentColor"
        />
      {/each}
    </svg></span
  >DEV
</a>

<style>
  .wordmark-dot {
    position: relative;
    display: inline-block;
  }
  .dot-core {
    display: inline-block;
    transform-origin: 50% 82%;
  }
  .dot-rays,
  .dot-flare {
    position: absolute;
    width: 1em;
    height: 1em;
    left: 50%;
    top: 82%;
    margin: -0.5em 0 0 -0.5em;
    opacity: 0;
    pointer-events: none;
    overflow: visible;
  }
  .dot-flare {
    background: radial-gradient(circle, #fff4d8 0%, currentColor 12%, transparent 65%);
    filter: blur(1px);
    width: 2em;
    height: 2em;
    margin: -1em 0 0 -1em;
  }
</style>
