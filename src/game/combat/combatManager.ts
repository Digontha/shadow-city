import { Player } from '../entities/Player';
import { Enemy, ENEMY_ARCHETYPES, EnemyType } from '../entities/Enemy';
import { WEAPON_REGISTRY, Weapon } from './weaponSystem';
import { soundFX } from '../audio/soundFX';
import { BoundingBox } from '../engine/collision';
import { GAME_CONFIG } from '@/config/gameConfig';

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  text: string;
  isCrit: boolean;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
}

export interface HitParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface CombatStats {
  kills: number;
  damageDealt: number;
  damageTaken: number;
  credits: number;
  xp: number;
  level: number;
  nextLevelXp: number;
  comboCount: number;
  comboTimer: number;
}

export class CombatManager {
  public enemies: Enemy[] = [];
  public damageNumbers: DamageNumber[] = [];
  public particles: HitParticle[] = [];
  public activeWeapon: Weapon;
  public stats: CombatStats;
  public slashVisualTimer: number = 0;
  public slashBox: BoundingBox | null = null;
  public screenShakeTimer: number = 0;
  public screenShakeMagnitude: number = 0;

  constructor() {
    this.activeWeapon = WEAPON_REGISTRY['kinetic-blade'];
    this.stats = {
      kills: 0,
      damageDealt: 0,
      damageTaken: 0,
      credits: 120,
      xp: 0,
      level: 1,
      nextLevelXp: 100,
      comboCount: 0,
      comboTimer: 0,
    };

    this.spawnInitialEnemies();
  }

  public setWeapon(weaponId: string): void {
    if (WEAPON_REGISTRY[weaponId]) {
      this.activeWeapon = WEAPON_REGISTRY[weaponId];
      soundFX.playWeaponSwitch();
    }
  }

  public spawnInitialEnemies(): void {
    const tile = GAME_CONFIG.tileSize;
    // Disperse varied enemies throughout city plazas, alleys and perimeters
    const spawnPoints: Array<{ type: EnemyType; col: number; row: number }> = [
      // Street Thugs in south-west alleyways
      { type: 'thug', col: 12, row: 18 },
      { type: 'thug', col: 16, row: 20 },
      { type: 'thug', col: 28, row: 26 },

      // Recon Drones patrolling broad roads and plaza edges
      { type: 'drone', col: 24, row: 14 },
      { type: 'drone', col: 36, row: 18 },
      { type: 'drone', col: 42, row: 22 },

      // Heavy Enforcers guarding commercial entrances & checkpoints
      { type: 'enforcer', col: 20, row: 8 },
      { type: 'enforcer', col: 38, row: 12 },
      { type: 'enforcer', col: 48, row: 28 },

      // Shadow Assassins lurking in perimeter shadows
      { type: 'assassin', col: 10, row: 30 },
      { type: 'assassin', col: 44, row: 34 },
    ];

    this.enemies = spawnPoints.map((sp, idx) => {
      const sx = sp.col * tile + 8;
      const sy = sp.row * tile + 8;
      return new Enemy(`enemy_${idx + 1}`, sp.type, sx, sy);
    });
  }

  public addDamageNumber(x: number, y: number, text: string, isCrit: boolean, color = '#ffffff'): void {
    this.damageNumbers.push({
      id: Math.random().toString(),
      x: x + (Math.random() * 16 - 8),
      y: y - 10,
      text,
      isCrit,
      color: isCrit ? '#ff3366' : color,
      opacity: 1,
      life: 0,
      maxLife: isCrit ? 0.9 : 0.65,
    });
  }

  public spawnHitSparks(x: number, y: number, color: string, count = 10): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 2.5,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.2,
      });
    }
  }

  public triggerScreenShake(duration = 0.2, magnitude = 4): void {
    this.screenShakeTimer = duration;
    this.screenShakeMagnitude = magnitude;
  }

  // Handle Player attack execution against live enemies
  public executePlayerAttack(player: Player): void {
    const weapon = this.activeWeapon;
    soundFX.playSlash(weapon.cooldown < 0.25 ? 1.3 : 1.0);

    // Compute attack hitbox based on weapon reach
    const reach = weapon.reach;
    const box: BoundingBox = {
      x: player.x,
      y: player.y,
      width: player.width,
      height: player.height,
    };

    let dirX = 0;
    let dirY = 0;

    switch (player.facing) {
      case 'up':
        box.y -= reach;
        box.height = reach;
        dirY = -1;
        break;
      case 'down':
        box.y += player.height;
        box.height = reach;
        dirY = 1;
        break;
      case 'left':
        box.x -= reach;
        box.width = reach;
        dirX = -1;
        break;
      case 'right':
        box.x += player.width;
        box.width = reach;
        dirX = 1;
        break;
    }

    this.slashBox = box;
    this.slashVisualTimer = 0.22;

    let hitAny = false;

    // Hit test against every enemy
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;

      const eBounds = enemy.getBounds();
      const collides =
        box.x < eBounds.x + eBounds.width &&
        box.x + box.width > eBounds.x &&
        box.y < eBounds.y + eBounds.height &&
        box.y + box.height > eBounds.y;

      if (collides) {
        hitAny = true;

        // Damage & Crit Formula
        const isCrit = Math.random() < weapon.critChance;
        const baseVariance = 0.85 + Math.random() * 0.3; // 85% - 115%
        let calcDamage = weapon.damage * baseVariance;
        if (isCrit) {
          calcDamage *= weapon.critMultiplier;
        }

        const { isDead, finalDamage } = enemy.takeDamage(
          calcDamage,
          dirX,
          dirY,
          weapon.knockback
        );

        this.stats.damageDealt += finalDamage;

        // Sound & visual feedback
        soundFX.playHit(isCrit);
        this.addDamageNumber(enemy.getCenterX(), enemy.y, `${finalDamage}${isCrit ? '!' : ''}`, isCrit);
        this.spawnHitSparks(enemy.getCenterX(), enemy.getCenterY(), weapon.color, isCrit ? 16 : 8);

        // Combo Counter
        this.stats.comboCount += 1;
        this.stats.comboTimer = 2.4;

        if (isCrit) {
          this.triggerScreenShake(0.18, 5);
        }

        // Enemy defeated reward handling
        if (isDead) {
          soundFX.playEnemyDeath();
          this.stats.kills += 1;
          this.stats.credits += enemy.creditsReward;
          this.grantExperience(enemy.xpReward);
          this.addDamageNumber(enemy.getCenterX(), enemy.y - 18, `+${enemy.xpReward} XP`, false, '#16ca8e');
        }
      }
    }

    if (!hitAny) {
      // Air swing
      player.attackCooldownTimer = weapon.cooldown;
    }
  }

  public grantExperience(amount: number): void {
    this.stats.xp += amount;
    while (this.stats.xp >= this.stats.nextLevelXp) {
      this.stats.xp -= this.stats.nextLevelXp;
      this.stats.level += 1;
      this.stats.nextLevelXp = Math.round(this.stats.nextLevelXp * 1.45);
      soundFX.playLevelUp();
      this.triggerScreenShake(0.3, 6);
    }
  }

  public update(dt: number, player: Player, mapGrid: number[][]): void {
    // Screen shake countdown
    if (this.screenShakeTimer > 0) {
      this.screenShakeTimer -= dt;
    }

    // Combo timer
    if (this.stats.comboTimer > 0) {
      this.stats.comboTimer -= dt;
      if (this.stats.comboTimer <= 0) {
        this.stats.comboCount = 0;
      }
    }

    // Slash visual overlay
    if (this.slashVisualTimer > 0) {
      this.slashVisualTimer -= dt;
      if (this.slashVisualTimer <= 0) {
        this.slashBox = null;
      }
    }

    // Update enemies & handle enemy melee against player
    for (const enemy of this.enemies) {
      const prevAlert = enemy.alertLevel;
      const { attackedPlayer, damageDealt } = enemy.update(dt, player, mapGrid);

      // Play sound on first detection threshold
      if (prevAlert < 0.35 && enemy.alertLevel >= 0.35) {
        soundFX.playAlert();
      }

      if (attackedPlayer && !player.isDead) {
        const damaged = player.takeDamage(damageDealt);
        if (damaged) {
          soundFX.playHit(false);
          this.stats.damageTaken += damageDealt;
          this.addDamageNumber(player.getCenterX(), player.y, `-${damageDealt}`, false, '#ff2a5f');
          this.spawnHitSparks(player.getCenterX(), player.getCenterY(), '#ff2a5f', 12);
          this.triggerScreenShake(0.18, 4);

          // Knockback player slightly
          const kx = player.x - enemy.x;
          const ky = player.y - enemy.y;
          const klen = Math.hypot(kx, ky) || 1;
          player.x += (kx / klen) * 12;
          player.y += (ky / klen) * 12;
        }
      }
    }

    // Update floating damage numbers
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.damageNumbers[i];
      dn.life += dt;
      dn.y -= dt * 38;
      dn.opacity = Math.max(0, 1 - dn.life / dn.maxLife);
      if (dn.life >= dn.maxLife) {
        this.damageNumbers.splice(i, 1);
      }
    }

    // Update hit sparks
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.94;
      p.vy *= 0.94;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }
}

export const combatManager = new CombatManager();