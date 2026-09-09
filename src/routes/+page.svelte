<script lang="ts">
  import PortfolioItem from '$lib/components/PortfolioItem.svelte';
  import { entries, profile } from '$lib/content';
  import { tracks, yearOf, isArchive, matchesSearch, type Track } from '$lib/timeline';
  let active = $state<Track | null>(null);
  let query = $state('');
  let showArchive = $state(false);
  const featured = entries.filter((entry) => entry.featured);
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
      <a href="#about">About</a><a href={profile.resume}>Résumé ↗</a>{#each profile.links as link}<a
          href={link.url}>{link.label} ↗</a
        >{/each}
    </nav>
  </header>
  <main id="top">
    <section class="intro" id="about">
      <div>
        <p class="eyebrow">Nathan Bennett / Developer & maker</p>
        <h1>Games, software,<br />and things <em>in between.</em></h1>
        <p class="lede">
          I build software and make games. This is a collection of the work, experiments, and
          detours along the way.
        </p>
      </div>
      <aside class="now">
        <span class="eyebrow"><i aria-hidden="true"></i> Currently</span><a
          href="https://deadtraveler.com">Building Dead Traveler ↗</a
        >
        <p>My independent game studio.<br />My full-time focus.</p>
      </aside>
    </section>
    <section class="selected" aria-labelledby="selected-title">
      <div class="section-line">
        <h2 id="selected-title" class="eyebrow">Selected work</h2>
        <span class="micro">A few chapters worth opening</span>
      </div>
      <div class="feature-grid">
        {#each featured as entry, i}<button
            class={`feature feature-${i}`}
            onclick={() => follow(entry.id)}
            ><div class="feature-art" aria-hidden="true">
              <span class="art-circle"></span><span class="art-step"></span><span class="art-block"
              ></span><span class="art-number">0{i + 1} / Company</span>
            </div>
            <div class="feature-caption">
              <div>
                <h3>{entry.title}</h3>
                <p>{entry.role}</p>
              </div>
              <span aria-hidden="true">↗</span>
            </div></button
          >{/each}
      </div>
    </section>
    <section id="timeline" aria-labelledby="timeline-title">
      <div class="timeline-head">
        <div>
          <p class="eyebrow">The ongoing collection</p>
          <h2 id="timeline-title">Everything, over time<span>.</span></h2>
        </div>
        <span class="micro">Work, learning & things made along the way</span>
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
      <div class="timeline">
        <div class="rails" aria-hidden="true">
          {#each tracks as track}<i
              class:quiet={active && active !== track.id}
              style={`--track:${track.color}`}
            ></i>{/each}
        </div>
        {#each visible as entry, i}
          {#if i === 0 || yearOf(entry) !== yearOf(visible[i - 1])}<div class="year">
              <span>{yearOf(entry)}</span>{#if !entry.date.value}<small>Dates to be added</small
                >{/if}
            </div>{/if}
          <PortfolioItem
            {entry}
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
