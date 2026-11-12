/**
 * High-performance lightweight particle simulation for Shadow City.
 * Renders bullet impacts, blood/cyber-oil splatter, footstep dust,
 * vehicle tire smoke, neon sparks, and level-up bursts.
 */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxLife: number;
  life: number;
  color: string;
  glow?: boolean;
  shape?: 'circle' | 'line' | 'square';
}

class ParticleSystem {
  private particles: Particle[] = [];
  private readonly maxParticles: number = 300;
  private enabled: boolean = true;

  public setEnabled(val: boolean): void {
    this.enabled = val;
    if (!val) {
      this.particles = [];
    }
  }

  public update(dt: number): void {
    if (!this.enabled) return;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.vx *= 0.94; // friction
      p.vy *= 0.94;
    }
  }

  public render(ctx: CanvasRenderingContext2D, camera: { worldToScreen: (x: number, y: number) => { x: number; y: number } }): void {
    if (!this.enabled || this.particles.length === 0) return;

    ctx.save();
    for (const p of this.particles) {
      const screen = camera.worldToScreen(p.x, p.y);
      const alpha = Math.max(0, 1 - p.life / p.maxLife);

      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;

      if (p.glow) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
      }

      if (p.shape === 'line') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screen.x, screen.y);
        ctx.lineTo(screen.x - p.vx * 3, screen.y - p.vy * 3);
        ctx.stroke();
      } else if (p.shape === 'square') {
        const curSize = p.size * (1 - p.life / p.maxLife * 0.5);
        ctx.fillRect(screen.x - curSize / 2, screen.y - curSize / 2, curSize, curSize);
      } else {
        const curSize = p.size * (1 - p.life / p.maxLife * 0.5);
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, Math.max(1, curSize), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Combat Hit Sparks
  public spawnHitSparks(x: number, y: number, color: string = '#00e5ff', count: number = 8): void {
    if (!this.enabled) return;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2,
        maxLife: 0.25 + Math.random() * 0.25,
        life: 0,
        color,
        glow: true,
        shape: 'line',
      });
    }
  }

  // Blood / Cyber Oil Splatter
  public spawnBloodSplatter(x: number, y: number, isCyber: boolean = false, count: number = 10): void {
    if (!this.enabled) return;
    const col = isCyber ? '#16ca8e' : '#e53e3e';
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        maxLife: 0.4 + Math.random() * 0.35,
        life: 0,
        color: col,
        glow: isCyber,
        shape: 'circle',
      });
    }
  }

  // Footstep dust / water ripple on sidewalk
  public spawnFootstepDust(x: number, y: number): void {
    if (!this.enabled) return;
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + 2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.2 - Math.random() * 0.3,
      size: 3 + Math.random() * 2,
      maxLife: 0.3,
      life: 0,
      color: 'rgba(255, 255, 255, 0.25)',
      shape: 'circle',
    });
  }

  // Vehicle tire drift smoke
  public spawnTireSmoke(x: number, y: number): void {
    if (!this.enabled) return;
    for (let i = 0; i < 2; i++) {
      if (this.particles.length >= this.maxParticles) break;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.5 - Math.random() * 0.6,
        size: 4 + Math.random() * 5,
        maxLife: 0.45,
        life: 0,
        color: 'rgba(200, 220, 240, 0.28)',
        shape: 'circle',
      });
    }
  }

  // Level Up / Mission complete celebratory nova burst
  public spawnNovaBurst(x: number, y: number, color: string = '#16ca8e'): void {
    if (!this.enabled) return;
    for (let i = 0; i < 24; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (i / 24) * Math.PI * 2;
      const speed = 2.5 + Math.random() * 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3,
        maxLife: 0.6,
        life: 0,
        color,
        glow: true,
        shape: 'square',
      });
    }
  }

  public clear(): void {
    this.particles = [];
  }
}

export const particleSystem = new ParticleSystem();