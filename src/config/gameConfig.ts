export interface GameConfig {
  tileSize: number;
  mapCols: number;
  mapRows: number;
  worldWidth: number;
  worldHeight: number;
  playerSpeed: number;
  playerSprintSpeed: number;
  playerWidth: number;
  playerHeight: number;
  fixedTimeStep: number;
  cameraLerp: number;
  spawnCol: number;
  spawnRow: number;
  colors: {
    background: string;
    road: string;
    roadMarking: string;
    roadCrosswalk: string;
    sidewalk: string;
    building: string;
    buildingRoof: string;
    buildingTrim: string;
    wall: string;
    shadowZone: string;
    parkGrass: string;
    water: string;
    shopFront: string;
    plaza: string;
    neonPrimary: string;
    neonAccent: string;
    neonCyan: string;
    neonAmber: string;
    ambientDarkness: string;
    playerCoat: string;
    playerGlow: string;
  };
}

export const TILE_SIZE = 48;
export const MAP_COLS = 56;
export const MAP_ROWS = 42;

export const GAME_CONFIG: GameConfig = {
  tileSize: TILE_SIZE,
  mapCols: MAP_COLS,
  mapRows: MAP_ROWS,
  worldWidth: MAP_COLS * TILE_SIZE,
  worldHeight: MAP_ROWS * TILE_SIZE,
  playerSpeed: 180,
  playerSprintSpeed: 265,
  playerWidth: 26,
  playerHeight: 34,
  fixedTimeStep: 1 / 60,
  cameraLerp: 0.08,
  spawnCol: 14,
  spawnRow: 18,
  colors: {
    background: '#07090e',
    road: '#11151e',
    roadMarking: '#273148',
    roadCrosswalk: '#e1e7f5',
    sidewalk: '#171d2b',
    building: '#0c101a',
    buildingRoof: '#080a12',
    buildingTrim: '#16ca8e',
    wall: '#1a2233',
    shadowZone: '#040609',
    parkGrass: '#0d241d',
    water: '#091c28',
    shopFront: '#121927',
    plaza: '#1e2638',
    neonPrimary: '#16ca8e',
    neonAccent: '#9e54f2',
    neonCyan: '#00e5ff',
    neonAmber: '#ffaa00',
    ambientDarkness: 'rgba(4, 6, 12, 0.78)',
    playerCoat: '#151926',
    playerGlow: 'rgba(22, 202, 142, 0.4)',
  },
};