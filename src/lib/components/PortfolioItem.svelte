<script lang="ts">
  import type { Entry } from '../../../content/schema.ts';
  import { assetUrl, descriptions } from '$lib/content';
  import { trackOf, tracks } from '$lib/timeline';
  let { entry, muted = false }: { entry: Entry; muted?: boolean } = $props();
  let expanded = $state(false);
  const track = $derived(trackOf(entry));
  const index = $derived(tracks.findIndex((t) => t.id === track));
  const color = $derived(tracks[index].color);
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

<article id={entry.id} class:muted class="entry" style={`--track:${color};--station:${index}`}>
  <div class="connection" aria-hidden="true"><span></span></div>
  <div class="entry-layout" class:has-cover={cover}>
    {#if cover}<a
        class="entry-cover"
        class:company-logo={cover === entry.media.icon}
        class:white-logo={entry.id === 'company-fablevision'}
        href={assetUrl(entry, cover)}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${entry.title} cover`}
        ><img
          src={assetUrl(entry, cover)}
          alt={`${entry.title} ${cover === entry.media.icon ? 'logo' : 'cover'}`}
          loading="lazy"
          decoding="async"
        /></a
      >{/if}
    <div class="entry-main">
      <div class="entry-meta">
        <span>{tracks[index].label} / {entry.role}</span><time
          datetime={entry.date.value ?? undefined}>{entry.date.label ?? 'Date to be added'}</time
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
    <details class="item-details" ontoggle={(event) => (expanded = event.currentTarget.open)}>
      <summary>Notes & media <span aria-hidden="true">+</span></summary>
      {#if expanded}
        <div class="prose">{@html descriptions.get(entry.id) ?? ''}</div>
        {#if entry.technologies.length}<p class="mt-5 text-sm">
            <strong>Built with:</strong>
            {entry.technologies.map((tech) => tech.label).join(', ')}
          </p>{/if}
        {#if gallery.length}<div class="screenshot-grid">
            {#each gallery as image}<a
                href={assetUrl(entry, image.src)}
                target="_blank"
                rel="noreferrer"
                ><img
                  src={assetUrl(entry, image.src)}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                /></a
              >{/each}
          </div>{/if}
        {#if entry.media.animation}<details class="animation">
            <summary>Play gameplay animation</summary><img
              src={assetUrl(entry, entry.media.animation)}
              alt={`${entry.title} gameplay animation`}
              loading="lazy"
            />
          </details>{/if}
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
