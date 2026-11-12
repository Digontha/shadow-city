import { GAME_CONFIG } from '../../config/gameConfig';
import { resolveMovement, BoundingBox } from '../engine/collision';
import { Player } from './Player';

export type EnemyType = 'thug' | 'drone' | 'enforcer' | 'assassin';
export type AIState = 'patrol' | 'suspicious' | 'chase' | 'attack' | 'retreat' | 'dead';

export interface EnemyConfig {
  type: EnemyType;
  name: string;
  maxHealth: number;
  damage: number;
  speed: number;
  chaseSpeed: number;
  detectionRadius: number;
  attackRange: number;
  attackCooldown: number;
  xpReward: number;
  creditsReward: number;
  width: number;
  height: number;
  color: string;
  glowColor: string;
  armor: number; // damage reduction flat
}

export const ENEMY_ARCHETYPES: Record<EnemyType, EnemyConfig> = {
  thug: {
    type: 'thug',
    name: 'Syndicate Thug',
    maxHealth: 55,
    damage: 12,
    speed: 38,
    chaseSpeed: 65,
    detectionRadius: 130,
    attackRange: 26,
    attackCooldown: 1.1,
    xpReward: 35,
    creditsReward: 15,
    width: 20,
    height: 28,
    color: '#ff9900',
    glowColor: 'rgba(255, 153, 0, 0.4)',
    armor: 1,
  },
  drone: {
    type: 'drone',
    name: 'Sector Recon Drone',
    maxHealth: 35,
    damage: 8,
    speed: 55,
    chaseSpeed: 82,
    detectionRadius: 180,
    attackRange: 32,
    attackCooldown: 0.8,
    xpReward: 45,
    creditsReward: 25,
    width: 18,
    height: 18,
    color: '#00e5ff',
    glowColor: 'rgba(0, 229, 255, 0.6)',
    armor: 0,
  },
  enforcer: {
    type: 'enforcer',
    name: 'Corp Heavy Enforcer',
    maxHealth: 120,
    damage: 22,
    speed: 28,
    chaseSpeed: 52,
    detectionRadius: 140,
    attackRange: 28,
    attackCooldown: 1.4,
    xpReward: 90,
    creditsReward: 60,
    width: 24,
    height: 32,
    color: '#ff2a5f',
    glowColor: 'rgba(255, 42, 95, 0.5)',
    armor: 5,
  },
  assassin: {
    type: 'assassin',
    name: 'Shadow Infiltrator',
    maxHealth: 70,
    damage: 26,
    speed: 46,
    chaseSpeed: 88,
    detectionRadius: 160,
    attackRange: 30,
    attackCooldown: 0.9,
    xpReward: 80,
    creditsReward: 50,
    width: 20,
    height: 28,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.65)',
    armor: 2,
  },
};

export class Enemy {
  public id: string;
  public type: EnemyType;
  public name: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public health: number;
  public maxHealth: number;
  public damage: number;
  public speed: number;
  public chaseSpeed: number;
  public detectionRadius: number;
  public attackRange: number;
  public attackCooldown: number;
  public xpReward: number;
  public creditsReward: number;
  public armor: number;
  public color: string;
  public glowColor: string;

  // AI & States
  public state: AIState;
  public facing: 'left' | 'right' | 'up' | 'down';
  public alertLevel: number; // 0 to 1
  public attackTimer: number;
  public hitFlashTimer: number;
  public isDead: boolean;
  public deathTimer: number;
  public respawnTimer: number;
  public respawnDelay: number;

  // Knockback physics
  public vx: number;
  public vy: number;
  public friction: number;

  // Patrol logic
  public spawnX: number;
  public spawnY: number;
  public patrolWaypoints: Array<{ x: number; y: number }>;
  public currentWaypointIndex: number;
  public patrolWaitTimer: number;
  public walkCycle: number;

  constructor(id: string, type: EnemyType, spawnX: number, spawnY: number, customWaypoints?: Array<{ x: number; y: number }>) {
    const config = ENEMY_ARCHETYPES[type];
    this.id = id;
    this.type = type;
    this.name = config.name;
    this.x = spawnX;
    this.y = spawnY;
    this.spawnX = spawnX;
    this.spawnY = spawnY;
    this.width = config.width;
    this.height = config.height;
    this.health = config.maxHealth;
    this.maxHealth = config.maxHealth;
    this.damage = config.damage;
    this.speed = config.speed;
    this.chaseSpeed = config.chaseSpeed;
    this.detectionRadius = config.detectionRadius;
    this.attackRange = config.attackRange;
    this.attackCooldown = config.attackCooldown;
    this.xpReward = config.xpReward;
    this.creditsReward = config.creditsReward;
    this.armor = config.armor;
    this.color = config.color;
    this.glowColor = config.glowColor;

    this.state = 'patrol';
    this.facing = 'down';
    this.alertLevel = 0;
    this.attackTimer = 0;
    this.hitFlashTimer = 0;
    this.isDead = false;
    this.deathTimer = 0;
    this.respawnTimer = 0;
    this.respawnDelay = 14; // Respawn in seconds

    this.vx = 0;
    this.vy = 0;
    this.friction = 0.88;
    this.walkCycle = 0;
    this.patrolWaitTimer = 0;

    // Generated patrol perimeter if none specified
    if (customWaypoints && customWaypoints.length > 0) {
      this.patrolWaypoints = customWaypoints;
    } else {
      const offset = 64;
      this.patrolWaypoints = [
        { x: spawnX, y: spawnY },
        { x: spawnX + offset, y: spawnY },
        { x: spawnX + offset, y: spawnY + offset },
        { x: spawnX, y: spawnY + offset },
      ];
    }
    this.currentWaypointIndex = 0;
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

  public applyKnockback(dirX: number, dirY: number, force: number): void {
    const len = Math.hypot(dirX, dirY) || 1;
    this.vx += (dirX / len) * force;
    this.vy += (dirY / len) * force;
  }

  public takeDamage(amount: number, dirX = 0, dirY = 0, knockbackForce = 100): { isDead: boolean; finalDamage: number } {
    if (this.isDead) return { isDead: false, finalDamage: 0 };

    const effectiveDamage = Math.max(2, Math.round(amount - this.armor));
    this.health = Math.max(0, this.health - effectiveDamage);
    this.hitFlashTimer = 0.22;
    this.applyKnockback(dirX, dirY, knockbackForce);

    // Taking damage instantly alerts enemy to chase player
    this.state = 'chase';
    this.alertLevel = 1;

    if (this.health <= 0) {
      this.isDead = true;
      this.state = 'dead';
      this.deathTimer = 0;
      this.respawnTimer = this.respawnDelay;
      return { isDead: true, finalDamage: effectiveDamage };
    }

    return { isDead: false, finalDamage: effectiveDamage };
  }

  public respawn(): void {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.health = this.maxHealth;
    this.isDead = false;
    this.state = 'patrol';
    this.alertLevel = 0;
    this.attackTimer = 0;
    this.deathTimer = 0;
    this.hitFlashTimer = 0;
    this.vx = 0;
    this.vy = 0;
  }

  public update(dt: number, player: Player, mapGrid: number[][]): { attackedPlayer: boolean; damageDealt: number } {
    let attackedPlayer = false;
    let damageDealt = 0;

    // Handle dead state & respawn cycle
    if (this.isDead) {
      this.deathTimer += dt;
      if (this.respawnTimer > 0) {
        this.respawnTimer -= dt;
        if (this.respawnTimer <= 0) {
          this.respawn();
        }
      }
      return { attackedPlayer, damageDealt };
    }

    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
    }
    if (this.attackTimer > 0) {
      this.attackTimer -= dt;
    }

    // Apply knockback velocity with map bounds
    if (Math.abs(this.vx) > 0.5 || Math.abs(this.vy) > 0.5) {
      const targetX = this.x + this.vx * dt * 5;
      const targetY = this.y + this.vy * dt * 5;
      const res = resolveMovement(this.x, this.y, targetX, targetY, this.width, this.height, mapGrid);
      this.x = res.x;
      this.y = res.y;
      this.vx *= this.friction;
      this.vy *= this.friction;
    }

    const selfCenterX = this.getCenterX();
    const selfCenterY = this.getCenterY();
    const playerCenterX = player.getCenterX();
    const playerCenterY = player.getCenterY();

    const dx = playerCenterX - selfCenterX;
    const dy = playerCenterY - selfCenterY;
    const distToPlayer = Math.hypot(dx, dy);

    // AI State Machine
    if (!player.isDead) {
      if (distToPlayer <= this.detectionRadius) {
        this.alertLevel = Math.min(1, this.alertLevel + dt * 2.5);
        if (this.alertLevel >= 0.35) {
          this.state = distToPlayer <= this.attackRange ? 'attack' : 'chase';
        } else {
          this.state = 'suspicious';
        }
      } else {
        // Player out of sight -> alert cools down slowly
        this.alertLevel = Math.max(0, this.alertLevel - dt * 0.4);
        if (this.alertLevel <= 0.05) {
          this.state = 'patrol';
        }
      }
    } else {
      this.state = 'patrol';
      this.alertLevel = 0;
    }

    // Facing calculation
    if (Math.abs(dx) > Math.abs(dy)) {
      this.facing = dx > 0 ? 'right' : 'left';
    } else {
      this.facing = dy > 0 ? 'down' : 'up';
    }

    let moveX = 0;
    let moveY = 0;
    let currentSpeed = this.speed;

    if (this.state === 'chase') {
      currentSpeed = this.chaseSpeed;
      if (distToPlayer > this.attackRange * 0.8) {
        moveX = dx / distToPlayer;
        moveY = dy / distToPlayer;
      }
    } else if (this.state === 'attack') {
      // In attack range
      if (this.attackTimer <= 0) {
        this.attackTimer = this.attackCooldown;
        attackedPlayer = true;
        damageDealt = this.damage;
      }
    } else if (this.state === 'patrol') {
      // Normal Patrol Waypoint Cycling
      if (this.patrolWaypoints.length > 0) {
        const targetWp = this.patrolWaypoints[this.currentWaypointIndex];
        const wpDx = targetWp.x - this.x;
        const wpDy = targetWp.y - this.y;
        const wpDist = Math.hypot(wpDx, wpDy);

        if (wpDist < 12) {
          this.patrolWaitTimer += dt;
          if (this.patrolWaitTimer > 2.0) {
            this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.patrolWaypoints.length;
            this.patrolWaitTimer = 0;
          }
        } else {
          moveX = wpDx / wpDist;
          moveY = wpDy / wpDist;
        }
      }
    }

    // Execute Move with World Collision
    if (moveX !== 0 || moveY !== 0) {
      const nextX = this.x + moveX * currentSpeed * dt;
      const nextY = this.y + moveY * currentSpeed * dt;

      const resolved = resolveMovement(this.x, this.y, nextX, nextY, this.width, this.height, mapGrid);
      this.x = resolved.x;
      this.y = resolved.y;
      this.walkCycle += dt * 8;
    }

    return { attackedPlayer, damageDealt };
  }
}