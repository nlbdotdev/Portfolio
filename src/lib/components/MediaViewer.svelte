<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import GameplayAnimation from './GameplayAnimation.svelte';
  export type GalleryMedia = {
    src: string;
    alt: string;
    type: 'image' | 'animation' | 'video';
    poster?: string;
  };
  let {
    media,
    initial = 0,
    title,
    onclose,
  }: { media: GalleryMedia[]; initial?: number; title: string; onclose: () => void } = $props();
  let index = $state(untrack(() => initial));
  let dialog: HTMLDialogElement;
  const current = $derived(media[index]);
  function move(direction: number) {
    index = (index + direction + media.length) % media.length;
  }
  onMount(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    dialog.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  });
</script>

<dialog
  bind:this={dialog}
  class="media-viewer"
  aria-label={`${title} media`}
  tabindex="-1"
  oncancel={(event) => {
    event.preventDefault();
    event.stopPropagation();
    onclose();
  }}
  onclick={(event) => {
    event.stopPropagation();
    if (event.target === dialog) onclose();
  }}
  onkeydown={(event) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.preventDefault();
      onclose();
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    }
  }}
>
  <div class="media-viewer-inner">
    <header>
      <span>{title}</span><button onclick={onclose} aria-label="Close media viewer">Close ×</button>
    </header>
    <div class="media-stage">
      {#if media.length > 1}<button
          class="media-prev"
          onclick={() => move(-1)}
          aria-label="Previous media">←</button
        >{/if}
      {#key current.src}
        {#if current.type === 'video'}
          <iframe
            src={`${current.src}${current.src.includes('?') ? '&' : '?'}autoplay=1&mute=1`}
            title={current.alt}
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
          ></iframe>
        {:else if current.type === 'animation'}
          <GameplayAnimation src={current.src} poster={current.poster} title={current.alt} />
        {:else}<img src={current.src} alt={current.alt} />{/if}
      {/key}
      {#if media.length > 1}<button
          class="media-next"
          onclick={() => move(1)}
          aria-label="Next media">→</button
        >{/if}
    </div>
    <p class="media-caption" aria-live="polite">{current.alt} · {index + 1} / {media.length}</p>
    <nav class="media-thumbnails" aria-label="Project media">
      {#each media as item, i}<button
          class:chosen={i === index}
          aria-pressed={i === index}
          aria-label={`View ${item.alt}`}
          onclick={() => (index = i)}
        >
          {#if item.type === 'video'}<span>▶ {item.alt}</span>{:else}<img
              src={item.poster ?? item.src}
              alt=""
              loading="lazy"
            />{/if}
        </button>{/each}
    </nav>
  </div>
</dialog>
