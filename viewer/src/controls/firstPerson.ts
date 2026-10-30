import * as THREE from 'three';

export const WALK_SPEED_MPS = 1.4;

const MOUSE_SENSITIVITY = 0.002;
const MAX_PITCH = Math.PI / 2 - 0.01;
const MAX_STEP_SECONDS = 0.1; // after a stall, don't jump a long way in one frame

/** WASD + pointer-lock mouse look. Rotates the camera itself; movement is only proposed, never applied. */
export class FirstPersonControls {
  private readonly keys = new Set<string>();
  private readonly euler = new THREE.Euler(0, 0, 0, 'YXZ');

  private readonly onClick = () => {
    void this.domElement.requestPointerLock();
  };

  private readonly onMouseMove = (event: MouseEvent) => {
    if (document.pointerLockElement !== this.domElement) return;
    // Read back each time: flyTo also turns the camera.
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= event.movementX * MOUSE_SENSITIVITY;
    this.euler.x = THREE.MathUtils.clamp(this.euler.x - event.movementY * MOUSE_SENSITIVITY, -MAX_PITCH, MAX_PITCH);
    this.camera.quaternion.setFromEuler(this.euler);
  };

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement) return; // typing in the search bar isn't walking
    this.keys.add(event.code);
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.code);
  };

  private readonly onBlur = () => {
    this.keys.clear();
  };

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly domElement: HTMLElement,
  ) {
    domElement.addEventListener('click', this.onClick);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  /** Horizontal displacement the user is asking for this frame, in world meters. */
  desiredMove(dtSeconds: number): THREE.Vector3 {
    const strafe = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA'));
    const forward = Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS'));
    if (strafe === 0 && forward === 0) return new THREE.Vector3();

    const facing = this.camera.getWorldDirection(new THREE.Vector3()).setY(0).normalize();
    const right = new THREE.Vector3(-facing.z, 0, facing.x);
    return facing
      .multiplyScalar(forward)
      .addScaledVector(right, strafe)
      .normalize()
      .multiplyScalar(WALK_SPEED_MPS * Math.min(dtSeconds, MAX_STEP_SECONDS));
  }

  dispose(): void {
    this.domElement.removeEventListener('click', this.onClick);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }
}
