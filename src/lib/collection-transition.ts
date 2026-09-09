import { cubicInOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

/** Animate height in document flow so neighboring rows move with the closing gap. */
export function collectionTransition(node: HTMLElement): TransitionConfig {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return { duration: 0 };
  const height = node.getBoundingClientRect().height;
  const style = getComputedStyle(node);
  const top = parseFloat(style.paddingTop);
  const bottom = parseFloat(style.paddingBottom);
  return {
    duration: 480,
    css: (t) => {
      // On exit, fade first, then fold away; reversing restores the row in place.
      const size = cubicInOut(Math.min(1, t / 0.8));
      return `height:${height * size}px;opacity:${t * t};padding-top:${top * size}px;padding-bottom:${bottom * size}px;overflow:hidden;transform:translateX(${24 * (1 - t)}px);`;
    },
  };
}
