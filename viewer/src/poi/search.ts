import Fuse from 'fuse.js';
import type { Poi } from '../scene/loader';

export type PoiSearch = (query: string, limit?: number) => Poi[];

export function createPoiSearch(pois: Poi[]): PoiSearch {
  const fuse = new Fuse(pois, {
    keys: [
      { name: 'name', weight: 3 },
      { name: 'aliases', weight: 2 },
      { name: 'category', weight: 1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
  });
  return (query, limit = 8) => {
    const q = query.trim();
    return q ? fuse.search(q, { limit }).map((r) => r.item) : [];
  };
}
