<script lang="ts">
  import { tick } from 'svelte';
  import { archivePreview } from '$lib/archive-preview';
  import { collectionTransition } from '$lib/collection-transition';
  import Wordmark from '$lib/components/Wordmark.svelte';
  import ThemeSelect from '$lib/components/ThemeSelect.svelte';
  import PortfolioItem from '$lib/components/PortfolioItem.svelte';
  import { entries, profile, assetUrl } from '$lib/content';
  import {
    tracks,
    rails,
    projectFilters,
    trackOf,
    yearOf,
    isArchive,
    matchesSearch,
    type Track,
    type ProjectFilter,
  } from '$lib/timeline';
  let active = $state<Track | 'featured' | null>(null);
  let projectFilter = $state<ProjectFilter>('all');
  let query = $state('');
  let showArchive = $state(false);
  let archiveRevealAfter = 0;
  async function changeTrack(track: Track | 'featured' | null) {
    if (track !== active) projectFilter = 'all';
    active = track;
    showArchive = false;
    // Don't mistake the view-reset scroll for a request to reveal history.
    archiveRevealAfter = performance.now() + 800;
    await tick();
    document.getElementById('collection-divider')?.scrollIntoView({
      block: 'start',
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }
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
  const heroFeatured = ['game-zombiehood', 'company-syntropy', 'company-psiquantum'].map((id) =>
    entries.find((entry) => entry.id === id)!,
  );
  const studio = entries.find((entry) => entry.id === 'company-dead-traveler')!;
  const matching = $derived(
    entries.filter(
      (entry) =>
        (!active || (active === 'featured' ? entry.featured : trackOf(entry) === active)) &&
        (active !== 'project' ||
          projectFilter === 'all' ||
          entry.kind === (projectFilter === 'game' ? 'game' : 'project')) &&
        matchesSearch(entry, query),
    ),
  );
  const visible = $derived(
    matching.filter((entry) => active === 'featured' || query.trim() || !isArchive(entry)),
  );
  const history = $derived(active === 'featured' || query.trim() ? [] : matching.filter(isArchive));
  const historyVisible = $derived(showArchive ? history : history.slice(0, 3));
  function closeArchive() {
    showArchive = false;
    document.getElementById('archive')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  function revealOnScroll(node: HTMLElement) {
    let previousY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const down = y > previousY;
      previousY = y;
      const rect = node.getBoundingClientRect();
      if (
        performance.now() >= archiveRevealAfter &&
        down &&
        rect.top < window.innerHeight * 0.8 &&
        rect.bottom > 0
      )
        showArchive = true;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return { destroy: () => window.removeEventListener('scroll', onScroll) };
  }
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
    <div class="header-brand">
      <Wordmark />
      <nav class="section-nav" aria-label="Main navigation">
        <a href="#timeline">Work</a><span aria-hidden="true">·</span><a href="#about">About</a>
      </nav>
    </div>
    <nav class="contact-nav" aria-label="Contact links">
      {#each profile.links as link}<a href={link.url}>{link.label} ↗</a>{/each}
    </nav>
    <ThemeSelect />
  </header>
  <main id="top">
    <section class="intro" id="about">
      <div class="intro-copy">
        <h1>Games, software,<br />and things<br />in between.</h1>
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
        {#each heroFeatured as entry}
          <button class="feature" onclick={() => follow(entry.id)}>
            <img
              class="feature-art"
              class:feature-logo={entry.kind === 'company' && !entry.media.cover}
              src={assetUrl(
                entry,
                entry.media.cover ?? entry.media.icon ?? entry.media.screenshots.desktop!,
              )}
              alt={`${entry.title} ${entry.kind === 'company' ? 'logo' : 'cover'}`}
            />
            <div class="feature-caption">
              <h3>{entry.title}</h3>
              <p>{entry.kind === 'game' ? 'Game' : 'Career'}</p>
              <p>{entry.role}</p>
            </div>
          </button>
        {/each}
      </div>
      <div class="collection-divider" id="collection-divider">
        <a href="#timeline">Scroll to explore <span aria-hidden="true">↓</span></a>
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
        <div class="filters" aria-label="Filter collection">
          <button
            class:chosen={active === 'featured'}
            aria-pressed={active === 'featured'}
            onclick={() => changeTrack('featured')}>Featured</button
          >
          <button
            class:chosen={active === null}
            aria-pressed={active === null}
            onclick={() => changeTrack(null)}>Everything</button
          >{#each tracks as track}<button
              class:chosen={active === track.id}
              aria-pressed={active === track.id}
              style={`--track:${track.color}`}
              onclick={() => changeTrack(active === track.id ? null : track.id)}
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
      {#if active === 'project'}
        <div class="project-subfilters" transition:collectionTransition>
          <div class="filters" aria-label="Filter projects by type">
            <span class="subfilter-label">Projects</span>
            {#each projectFilters as filter}
              <button
                class:chosen={projectFilter === filter.id}
                aria-pressed={projectFilter === filter.id}
                onclick={() => {
                  projectFilter = filter.id;
                  changeTrack('project');
                }}
              >
                {#if filter.id !== 'all'}<i
                    style={`--track:${filter.id === 'game' ? 'var(--project)' : 'var(--website)'}`}
                    aria-hidden="true"
                  ></i>{/if}
                {filter.label}
              </button>
            {/each}
          </div>
        </div>
      {/if}
      <p class="sr-only" aria-live="polite">
        {visible.length + (showArchive ? history.length : 0)} entries shown{active
          ? `; ${active === 'featured' ? 'Featured' : tracks.find((track) => track.id === active)?.label} filter active${active === 'project' ? `; ${projectFilters.find((filter) => filter.id === projectFilter)?.label}` : ''}`
          : ''}
      </p>
      <div class="timeline" id="collection-items">
        <div class="rails" aria-hidden="true">
          {#each rails as rail}<i
              class:quiet={(rail.id === 'website' && active !== 'project') ||
                (active && active !== 'featured' && active !== rail.track) ||
                (active === 'project' && projectFilter !== 'all' && rail.id !== projectFilter)}
              style={`--track:${rail.color};--station:${rail.id === 'website' && active !== 'project' ? 2 : rail.station}`}
            ></i>{/each}
        </div>
        {#each visible as entry, i (entry.id)}
          <div class="timeline-row" transition:collectionTransition>
            {#if i === 0 || yearOf(entry) !== yearOf(visible[i - 1])}<div
                class="year"
                transition:collectionTransition
              >
                <span>{yearOf(entry)}</span>{#if !entry.date.value}<small>Dates to be added</small
                  >{/if}
              </div>{/if}
            <PortfolioItem
              {entry}
              splitProjects={active === 'project'}
              bind:expanded={expandedEntries[entry.id]}
            />
          </div>
        {:else}<p class="empty-state">
            {#if query.trim()}No entries match “{query}” in this track.
              <button onclick={() => (query = '')}>Clear search</button>{:else}No recent entries in
              this track. Explore the earlier chapters below.{/if}
          </p>{/each}
        {#if history.length}
          <section id="archive" class="archive-section" aria-label="Earlier chapters">
            <p class="eyebrow archive-heading">Earlier chapters</p>
            <div
              class="archive-frame"
              class:preview={!showArchive}
              use:archivePreview={showArchive}
            >
              <div class="archive-rows" inert={!showArchive} aria-hidden={!showArchive}>
                {#each historyVisible as entry, i (entry.id)}
                  <div class="timeline-row" transition:collectionTransition>
                    {#if i === 0 || yearOf(entry) !== yearOf(historyVisible[i - 1])}
                      <div class="year" transition:collectionTransition>
                        <span>{yearOf(entry)}</span>
                      </div>
                    {/if}
                    <PortfolioItem
                      {entry}
                      splitProjects={active === 'project'}
                      bind:expanded={expandedEntries[entry.id]}
                    />
                  </div>
                {/each}
              </div>
            </div>
            {#if !showArchive}
              <div class="archive-prompt" use:revealOnScroll>
                <button
                  onclick={() => (showArchive = true)}
                  aria-controls="archive"
                  aria-expanded="false"
                >
                  Keep scrolling to explore <span aria-hidden="true">↓</span>
                </button>
                <p>{history.length} earlier chapters</p>
              </div>
            {:else}
              <div class="archive-control">
                <button onclick={closeArchive} aria-controls="archive" aria-expanded="true"
                  >Close archive ↑</button
                >
              </div>
            {/if}
          </section>
        {/if}
        <div class="timeline-end">
          <span aria-hidden="true">↓</span>
          <p>There’s always another thing to make.</p>
        </div>
      </div>
    </section>
  </main>
  <footer>
    <p>{profile.name} <span>© {new Date().getFullYear()}</span></p>
    <a href="mailto:nate@nlb.dev">Say hello ↗</a><a href="#top">Back to top ↑</a>
  </footer>
</div>
