export function countTo(
  start: number,
  end: number,
  duration: number,
  onUpdate: (val: number) => void
): () => void {
  const startTime = performance.now();
  let rafId = 0;
  let cancelled = false;

  function update(currentTime: number) {
    if (cancelled) return;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / (duration * 1000), 1);

    // ease out quad
    const easeProgress = 1 - (1 - progress) * (1 - progress);
    const currentVal = start + (end - start) * easeProgress;

    onUpdate(currentVal);

    if (progress < 1) {
      rafId = requestAnimationFrame(update);
    } else {
      onUpdate(end);
    }
  }

  rafId = requestAnimationFrame(update);

  return () => {
    cancelled = true;
    if (rafId) cancelAnimationFrame(rafId);
  };
}
