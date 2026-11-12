import { GAME_CONFIG } from '../../config/gameConfig';

export type UpdateCallback = (dt: number) => void;
export type RenderCallback = (interpolation: number) => void;

export class GameLoop {
  private updateFn: UpdateCallback;
  private renderFn: RenderCallback;
  private isRunning: boolean;
  private rafId: number | null;
  private lastTime: number;
  private accumulator: number;
  private readonly fixedStep: number;
  private fps: number;
  private frameCount: number;
  private lastFpsUpdate: number;

  constructor(update: UpdateCallback, render: RenderCallback) {
    this.updateFn = update;
    this.renderFn = render;
    this.isRunning = false;
    this.rafId = null;
    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedStep = GAME_CONFIG.fixedTimeStep;
    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = this.lastTime;
    this.rafId = requestAnimationFrame(this.tick);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public getFps(): number {
    return this.fps;
  }

  public active(): boolean {
    return this.isRunning;
  }

  private tick = (currentTime: number): void => {
    if (!this.isRunning) return;

    let delta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Guard against spiral of death on tab switch or lag spike
    if (delta > 0.25) {
      delta = 0.25;
    }

    this.accumulator += delta;

while (this.accumulator >= this.fixedStep) {
      this.updateFn(this.fixedStep);
      this.accumulator -= this.fixedStep;
    }

    const interpolation = this.accumulator / this.fixedStep;
    this.renderFn(interpolation);

    // Track FPS
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };
}