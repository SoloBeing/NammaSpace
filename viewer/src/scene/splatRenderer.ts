import type * as THREE from 'three';
import type { SceneBundle } from './loader';

export interface SplatViewer {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  domElement: HTMLElement;
  onFrame(callback: (dtSeconds: number) => void): void;
  dispose(): void;
}

/**
 * Renders bundle.splatUrl with @mkkellogg/gaussian-splats-3d inside our own Three.js scene,
 * placing the splat with manifest.world_from_recon so it lines up with the navmesh and POIs.
 */
export async function createSplatViewer(container: HTMLElement, bundle: SceneBundle): Promise<SplatViewer> {
  throw new Error('createSplatViewer not implemented');
}
