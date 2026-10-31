export interface LoadingScreen {
  setProgress(percent: number): void;
  remove(): void;
}

/** Full-screen title and progress bar, covering the scene until it has loaded. */
export function mountLoadingScreen(container: HTMLElement): LoadingScreen {
  const root = document.createElement('div');
  root.className = 'loading';
  const title = document.createElement('h1');
  title.textContent = 'AtomSpace';
  const bar = document.createElement('div');
  bar.className = 'loading-bar';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Scene loading progress');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  const fill = document.createElement('div');
  bar.append(fill);
  const status = document.createElement('p');
  status.textContent = 'Loading scene…';
  root.append(title, bar, status);
  container.append(root);

  return {
    setProgress: (percent) => {
      const value = Math.round(Math.min(percent, 100));
      fill.style.width = `${value}%`;
      bar.setAttribute('aria-valuenow', String(value));
      // The file is down at 100%, but the splats still have to be processed before they appear.
      status.textContent = value < 100 ? `Loading scene… ${value}%` : 'Preparing scene…';
    },
    remove: () => root.remove(),
  };
}
