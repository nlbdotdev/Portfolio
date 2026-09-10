<script lang="ts">
  import { page } from '$app/state';
  import { pushState, replaceState } from '$app/navigation';
  import ProjectModal from '$lib/components/ProjectModal.svelte';
  import { yearGuide } from '$lib/year-guide';
  import { tick, onMount } from 'svelte';
  import { archivePreview } from '$lib/archive-preview';
  import { collectionTransition } from '$lib/collection-transition';
  import PortfolioItem from '$lib/components/PortfolioItem.svelte';
  import { entries, profile, assetUrl, hasDetails } from '$lib/content';
  import {
    lastActive,
    tracks,
    rails,
    projectFilters,
    trackOf,
    yearOf,
    splitTimeline,
    matchesSearch,
    type Track,
    type ProjectFilter,
  } from '$lib/timeline';
  let selectedId = $state<string | null>(null);
  const selectedProject = $derived(entries.find((entry) => entry.id === selectedId));
  function openProject(id: string) {
    const url = new URL(page.url);
    url.searchParams.set('project', id);
    pushState(url, {});
    selectedId = id;
  }
  function closeProject() {
    const url = new URL(page.url);
    url.searchParams.delete('project');
    selectedId = null;
    replaceState(url, {});
  }
  let archiveReset = $state(0);
  let active = $state<Track | 'featured' | null>('featured');
  let projectFilter = $state<ProjectFilter>('all');
  let query = $state('');
  let showGuides = $state(false);
  let showArchive = $state(false);
  let archiveRevealAfter = 0;
  let archiveArmed = true;
  async function changeTrack(track: Track | 'featured' | null) {
    if (track !== active) projectFilter = 'all';
    active = track;
    showArchive = false;
    archiveReset += 1;
    archiveArmed = false;
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
      entries.map((entry) => [entry.id, open && hasDetails(entry)]),
    );
  }
  let today = $state(new Date());
  onMount(() => {
    today = new Date();
    const syncProject = () => {
      selectedId = new URL(location.href).searchParams.get('project');
    };
    syncProject();
    window.addEventListener('popstate', syncProject);
    return () => window.removeEventListener('popstate', syncProject);
  });
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
  const timelineSections = $derived(
    query.trim() ? { visible: matching, history: [] } : splitTimeline(matching, active === null),
  );
  const visible = $derived(timelineSections.visible);
  const history = $derived(timelineSections.history);
  const historyVisible = $derived(showArchive ? history : history.slice(0, 2));
  function closeArchive() {
    showArchive = false;
    document.getElementById('archive')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  function revealOnScroll(node: HTMLElement) {
    let previousY = window.scrollY;
    const arm = () => {
      if (performance.now() >= archiveRevealAfter) archiveArmed = true;
    };
    window.addEventListener('wheel', arm, { passive: true });
    window.addEventListener('touchmove', arm, { passive: true });
    window.addEventListener('pointerdown', arm, { passive: true });
    window.addEventListener('keydown', arm);
    const onScroll = () => {
      const y = window.scrollY;
      const down = y > previousY;
      previousY = y;
      const rect = node.getBoundingClientRect();
      if (
        archiveArmed &&
        performance.now() >= archiveRevealAfter &&
        down &&
        rect.top < window.innerHeight * 0.8 &&
        rect.bottom > 0
      )
        showArchive = true;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return {
      destroy: () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('wheel', arm);
        window.removeEventListener('touchmove', arm);
        window.removeEventListener('pointerdown', arm);
        window.removeEventListener('keydown', arm);
      },
    };
  }
</script>

<svelte:head
  ><title>Nathan Bennett — Games, software, and things in between</title><meta
    name="description"
    content="The work, games, experiments, and detours of Nathan Bennett. A personal portfolio and living timeline."
  /></svelte:head
>
<main id="top">
  <section class="intro" id="about">
    <div class="intro-copy">
      <h1>Games, software,<br />and things<br /><em class="in-between">in between.</em></h1>
    </div>
    <div class="studio-feature">
      <aside class="now">
        <span class="eyebrow">Now</span>
        <a href="https://deadtraveler.com">Dead Traveler ↗</a>
        <p>Independent games / In progress</p>
      </aside>
      <button
        class="studio-art"
        onclick={() => openProject(studio.id)}
        aria-label="Explore Dead Traveler"
      >
        <img
          src={assetUrl(studio, studio.media.cover!)}
          alt="Blue cosmic clouds from Dead Traveler’s studio artwork"
          fetchpriority="high"
        />
        <img class="brand-overlay" src={assetUrl(studio, studio.media.icon!)} alt="Dead Traveler" />
        <span class="studio-arrow" aria-hidden="true">↗</span>
      </button>
    </div>
  </section>
  <section class="selected" aria-label="Selected work">
    <div class="feature-grid">
      {#each heroFeatured as entry}
        {@const activity = lastActive(entry, today)}
        <button class="feature" onclick={() => openProject(entry.id)}>
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
            <p class="feature-meta">
              <span>{entry.kind === 'game' ? 'Game' : 'Career'}</span>
              {#if activity}<time datetime={activity.value} title={`Last active: ${activity.value}`}
                  >{activity.label}</time
                >{/if}
            </p>
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
    <div class="timeline" id="collection-items" class:show-guides={showGuides}>
      <button
        class="timeline-guide-toggle"
        aria-pressed={showGuides}
        onclick={() => (showGuides = !showGuides)}
        >Year &amp; entry guides <span aria-hidden="true" class:enabled={showGuides}></span></button
      >
      <div class="year-guide-layer" aria-hidden="true" use:yearGuide></div>
      <div class="rails" aria-hidden="true">
        {#each rails as rail}<i
            class:quiet={(rail.id === 'website' && active !== 'project') ||
              (active && active !== 'featured' && active !== rail.track) ||
              (active === 'project' && projectFilter !== 'all' && rail.id !== projectFilter)}
            style={`--track:${rail.color};--station:${rail.id === 'website' && active !== 'project' ? 2 : rail.station}`}
          ></i>{/each}
      </div>
      {#each visible as entry, i (entry.id)}
        <div
          class="timeline-row"
          data-guide-year={yearOf(entry)}
          data-entry-number={String(i + 1).padStart(2, '0')}
          transition:collectionTransition
        >
          {#if i === 0 || yearOf(entry) !== yearOf(visible[i - 1])}<div
              class="year"
              data-guide-year={yearOf(entry)}
              transition:collectionTransition
            >
              <span>{yearOf(entry)}</span>{#if !entry.date.value}<small>Dates to be added</small
                >{/if}
            </div>{/if}
          <PortfolioItem
            {entry}
            onopen={openProject}
            splitProjects={active === 'project'}
            bind:expanded={expandedEntries[entry.id]}
          />
        </div>
      {:else}<p class="empty-state">
          {#if query.trim()}No entries match “{query}” in this track.
            <button onclick={() => (query = '')}>Clear search</button>
            {#if active !== null}<button class="search-everything" onclick={() => changeTrack(null)}
                >Search Everything</button
              >{/if}{:else}No recent entries in this track. Explore the earlier chapters below.{/if}
        </p>{/each}
      {#if history.length}
        {#key archiveReset}<section
            id="archive"
            class="archive-section"
            aria-label="Earlier chapters"
          >
            <p class="eyebrow archive-heading">Earlier chapters</p>
            <div
              class="archive-frame"
              class:preview={!showArchive}
              use:archivePreview={showArchive}
            >
              <div class="archive-rows" inert={!showArchive} aria-hidden={!showArchive}>
                {#each historyVisible as entry, i (entry.id)}
                  <div
                    class="timeline-row"
                    data-guide-year={yearOf(entry)}
                    data-entry-number={String(visible.length + i + 1).padStart(2, '0')}
                    transition:collectionTransition
                  >
                    {#if i === 0 || yearOf(entry) !== yearOf(historyVisible[i - 1])}
                      <div
                        class="year"
                        data-guide-year={yearOf(entry)}
                        transition:collectionTransition
                      >
                        <span>{yearOf(entry)}</span>
                      </div>
                    {/if}
                    <PortfolioItem
                      {entry}
                      onopen={openProject}
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
          </section>{/key}
      {/if}
      <div class="timeline-end">
        <span aria-hidden="true">↓</span>
        <p>There’s always another thing to make.</p>
      </div>
    </div>
  </section>
</main>

{#if selectedProject}
  {#key selectedProject.id}<ProjectModal entry={selectedProject} onclose={closeProject} />{/key}
{/if}
