import type { PoiSearch } from '../poi/search';
import type { Poi } from '../scene/loader';

/** Search input with a live results list; keyboard and click both select a result. */
export function mountSearchBar(container: HTMLElement, search: PoiSearch, onSelect: (poi: Poi) => void): void {
  const root = document.createElement('div');
  root.className = 'search';
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Search this space';
  input.setAttribute('aria-label', 'Search this space');
  const list = document.createElement('ul');
  root.append(input, list);
  container.append(root);

  let results: Poi[] = [];
  let active = 0;

  const render = () => {
    list.replaceChildren(
      ...results.map((poi, i) => {
        const item = document.createElement('li');
        item.textContent = poi.name;
        item.classList.toggle('active', i === active);
        // mousedown, not click: the input's blur would otherwise clear the list first.
        item.addEventListener('mousedown', (event) => {
          event.preventDefault();
          select(poi);
        });
        return item;
      }),
    );
  };

  const setResults = (next: Poi[]) => {
    results = next;
    active = 0;
    render();
  };

  const select = (poi: Poi) => {
    input.value = '';
    setResults([]);
    input.blur();
    onSelect(poi);
  };

  input.addEventListener('input', () => setResults(search(input.value)));
  input.addEventListener('blur', () => setResults([]));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (results.length === 0) return;
      event.preventDefault();
      active = (active + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
      render();
    } else if (event.key === 'Enter' && results[active]) {
      select(results[active]);
    } else if (event.key === 'Escape') {
      input.blur();
    }
  });
}
