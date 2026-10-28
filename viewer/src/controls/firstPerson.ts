import * as THREE from 'three';

export const WALK_SPEED_MPS = 1.4;

/** WASD + pointer-lock mouse look. Rotates the camera itself; movement is only proposed, never applied. */
export class FirstPersonControls {
  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly domElement: HTMLElement,
  ) {}

  /** Horizontal displacement the user is asking for this frame, in world meters. */
  desiredMove(dtSeconds: number): THREE.Vector3 {
    throw new Error('FirstPersonControls.desiredMove not implemented');
  }

  dispose(): void {}
}
