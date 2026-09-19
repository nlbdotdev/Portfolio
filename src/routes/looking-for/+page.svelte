<script lang="ts">
  import content from '../../../content/looking-for.json';
  import profile from '../../../content/profile.json';
  const linkedin = profile.links.find((link) => link.label === 'LinkedIn')!;
</script>

<svelte:head>
  <title>{content.title} — Nathan Bennett</title>
  <meta name="description" content={content.description} />
  <meta property="og:title" content={`${content.title} — Nathan Bennett`} />
  <meta property="og:description" content={content.description} />
</svelte:head>
<main class="text-page looking-page">
  <header>
    <p class="eyebrow">Let’s build something that lasts</p>
    <h1>{content.title}<span>.</span></h1>
    <p class="page-intro">{content.intro}</p>
    <div class="contact-options">
      <a class="contact" href="mailto:nate@nlb.dev?subject=Building%20with%20Dead%20Traveler"
        >Start a conversation ↗</a
      >
      <a href={linkedin.url} target="_blank" rel="noopener noreferrer">Connect on LinkedIn ↗</a>
    </div>
  </header>
  {#each content.sections as section, i}
    <section class:priority={i === 0}>
      {#if i === 0}<p class="eyebrow">Primary focus</p>{/if}
      <h2>{section.heading}</h2>
      {#each section.paragraphs as paragraph}<p>{paragraph}</p>{/each}
      {#if i === 0}<div class="related">
          <a href="https://deadtraveler.com" target="_blank" rel="noopener noreferrer"
            >Dead Traveler ↗</a
          >
          <a
            href="https://store.steampowered.com/app/3003120/Zombiehood/"
            target="_blank"
            rel="noopener noreferrer">Zombiehood on Steam ↗</a
          >
        </div>{/if}
    </section>
  {/each}
  <section>
    <h2>Say hello</h2>
    <p>
      Send a little about yourself, something you’ve worked on, and what caught your interest. A
      warm introduction is welcome too.
    </p>
    <a class="contact" href="mailto:nate@nlb.dev?subject=Building%20with%20Dead%20Traveler"
      >nate@nlb.dev ↗</a
    >
  </section>
</main>

<style>
  .looking-page {
    max-width: 840px;
    margin-inline: auto;
  }
  h1 {
    font-size: clamp(40px, 6vw, 70px);
    line-height: 1.1;
  }
  h1 span,
  .contact,
  .related a {
    color: var(--header-accent);
  }
  section {
    margin-top: 40px;
    padding-top: 28px;
    border-top: 1px solid var(--border);
  }
  section.priority {
    border-left: 3px solid var(--header-accent);
    border-top: 0;
    padding: 4px 0 4px 24px;
    margin-top: 52px;
  }
  h2 {
    font-size: clamp(24px, 4vw, 32px);
    line-height: 1.25;
    margin-bottom: 20px;
  }
  section p {
    color: var(--muted);
    font-size: 18px;
    line-height: 1.75;
    margin-top: 16px;
  }
  section .eyebrow {
    color: var(--header-accent);
    font-size: 13px;
    margin-bottom: 16px;
  }
  .contact {
    display: inline-block;
  }
  .contact-options {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 24px;
    margin-top: 24px;
  }
  .contact-options a:last-child {
    color: var(--muted);
  }
  .related {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    margin-top: 24px;
  }
</style>
