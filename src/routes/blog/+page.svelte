<script lang="ts">
  import post from '../../../content/blog/whats-done-is-done.json';
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
  <article class="post-preview">
    <time datetime={post.date}>September 13, 2026</time>
    <h2><a href={`/blog/${post.slug}`}>{post.title} <span aria-hidden="true">↗</span></a></h2>
    <p>{post.description}</p>
    <a class="post-read" href={`/blog/${post.slug}`}>Read the post →</a>
  </article>
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
