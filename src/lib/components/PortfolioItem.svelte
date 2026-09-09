<script lang="ts">
  import GameplayAnimation from './GameplayAnimation.svelte';
  import type { Entry } from '../../../content/schema.ts';
  import { assetUrl, descriptions } from '$lib/content';
  import { railOf } from '$lib/timeline';
  let {
    entry,
    splitProjects = false,
    expanded = $bindable(false),
  }: {
    entry: Entry;
    splitProjects?: boolean;
    expanded?: boolean;
  } = $props();
  const rail = $derived(railOf(entry, splitProjects));
  const color = $derived(rail.color);
  const label = $derived(
    entry.kind === 'game'
      ? 'Game'
      : entry.kind === 'project'
        ? 'Website'
        : entry.kind === 'company'
          ? 'Career'
          : 'Education',
  );
  const cover = $derived(
    entry.media.cover ?? entry.media.icon ?? entry.media.screenshots.desktop ?? null,
  );
  const gallery = $derived(
    [
      ...entry.media.images,
      ...Object.entries(entry.media.screenshots).map(([device, src]) => ({
        src,
        alt: `${entry.title} — ${device} view`,
      })),
    ].filter((image, i, all) => all.findIndex((x) => x.src === image.src) === i),
  );
</script>

<article id={entry.id} class="entry" style={`--track:${color};--station:${rail.station}`}>
  <div class="connection" aria-hidden="true"><span></span></div>
  <div class="entry-layout" class:has-cover={cover}>
    {#if cover}<a
        class="entry-cover"
        class:company-logo={cover === entry.media.icon}
        class:reflextions-logo={['company-contract-games', 'company-reflextions'].includes(
          entry.id,
        )}
        class:white-logo={['company-fablevision', 'education-praxis'].includes(entry.id)}
        href={assetUrl(entry, cover)}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${entry.title} cover`}
        ><img
          src={assetUrl(entry, cover)}
          alt={`${entry.title} ${cover === entry.media.icon ? 'logo' : 'cover'}`}
          loading="lazy"
          decoding="async"
        />{#if entry.id === 'company-dead-traveler' && entry.media.icon}<img
            class="brand-overlay"
            src={assetUrl(entry, entry.media.icon)}
            alt="Dead Traveler"
            loading="lazy"
          />{/if}</a
      >{/if}
    <div class="entry-main">
      <div class="entry-meta">
        <span>{label} / {entry.role}</span><time datetime={entry.date.value ?? undefined}
          >{entry.date.label ?? 'Date to be added'}</time
        >
      </div>
      <h3>{entry.title}</h3>
      <p class="summary">{entry.summary}</p>
      {#if entry.tags.length}<ul class="tags" aria-label="Tools and disciplines">
          {#each entry.tags as tag}<li>{tag}</li>{/each}
        </ul>{/if}
      {#if entry.links.length}<div class="entry-links">
          {#each entry.links as link}<a href={link.link}
              >{link.label} <span aria-hidden="true">↗</span></a
            >{/each}
        </div>{/if}
    </div>
  </div>
  {#if entry.kind === 'game' || entry.kind === 'project'}
    <details class="item-details" bind:open={expanded}>
      <summary>Notes & media <span aria-hidden="true">+</span></summary>
      {#if expanded}
        <div class="prose">{@html descriptions.get(entry.id) ?? ''}</div>
        {#if entry.technologies.length}<p class="mt-5 text-sm">
            <strong>Built with:</strong>
            {entry.technologies.map((tech) => tech.label).join(', ')}
          </p>{/if}
        {#if gallery.length || entry.media.animation}<div class="screenshot-grid">
            {#if entry.media.animation}
              <GameplayAnimation
                src={assetUrl(entry, entry.media.animation)}
                poster={cover ? assetUrl(entry, cover) : undefined}
                title={entry.title}
              />
            {/if}
            {#each gallery as image}
              {#if image.src.endsWith('.gif')}
                <GameplayAnimation
                  src={assetUrl(entry, image.src)}
                  poster={cover ? assetUrl(entry, cover) : undefined}
                  title={image.alt}
                />
              {:else}<a href={assetUrl(entry, image.src)} target="_blank" rel="noreferrer"
                  ><img
                    src={assetUrl(entry, image.src)}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                  /></a
                >{/if}{/each}
          </div>{/if}
        {#if entry.media.videos.length}<div class="entry-links">
            {#each entry.media.videos as video}<a href={video.src}>{video.label} ↗</a>{/each}
          </div>{/if}
        {#if entry.preview.url && (entry.preview.desktop || entry.preview.mobile)}<a
            class="entry-link"
            href={entry.preview.url}
            target="_blank"
            rel="noreferrer">Open playable preview ↗</a
          >{/if}
      {/if}
    </details>
  {/if}
</article>
