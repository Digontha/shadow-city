/**
 * Screen transition and visual post-processing effects for Shadow City.
 * Handles district reveal banners, death glitch screens, CRT scanlines, and screen shakes.
 */
class TransitionManager {
  private flashAlpha: number = 0;
  private flashColor: string = '#00e5ff';
  private districtBanner: { name: string; subtitle: string; life: number; maxLife: number } | null = null;
  private shakeTime: number = 0;
  private shakeIntensity: number = 0;

  public triggerFlash(color: string = '#ffffff', durationSeconds: number = 0.25): void {
    this.flashColor = color;
    this.flashAlpha = 0.65;
  }

  public triggerScreenShake(intensity: number = 6, durationSeconds: number = 0.2): void {
    this.shakeIntensity = intensity;
    this.shakeTime = durationSeconds;
  }

  public showDistrictBanner(districtName: string, subtitle: string = 'ENTERING DISTRICT'): void {
    this.districtBanner = {
      name: districtName?.toUpperCase(),
      subtitle,
      life: 0,
      maxLife: 2.8,
    };
    this.triggerFlash('#16ca8e', 0.2);
  }

  public getShakeOffset(): { x: number; y: number } {
    if (this.shakeTime <= 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() - 0.5) * this.shakeIntensity,
      y: (Math.random() - 0.5) * this.shakeIntensity,
    };
  }

  public update(dt: number): void {
    // Screen shake decay
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      if (this.shakeTime <= 0) {
        this.shakeIntensity = 0;
      }
    }

    // Flash decay
    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - dt * 3.5);
    }

    // District banner life
    if (this.districtBanner) {
      this.districtBanner.life += dt;
      if (this.districtBanner.life >= this.districtBanner.maxLife) {
        this.districtBanner = null;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number, retroScanlines: boolean = false): void {
    // 1. Flash overlay (e.g. impact, teleport, transition)
    if (this.flashAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = this.flashAlpha;
      ctx.fillStyle = this.flashColor;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 2. Retro CRT scanlines if toggled
    if (retroScanlines) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let y = 0; y < height; y += 3) {
        ctx.fillRect(0, y, width, 1);
      }
      ctx.restore();
    }

    // 3. Cinematic District Entry Banner
    if (this.districtBanner) {
      const { name, subtitle, life, maxLife } = this.districtBanner;
      // Fade in first 0.4s, hold, fade out last 0.5s
      let alpha = 1;
      if (life < 0.4) {
        alpha = life / 0.4;
      } else if (life > maxLife - 0.5) {
        alpha = (maxLife - life) / 0.5;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      const bannerY = height * 0.22;
      // Dark cyber banner backplate
      const grad = ctx.createLinearGradient(0, bannerY - 24, 0, bannerY + 36);
      grad.addColorStop(0, 'rgba(7, 9, 14, 0)');
      grad.addColorStop(0.3, 'rgba(7, 9, 14, 0.85)');
      grad.addColorStop(0.7, 'rgba(7, 9, 14, 0.85)');
      grad.addColorStop(1, 'rgba(7, 9, 14, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, bannerY - 24, width, 60);

      // Accent border line
      ctx.strokeStyle = '#16ca8e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width * 0.25, bannerY - 18);
      ctx.lineTo(width * 0.75, bannerY - 18);
      ctx.moveTo(width * 0.25, bannerY + 30);
      ctx.lineTo(width * 0.75, bannerY + 30);
      ctx.stroke();

      // Subtitle
      ctx.fillStyle = 'rgba(22, 202, 142, 0.85)';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`// ${subtitle} //`, width / 2, bannerY - 4);

      // District Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(name, width / 2, bannerY + 18);

      ctx.restore();
    }
  }
}

export const transitionManager = new TransitionManager();