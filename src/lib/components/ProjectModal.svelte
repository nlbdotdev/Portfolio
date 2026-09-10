<script lang="ts">
  import { onMount } from 'svelte';
  import type { Entry } from '../../../content/schema';
  import PortfolioItem from './PortfolioItem.svelte';
  let { entry, onclose }: { entry: Entry; onclose: () => void } = $props();
  let dialog: HTMLDialogElement;
  let copied = $state(false);
  let copyFailed = $state(false);
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
  async function copyLink() {
    try {
      const url = new URL(location.href);
      url.searchParams.delete('project');
      url.searchParams.set('item', entry.slug);
      await navigator.clipboard.writeText(url.href);
      copied = true;
    } catch {
      copyFailed = true;
    }
  }
</script>

<dialog
  bind:this={dialog}
  class="project-modal"
  tabindex="-1"
  aria-label={entry.title}
  oncancel={(event) => {
    event.preventDefault();
    onclose();
  }}
  onclick={(event) => {
    if (event.target === dialog) onclose();
  }}
  onkeydown={(event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onclose();
    }
  }}
>
  <div class="project-modal-inner">
    <div class="project-modal-controls">
      <button onclick={copyLink}>{copied ? 'Link copied' : 'Copy link'}</button>
      <button onclick={onclose} aria-label="Close project">Close ×</button>
    </div>
    <span class="sr-only" aria-live="polite"
      >{copied
        ? 'Project link copied'
        : copyFailed
          ? 'Copy the project URL from your address bar'
          : ''}</span
    >
    <PortfolioItem {entry} modal />
  </div>
</dialog>
