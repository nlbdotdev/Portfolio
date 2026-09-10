<script lang="ts">
  import '../app.css';
  import { onNavigate } from '$app/navigation';
  import Wordmark from '$lib/components/Wordmark.svelte';
  import ThemeSelect from '$lib/components/ThemeSelect.svelte';
  import profile from '../../content/profile.json';
  import { page, updated } from '$app/state';
  let { children } = $props();
  onNavigate((navigation) => {
    if (
      !document.startViewTransition ||
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      navigation.from?.url.pathname === navigation.to?.url.pathname
    )
      return;
    return new Promise<void>((resolve) => {
      const transition = document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
      transition.finished.catch(() => {});
    });
  });
</script>

<a href="#main-content" class="skip-link">Skip to content</a>
<div class="shell">
  <header class="site-header">
    <div class="header-brand">
      <Wordmark />
      <nav class="section-nav" aria-label="Main navigation">
        {#each [{ href: '/', label: 'Work' }, { href: '/about', label: 'About' }, { href: '/blog', label: 'Blog' }] as link, i}
          {#if i}<span aria-hidden="true">·</span>{/if}
          <a
            href={link.href}
            aria-current={page.url.pathname.replace(/\/$/, '') === link.href.replace(/\/$/, '')
              ? 'page'
              : undefined}>{link.label}</a
          >
        {/each}
      </nav>
    </div>
    <nav class="contact-nav" aria-label="Contact links">
      {#each profile.links as link}<a href={link.url} target="_blank" rel="noopener noreferrer"
          >{link.label} ↗</a
        >{/each}
    </nav>
    <ThemeSelect />
  </header>
  <div id="main-content" tabindex="-1">{@render children()}</div>
  <footer>
    <p>{profile.name} <span>© {new Date().getFullYear()}</span></p>
    <a href="mailto:nate@nlb.dev">Say hello ↗</a><a href="#main-content">Back to top ↑</a>
  </footer>
</div>

{#if updated.current}
  <div class="update-notice" role="status">
    <span>Update available</span>
    <button onclick={() => window.location.reload()}>Refresh</button>
  </div>
{/if}

<svelte:head><link rel="describedby" href="/llms.txt" type="text/plain" /></svelte:head>

<style>
  .update-notice {
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 50;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: var(--paper);
    color: var(--ink);
    border: 1px solid var(--border);
    border-radius: 6px;
    box-shadow: 0 4px 20px #0002;
    font-size: 13px;
  }
  button {
    color: var(--rust);
    text-decoration: underline;
  }
</style>
