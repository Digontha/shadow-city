import { TileType, TileInfo } from '../types';

export const TILE_DEFINITIONS: Record<TileType, TileInfo> = {
  [TileType.Road]: {
    type: TileType.Road,
    solid: false,
    name: 'Asphalt Thoroughfare',
  },
  [TileType.Sidewalk]: {
    type: TileType.Sidewalk,
    solid: false,
    name: 'Pedestrian Paver',
  },
  [TileType.Building]: {
    type: TileType.Building,
    solid: true,
    name: 'Corporate Monolith',
  },
  [TileType.Wall]: {
    type: TileType.Wall,
    solid: true,
    name: 'Security Perimeter Wall',
  },
  [TileType.ShadowZone]: {
    type: TileType.ShadowZone,
    solid: false,
    name: 'Dark Alleyway',
  },
  [TileType.NeonBuilding]: {
    type: TileType.NeonBuilding,
    solid: true,
    name: 'Neon Highrise Tower',
  },
  [TileType.Park]: {
    type: TileType.Park,
    solid: false,
    name: 'Synthetic Grassland',
  },
  [TileType.Water]: {
    type: TileType.Water,
    solid: true,
    name: 'Purification Water Basin',
  },
  [TileType.ShopFront]: {
    type: TileType.ShopFront,
    solid: true,
    name: 'Commercial Shopfront',
  },
  [TileType.Crosswalk]: {
    type: TileType.Crosswalk,
    solid: false,
    name: 'Striped Crosswalk',
  },
  [TileType.Plaza]: {
    type: TileType.Plaza,
    solid: false,
    name: 'Central Plaza Stone',
  },
};

export function isTileSolid(tile: number): boolean {
  return (
    tile === TileType.Building ||
    tile === TileType.Wall ||
    tile === TileType.NeonBuilding ||
    tile === TileType.Water ||
    tile === TileType.ShopFront
  );
}