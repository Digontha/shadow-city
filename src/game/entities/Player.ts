import { GAME_CONFIG } from '../../config/gameConfig';
import { resolveMovement, BoundingBox } from '../engine/collision';
import { InputState } from '../input/InputManager';
export type PlayerAnimState = 'idle' | 'walk' | 'run' | 'attack' | 'hit' | 'dead';
export type PlayerCondition = 'normal' | 'exhausted' | 'invulnerable' | 'dead';
export interface InteractableEntity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  district: string;
}

export class Player {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public speed: number;
  public sprintSpeed: number;
  public facing: Direction;
  public isMoving: boolean;
  public isSprinting: boolean;
  public stats: PlayerStats;
  public name: string;
  public animFrame: number;
  public animTimer: number;

  // Advanced mechanics state
  public animState: PlayerAnimState;
  public condition: PlayerCondition;
  public isAttacking: boolean;
  public attackTimer: number;
  public attackCooldown: number;
  public attackCooldownTimer: number;
  public invulnerabilityTimer: number;
  public isInvulnerable: boolean;
  public hitFlashTimer: number;
  public isDead: boolean;
  public deathTimer: number;
  public idleBreathePhase: number;
public staminaRegenCooldown: number;
  public nearbyInteractable: InteractableEntity | null;
  public interactionCooldown: number;
  public attackCount: number;
  public isInVehicle: boolean;
  public currentVehicle: any | null;
  public equipmentAttackBonus: number;
  public equipmentDefenseBonus: number;
  public equipmentSpeedBonus: number;

  private spawnPosition: { x: number; y: number };

  constructor(spawnX?: number, spawnY?: number) {
    this.width = GAME_CONFIG.playerWidth;
    this.height = GAME_CONFIG.playerHeight;
    const initialX = spawnX ?? GAME_CONFIG.spawnCol * GAME_CONFIG.tileSize + (GAME_CONFIG.tileSize - this.width) / 2;
    const initialY = spawnY ?? GAME_CONFIG.spawnRow * GAME_CONFIG.tileSize + (GAME_CONFIG.tileSize - this.height) / 2;
    this.x = initialX;
    this.y = initialY;
    this.spawnPosition = { x: initialX, y: initialY };

    this.speed = GAME_CONFIG.playerSpeed;
    this.sprintSpeed = GAME_CONFIG.playerSprintSpeed;
    this.facing = 'down';
    this.isMoving = false;
    this.isSprinting = false;
    this.animFrame = 0;
    this.animTimer = 0;
    this.idleBreathePhase = 0;

    this.animState = 'idle';
    this.condition = 'normal';
    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackCooldown = 0.32;
    this.attackCooldownTimer = 0;
    this.attackCount = 0;

    this.invulnerabilityTimer = 0;
    this.isInvulnerable = false;
    this.hitFlashTimer = 0;
    this.isDead = false;
    this.deathTimer = 0;
this.staminaRegenCooldown = 0;
        this.nearbyInteractable = null;
        this.interactionCooldown = 0;
        this.isInVehicle = false;
        this.currentVehicle = null;
        this.equipmentAttackBonus = 10;
        this.equipmentDefenseBonus = 8;
        this.equipmentSpeedBonus = 0;

        this.name = 'Cipher';
    this.stats = {
      health: 100,
      maxHealth: 100,
      energy: 100,
      maxEnergy: 100,
      district: 'Neon District',
    };
  }

  public setAttackCooldown(time: number): void {
    this.attackCooldown = time;
  }

  public getBounds(): BoundingBox {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public getCenterX(): number {
    return this.x + this.width / 2;
  }

  public getCenterY(): number {
    return this.y + this.height / 2;
  }

public takeDamage(amount: number): boolean {
    if (this.isDead || this.isInvulnerable) return false;

    // Apply equipment defense mitigation (minimum 25% damage taken)
    const mitigation = Math.min(0.75, this.equipmentDefenseBonus * 0.015);
    const effectiveDamage = Math.max(1, Math.round(amount * (1 - mitigation)));

    this.stats.health = Math.max(0, this.stats.health - effectiveDamage);
    this.isInvulnerable = true;
    this.invulnerabilityTimer = 0.8;
    this.hitFlashTimer = 0.25;

    if (this.stats.health <= 0) {
      this.triggerDeath();
      return true;
    }

    this.animState = 'hit';
    return true;
  }

  public heal(amount: number): void {
    if (this.isDead) return;
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }

  public restoreEnergy(amount: number): void {
    this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + amount);
  }

  public triggerDeath(): void {
    this.isDead = true;
    this.condition = 'dead';
    this.animState = 'dead';
    this.isMoving = false;
    this.isSprinting = false;
    this.isAttacking = false;
    this.stats.health = 0;
  }

  public respawn(): void {
    this.x = this.spawnPosition.x;
    this.y = this.spawnPosition.y;
    this.stats.health = this.stats.maxHealth;
    this.stats.energy = this.stats.maxEnergy;
    this.isDead = false;
    this.condition = 'normal';
    this.animState = 'idle';
    this.facing = 'down';
    this.animFrame = 0;
    this.isInvulnerable = true;
    this.invulnerabilityTimer = 1.2;
    this.isAttacking = false;
  }

  public setSpawn(x: number, y: number): void {
    this.spawnPosition = { x, y };
  }

  public getAttackHitbox(): BoundingBox {
    const reach = 28;
    const box: BoundingBox = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };

    switch (this.facing) {
      case 'up':
        box.y -= reach;
        box.height = reach;
        break;
      case 'down':
        box.y += this.height;
        box.height = reach;
        break;
      case 'left':
        box.x -= reach;
        box.width = reach;
        break;
      case 'right':
        box.x += this.width;
        box.width = reach;
        break;
    }
    return box;
  }

  public update(dt: number, input: InputState, mapGrid: number[][]): void {
    // Dead state lock
    if (this.isDead) {
      this.deathTimer += dt;
      this.animState = 'dead';
      return;
    }

    // Timers handling
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= dt;
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
      }
    }

    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
    }

    if (this.attackCooldownTimer > 0) {
      this.attackCooldownTimer -= dt;
    }

    if (this.interactionCooldown > 0) {
      this.interactionCooldown -= dt;
    }

    if (this.staminaRegenCooldown > 0) {
      this.staminaRegenCooldown -= dt;
    }

// Attack Action execution
    if (input.attack && this.attackCooldownTimer <= 0 && !this.isAttacking) {
      this.isAttacking = true;
      this.attackTimer = 0.22;
      this.attackCooldownTimer = this.attackCooldown;
      this.animState = 'attack';
      this.animFrame = 0;
      this.attackCount += 1;
      this.stats.energy = Math.max(0, this.stats.energy - 6);
      this.staminaRegenCooldown = 0.4;
    }

    if (this.isAttacking) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }

    // Movement calculation
    let moveX = 0;
    let moveY = 0;

    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;
    if (input.up) moveY -= 1;
    if (input.down) moveY += 1;

    this.isMoving = (moveX !== 0 || moveY !== 0) && !this.isAttacking;

    // Stamina & Exhaustion management
    const canSprint = this.stats.energy > 8 && this.condition !== 'exhausted';
    this.isSprinting = input.sprint && this.isMoving && canSprint;

    if (this.stats.energy <= 0 && this.condition !== 'exhausted') {
      this.condition = 'exhausted';
      this.staminaRegenCooldown = 0.8;
    } else if (this.condition === 'exhausted' && this.stats.energy >= 25) {
      this.condition = this.isInvulnerable ? 'invulnerable' : 'normal';
    } else if (this.isInvulnerable) {
      this.condition = 'invulnerable';
    } else if (this.condition !== 'exhausted') {
      this.condition = 'normal';
    }

    // Facing direction
    if (this.isMoving) {
      if (moveX > 0) this.facing = 'right';
      else if (moveX < 0) this.facing = 'left';
      else if (moveY > 0) this.facing = 'down';
      else if (moveY < 0) this.facing = 'up';
    }

    if (this.isMoving) {
      let currentSpeed = this.isSprinting ? this.sprintSpeed : this.speed;

      // Exhaustion slows speed down
      if (this.condition === 'exhausted') {
        currentSpeed *= 0.75;
      }

      // Diagonal normalization
      if (moveX !== 0 && moveY !== 0) {
        currentSpeed *= Math.SQRT1_2;
      }

      // Energy consumption
      if (this.isSprinting) {
        this.stats.energy = Math.max(0, this.stats.energy - dt * 22);
        this.staminaRegenCooldown = 0.5;
      } else if (this.staminaRegenCooldown <= 0) {
        this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + dt * 10);
      }

      const targetX = this.x + moveX * currentSpeed * dt;
      const targetY = this.y + moveY * currentSpeed * dt;

      const resolved = resolveMovement(
        this.x,
        this.y,
        targetX,
        targetY,
        this.width,
        this.height,
        mapGrid
      );

// Keep within world bounds with padding from border walls
      const minBoundX = GAME_CONFIG.tileSize + 4;
      const maxBoundX = GAME_CONFIG.worldWidth - GAME_CONFIG.tileSize - this.width - 4;
      const minBoundY = GAME_CONFIG.tileSize + 4;
      const maxBoundY = GAME_CONFIG.worldHeight - GAME_CONFIG.tileSize - this.height - 4;

      this.x = Math.max(minBoundX, Math.min(maxBoundX, resolved.x));
      this.y = Math.max(minBoundY, Math.min(maxBoundY, resolved.y));

      // Walk / Run animation timing
      this.animTimer += dt * (this.isSprinting ? 14 : 9);
      if (this.animTimer >= 1) {
        this.animFrame = (this.animFrame + 1) % 4;
        this.animTimer = 0;
      }

      if (!this.isAttacking && this.hitFlashTimer <= 0) {
        this.animState = this.isSprinting ? 'run' : 'walk';
      }
    } else {
      // Idle recovery & breathing
      this.animFrame = 0;
      this.animTimer = 0;
      this.idleBreathePhase = (this.idleBreathePhase + dt * 3) % (Math.PI * 2);

      if (this.staminaRegenCooldown <= 0) {
        this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + dt * 24);
      }

      if (!this.isAttacking && this.hitFlashTimer <= 0) {
        this.animState = 'idle';
      }
    }
  }

  public teleport(col: number, row: number): void {
    this.x = col * GAME_CONFIG.tileSize + (GAME_CONFIG.tileSize - this.width) / 2;
    this.y = row * GAME_CONFIG.tileSize + (GAME_CONFIG.tileSize - this.height) / 2;
  }
}