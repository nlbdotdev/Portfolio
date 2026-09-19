<script lang="ts">
  import { postDate } from '$lib/blog';
  let { data } = $props();
  const post = $derived(data.post);
</script>

<svelte:head>
  <title>{post.title} — Nathan Bennett</title>
  <meta name="description" content={post.description} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={post.title} />
  <meta property="og:description" content={post.description} />
  <meta property="article:published_time" content={post.date} />
  <meta name="robots" content={post.draft ? 'noindex, nofollow' : 'index, follow'} />
  <meta name="author" content="Nathan Bennett" />
</svelte:head>
<main class="text-page post-page">
  <a class="back" href="/blog">← All posts</a>
  <article>
    <header>
      <p class="eyebrow">{post.draft ? 'Draft · Work in progress' : 'A note from in between'}</p>
      <h1>{post.title}</h1>
      <p class="byline">Nathan Bennett · <time datetime={post.date}>{postDate(post.date)}</time></p>
      <p class="page-intro">{post.description}</p>
    </header>
    <div class="post-body">
      {#each post.paragraphs as paragraph}<p>{paragraph}</p>{/each}
      {#each post.sections as section}
        <section>
          <h2>{section.heading}</h2>
          {#each section.paragraphs as paragraph}<p>{paragraph}</p>{/each}
        </section>
      {/each}
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
  .post-body section {
    margin-top: 40px;
  }
  .post-body h2 {
    font-size: 26px;
    line-height: 1.3;
    margin-bottom: 20px;
  }
  .post-body p + p {
    margin-top: 24px;
  }
</style>
