<script lang="ts">
  import MediaViewer, { type GalleryMedia } from './MediaViewer.svelte';
  import { slide } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';
  import GameplayAnimation from './GameplayAnimation.svelte';
  import type { Entry } from '../../../content/schema.ts';
  import { assetUrl, descriptions, hasDetails } from '$lib/content';
  import { formatTimelineDate, railOf } from '$lib/timeline';
  let {
    entry,
    splitProjects = false,
    modal = false,
    onopen,
    expanded = $bindable(false),
  }: {
    entry: Entry;
    splitProjects?: boolean;
    modal?: boolean;
    onopen?: (id: string) => void;
    expanded?: boolean;
  } = $props();
  function revealDetails(node: HTMLElement) {
    return slide(node, {
      duration: modal || matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 320,
      easing: cubicInOut,
    });
  }
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
  let mediaIndex = $state<number | null>(null);
  const galleryMedia = $derived<GalleryMedia[]>([
    ...(entry.media.animation
      ? [
          {
            src: assetUrl(entry, entry.media.animation),
            alt: `${entry.title} gameplay`,
            type: 'animation' as const,
            poster: cover ? assetUrl(entry, cover) : undefined,
          },
        ]
      : []),
    ...gallery.map((image) => ({
      src: assetUrl(entry, image.src),
      alt: image.alt,
      type: image.src.endsWith('.gif') ? ('animation' as const) : ('image' as const),
    })),
    ...entry.media.videos.map((video) => ({
      src: video.src,
      alt: video.label,
      type: 'video' as const,
    })),
  ]);
  const viewerMedia = $derived<GalleryMedia[]>([
    ...(cover && !galleryMedia.some((item) => item.src === assetUrl(entry, cover))
      ? [{ src: assetUrl(entry, cover), alt: `${entry.title} cover`, type: 'image' as const }]
      : []),
    ...galleryMedia,
  ]);
  function openMedia(src: string) {
    mediaIndex = viewerMedia.findIndex((item) => item.src === src);
  }
</script>

<article
  id={modal ? `modal-${entry.id}` : entry.id}
  class="entry"
  style={`--track:${color};--station:${rail.station}`}
>
  <div class="connection" aria-hidden="true"><span></span></div>
  <div class="entry-layout" class:has-cover={cover}>
    {#if cover}<a
        class="entry-cover"
        class:company-logo={cover === entry.media.icon}
        class:reflextions-logo={['company-contract-games', 'company-reflextions'].includes(
          entry.id,
        )}
        class:white-logo={['company-fablevision', 'education-praxis'].includes(entry.id)}
        href={modal ? assetUrl(entry, cover) : `?item=${entry.slug}`}
        onclick={(event) => {
          if (modal) {
            event.preventDefault();
            openMedia(assetUrl(entry, cover!));
            return;
          }
          if (
            !modal &&
            onopen &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.shiftKey &&
            !event.altKey
          ) {
            event.preventDefault();
            onopen(entry.id);
          }
        }}
        aria-label={`Open ${entry.title} details`}
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
          >{formatTimelineDate(entry)}</time
        >
      </div>
      <h3>{entry.title}</h3>
      <p class="summary">{entry.summary}</p>
      {#if entry.tags.length}<ul class="tags" aria-label="Tools and disciplines">
          {#each entry.tags as tag}<li>{tag}</li>{/each}
        </ul>{/if}
      {#if entry.links.length}<div class="entry-links">
          {#each entry.links as link}<a href={link.link} target="_blank" rel="noopener noreferrer"
              >{link.label} <span aria-hidden="true">↗</span></a
            >{/each}
        </div>{/if}
    </div>
  </div>
  {#if modal || hasDetails(entry)}
    <div class="item-details">
      {#if !modal}<button
          class="details-trigger"
          aria-expanded={expanded}
          aria-controls={`${entry.id}-details`}
          onclick={() => (expanded = !expanded)}
          >Notes & media <span aria-hidden="true">+</span></button
        >{/if}
      {#if modal || expanded}
        <div
          id={`${modal ? 'modal-' : ''}${entry.id}-details`}
          class="details-content"
          inert={!modal && !expanded}
          transition:revealDetails
        >
          <div class="prose">{@html descriptions.get(entry.id) ?? ''}</div>
          {#if entry.technologies.length}<p class="mt-5 text-sm">
              <strong>Built with:</strong>
              {entry.technologies.map((tech) => tech.label).join(', ')}
            </p>{/if}
          {#if galleryMedia.length}<div
              class="screenshot-grid adaptive-gallery"
              class:odd-gallery={galleryMedia.length % 2 === 1}
              class:single-gallery={galleryMedia.length === 1}
            >
              {#each galleryMedia as item}
                {#if item.type === 'animation'}
                  <GameplayAnimation
                    src={item.src}
                    poster={item.poster}
                    title={item.alt}
                    onopen={() => openMedia(item.src)}
                  />
                {:else}<button
                    class="gallery-preview"
                    onclick={() => openMedia(item.src)}
                    aria-label={`Open ${item.alt} media`}
                  >
                    {#if item.type === 'video'}<span class="video-preview">▶ {item.alt}</span>
                    {:else}<img
                        src={item.src}
                        alt={item.alt}
                        loading="lazy"
                        decoding="async"
                      />{/if}
                  </button>{/if}
              {/each}
            </div>{/if}
          {#if entry.preview.url && (entry.preview.desktop || entry.preview.mobile)}<a
              class="entry-link"
              href={entry.preview.url}
              target="_blank"
              rel="noreferrer">Open playable preview ↗</a
            >{/if}
        </div>
      {/if}
    </div>
  {/if}
</article>

{#if mediaIndex !== null}
  <MediaViewer
    media={viewerMedia}
    initial={mediaIndex}
    title={entry.title}
    onclose={() => (mediaIndex = null)}
  />
{/if}
