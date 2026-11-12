import { VehicleDefinition } from './vehicleTypes';
import { GAME_CONFIG } from '../../config/gameConfig';
import { isSolidTileType } from '../engine/collision';
import { InputState } from '../input/InputManager';
import { soundFX } from '../audio/soundFX';

export interface TireSkidMark {
  x: number;
  y: number;
  alpha: number;
  angle: number;
}

export class Vehicle {
  public id: string;
  public def: VehicleDefinition;
  public x: number;
  public y: number;
  public angle: number; // in radians (0 pointing down, or math angle)
  public speed: number; // pixels per second
  public angularVelocity: number;
  public health: number;
  public maxHealth: number;
  public isOccupied: boolean;
  public isDestroyed: boolean;
  public nitroRemaining: number;
  public maxNitro: number;
  public isBoosting: boolean;
  public skidMarks: TireSkidMark[];
  public smokeParticles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[];
  public collisionCooldown: number;
  public headlightOn: boolean;

  constructor(id: string, def: VehicleDefinition, spawnX: number, spawnY: number, angle = 0) {
    this.id = id;
    this.def = def;
    this.x = spawnX;
    this.y = spawnY;
    this.angle = angle;
    this.speed = 0;
    this.angularVelocity = 0;
    this.health = def.maxHealth;
    this.maxHealth = def.maxHealth;
    this.isOccupied = false;
    this.isDestroyed = false;
    this.nitroRemaining = 100;
    this.maxNitro = 100;
    this.isBoosting = false;
    this.skidMarks = [];
    this.smokeParticles = [];
    this.collisionCooldown = 0;
    this.headlightOn = true;
  }

  public get width(): number {
    return this.def.width;
  }

  public get height(): number {
    return this.def.height;
  }

  public getCenterX(): number {
    return this.x + this.width / 2;
  }

  public getCenterY(): number {
    return this.y + this.height / 2;
  }

  public repair(amount = 999): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.isDestroyed = false;
  }

  public takeDamage(damage: number): void {
    if (this.isDestroyed) return;
    const mitigated = Math.max(3, damage - this.def.armor);
    this.health = Math.max(0, this.health - mitigated);

    if (this.health <= 0) {
      this.isDestroyed = true;
      this.speed = 0;
      soundFX?.playEnemyDeath?.();
    }
  }

  public update(dt: number, input: InputState | null, mapGrid: number[][]): void {
    // Collision cooldown
    if (this.collisionCooldown > 0) {
      this.collisionCooldown -= dt;
    }

    // Nitro recharge if not occupied or not boosting
    if (!this.isBoosting && this.nitroRemaining < this.maxNitro) {
      this.nitroRemaining = Math.min(this.maxNitro, this.nitroRemaining + dt * 14);
    }

    // Manage smoke when health is low
    if (this.health < this.maxHealth * 0.4 || this.isDestroyed) {
      if (Math.random() < 0.4) {
        this.smokeParticles.push({
          x: this.getCenterX() + (Math.random() - 0.5) * 12,
          y: this.getCenterY() + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 15,
          vy: -20 - Math.random() * 25,
          life: 0,
          maxLife: 0.6 + Math.random() * 0.5,
          size: 4 + Math.random() * 6,
        });
      }
    }

    // Update smoke
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life >= p.maxLife) {
        this.smokeParticles.splice(i, 1);
      }
    }

    // Decay skid marks
    for (let i = this.skidMarks.length - 1; i >= 0; i--) {
      this.skidMarks[i].alpha -= dt * 0.2;
      if (this.skidMarks[i].alpha <= 0) {
        this.skidMarks.splice(i, 1);
      }
    }

    if (this.isDestroyed) {
      this.speed *= 0.85;
      return;
    }

    // If driven by player
    if (this.isOccupied && input) {
      const isAccelerating = input.up;
      const isReversingOrBraking = input.down;
      const isSteeringLeft = input.left;
      const isSteeringRight = input.right;
      const wantsNitro = input.sprint && this.nitroRemaining > 5;

      this.isBoosting = wantsNitro && isAccelerating;

      let topSpeed = this.def.maxSpeed;
      let accel = this.def.acceleration;

      if (this.isBoosting) {
        topSpeed *= this.def.nitroBoost;
        accel *= 1.4;
        this.nitroRemaining = Math.max(0, this.nitroRemaining - dt * 35);
      }

      // Acceleration & Braking
      if (isAccelerating) {
        if (this.speed < topSpeed) {
          this.speed += accel * dt;
        }
      } else if (isReversingOrBraking) {
        if (this.speed > 5) {
          // Braking
          this.speed -= this.def.braking * dt;
        } else if (this.speed > -this.def.reverseSpeed) {
          // Reverse
          this.speed -= accel * 0.7 * dt;
        }
      } else {
        // Natural deceleration / rolling resistance
        this.speed *= Math.pow(this.def.friction, dt * 60);
        if (Math.abs(this.speed) < 3) this.speed = 0;
      }

      // Steering (turn speed scales with velocity)
      const absSpeed = Math.abs(this.speed);
      if (absSpeed > 6) {
        const speedRatio = Math.min(1.2, absSpeed / (this.def.maxSpeed * 0.6));
        const directionSign = this.speed >= 0 ? 1 : -1;
        const turnRate = this.def.turnSpeed * speedRatio * directionSign;

        if (isSteeringLeft) {
          this.angle -= turnRate * dt;
        }
        if (isSteeringRight) {
          this.angle += turnRate * dt;
        }

        // Add skid marks during sharp turns or braking at high speeds
        if (absSpeed > 130 && (isSteeringLeft || isSteeringRight || (isReversingOrBraking && this.speed > 80))) {
          if (Math.random() < 0.6) {
            const cos = Math.cos(this.angle);
            const sin = Math.sin(this.angle);
            const rearX = this.getCenterX() - cos * (this.height * 0.4);
            const rearY = this.getCenterY() - sin * (this.height * 0.4);
            this.skidMarks.push({
              x: rearX,
              y: rearY,
              alpha: 0.7,
              angle: this.angle,
            });
            if (this.skidMarks.length > 50) {
              this.skidMarks.shift();
            }
          }
        }
      }
    } else {
      // Unoccupied deceleration
      this.isBoosting = false;
      this.speed *= Math.pow(this.def.friction * 0.9, dt * 60);
      if (Math.abs(this.speed) < 2) this.speed = 0;
    }

    // Velocity vector based on vehicle forward angle (angle: 0 = straight down, or along forward vector)
    // We treat angle 0 as facing UP (-Y) for intuitive car rotation:
    const forwardX = Math.sin(this.angle);
    const forwardY = -Math.cos(this.angle);

    const deltaX = forwardX * this.speed * dt;
    const deltaY = forwardY * this.speed * dt;

    const nextX = this.x + deltaX;
    const nextY = this.y + deltaY;

    // World & Tile Collision resolution
    const collision = this.checkCollision(nextX, nextY, mapGrid);
    if (!collision) {
      this.x = nextX;
      this.y = nextY;
    } else {
      // Rebound & impact damage
      if (Math.abs(this.speed) > 40 && this.collisionCooldown <= 0) {
        const impactDmg = Math.floor(Math.abs(this.speed) * 0.12);
        this.takeDamage(impactDmg);
        this.collisionCooldown = 0.4;
soundFX?.playEnemyDeath?.();
      }
      this.speed = -this.speed * 0.35;
    }

    // World bounds clamp
    const minBoundX = GAME_CONFIG.tileSize + 6;
    const maxBoundX = GAME_CONFIG.worldWidth - GAME_CONFIG.tileSize - this.width - 6;
    const minBoundY = GAME_CONFIG.tileSize + 6;
    const maxBoundY = GAME_CONFIG.worldHeight - GAME_CONFIG.tileSize - this.height - 6;

    this.x = Math.max(minBoundX, Math.min(maxBoundX, this.x));
    this.y = Math.max(minBoundY, Math.min(maxBoundY, this.y));
  }

  private checkCollision(targetX: number, targetY: number, mapGrid: number[][]): boolean {
    const tileSize = GAME_CONFIG.tileSize;
    const halfW = this.width * 0.4;
    const halfH = this.height * 0.4;
    const cx = targetX + this.width / 2;
    const cy = targetY + this.height / 2;

    const corners = [
      { x: cx - halfW, y: cy - halfH },
      { x: cx + halfW, y: cy - halfH },
      { x: cx - halfW, y: cy + halfH },
      { x: cx + halfW, y: cy + halfH },
    ];

    for (const pt of corners) {
      const col = Math.floor(pt.x / tileSize);
      const row = Math.floor(pt.y / tileSize);

      if (row < 0 || row >= GAME_CONFIG.mapRows || col < 0 || col >= GAME_CONFIG.mapCols) {
        return true;
      }

      const tile = mapGrid[row]?.[col] ?? 0;
      if (isSolidTileType(tile)) {
        return true;
      }
    }
    return false;
  }
}