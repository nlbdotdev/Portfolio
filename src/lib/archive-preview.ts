/** Keep the first one and a half historical rows visible until the archive opens. */
export function archivePreview(node: HTMLElement, expanded: boolean) {
  const inner = node.firstElementChild as HTMLElement;
  let frame = 0;
  function measure() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const rows = [...inner.children] as HTMLElement[];
      const height = expanded
        ? inner.getBoundingClientRect().height
        : rows
            .slice(0, 2)
            .reduce(
              (total, row, i) => total + row.getBoundingClientRect().height * (i === 1 ? 0.5 : 1),
              0,
            );
      node.style.height = `${height}px`;
    });
  }
  const observer = new ResizeObserver(measure);
  observer.observe(inner);
  measure();
  return {
    update(value: boolean) {
      expanded = value;
      measure();
    },
    destroy() {
      observer.disconnect();
      cancelAnimationFrame(frame);
    },
  };
}
