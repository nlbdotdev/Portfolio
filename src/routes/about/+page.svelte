<script lang="ts">
  import profile from '../../../content/profile.json';
  let iconMode = $state(0);
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
    <div class="skills-heading-row">
      <h2 id="skills-heading">Tools I work with</h2>
      <div class="skill-display-control">
        <span id="icon-mode-label">Icons</span>
        <div
          class="skill-mode-switch"
          role="group"
          aria-labelledby="icon-mode-label"
          style={`--selected:${iconMode}`}
        >
          <span class="skill-mode-thumb" aria-hidden="true"></span>
          {#each ['Off', 'On', 'Only'] as label, i}
            <button
              aria-pressed={iconMode === i}
              aria-label={['Text only', 'Text and icons', 'Icons only'][i]}
              onclick={() => (iconMode = i)}>{label}</button
            >
          {/each}
        </div>
      </div>
    </div>
    <div
      class="skills-grid"
      class:hide-skill-icons={iconMode === 0}
      class:icons-only={iconMode === 2}
    >
      {#each groups as group}
        <section class="skill-group">
          <h3>{group.label}</h3>
          <ul>
            {#each profile.skills.filter((skill) => skill.category === group.id) as skill}<li>
                {#if skill.url}
                  <a
                    class="skill-button"
                    title={iconMode === 2 ? skill.label : undefined}
                    href={skill.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src={skill.icon} alt="" width="16" height="16" loading="lazy" /><span
                      class="skill-label">{skill.label}</span
                    ><span class="sr-only"> (opens in new tab)</span>
                  </a>
                {:else}
                  <span class="skill-button skill-discipline"
                    ><img src={skill.icon} alt="" width="16" height="16" loading="lazy" /><span
                      class="skill-label">{skill.label}</span
                    ></span
                  >
                {/if}
              </li>{/each}
          </ul>
        </section>
      {/each}
    </div>
  </section>
</main>
