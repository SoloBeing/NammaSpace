const UPDATE_SECONDS = 0.5;

/** Averages frames over a short window, so the number is readable instead of flickering. */
export function createFpsMeter(onUpdate: (fps: number) => void): (dtSeconds: number) => void {
  let frames = 0;
  let elapsed = 0;
  return (dtSeconds) => {
    frames += 1;
    elapsed += dtSeconds;
    if (elapsed < UPDATE_SECONDS) return;
    onUpdate(Math.round(frames / elapsed));
    frames = 0;
    elapsed = 0;
  };
}

/** Shows frames per second over the scene. Call the returned function once per rendered frame. */
export function mountFpsCounter(container: HTMLElement): (dtSeconds: number) => void {
  const root = document.createElement('div');
  root.className = 'fps-counter';
  root.textContent = '-- FPS';
  container.append(root);
  return createFpsMeter((fps) => {
    root.textContent = `${fps} FPS`;
  });
}
