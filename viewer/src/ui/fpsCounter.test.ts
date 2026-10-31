import { describe, expect, it } from 'vitest';
import { createFpsMeter } from './fpsCounter';

// Frame times are powers of two so they add up exactly; 30 steps of 1/60 fall just short of 0.5.
describe('createFpsMeter', () => {
  it('reports the average rate once the window has passed', () => {
    const readings: number[] = [];
    const tick = createFpsMeter((fps) => readings.push(fps));
    for (let i = 0; i < 32; i++) tick(1 / 64);
    expect(readings).toEqual([64]);
  });

  it('stays quiet before the window has passed', () => {
    const readings: number[] = [];
    const tick = createFpsMeter((fps) => readings.push(fps));
    tick(0.1);
    expect(readings).toEqual([]);
  });

  it('starts each window fresh, so a slowdown shows up straight away', () => {
    const readings: number[] = [];
    const tick = createFpsMeter((fps) => readings.push(fps));
    for (let i = 0; i < 32; i++) tick(1 / 64);
    for (let i = 0; i < 4; i++) tick(1 / 8);
    expect(readings).toEqual([64, 8]);
  });
});
