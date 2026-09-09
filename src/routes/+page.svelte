<script lang="ts">
  import { entries, profile } from '$lib/content';
  let search = $state('');
  let kind = $state('all');
  const visible = $derived(entries.filter(entry =>
    (kind === 'all' || entry.kind === kind) &&
    `${entry.title} ${entry.summary ?? ''} ${entry.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())
  ));
</script>
<svelte:head><title>NLB.DEV — Content library</title><meta name="description" content="Nathan Bennett's collection of games and software projects." /></svelte:head>
<main class="mx-auto max-w-4xl px-5 py-12 font-sans text-zinc-900">
  <h1 class="text-3xl font-bold">{profile.name}</h1>
  <p class="mt-3 text-zinc-600">{profile.headline}</p>
  <nav aria-label="Profile" class="mt-4 flex flex-wrap gap-4">{#each profile.links as link}<a class="text-blue-700 underline" href={link.url}>{link.label}</a>{/each}<a class="text-blue-700 underline" href={profile.resume}>Resume</a></nav>
  <div class="my-8 flex flex-wrap gap-4">
    <label class="flex grow flex-col gap-1">Search<input class="rounded border border-zinc-400 p-2" type="search" bind:value={search} /></label>
    <label class="flex flex-col gap-1">Type<select class="rounded border border-zinc-400 p-2" bind:value={kind}><option value="all">Everything</option><option value="game">Games</option><option value="project">Projects</option></select></label>
  </div>
  <p aria-live="polite" class="mb-5 text-sm text-zinc-600">{visible.length} of {entries.length} entries</p>
  {#each visible as entry (entry.id)}
    <article id={entry.id} class="border-t border-zinc-200 py-6">
      <h2 class="text-xl font-semibold"><a href={`#${entry.id}`} class="hover:underline">{entry.title}</a></h2>
      <p class="mt-1 text-sm text-zinc-600">{entry.kind} · {entry.date.label ?? 'Date not recorded'}{entry.featured ? ' · Featured' : ''}</p>
      {#if entry.summary}<p class="mt-3">{entry.summary}</p>{/if}
      <ul class="my-3 flex flex-wrap gap-x-5 gap-y-2">{#each entry.links as link}<li><a class="text-blue-700 underline" href={link.link}>{link.label}</a></li>{/each}</ul>
      <details class="mt-3"><summary class="cursor-pointer font-medium">Description and media</summary>
        <pre class="mt-4 whitespace-pre-wrap break-words font-sans leading-relaxed">{entry.body}</pre>
        {#if entry.media.cover}<a class="mt-4 inline-block text-blue-700 underline" href={entry.media.cover}>Cover image</a>{/if}
        <ul class="mt-2 space-y-1">{#each entry.media.images as image}<li><a class="text-blue-700 underline" href={image.src}>{image.alt}</a></li>{/each}</ul>
        {#if entry.media.animation}<p class="mt-2"><a class="text-blue-700 underline" href={entry.media.animation}>Animation</a></p>{/if}
      </details>
    </article>
  {:else}<p>No matching entries.</p>{/each}
</main>
