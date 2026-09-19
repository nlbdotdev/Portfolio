<script lang="ts">
  import { postDate } from '$lib/blog';
  let { data } = $props();
</script>

<svelte:head>
  <title>Blog — Nathan Bennett</title>
  <meta
    name="description"
    content="Notes on making games, writing software, and things in between."
  />
</svelte:head>
<main class="text-page">
  <p class="eyebrow">Blog</p>
  <h1>Notes from in between.</h1>
  <p class="page-intro">On making games, writing software, and finding the thread.</p>
  {#each data.posts as post}
    <article class="post-preview">
      <time datetime={post.date}>{postDate(post.date)}</time>
      {#if post.draft}<p class="eyebrow">Draft · Work in progress</p>{/if}
      <h2><a href={`/blog/${post.slug}`}>{post.title} <span aria-hidden="true">↗</span></a></h2>
      <p>{post.description}</p>
      <a class="post-read" href={`/blog/${post.slug}`}>Read the post →</a>
    </article>
  {/each}
</main>

<style>
  .post-preview {
    margin-top: 48px;
    padding-top: 28px;
    border-top: 1px solid var(--border);
    max-width: 720px;
  }
  time {
    color: var(--muted);
    font: 13px var(--font-mono);
  }
  h2 {
    margin: 16px 0;
    font-size: clamp(26px, 4vw, 36px);
  }
  h2 span,
  .post-read {
    color: var(--header-accent);
  }
  .post-preview p {
    color: var(--muted);
    line-height: 1.7;
  }
  .post-read {
    display: inline-block;
    margin-top: 20px;
  }
</style>
