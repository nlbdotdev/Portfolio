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
  let hovering = $state(false);
  const motionMedia = $derived(galleryMedia.find((item) => item.type !== 'image'));
  const playable = $derived(entry.preview.url && (entry.preview.desktop || entry.preview.mobile));
  function hoverPreview() {
    hovering = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
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
        onmouseenter={hoverPreview}
        onmouseleave={() => (hovering = false)}
        onfocus={hoverPreview}
        onblur={() => (hovering = false)}
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
          />{/if}
        {#if hovering && motionMedia}
          {#if motionMedia.type === 'animation'}<img
              class="hover-preview"
              src={motionMedia.src}
              alt=""
            />
          {:else}<iframe
              class="hover-preview"
              src={`${motionMedia.src}${motionMedia.src.includes('?') ? '&' : '?'}autoplay=1&mute=1&controls=0`}
              title={`${entry.title} preview`}
              allow="autoplay; encrypted-media"
              tabindex="-1"
            ></iframe>{/if}
        {/if}</a
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
      {#if entry.links.length || playable}<div class="entry-links">
          {#if playable}<a href={entry.preview.url!} target="_blank" rel="noopener noreferrer"
              >Play preview ↗</a
            >{/if}
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
              class:bethesda-gallery={entry.id === 'company-bethesda'}
              class:motion-gallery={Boolean(motionMedia) && entry.id !== 'company-bethesda'}
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
                {:else if item.type === 'video'}<div class="embedded-video">
                    <iframe
                      src={item.src}
                      title={`${entry.title} ${item.alt}`}
                      loading="lazy"
                      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                      allowfullscreen
                    ></iframe>
                    <button
                      onclick={() => openMedia(item.src)}
                      aria-label={`Open ${item.alt} media`}>View {item.alt} in gallery ↗</button
                    >
                  </div>
                {:else}<button
                    class="gallery-preview"
                    onclick={() => openMedia(item.src)}
                    aria-label={`Open ${item.alt} media`}
                  >
                    <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                  </button>{/if}
              {/each}
            </div>{/if}
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
