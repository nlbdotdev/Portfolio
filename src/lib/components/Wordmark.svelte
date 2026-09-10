<script lang="ts">
  import { onMount } from 'svelte';
  let dot: HTMLSpanElement;
  let rays: SVGSVGElement;
  let animations: Animation[] = [];

  function shine() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    animations.forEach((animation) => animation.cancel());
    const timing = { duration: 1500, easing: 'ease-in-out' };
    animations = [
      dot.animate(
        [
          { transform: 'rotate(0deg) scale(1)', filter: 'drop-shadow(0 0 0 transparent)' },
          { transform: 'rotate(100deg) scale(1.25)', offset: 0.22 },
          {
            transform: 'rotate(240deg) scale(1.9)',
            filter: 'drop-shadow(0 0 5px currentColor)',
            offset: 0.52,
          },
          { transform: 'rotate(360deg) scale(1.25)', offset: 0.78 },
          { transform: 'rotate(360deg) scale(1)', filter: 'drop-shadow(0 0 0 transparent)' },
        ],
        timing,
      ),
      rays.animate(
        [
          { opacity: 0, transform: 'rotate(0deg) scale(0.15)' },
          { opacity: 0, transform: 'rotate(35deg) scale(0.3)', offset: 0.12 },
          { opacity: 0.95, transform: 'rotate(140deg) scale(1)', offset: 0.4 },
          { opacity: 0.7, transform: 'rotate(275deg) scale(1.2)', offset: 0.64 },
          { opacity: 0, transform: 'rotate(360deg) scale(0.1)' },
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

<a class="wordmark" href="/" aria-label="NLB.DEV" onmouseenter={shine} onfocus={shine}>
  NLB<span class="wordmark-dot" aria-hidden="true"
    ><span class="dot-core" bind:this={dot}>.</span><svg
      bind:this={rays}
      class="dot-rays"
      viewBox="0 0 40 40"
      fill="none"
    >
      {#each Array(8) as _, i}
        <path
          d="M20 7V2"
          transform={`rotate(${i * 45} 20 20)`}
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
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
  .dot-rays {
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
</style>
