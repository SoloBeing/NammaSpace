import type * as THREE from 'three';
import type { Poi } from '../scene/loader';

export interface Pins {
  update(pois: Poi[]): void;
  dispose(): void;
}

/** Billboard pins with name labels at each POI position. */
export function createPins(scene: THREE.Scene, pois: Poi[]): Pins {
  throw new Error('createPins not implemented');
}
