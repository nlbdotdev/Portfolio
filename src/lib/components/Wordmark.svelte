<script lang="ts">
  import { onMount } from 'svelte';
  let dot: HTMLSpanElement;
  let animations: Animation[] = [];

  function shine() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    animations.forEach((animation) => animation.cancel());
    animations = [
      dot.animate(
        [
          { transform: 'translateY(0) rotate(0deg) scale(1)', offset: 0, easing: 'ease-out' },
          {
            transform: 'translateY(2px) rotate(-10deg) scale(1.15, 0.8)',
            offset: 0.12,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          },
          {
            transform: 'translateY(-15px) rotate(45deg) scale(2.6)',
            offset: 0.4,
            easing: 'ease-in',
          },
          {
            transform: 'translateY(0) rotate(0deg) scale(1.2, 0.8)',
            offset: 0.76,
            easing: 'ease-out',
          },
          {
            transform: 'translateY(-3px) rotate(-8deg) scale(1.1)',
            offset: 0.88,
            easing: 'ease-in-out',
          },
          { transform: 'translateY(0) rotate(0deg) scale(1)', offset: 1 },
        ],
        { duration: 1050 },
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
  NLB<span class="dot-core" aria-hidden="true" bind:this={dot}>.</span>DEV
</a>

<style>
  .dot-core {
    display: inline-block;
    transform-origin: 50% 82%;
  }
</style>
