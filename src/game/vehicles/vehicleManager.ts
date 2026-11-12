import { Vehicle } from './Vehicle';
import { VEHICLE_MODELS } from './vehicleTypes';
import { GAME_CONFIG } from '../../config/gameConfig';
import { Player } from '../entities/Player';
import { InputState } from '../input/InputManager';
import { soundFX } from '../audio/soundFX';

class VehicleManager {
  public vehicles: Vehicle[] = [];
  public activeVehicle: Vehicle | null = null;
  public interactionDistance = 64;

  constructor() {
    this.initDefaultVehicles();
  }

  public initDefaultVehicles(): void {
    this.vehicles = [];

    // Pre-place various vehicles along prominent city avenues & parking spots
    const spawnPoints = [
      { model: 'kusanagi_bike', x: 26 * GAME_CONFIG.tileSize + 8, y: 19 * GAME_CONFIG.tileSize + 6, angle: 0 },
      { model: 'neon_phantom', x: 29 * GAME_CONFIG.tileSize + 4, y: 20 * GAME_CONFIG.tileSize + 4, angle: Math.PI / 2 },
      { model: 'enforcer_suv', x: 14 * GAME_CONFIG.tileSize + 4, y: 11 * GAME_CONFIG.tileSize + 4, angle: 0 },
      { model: 'ghost_coupe', x: 42 * GAME_CONFIG.tileSize + 4, y: 21 * GAME_CONFIG.tileSize + 4, angle: -Math.PI / 2 },
      { model: 'kusanagi_bike', x: 44 * GAME_CONFIG.tileSize + 8, y: 31 * GAME_CONFIG.tileSize + 6, angle: Math.PI },
      { model: 'neon_phantom', x: 15 * GAME_CONFIG.tileSize + 4, y: 31 * GAME_CONFIG.tileSize + 4, angle: 0 },
    ];

    spawnPoints.forEach((sp, idx) => {
      const def = VEHICLE_MODELS[sp.model] || VEHICLE_MODELS.neon_phantom;
      this.vehicles.push(new Vehicle(`veh_${idx}_${sp.model}`, def, sp.x, sp.y, sp.angle));
    });
  }

  public spawnVehicle(modelId: string, nearX: number, nearY: number): Vehicle {
    const def = VEHICLE_MODELS[modelId] || VEHICLE_MODELS.neon_phantom;
    const id = `veh_${Date.now()}_${modelId}`;
    const newVehicle = new Vehicle(id, def, nearX, nearY, 0);
this.vehicles.push(newVehicle);
    return newVehicle;
  }

  public getNearestVehicle(x: number, y: number): { vehicle: Vehicle; distance: number } | null {
    if (this.vehicles.length === 0) return null;
    let nearest: Vehicle | null = null;
    let minDst = Infinity;

    for (const v of this.vehicles) {
      const dx = v.getCenterX() - x;
      const dy = v.getCenterY() - y;
      const dst = Math.hypot(dx, dy);
      if (dst < minDst) {
        minDst = dst;
        nearest = v;
      }
    }

    if (!nearest) return null;
    return { vehicle: nearest, distance: minDst };
  }

  public enterVehicle(vehicle: Vehicle, player: Player): boolean {
    if (vehicle.isDestroyed || vehicle.isOccupied) return false;

    this.activeVehicle = vehicle;
    vehicle.isOccupied = true;
    (player as any).isInVehicle = true;
(player as any).currentVehicle = vehicle;
    return true;
  }

  public exitVehicle(player: Player): void {
    if (!this.activeVehicle) return;

    const v = this.activeVehicle;
    v.isOccupied = false;

    // Safely place player slightly to the side of vehicle
    const sideAngle = v.angle + Math.PI / 2;
    const exitDist = v.width / 2 + 18;
    player.x = v.getCenterX() + Math.sin(sideAngle) * exitDist - player.width / 2;
    player.y = v.getCenterY() - Math.cos(sideAngle) * exitDist - player.height / 2;

    (player as any).isInVehicle = false;
    (player as any).currentVehicle = null;
this.activeVehicle = null;
  }

  public update(dt: number, input: InputState, mapGrid: number[][], player: Player): void {
    // If driving active vehicle, sync player position so camera and logic stay centered
    if (this.activeVehicle) {
      this.activeVehicle.update(dt, input, mapGrid);
      player.x = this.activeVehicle.getCenterX() - player.width / 2;
      player.y = this.activeVehicle.getCenterY() - player.height / 2;
      player.isMoving = Math.abs(this.activeVehicle.speed) > 10;
    }

    // Update all other unoccupied vehicles for physics and smoke
    for (const veh of this.vehicles) {
      if (veh !== this.activeVehicle) {
        veh.update(dt, null, mapGrid);
      }
    }
  }
}

export const vehicleManager = new VehicleManager();