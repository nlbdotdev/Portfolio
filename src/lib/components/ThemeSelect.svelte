<script lang="ts">
  import { onMount } from 'svelte';
  type Theme = 'system' | 'light' | 'dark';
  let theme = $state<Theme>('system');
  onMount(() => {
    const saved = document.documentElement.dataset.theme;
    theme = saved === 'dark' || saved === 'light' ? saved : 'system';
  });
  function changeTheme() {
    document.documentElement.dataset.theme = theme;
    try {
      if (theme === 'system') localStorage.removeItem('portfolio-theme');
      else localStorage.setItem('portfolio-theme', theme);
    } catch {
      /* Theme still works when storage is unavailable. */
    }
  }
</script>

<label class="theme-select">
  <span class="sr-only">Color theme</span>
  <select bind:value={theme} onchange={changeTheme} aria-label="Color theme">
    <option value="system">◐ System</option>
    <option value="light">☀ Light</option>
    <option value="dark">☾ Dark</option>
  </select>
</label>
