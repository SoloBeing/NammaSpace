/** A titled box in the admin column; created on first use, stacked in call order. */
export function adminPanel(title: string): HTMLElement {
  let column = document.querySelector<HTMLElement>('.admin');
  if (!column) {
    column = document.createElement('div');
    column.className = 'admin';
    document.getElementById('app')!.append(column);
  }
  const panel = document.createElement('section');
  const heading = document.createElement('h2');
  heading.textContent = title;
  panel.append(heading);
  column.append(panel);
  return panel;
}
