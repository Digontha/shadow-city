import { WeatherType } from '../types';

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
}

interface SplashRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export class WeatherSystem {
  public weather: WeatherType = 'rain';
  private raindrops: RainDrop[] = [];
  private splashes: SplashRipple[] = [];
  private maxDrops: number = 240;
  private lightningTimer: number = 0;
  public lightningFlash: number = 0;

  constructor() {
    this.initRain();
  }

  private initRain(): void {
    this.raindrops = [];
    for (let i = 0; i < this.maxDrops; i++) {
      this.raindrops.push({
        x: Math.random() * 2000,
        y: Math.random() * 1200,
        length: 8 + Math.random() * 14,
        speed: 650 + Math.random() * 300,
        alpha: 0.2 + Math.random() * 0.45,
      });
    }
  }

  public setWeather(type: WeatherType): void {
    this.weather = type;
    if (type === 'heavy-rain') {
      this.maxDrops = 420;
    } else if (type === 'rain') {
      this.maxDrops = 240;
    } else {
      this.maxDrops = 0;
    }
    this.initRain();
  }

  public update(deltaTime: number, viewWidth: number, viewHeight: number): void {
    if (this.weather === 'clear') return;

    // Wind angle tilt
    const windSpeedX = -120;

    // Update rain drops
    for (const drop of this.raindrops) {
      drop.y += drop.speed * deltaTime;
      drop.x += windSpeedX * deltaTime;

      if (drop.y > viewHeight || drop.x < 0) {
        // Occasional splash on ground
        if (Math.random() < 0.25) {
          this.splashes.push({
            x: drop.x,
            y: drop.y > viewHeight ? viewHeight - 4 : drop.y,
            radius: 1,
            maxRadius: 3 + Math.random() * 4,
            alpha: 0.6,
          });
        }

        drop.y = -drop.length - Math.random() * 50;
        drop.x = Math.random() * (viewWidth + 200);
      }
    }

    // Update splash ripples
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const splash = this.splashes[i];
      splash.radius += deltaTime * 12;
      splash.alpha -= deltaTime * 1.8;
      if (splash.alpha <= 0) {
        this.splashes.splice(i, 1);
      }
    }

    // Lightning event timer
    this.lightningTimer += deltaTime;
    if (this.weather === 'heavy-rain' || this.weather === 'rain') {
      if (this.lightningTimer > 14 + Math.random() * 10) {
        this.lightningFlash = 0.85;
        this.lightningTimer = 0;
      }
    }

    if (this.lightningFlash > 0) {
      this.lightningFlash = Math.max(0, this.lightningFlash - deltaTime * 3.5);
    }
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (this.weather === 'clear') return;

    ctx.save();

    // 1. Splash ripples
    for (const splash of this.splashes) {
      ctx.strokeStyle = `rgba(180, 220, 255, ${splash.alpha * 0.5})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(splash.x, splash.y, splash.radius, splash.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Angled rain streaks
    ctx.lineWidth = 1.2;
    for (const drop of this.raindrops) {
      ctx.strokeStyle = `rgba(165, 215, 255, ${drop.alpha})`;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      // Wind tilt
      ctx.lineTo(drop.x - drop.length * 0.35, drop.y + drop.length);
      ctx.stroke();
    }

    // 3. Lightning flash overlay
    if (this.lightningFlash > 0) {
      ctx.fillStyle = `rgba(210, 235, 255, ${this.lightningFlash * 0.45})`;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }
}

export const weatherSystem = new WeatherSystem();