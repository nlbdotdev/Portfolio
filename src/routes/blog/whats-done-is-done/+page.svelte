<script lang="ts">
  import post from '../../../../content/blog/whats-done-is-done.json';
</script>

<svelte:head>
  <title>{post.title} — Nathan Bennett</title>
  <meta name="description" content={post.description} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={post.title} />
  <meta property="og:description" content={post.description} />
  <meta property="article:published_time" content={post.date} />
  <meta name="author" content="Nathan Bennett" />
</svelte:head>
<main class="text-page post-page">
  <a class="back" href="/blog">← All posts</a>
  <article>
    <header>
      <p class="eyebrow">A note from in between</p>
      <h1>{post.title}</h1>
      <p class="byline">Nathan Bennett · <time datetime={post.date}>September 13, 2026</time></p>
      <p class="page-intro">{post.description}</p>
    </header>
    <div class="post-body">
      {#each post.paragraphs as paragraph}<p>{paragraph}</p>{/each}
    </div>
  </article>
  <a class="back" href="/">Explore the work →</a>
</main>

<style>
  .post-page {
    max-width: 740px;
    margin-inline: auto;
  }
  .back {
    display: inline-block;
    color: var(--header-accent);
    margin-bottom: 32px;
  }
  h1 {
    font-size: clamp(36px, 6vw, 64px);
    line-height: 1.1;
  }
  .byline {
    margin-top: 24px;
    color: var(--muted);
    font: 13px var(--font-mono);
    line-height: 1.7;
  }
  .post-body {
    margin: 40px 0;
    font-size: clamp(17px, 2vw, 20px);
    line-height: 1.8;
  }
  .post-body p + p {
    margin-top: 24px;
  }
</style>
