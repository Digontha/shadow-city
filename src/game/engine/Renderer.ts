import { GAME_CONFIG } from '../../config/gameConfig';
import { Camera } from './Camera';
import { Player } from '../entities/Player';
import { TileType } from '../types';
import { propsManager, EnvironmentProp } from '../world/environmentProps';
import { dayNightCycle } from '../world/dayNightCycle';
import { weatherSystem } from '../world/weatherSystem';
import { getDistrictAtPosition } from '../world/cityMap';
import { combatManager } from '../combat/combatManager';
import { Enemy } from '../entities/Enemy';
import { vehicleManager } from '../vehicles/vehicleManager';
import { Vehicle } from '../vehicles/Vehicle';
import { particleSystem } from '../effects/particleSystem';
import { transitionManager } from '../effects/transitionManager';
import { saveManager } from '../save/saveManager';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
    this.dpr = window.devicePixelRatio || 1;
  }

  public resize(displayWidth: number, displayHeight: number): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(displayWidth * this.dpr);
    this.canvas.height = Math.floor(displayHeight * this.dpr);
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  }

  public clear(): void {
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;
    this.ctx.fillStyle = GAME_CONFIG.colors.background;
    this.ctx.fillRect(0, 0, width, height);
  }

  public render(
    mapGrid: number[][],
    player: Player,
    camera: Camera,
    fps: number
  ): void {
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;

    // Update environmental systems (time, weather, props)
    const dt = 1 / 60;
    dayNightCycle.update(dt);
    weatherSystem.update(dt, width, height);
    propsManager.update(dt);

    this.clear();

    // Pass 1: Base World Tiles (Roads, Sidewalks, Parks, Water, Plazas)
    this.renderWorldMap(mapGrid, camera);

    // Pass 2: Ground Shadows cast by buildings & obstacles
    this.renderShadowsAndHighlights(mapGrid, camera);

    // Pass 3: Environmental Props (Benches, Trees, Dumpsters, Vending Machines)
    this.renderEnvironmentalProps(camera);

// Pass 3b: Active Hostile Enemies
    if (combatManager && combatManager.enemies) {
      this.renderEnemies(combatManager.enemies, camera);
    }

    // Pass 4: Player Character
    this.renderPlayer(player, camera);

    // Pass 5: Dynamic Lighting (Street lights, traffic lights, neon signs, player flashlight)
    this.renderDynamicLighting(player, camera);

    // Pass 6: Day / Night Ambient Atmosphere
    this.renderDayNightAtmosphere(player, camera);

    // Pass 7: Rain & Weather Particles
    weatherSystem.render(this.ctx, width, height);

    // Pass 8: Cyberpunk HUD & Minimap
    this.renderMinimapHUD(player, mapGrid);
    this.renderEnvironmentHUD(player, fps);
  }

  private renderWorldMap(mapGrid: number[][], camera: Camera): void {
    const tileSize = GAME_CONFIG.tileSize;
    const startCol = Math.max(0, Math.floor(camera.x / tileSize));
    const endCol = Math.min(
      GAME_CONFIG.mapCols - 1,
      Math.ceil((camera.x + camera.width) / tileSize)
    );
    const startRow = Math.max(0, Math.floor(camera.y / tileSize));
    const endRow = Math.min(
      GAME_CONFIG.mapRows - 1,
      Math.ceil((camera.y + camera.height) / tileSize)
    );

    const colors = GAME_CONFIG.colors;

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileType = mapGrid[r]?.[c] ?? 0;
        const screenPos = camera.worldToScreen(c * tileSize, r * tileSize);
        const x = screenPos.x;
        const y = screenPos.y;

        switch (tileType) {
          case TileType.Road: // 0: Asphalt Road
            this.ctx.fillStyle = colors.road;
            this.ctx.fillRect(x, y, tileSize, tileSize);
            // Centerline dashes
            if (c % 4 === 0 && (r === 10 || r === 20 || r === 30)) {
              this.ctx.fillStyle = colors.roadMarking;
              this.ctx.fillRect(x + tileSize * 0.15, y + tileSize * 0.46, tileSize * 0.7, 3);
            }
            if (r % 4 === 0 && (c === 14 || c === 28 || c === 42)) {
              this.ctx.fillStyle = colors.roadMarking;
              this.ctx.fillRect(x + tileSize * 0.46, y + tileSize * 0.15, 3, tileSize * 0.7);
            }
            break;

          case TileType.Crosswalk: // 9: Striped Crosswalk
            this.ctx.fillStyle = colors.road;
            this.ctx.fillRect(x, y, tileSize, tileSize);
            this.ctx.fillStyle = colors.roadCrosswalk;
            for (let stripe = 0; stripe < 4; stripe++) {
              this.ctx.fillRect(x + 4, y + 4 + stripe * 10, tileSize - 8, 5);
            }
            break;

          case TileType.Sidewalk: // 1: Paver Sidewalk
            this.ctx.fillStyle = colors.sidewalk;
            this.ctx.fillRect(x, y, tileSize, tileSize);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x + 0.5, y + 0.5, tileSize - 1, tileSize - 1);
            break;

          case TileType.Plaza: // 10: Smooth Plaza Tiles
            this.ctx.fillStyle = colors.plaza;
            this.ctx.fillRect(x, y, tileSize, tileSize);
            this.ctx.strokeStyle = 'rgba(22, 202, 142, 0.08)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
            break;

          case TileType.Park: // 6: Synthetic Bio-Park Grass
            this.ctx.fillStyle = colors.parkGrass;
            this.ctx.fillRect(x, y, tileSize, tileSize);
            // Grass texture dots
            this.ctx.fillStyle = 'rgba(22, 202, 142, 0.15)';
            this.ctx.fillRect(x + 10, y + 12, 3, 4);
            this.ctx.fillRect(x + 28, y + 26, 4, 3);
            break;

          case TileType.Water: // 7: Water Basin
            this.ctx.fillStyle = colors.water;
            this.ctx.fillRect(x, y, tileSize, tileSize);
            // Wave shimmer
            const waveOffset = Math.sin(Date.now() * 0.003 + r + c) * 3;
            this.ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
            this.ctx.fillRect(x + 4, y + tileSize * 0.45 + waveOffset, tileSize - 8, 3);
            break;

          case TileType.ShopFront: // 8: Retail Commercial Storefront
            this.ctx.fillStyle = colors.shopFront;
            this.ctx.fillRect(x, y, tileSize, tileSize);
            // Glowing neon entrance awning
            const shopNeon = (r + c) % 2 === 0 ? colors.neonAmber : colors.neonCyan;
            this.ctx.fillStyle = shopNeon;
            this.ctx.fillRect(x + 4, y + tileSize - 8, tileSize - 8, 4);
            // Shop window glow
            this.ctx.fillStyle = 'rgba(255, 200, 100, 0.15)';
            this.ctx.fillRect(x + 6, y + 6, tileSize - 12, tileSize - 18);
            break;

          case TileType.Building: // 2: Corporate Monolith
            this.ctx.fillStyle = colors.buildingRoof;
            this.ctx.fillRect(x, y, tileSize, tileSize);
            this.ctx.fillStyle = colors.building;
            this.ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

            // Windows with periodic neon lights
            const seed = (r * 73 + c * 31) % 10;
            if (seed > 6) {
              const winColor = seed === 9 ? colors.neonPrimary : colors.neonAccent;
              this.ctx.fillStyle = winColor;
              this.ctx.fillRect(x + tileSize * 0.35, y + tileSize * 0.35, tileSize * 0.3, tileSize * 0.25);
            }
            break;

          case TileType.NeonBuilding: // 5: Neon Skyscraper
            this.ctx.fillStyle = '#080c14';
            this.ctx.fillRect(x, y, tileSize, tileSize);
            this.ctx.fillStyle = '#101622';
            this.ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

            // Glowing rooftop edge trims
            this.ctx.strokeStyle = colors.neonPrimary;
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(x + 2.5, y + 2.5, tileSize - 5, tileSize - 5);
            break;

          case TileType.Wall: // 3: Security Barrier Wall
            this.ctx.fillStyle = colors.wall;
            this.ctx.fillRect(x, y, tileSize, tileSize);
            this.ctx.fillStyle = colors.buildingRoof;
            this.ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
            this.ctx.strokeStyle = 'rgba(22, 202, 142, 0.35)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
            break;

          case TileType.ShadowZone: // 4: Alley / Shadow Zone
            this.ctx.fillStyle = colors.shadowZone;
            this.ctx.fillRect(x, y, tileSize, tileSize);
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            this.ctx.fillRect(x + 8, y + 10, 4, 4);
            this.ctx.fillRect(x + 28, y + 22, 6, 4);
            break;

          default:
            this.ctx.fillStyle = colors.road;
            this.ctx.fillRect(x, y, tileSize, tileSize);
        }
      }
    }
  }

  private renderShadowsAndHighlights(mapGrid: number[][], camera: Camera): void {
    const tileSize = GAME_CONFIG.tileSize;
    const startCol = Math.max(0, Math.floor(camera.x / tileSize));
    const endCol = Math.min(
      GAME_CONFIG.mapCols - 1,
      Math.ceil((camera.x + camera.width) / tileSize)
    );
    const startRow = Math.max(0, Math.floor(camera.y / tileSize));
    const endRow = Math.min(
      GAME_CONFIG.mapRows - 1,
      Math.ceil((camera.y + camera.height) / tileSize)
    );

    // Drop shadows cast south-east from tall buildings
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const t = mapGrid[r]?.[c];
        if (t === TileType.Building || t === TileType.NeonBuilding || t === TileType.ShopFront) {
          const screenPos = camera.worldToScreen(c * tileSize, r * tileSize);
          // Cast shadow south
          if (r + 1 < GAME_CONFIG.mapRows && mapGrid[r + 1]?.[c] !== t) {
            this.ctx.fillRect(screenPos.x, screenPos.y + tileSize, tileSize, 14);
          }
          // Cast shadow east
          if (c + 1 < GAME_CONFIG.mapCols && mapGrid[r]?.[c + 1] !== t) {
            this.ctx.fillRect(screenPos.x + tileSize, screenPos.y, 10, tileSize + 14);
          }
        }
      }
    }
  }

  private renderEnvironmentalProps(camera: Camera): void {
    const props = propsManager.props;

    for (const prop of props) {
if (
        prop.x + prop.width < camera.x ||
        prop.y + prop.height < camera.y ||
        prop.x > camera.x + camera.width ||
        prop.y > camera.y + camera.height
      ) continue;

      const screenPos = camera.worldToScreen(prop.x, prop.y);
      const x = screenPos.x;
      const y = screenPos.y;

      switch (prop.type) {
        case 'street_lamp': {
          // Metal pole
          this.ctx.fillStyle = '#232b3d';
          this.ctx.fillRect(x + 5, y + 6, 4, prop.height - 6);
          // Lamp head fixture
          this.ctx.fillStyle = prop.accentColor || '#16ca8e';
          this.ctx.fillRect(x + 2, y, 10, 6);
          break;
        }

        case 'traffic_light': {
          // Post
          this.ctx.fillStyle = '#1c2230';
          this.ctx.fillRect(x + 3, y + 16, 4, prop.height - 16);
          // Light Housing
          this.ctx.fillStyle = '#0a0d14';
          this.ctx.fillRect(x, y, 10, 18);
          this.ctx.strokeStyle = '#2a324b';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(x, y, 10, 18);

          // 3 Light bulbs (Red, Yellow, Green)
          const state = prop.state || 'green';
          // Red
          this.ctx.fillStyle = state === 'red' ? '#ff3b30' : '#4a1212';
          this.ctx.beginPath();
          this.ctx.arc(x + 5, y + 3.5, 2, 0, Math.PI * 2);
          this.ctx.fill();

          // Yellow
          this.ctx.fillStyle = state === 'yellow' ? '#ffcc00' : '#4a3d00';
          this.ctx.beginPath();
          this.ctx.arc(x + 5, y + 8.5, 2, 0, Math.PI * 2);
          this.ctx.fill();

          // Green
          this.ctx.fillStyle = state === 'green' ? '#34c759' : '#0c3818';
          this.ctx.beginPath();
          this.ctx.arc(x + 5, y + 13.5, 2, 0, Math.PI * 2);
          this.ctx.fill();
          break;
        }

        case 'vending_machine': {
          // Machine cabinet
          this.ctx.fillStyle = '#141a29';
          this.ctx.fillRect(x, y, prop.width, prop.height);
          this.ctx.strokeStyle = prop.accentColor || '#00e5ff';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(x, y, prop.width, prop.height);

          // Screen display
          this.ctx.fillStyle = prop.accentColor || '#00e5ff';
          this.ctx.fillRect(x + 4, y + 4, prop.width - 8, 12);

          // Dispenser tray
          this.ctx.fillStyle = '#090b10';
          this.ctx.fillRect(x + 6, y + prop.height - 8, prop.width - 12, 5);
          break;
        }

        case 'synth_tree': {
          // Dark bio-trunk
          this.ctx.fillStyle = '#1a1f2c';
          this.ctx.fillRect(x + 15, y + 26, 6, 20);

          // Glowing foliage canopy
          this.ctx.fillStyle = prop.accentColor || '#16ca8e';
          this.ctx.shadowColor = prop.accentColor || '#16ca8e';
          this.ctx.shadowBlur = 10;
          this.ctx.beginPath();
          this.ctx.arc(x + 18, y + 16, 16, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
          break;
        }

        case 'bench': {
          // Wooden cyber-bench
          this.ctx.fillStyle = '#2d3748';
          this.ctx.fillRect(x, y + 2, prop.width, 6);
          this.ctx.fillRect(x, y + 10, prop.width, 4);
          // Legs
          this.ctx.fillStyle = '#1a202c';
          this.ctx.fillRect(x + 2, y + 6, 3, 10);
          this.ctx.fillRect(x + prop.width - 5, y + 6, 3, 10);
          break;
        }

        case 'holo_ad': {
          // Hologram projector base
          this.ctx.fillStyle = '#2a324b';
          this.ctx.fillRect(x + 12, y + 16, 16, 4);
          // Floating hologram banner
          this.ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
          this.ctx.fillRect(x, y, prop.width, 14);
          this.ctx.strokeStyle = prop.accentColor || '#00e5ff';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(x, y, prop.width, 14);

          // Hologram text label
          this.ctx.fillStyle = prop.accentColor || '#00e5ff';
          this.ctx.font = 'bold 7px monospace';
          this.ctx.fillText(prop.label || 'KAIZEN', x + 3, y + 9);
          break;
        }

        case 'dumpster': {
          // Heavy scrap dumpster
          this.ctx.fillStyle = '#1e2638';
          this.ctx.fillRect(x, y, prop.width, prop.height);
          this.ctx.strokeStyle = '#2d3748';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(x, y, prop.width, prop.height);
          // Lid line
          this.ctx.fillStyle = '#141a29';
          this.ctx.fillRect(x, y, prop.width, 6);
          break;
        }

        case 'hydrant': {
          this.ctx.fillStyle = '#e53e3e';
          this.ctx.fillRect(x + 2, y + 4, 8, 12);
          this.ctx.fillRect(x, y + 7, 12, 4);
          break;
        }
      }
    }
  }

private renderEnemies(enemies: Enemy[], camera: Camera): void {
    for (const enemy of enemies) {
      if (enemy.isDead) continue;
      if (
        enemy.x + enemy.width < camera.x ||
        enemy.y + enemy.height < camera.y ||
        enemy.x > camera.x + camera.width ||
        enemy.y > camera.y + camera.height
      ) {
        continue;
      }

      const screenPos = camera.worldToScreen(enemy.x, enemy.y);
      const ex = screenPos.x;
      const ey = screenPos.y;
      const ew = enemy.width;
      const eh = enemy.height;

      this.ctx.save();
      // Drop shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      this.ctx.beginPath();
      this.ctx.ellipse(ex + ew / 2, ey + eh - 2, ew / 2 + 1, 4, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Body (Archetype color based)
this.ctx.fillStyle = (enemy as Enemy & { archetype?: { color?: string } }).archetype?.color || '#e53e3e';
      this.ctx.beginPath();
      this.ctx.roundRect(ex + 2, ey + 8, ew - 4, eh - 10, [3, 3, 2, 2]);
      this.ctx.fill();

      // Cyber Visor / Head
      this.ctx.fillStyle = '#111827';
      this.ctx.beginPath();
      this.ctx.arc(ex + ew / 2, ey + 5, 5.5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ff2a5f';
      this.ctx.fillRect(ex + ew / 2 - 2, ey + 4, 4, 2);

      // Mini Health Bar above enemy
const hpRatio = Math.max(0, (enemy as Enemy & { currentHealth: number }).currentHealth / enemy.maxHealth);
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.fillRect(ex, ey - 7, ew, 3.5);
      this.ctx.fillStyle = hpRatio > 0.4 ? '#ff3b30' : '#ff9500';
      this.ctx.fillRect(ex, ey - 7, ew * hpRatio, 3.5);

      this.ctx.restore();
    }
  }

  private renderPlayer(player: Player, camera: Camera): void {
    const screenPos = camera.worldToScreen(player.x, player.y);
    const x = screenPos.x;
    const y = screenPos.y;
    const w = player.width;
    const h = player.height;

    // 1. Ground shadow
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.beginPath();
    this.ctx.ellipse(x + w / 2, y + h - 2, w / 2 + 3, 5, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Trenchcoat body
    this.ctx.fillStyle = GAME_CONFIG.colors.playerCoat;
    this.ctx.beginPath();
    this.ctx.roundRect(x + 2, y + 10, w - 4, h - 12, [4, 4, 2, 2]);
    this.ctx.fill();

    // 3. Neon seams
    this.ctx.strokeStyle = player.isSprinting
      ? GAME_CONFIG.colors.neonAccent
      : GAME_CONFIG.colors.neonPrimary;
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x + w / 2, y + 12);
    this.ctx.lineTo(x + w / 2, y + h - 4);
    this.ctx.moveTo(x + 4, y + 14);
    this.ctx.lineTo(x + w - 4, y + 14);
    this.ctx.stroke();

    // 4. Cyber visor & head
    this.ctx.fillStyle = '#1e2433';
    this.ctx.beginPath();
    this.ctx.arc(x + w / 2, y + 6, 6.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = player.isSprinting
      ? GAME_CONFIG.colors.neonAccent
      : GAME_CONFIG.colors.neonPrimary;
    const visorWidth = 6;
    const visorHeight = 2.5;

    if (player.facing === 'down') {
      this.ctx.fillRect(x + w / 2 - visorWidth / 2, y + 6, visorWidth, visorHeight);
    } else if (player.facing === 'up') {
      this.ctx.fillRect(x + w / 2 - 1.5, y + 3, 3, 2);
    } else if (player.facing === 'left') {
      this.ctx.fillRect(x + w / 2 - 5, y + 5, 4, visorHeight);
    } else if (player.facing === 'right') {
      this.ctx.fillRect(x + w / 2 + 1, y + 5, 4, visorHeight);
    }

    // Footsteps animation
    if (player.isMoving) {
      const footOffset = (player.animFrame % 2 === 0 ? 1 : -1) * 2;
      this.ctx.fillStyle = '#0a0d14';
      this.ctx.fillRect(x + 4 + footOffset, y + h - 3, 4, 3);
      this.ctx.fillRect(x + w - 8 - footOffset, y + h - 3, 4, 3);
    }

    this.ctx.restore();
  }

  private renderDynamicLighting(player: Player, camera: Camera): void {
    if (!dayNightCycle.areLightsOn()) return;

    this.ctx.save();

    // Street Lamps Glowing Cones
    for (const prop of propsManager.props) {
      if (prop.type === 'street_lamp') {
if (
          prop.x + 80 < camera.x ||
          prop.y + 80 < camera.y ||
          prop.x - 60 > camera.x + camera.width ||
          prop.y - 60 > camera.y + camera.height
        ) continue;
        const s = camera.worldToScreen(prop.x + 7, prop.y + 2);
        const lampGrad = this.ctx.createRadialGradient(s.x, s.y, 4, s.x, s.y, 75);
        lampGrad.addColorStop(0, prop.accentColor ? `${prop.accentColor}33` : 'rgba(22, 202, 142, 0.25)');
        lampGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        this.ctx.fillStyle = lampGrad;
        this.ctx.beginPath();
        this.ctx.arc(s.x, s.y, 75, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // Player Directional Flashlight Beam
    const pScreen = camera.worldToScreen(player.getCenterX(), player.getCenterY());
    const px = pScreen.x;
    const py = pScreen.y;

    let angle = Math.PI / 2; // down
    if (player.facing === 'up') angle = -Math.PI / 2;
    if (player.facing === 'left') angle = Math.PI;
    if (player.facing === 'right') angle = 0;

    const beamLength = 130;
    const beamSpread = 0.52;

    const beamGradient = this.ctx.createRadialGradient(px, py, 12, px, py, beamLength);
    beamGradient.addColorStop(0, 'rgba(22, 202, 142, 0.22)');
    beamGradient.addColorStop(1, 'rgba(22, 202, 142, 0)');

    this.ctx.fillStyle = beamGradient;
    this.ctx.beginPath();
    this.ctx.moveTo(px, py);
    this.ctx.arc(px, py, beamLength, angle - beamSpread, angle + beamSpread);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  private renderDayNightAtmosphere(player: Player, camera: Camera): void {
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;
    const darkness = dayNightCycle.getDarknessLevel();
    const tint = dayNightCycle.getAmbientTint();

    const pScreen = camera.worldToScreen(player.getCenterX(), player.getCenterY());
    const px = pScreen.x;
    const py = pScreen.y;

    // Atmospheric darkness radial vignette around player
    const rad = player.isSprinting ? 220 : 170;
    const vignette = this.ctx.createRadialGradient(px, py, 40, px, py, rad);
    vignette.addColorStop(0, `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${darkness * 0.15})`);
    vignette.addColorStop(0.6, `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${darkness * 0.65})`);
    vignette.addColorStop(1, `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${darkness})`);

    this.ctx.fillStyle = vignette;
    this.ctx.fillRect(0, 0, width, height);
  }

  private renderMinimapHUD(player: Player, mapGrid: number[][]): void {
    const pad = 16;
    const mmWidth = 120;
    const mmHeight = 90;
    const x = this.canvas.width / this.dpr - mmWidth - pad;
    const y = pad;

    // Radar Panel
    this.ctx.fillStyle = 'rgba(7, 9, 14, 0.9)';
    this.ctx.fillRect(x, y, mmWidth, mmHeight);
    this.ctx.strokeStyle = 'rgba(22, 202, 142, 0.4)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, mmWidth, mmHeight);

    // Header label
    this.ctx.fillStyle = '#16ca8e';
    this.ctx.font = 'bold 9px monospace';
    this.ctx.fillText('NAV // RADAR', x + 6, y + 11);

    const scaleX = (mmWidth - 8) / GAME_CONFIG.worldWidth;
    const scaleY = (mmHeight - 18) / GAME_CONFIG.worldHeight;

    // Coarse map structures
    this.ctx.fillStyle = 'rgba(42, 50, 75, 0.75)';
    for (let r = 0; r < mapGrid.length; r += 2) {
      for (let c = 0; c < (mapGrid[0]?.length || 0); c += 2) {
        const t = mapGrid[r]?.[c];
        if (t === TileType.Building || t === TileType.NeonBuilding || t === TileType.ShopFront) {
          const bx = x + 4 + c * GAME_CONFIG.tileSize * scaleX;
          const by = y + 16 + r * GAME_CONFIG.tileSize * scaleY;
          this.ctx.fillRect(bx, by, 3, 3);
        } else if (t === TileType.Water) {
          this.ctx.fillStyle = 'rgba(0, 229, 255, 0.8)';
          const wx = x + 4 + c * GAME_CONFIG.tileSize * scaleX;
          const wy = y + 16 + r * GAME_CONFIG.tileSize * scaleY;
          this.ctx.fillRect(wx, wy, 3, 3);
          this.ctx.fillStyle = 'rgba(42, 50, 75, 0.75)';
        }
      }
    }

    // Player Blip
    const pBlipX = x + 4 + player.x * scaleX;
    const pBlipY = y + 16 + player.y * scaleY;
    this.ctx.fillStyle = '#16ca8e';
    this.ctx.shadowColor = '#16ca8e';
    this.ctx.shadowBlur = 6;
    this.ctx.beginPath();
    this.ctx.arc(pBlipX, pBlipY, 2.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  private renderEnvironmentHUD(player: Player, fps: number): void {
    const pad = 16;
    const panelX = pad;
    const panelY = pad;

    const district = getDistrictAtPosition(player.x, player.y);

    // Operative Stats Panel
    this.ctx.fillStyle = 'rgba(7, 9, 14, 0.9)';
    this.ctx.fillRect(panelX, panelY, 210, 84);
    this.ctx.strokeStyle = 'rgba(22, 202, 142, 0.4)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(panelX, panelY, 210, 84);

    // Operative Callout
    this.ctx.fillStyle = '#16ca8e';
    this.ctx.font = 'bold 11px monospace';
    this.ctx.fillText(`OPERATIVE: ${player.name}`, panelX + 8, panelY + 16);

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    this.ctx.font = '9px monospace';
    this.ctx.fillText(`${fps} FPS`, panelX + 165, panelY + 16);

    // HP Bar
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.font = '9px monospace';
    this.ctx.fillText('HP', panelX + 8, panelY + 33);

    const barW = 160;
    const barH = 6;
    this.ctx.fillStyle = 'rgba(30, 38, 56, 0.8)';
    this.ctx.fillRect(panelX + 28, panelY + 27, barW, barH);
    const hpRatio = Math.max(0, player.stats.health / player.stats.maxHealth);
    this.ctx.fillStyle = '#16ca8e';
    this.ctx.fillRect(panelX + 28, panelY + 27, barW * hpRatio, barH);

    // Energy Bar
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.fillText('NRG', panelX + 8, panelY + 47);

    this.ctx.fillStyle = 'rgba(30, 38, 56, 0.8)';
    this.ctx.fillRect(panelX + 28, panelY + 41, barW, barH);
    const nrgRatio = Math.max(0, player.stats.energy / player.stats.maxEnergy);
    this.ctx.fillStyle = '#9e54f2';
    this.ctx.fillRect(panelX + 28, panelY + 41, barW * nrgRatio, barH);

    // District Tag + Weather + Clock
    this.ctx.fillStyle = district.themeColor || '#00e5ff';
    this.ctx.font = 'bold 9px monospace';
    this.ctx.fillText(district.name?.toUpperCase(), panelX + 8, panelY + 63);

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    this.ctx.font = '9px monospace';
    const timeStr = dayNightCycle.getTimeString();
    const weatherStr = weatherSystem.weather?.toUpperCase();
    this.ctx.fillText(`${timeStr} // ${weatherStr}`, panelX + 8, panelY + 76);
  }
}