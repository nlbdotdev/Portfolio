<script lang="ts">
  import profile from '../../../content/profile.json';
  const groups = [
    { id: 'frontend', label: 'Frontend', icon: 'code' },
    { id: 'backend', label: 'Backend', icon: 'server' },
    { id: 'other', label: 'Software & AI', icon: 'tool' },
    { id: 'management', label: 'Project management', icon: 'tool' },
    { id: 'design', label: 'Design & automation', icon: 'tool' },
    { id: 'qa', label: 'Testing & quality', icon: 'tool' },
  ];
</script>

<svelte:head
  ><title>About — Nathan Bennett</title><meta
    name="description"
    content="A little about Nathan Bennett and the tools behind his web and game development work."
  /></svelte:head
>
<main class="text-page">
  <p class="eyebrow">About</p>
  <h1>Hi, I’m Nathan.</h1>
  <p class="page-intro">
    I build games and software. My work spans independent games, full-stack web development, and the
    tools that help people create.
  </p>
  <section class="skills-section" aria-labelledby="skills-heading">
    <h2 id="skills-heading">Tools I work with</h2>
    <div class="skills-grid">
      {#each groups as group}
        <section class="skill-group">
          <h3>{group.label}</h3>
          <ul>
            {#each profile.skills.filter((skill) => skill.category === group.id) as skill}<li>
                {#if skill.url}
                  <a class="skill-button" href={skill.url} target="_blank" rel="noreferrer">
                    <img
                      src={skill.icon}
                      alt=""
                      width="16"
                      height="16"
                      loading="lazy"
                    />{skill.label}<span class="sr-only"> (opens in new tab)</span>
                  </a>
                {:else}
                  <span class="skill-button skill-discipline"
                    ><img
                      src={skill.icon}
                      alt=""
                      width="16"
                      height="16"
                      loading="lazy"
                    />{skill.label}</span
                  >
                {/if}
              </li>{/each}
          </ul>
        </section>
      {/each}
    </div>
  </section>
</main>
