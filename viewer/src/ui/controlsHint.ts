const CONTROLS: [keys: string[], action: string][] = [
  [['W', 'A', 'S', 'D'], 'Walk'],
  [['Mouse'], 'Look'],
  [['Esc'], 'Free cursor'],
];

/** Shows how to move around; fades out once the mouse is captured, and returns when it's released. */
export function mountControlsHint(container: HTMLElement, lockTarget: HTMLElement): void {
  const root = document.createElement('div');
  root.className = 'controls-hint';
  const prompt = document.createElement('p');
  prompt.textContent = 'Click the scene to start';
  const list = document.createElement('dl');
  for (const [keys, action] of CONTROLS) {
    const term = document.createElement('dt');
    term.append(
      ...keys.map((key) => {
        const cap = document.createElement('kbd');
        cap.textContent = key;
        return cap;
      }),
    );
    const description = document.createElement('dd');
    description.textContent = action;
    list.append(term, description);
  }
  root.append(prompt, list);
  container.append(root);

  document.addEventListener('pointerlockchange', () => {
    root.classList.toggle('locked', document.pointerLockElement === lockTarget);
  });
}
