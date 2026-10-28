import * as THREE from 'three';
import type { Navmesh } from '../scene/loader';

export const EYE_HEIGHT_M = 1.6;

export class NavmeshGuard {
  constructor(private readonly navmesh: Navmesh) {}

  /** Floor height at (x, z), or null if that point is outside the walkable navmesh. */
  floorHeightAt(x: number, z: number): number | null {
    throw new Error('NavmeshGuard.floorHeightAt not implemented');
  }

  /** Lookahead check: if the next step leaves the navmesh, the camera doesn't move at all (no wall sliding). */
  tryMove(position: THREE.Vector3, delta: THREE.Vector3): THREE.Vector3 {
    const next = position.clone().add(delta);
    const floorY = this.floorHeightAt(next.x, next.z);
    if (floorY === null) return position.clone();
    next.y = floorY + EYE_HEIGHT_M;
    return next;
  }
}
