export type GamePhase = 'loading' | 'menu' | 'playing' | 'paused' | 'gameover';

export interface Vector2D {
  x: number;
  y: number;
}

export enum TileType {
  Road = 0,
  Sidewalk = 1,
  Building = 2,
  Wall = 3,
  ShadowZone = 4,
  NeonBuilding = 5,
  Park = 6,
  Water = 7,
  ShopFront = 8,
  Crosswalk = 9,
  Plaza = 10,
}

export interface TileInfo {
  type: TileType;
  solid: boolean;
  name: string;
  color?: string;
}

export interface DistrictInfo {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export interface WorldMap {
  cols: number;
  rows: number;
  tileSize: number;
  grid: number[][];
  spawnCol: number;
  spawnRow: number;
  districts: DistrictInfo[];
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

export interface PlayerStatsState {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  district: string;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  interact: boolean;
}

export type WeatherType = 'clear' | 'rain' | 'heavy-rain' | 'fog';

export interface LightSource {
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
  flicker?: boolean;
}