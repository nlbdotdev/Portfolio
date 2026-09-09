<script lang="ts">
  import '../app.css';
  import { updated } from '$app/state';
  let { children } = $props();
</script>

{@render children()}

{#if updated.current}
  <div class="update-notice" role="status">
    <span>Update available</span>
    <button onclick={() => window.location.reload()}>Refresh</button>
  </div>
{/if}

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
