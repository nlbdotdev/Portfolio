<script lang="ts">
  import { tick } from 'svelte';
  import { archivePreview } from '$lib/archive-preview';
  import { collectionTransition } from '$lib/collection-transition';
  import ThemeSelect from '$lib/components/ThemeSelect.svelte';
  import PortfolioItem from '$lib/components/PortfolioItem.svelte';
  import { entries, profile, assetUrl } from '$lib/content';
  import { tracks, trackOf, yearOf, isArchive, matchesSearch, type Track } from '$lib/timeline';
  let active = $state<Track | null>(null);
  let query = $state('');
  let showArchive = $state(false);
  let archiveRevealAfter = 0;
  async function changeTrack(track: Track | null) {
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
  const featured = ['game-zombiehood', 'company-psiquantum', 'company-pilot'].map((id) =>
    entries.find((entry) => entry.id === id)!,
  );
  const studio = entries.find((entry) => entry.id === 'company-dead-traveler')!;
  const matching = $derived(
    entries.filter(
      (entry) => (!active || trackOf(entry) === active) && matchesSearch(entry, query),
    ),
  );
  const visible = $derived(matching.filter((entry) => query.trim() || !isArchive(entry)));
  const history = $derived(query.trim() ? [] : matching.filter(isArchive));
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
              class:feature-logo={entry.kind === 'company'}
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
        <div class="filters" aria-label="Filter timeline by track">
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
      <p class="sr-only" aria-live="polite">
        {visible.length + (showArchive ? history.length : 0)} entries shown{active
          ? `; ${tracks.find((track) => track.id === active)?.label} filter active`
          : ''}
      </p>
      <div class="timeline" id="collection-items">
        <div class="rails" aria-hidden="true">
          {#each tracks as track}<i
              class:quiet={active && active !== track.id}
              style={`--track:${track.color}`}
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
            <PortfolioItem {entry} bind:expanded={expandedEntries[entry.id]} />
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
                    <PortfolioItem {entry} bind:expanded={expandedEntries[entry.id]} />
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
    <a href="mailto:nlb.nathan@gmail.com">Say hello ↗</a><a href="#top">Back to top ↑</a>
  </footer>
</div>
