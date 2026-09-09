<script lang="ts">
  import ThemeSelect from '$lib/components/ThemeSelect.svelte';
  import PortfolioItem from '$lib/components/PortfolioItem.svelte';
  import { entries, profile, assetUrl } from '$lib/content';
  import { tracks, yearOf, isArchive, matchesSearch, type Track } from '$lib/timeline';
  let active = $state<Track | null>(null);
  let query = $state('');
  let showArchive = $state(false);
  let expandedEntries = $state<Record<string, boolean>>(
    Object.fromEntries(entries.map((entry) => [entry.id, false])),
  );
  const anyDetailsOpen = $derived(Object.values(expandedEntries).some(Boolean));
  function toggleAllDetails() {
    const open = !anyDetailsOpen;
    expandedEntries = Object.fromEntries(
      entries.map((entry) => [
        entry.id,
        open && (entry.kind === 'game' || entry.kind === 'project'),
      ]),
    );
  }
  const featured = ['project-construct-snippets', 'project-map-builder'].map((id) =>
    entries.find((entry) => entry.id === id)!,
  );
  const studio = entries.find((entry) => entry.id === 'company-dead-traveler')!;
  const visible = $derived(
    entries.filter(
      (entry) => matchesSearch(entry, query) && (showArchive || query.trim() || !isArchive(entry)),
    ),
  );
  const hiddenCount = $derived(entries.length - visible.length);
  function follow(id: string) {
    showArchive = true;
    active = null;
    query = '';
    requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
  }
</script>

<svelte:head
  ><title>Nathan Bennett — Games, software, and things in between</title><meta
    name="description"
    content="The work, games, experiments, and detours of Nathan Bennett. A personal portfolio and living timeline."
  /></svelte:head
>
<a href="#timeline" class="skip-link">Skip to timeline</a>
<div class="shell">
  <header class="site-header">
    <a class="wordmark" href="#top">NLB<span>.</span>DEV</a>
    <nav aria-label="Main navigation">
      <a href="#timeline">Work</a><a href="#about">About</a><a href={profile.resume}>Résumé ↗</a
      >{#each profile.links as link}<a href={link.url}>{link.label} ↗</a>{/each}
    </nav>
    <ThemeSelect />
  </header>
  <main id="top">
    <section class="intro" id="about">
      <div class="intro-copy">
        <h1>Games, software,<br />and things<br />in between.</h1>
        <p class="lede">I’m Nathan.<br />Currently working full time<br />on Dead Traveler.</p>
      </div>
      <div class="studio-feature">
        <aside class="now">
          <span class="eyebrow">Now</span>
          <a href="https://deadtraveler.com">Dead Traveler ↗</a>
          <p>Independent games / In progress</p>
        </aside>
        <button
          class="studio-art"
          onclick={() => follow(studio.id)}
          aria-label="Explore Dead Traveler"
        >
          <img
            src={assetUrl(studio, studio.media.cover!)}
            alt="Blue cosmic clouds from Dead Traveler’s studio artwork"
            fetchpriority="high"
          />
          <img
            class="brand-overlay"
            src={assetUrl(studio, studio.media.icon!)}
            alt="Dead Traveler"
          />
          <span class="studio-arrow" aria-hidden="true">↗</span>
        </button>
      </div>
    </section>
    <section class="selected" aria-label="Selected work">
      <div class="feature-grid">
        {#each featured as entry}
          <button class="feature" onclick={() => follow(entry.id)}>
            <img
              class="feature-art"
              src={assetUrl(entry, entry.media.cover ?? entry.media.screenshots.desktop!)}
              alt={`${entry.title} screenshot`}
            />
            <div class="feature-caption">
              <h3>{entry.title}</h3>
              <p>Software</p>
              <p>
                {entry.id === 'project-construct-snippets'
                  ? 'Reusable building blocks.'
                  : 'Tools for fast iteration.'}
              </p>
            </div>
          </button>
        {/each}
      </div>
    </section>
    <section id="timeline" aria-labelledby="timeline-title">
      <div class="timeline-head">
        <div>
          <p class="eyebrow">The ongoing collection</p>
          <h2 id="timeline-title">Everything, over time<span>.</span></h2>
        </div>
        <button class="details-toggle" aria-controls="collection-items" onclick={toggleAllDetails}>
          {anyDetailsOpen ? 'Collapse all details' : 'Expand all details'}
          <span aria-hidden="true">{anyDetailsOpen ? '−' : '+'}</span>
        </button>
      </div>
      <div class="timeline-controls">
        <div class="filters" aria-label="Highlight a timeline track">
          <button
            class:chosen={active === null}
            aria-pressed={active === null}
            onclick={() => (active = null)}>Everything</button
          >{#each tracks as track}<button
              class:chosen={active === track.id}
              aria-pressed={active === track.id}
              style={`--track:${track.color}`}
              onclick={() => (active = active === track.id ? null : track.id)}
              ><i aria-hidden="true"></i>{track.label}</button
            >{/each}
        </div>
        <label class="search"
          ><span class="sr-only">Search timeline</span><input
            type="search"
            placeholder="Find something…"
            bind:value={query}
          /></label
        >
      </div>
      <p class="sr-only" aria-live="polite">
        {visible.length} entries shown{active ? `; ${active} track highlighted` : ''}
      </p>
      <div class="timeline" id="collection-items">
        <div class="rails" aria-hidden="true">
          {#each tracks as track}<i
              class:quiet={active && active !== track.id}
              style={`--track:${track.color}`}
            ></i>{/each}
        </div>
        {#each visible as entry, i (entry.id)}
          {#if i === 0 || yearOf(entry) !== yearOf(visible[i - 1])}<div class="year">
              <span>{yearOf(entry)}</span>{#if !entry.date.value}<small>Dates to be added</small
                >{/if}
            </div>{/if}
          <PortfolioItem
            {entry}
            bind:expanded={expandedEntries[entry.id]}
            muted={active !== null && active !== (entry.kind === 'game' ? 'project' : entry.kind)}
          />
        {:else}<p class="empty-state">
            No entries match “{query}”. <button onclick={() => (query = '')}>Clear search</button>
          </p>{/each}
        {#if !query.trim()}<div class="archive-control">
            <button aria-expanded={showArchive} onclick={() => (showArchive = !showArchive)}
              >{showArchive
                ? 'Keep it recent ↑'
                : `Earlier chapters · ${hiddenCount} more entries ↓`}</button
            >
            <p>Old projects, experiments, and the beginnings.</p>
          </div>{/if}
        <div class="timeline-end">
          <span aria-hidden="true">↓</span>
          <p>There’s always another thing to make.</p>
        </div>
      </div>
    </section>
  </main>
  <footer>
    <p>{profile.name} <span>© {new Date().getFullYear()}</span></p>
    <a href="mailto:nlb.nathan@gmail.com">Say hello ↗</a><a href="#top">Back to top ↑</a>
  </footer>
</div>
