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
      {#if post.stats.length}
        <dl class="post-stats" aria-label="Migration progress snapshot">
          {#each post.stats as stat}
            <div>
              <dt>{stat.value}</dt>
              <dd>{stat.label}</dd>
              {#if stat.note}<small>{stat.note}</small>{/if}
            </div>
          {/each}
        </dl>
      {/if}
      {#each post.sections as section}
        <section>
          <h2>{section.heading}</h2>
          {#each section.paragraphs as paragraph}<p>{paragraph}</p>{/each}
          {#each section.codeSnippets as snippet}
            <figure class="code-sample">
              <figcaption>
                <span>{snippet.caption}</span>
                <small>{snippet.source ?? snippet.language}</small>
              </figcaption>
              <pre><code>{snippet.code}</code></pre>
            </figure>
          {/each}
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
    margin-top: 56px;
  }
  .post-body h2 {
    font-size: 26px;
    line-height: 1.3;
    margin-bottom: 20px;
  }
  .post-body p + p {
    margin-top: 24px;
  }
  .post-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1px;
    margin: 42px 0 0;
    background: var(--border);
    border: 1px solid var(--border);
  }
  .post-stats div {
    min-width: 0;
    padding: 20px;
    background: var(--paper);
  }
  .post-stats dt {
    color: var(--header-accent);
    font:
      500 28px Oswald,
      sans-serif;
  }
  .post-stats dd {
    margin-top: 4px;
    font: 13px var(--font-mono);
  }
  .post-stats small {
    display: block;
    margin-top: 8px;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.45;
  }
  .code-sample {
    margin: 30px 0 0;
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
  }
  .code-sample figcaption {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    font: 12px var(--font-mono);
  }
  .code-sample figcaption small {
    color: var(--muted);
    text-align: right;
  }
  .code-sample pre {
    margin: 0;
    padding: 18px;
    overflow-x: auto;
    background: color-mix(in srgb, var(--ink) 4%, transparent);
    font: 13px/1.65 var(--font-mono);
    tab-size: 2;
  }
  @media (max-width: 600px) {
    .post-stats {
      grid-template-columns: 1fr;
    }
    .code-sample figcaption {
      display: block;
    }
    .code-sample figcaption small {
      display: block;
      margin-top: 5px;
      text-align: left;
    }
  }
</style>
