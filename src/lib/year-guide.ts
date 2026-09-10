/** Place each vertical year label halfway between the first and last entry markers of that year. */
export function yearGuide(layer: HTMLElement) {
  const timeline = layer.parentElement!;
  let frame = 0;
  const resize = new ResizeObserver(schedule);
  const observed = new Set<Element>();
  resize.observe(timeline);
  function draw() {
    const origin = timeline.getBoundingClientRect().top;
    const groups: { year: string; top: number; bottom: number; branches: number[] }[] = [];
    const rows = timeline.querySelectorAll<HTMLElement>('.timeline-row[data-guide-year]');
    for (const node of observed) {
      if (!timeline.contains(node)) {
        resize.unobserve(node);
        observed.delete(node);
      }
    }
    for (const row of rows) {
      if (!observed.has(row)) {
        resize.observe(row);
        observed.add(row);
      }
      const rect = row.getBoundingClientRect();
      const entry = row.querySelector<HTMLElement>('.entry');
      if (!entry || rect.height < 4) continue;
      const archive = row.closest('.archive-frame');
      const bottom = Math.min(rect.bottom, archive?.getBoundingClientRect().bottom ?? rect.bottom);
      if (bottom <= rect.top) continue;
      const top = rect.top - origin;
      const end = bottom - origin;
      const marker = entry.querySelector<HTMLElement>('.connection')!.getBoundingClientRect();
      const branch = Math.min(marker.top + marker.height / 2 - origin, end);
      const year = row.dataset.guideYear!;
      const previous = groups.at(-1);
      if (previous?.year === year) {
        previous.bottom = end;
        previous.branches.push(branch);
      } else groups.push({ year, top, bottom: end, branches: [branch] });
    }
    const fragment = document.createDocumentFragment();
    for (const group of groups) {
      const segment = document.createElement('div');
      segment.className = 'year-guide-segment';
      segment.style.top = `${group.top}px`;
      segment.style.height = `${group.bottom - group.top}px`;
      if (group.bottom - group.top > 75) {
        const label = document.createElement('span');
        label.className = 'year-guide-label';
        label.textContent = group.year;
        label.style.top = `${(group.branches[0] + group.branches.at(-1)!) / 2 - group.top}px`;
        segment.append(label);
        const notch = document.createElement('i');
        notch.className = 'year-guide-notch';
        notch.style.top = label.style.top;
        segment.append(notch);
      }
      for (const y of group.branches) {
        const branch = document.createElement('i');
        branch.style.top = `${y - group.top}px`;
        segment.append(branch);
      }
      fragment.append(segment);
    }
    layer.replaceChildren(fragment);
  }
  function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(draw);
  }
  const mutation = new MutationObserver((changes) => {
    if (changes.some((change) => !layer.contains(change.target))) schedule();
  });
  mutation.observe(timeline, { childList: true, subtree: true });
  window.addEventListener('resize', schedule);
  schedule();
  return {
    destroy() {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      window.removeEventListener('resize', schedule);
    },
  };
}
