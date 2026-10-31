import type { FirstPersonControls } from './firstPerson';

const JOYSTICK_RADIUS_PX = 45;
const LOOK_SENSITIVITY = 0.004;

export function isTouchDevice(): boolean {
  return window.matchMedia('(pointer: coarse)').matches;
}

/** Finger offset in screen pixels to stick position: length 0 to 1, with up as +y. */
export function joystickVector(dx: number, dy: number): { x: number; y: number } {
  const scale = 1 / Math.max(Math.hypot(dx, dy), JOYSTICK_RADIUS_PX);
  return { x: dx * scale, y: -dy * scale };
}

/** Left half of the screen is a joystick for walking, right half is drag to look. Each takes its own finger. */
export function mountTouchControls(
  container: HTMLElement,
  domElement: HTMLElement,
  controls: FirstPersonControls,
): void {
  const stick = document.createElement('div');
  stick.className = 'touch-stick';
  const knob = document.createElement('div');
  stick.append(knob);
  container.append(stick);

  let stickFinger: number | null = null;
  let lookFinger: number | null = null;
  let stickStart = { x: 0, y: 0 };
  let lookLast = { x: 0, y: 0 };

  const setStick = (x: number, y: number) => {
    controls.setStickMove(x, y);
    knob.style.transform = `translate(${x * JOYSTICK_RADIUS_PX}px, ${-y * JOYSTICK_RADIUS_PX}px)`;
  };

  domElement.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch') return;
    const rect = domElement.getBoundingClientRect();
    const onLeft = event.clientX - rect.left < rect.width / 2;
    const at = { x: event.clientX, y: event.clientY };
    if (onLeft && stickFinger === null) {
      stickFinger = event.pointerId;
      stickStart = at; // relative to where the thumb landed, so the walk doesn't jump
    } else if (!onLeft && lookFinger === null) {
      lookFinger = event.pointerId;
      lookLast = at;
    } else {
      return;
    }
    domElement.setPointerCapture(event.pointerId);
  });

  domElement.addEventListener('pointermove', (event) => {
    if (event.pointerId === stickFinger) {
      const { x, y } = joystickVector(event.clientX - stickStart.x, event.clientY - stickStart.y);
      setStick(x, y);
    } else if (event.pointerId === lookFinger) {
      controls.look((event.clientX - lookLast.x) * LOOK_SENSITIVITY, (event.clientY - lookLast.y) * LOOK_SENSITIVITY);
      lookLast = { x: event.clientX, y: event.clientY };
    }
  });

  const onFingerUp = (event: PointerEvent) => {
    if (event.pointerId === stickFinger) {
      stickFinger = null;
      setStick(0, 0);
    } else if (event.pointerId === lookFinger) {
      lookFinger = null;
    }
  };
  domElement.addEventListener('pointerup', onFingerUp);
  domElement.addEventListener('pointercancel', onFingerUp);
}
