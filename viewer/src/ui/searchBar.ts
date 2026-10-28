import type { PoiSearch } from '../poi/search';
import type { Poi } from '../scene/loader';

/** Search input with a live results list; keyboard and click both select a result. */
export function mountSearchBar(container: HTMLElement, search: PoiSearch, onSelect: (poi: Poi) => void): void {
  throw new Error('mountSearchBar not implemented');
}
