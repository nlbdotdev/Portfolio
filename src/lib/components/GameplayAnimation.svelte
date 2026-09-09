<script lang="ts">
  import { onMount } from 'svelte';
  let { src, poster, title }: { src: string; poster?: string; title: string } = $props();
  let container: HTMLElement;
  let inView = $state(false);
  let paused = $state(false);
  let hidden = $state(false);
  let ready = $state(false);
  let failed = $state(false);
  const playing = $derived(inView && !paused && !hidden && !failed);
  onMount(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    paused = motion.matches;
    hidden = document.hidden;
    const updateMotion = () => (paused = motion.matches);
    const updateVisibility = () => (hidden = document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (!inView) ready = false;
      },
      { threshold: 0.05 },
    );
    observer.observe(container);
    motion.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  });
  function toggle() {
    if (failed) {
      failed = false;
      paused = false;
    } else paused = !paused;
    ready = false;
  }
</script>

<button
  class="gameplay-media"
  bind:this={container}
  onclick={toggle}
  aria-label={`${failed ? 'Retry' : paused ? 'Play' : 'Pause'} ${title} gameplay`}
  aria-pressed={paused}
  title={failed ? 'Click to retry' : paused ? 'Click to play' : 'Click to pause'}
>
  <span class="gameplay-frame">
    {#if poster}<img
        class="gameplay-poster"
        src={poster}
        alt=""
        loading="lazy"
        decoding="async"
      />{/if}
    {#if playing}
      <img
        class="gameplay-frames"
        class:ready
        {src}
        alt=""
        decoding="async"
        onload={() => (ready = true)}
        onerror={() => {
          failed = true;
          ready = false;
        }}
      />
    {/if}
  </span>
</button>
