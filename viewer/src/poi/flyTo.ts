import type * as THREE from 'three';
import type { Poi } from '../scene/loader';

/**
 * Smoothly animates the camera to poi.view (or a standoff point in front of poi.position),
 * ending on the navmesh so walking can resume from there.
 */
export function flyTo(camera: THREE.PerspectiveCamera, poi: Poi, durationMs = 1200): Promise<void> {
  throw new Error('flyTo not implemented');
}
