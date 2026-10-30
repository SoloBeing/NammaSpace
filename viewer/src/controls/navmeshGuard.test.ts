import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import type { Navmesh } from '../scene/loader';
import { EYE_HEIGHT_M, NavmeshGuard } from './navmeshGuard';

// A 4 x 2 m floor split into two triangles, counter-clockwise from above.
const mesh: Navmesh = {
  format_version: 1,
  units: 'm',
  agent: { radius_m: 0.4, height_m: 1.7, max_climb_m: 0.2 },
  vertices: [[0, 0, 0], [0, 0, 2], [4, 0, 2], [4, 0, 0]],
  polygons: [{ v: [0, 1, 2] }, { v: [0, 2, 3] }],
};

describe('NavmeshGuard', () => {
  const guard = new NavmeshGuard(mesh);

  it('knows what is on the navmesh', () => {
    expect(guard.floorHeightAt(1, 1)).toBe(0);
    expect(guard.floorHeightAt(3.5, 0.5)).toBe(0);
    expect(guard.floorHeightAt(2, 1)).toBe(0); // on the edge shared by both triangles
    expect(guard.floorHeightAt(-0.1, 1)).toBeNull();
    expect(guard.floorHeightAt(1, 2.1)).toBeNull();
  });

  it('dead stops at the edge instead of sliding along it', () => {
    const position = new THREE.Vector3(1, EYE_HEIGHT_M, 0.05);
    const diagonal = new THREE.Vector3(0.2, 0, -0.1);
    expect(guard.tryMove(position, diagonal).toArray()).toEqual(position.toArray());
  });

  it('keeps the camera at eye height while walking', () => {
    const moved = guard.tryMove(new THREE.Vector3(1, 5, 1), new THREE.Vector3(0.5, 0, 0));
    expect(moved.toArray()).toEqual([1.5, EYE_HEIGHT_M, 1]);
  });

  it('snaps a point outside the navmesh to the nearest edge', () => {
    const near = guard.nearestPosition(5, 1);
    expect(near.x).toBeCloseTo(4);
    expect(near.y).toBeCloseTo(EYE_HEIGHT_M);
    expect(near.z).toBeCloseTo(1);
  });

  it('spawns on the navmesh', () => {
    const spawn = guard.spawnPosition();
    expect(guard.floorHeightAt(spawn.x, spawn.z)).toBe(0);
    expect(spawn.y).toBe(EYE_HEIGHT_M);
  });
});
