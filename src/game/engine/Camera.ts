import { GAME_CONFIG } from '../../config/gameConfig';

export interface ViewportSize {
  width: number;
  height: number;
}

export class Camera {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public targetX: number;
  public targetY: number;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.width = viewportWidth;
    this.height = viewportHeight;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.clamp();
  }

  public follow(targetCenterX: number, targetCenterY: number, smooth: boolean = true): void {
    this.targetX = targetCenterX - this.width / 2;
    this.targetY = targetCenterY - this.height / 2;

    if (!smooth) {
      this.x = this.targetX;
      this.y = this.targetY;
    } else {
      const lerp = GAME_CONFIG.cameraLerp;
      this.x += (this.targetX - this.x) * lerp;
      this.y += (this.targetY - this.y) * lerp;
    }

    this.clamp();
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.clamp();
  }

  public clamp(): void {
    const maxX = Math.max(0, GAME_CONFIG.worldWidth - this.width);
    const maxY = Math.max(0, GAME_CONFIG.worldHeight - this.height);

    if (GAME_CONFIG.worldWidth < this.width) {
      this.x = -(this.width - GAME_CONFIG.worldWidth) / 2;
    } else {
      this.x = Math.max(0, Math.min(this.x, maxX));
    }

    if (GAME_CONFIG.worldHeight < this.height) {
      this.y = -(this.height - GAME_CONFIG.worldHeight) / 2;
    } else {
      this.y = Math.max(0, Math.min(this.y, maxY));
    }
  }

  public worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: Math.round(worldX - this.x),
      y: Math.round(worldY - this.y),
    };
  }

  public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: screenX + this.x,
      y: screenY + this.y,
    };
  }

  public isVisible(worldX: number, worldY: number, objWidth: number, objHeight: number): boolean {
    return (
      worldX + objWidth >= this.x &&
      worldX <= this.x + this.width &&
      worldY + objHeight >= this.y &&
      worldY <= this.y + this.height
    );
  }
}