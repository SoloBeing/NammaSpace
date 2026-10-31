import { describe, expect, it } from 'vitest';
import { joystickVector } from './touch';

describe('joystickVector', () => {
  it('rests at zero', () => {
    const { x, y } = joystickVector(0, 0);
    expect(Math.abs(x)).toBe(0);
    expect(Math.abs(y)).toBe(0);
  });

  it('treats dragging up the screen as forward', () => {
    expect(joystickVector(0, -45).y).toBeCloseTo(1);
  });

  it('scales with distance inside the stick', () => {
    expect(joystickVector(22.5, 0).x).toBeCloseTo(0.5);
  });

  it('never exceeds full speed however far the thumb goes', () => {
    const { x, y } = joystickVector(300, 400);
    expect(Math.hypot(x, y)).toBeCloseTo(1);
  });
});
