import * as THREE from 'three';
import type { SceneBundle } from '../scene/loader';
import type { SplatViewer } from '../scene/splatRenderer';
import { adminPanel } from './panel';

/**
 * Admin: click two points on the splat, type their real distance in meters.
 * Converts the clicks back to recon space (inverse of world_from_recon) and produces
 * the matching `atomspace scale <scene> --a ... --b ... --distance ...` command.
 */
export function mountScaleTool(viewer: SplatViewer, bundle: SceneBundle): void {
  const reconFromWorld = new THREE.Matrix4().fromArray(bundle.manifest.world_from_recon).invert();
  const points: { a: THREE.Vector3 | null; b: THREE.Vector3 | null } = { a: null, b: null };

  const panel = adminPanel('Scale');
  const pickA = document.createElement('button');
  pickA.textContent = 'Pick point A';
  const pickB = document.createElement('button');
  pickB.textContent = 'Pick point B';
  const distance = document.createElement('input');
  distance.type = 'number';
  distance.min = '0';
  distance.step = '0.01';
  distance.placeholder = 'Real distance (m)';
  distance.setAttribute('aria-label', 'Real distance in meters');
  const output = document.createElement('code');
  output.className = 'command';
  panel.append(pickA, pickB, distance, output);

  const coords = (p: THREE.Vector3) => p.toArray().map((n) => n.toFixed(4)).join(' ');

  const refresh = () => {
    const d = Number(distance.value);
    output.textContent =
      points.a && points.b && d > 0
        ? `atomspace scale ${bundle.manifest.scene} --a ${coords(points.a)} --b ${coords(points.b)} --distance ${d}`
        : 'Pick both points, then enter the distance.';
  };

  const pick = async (key: 'a' | 'b', button: HTMLButtonElement) => {
    const label = key.toUpperCase();
    button.textContent = `Click point ${label} in the scene…`;
    const hit = await viewer.pickNextClick();
    button.textContent = hit ? `Point ${label} set` : `Missed, pick point ${label} again`;
    points[key] = hit && hit.applyMatrix4(reconFromWorld);
    refresh();
  };

  pickA.addEventListener('click', () => void pick('a', pickA));
  pickB.addEventListener('click', () => void pick('b', pickB));
  distance.addEventListener('input', refresh);
  refresh();
}
