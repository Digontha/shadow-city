import { TILE_SIZE, MAP_COLS, MAP_ROWS, GAME_CONFIG } from '@/config/gameConfig';
import { TileType, WorldMap, DistrictInfo } from '@/game/types';

function generateCityGrid(cols: number, rows: number): number[][] {
  const grid: number[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      // 1. Outer Perimeter Fortress Walls
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        row.push(TileType.Wall);
        continue;
      }

      // 2. Major Thoroughfares (Avenues & Boulevards)
      const isHorizontalAvenue = r === 10 || r === 20 || r === 30;
      const isVerticalBoulevard = c === 14 || c === 28 || c === 42;

      // Crosswalks at intersections
      const isCrosswalkH =
        (r === 9 || r === 11 || r === 19 || r === 21 || r === 29 || r === 31) &&
        (c === 14 || c === 28 || c === 42);
      const isCrosswalkV =
        (c === 13 || c === 15 || c === 27 || c === 29 || c === 41 || c === 43) &&
        (r === 10 || r === 20 || r === 30);

      if (isCrosswalkH || isCrosswalkV) {
        row.push(TileType.Crosswalk);
        continue;
      }

      if (isHorizontalAvenue || isVerticalBoulevard) {
        row.push(TileType.Road);
        continue;
      }

      // 3. Sidewalks bordering all roads
      const nearHorizRoad =
        r === 9 || r === 11 || r === 19 || r === 21 || r === 29 || r === 31;
      const nearVertRoad =
        c === 13 || c === 15 || c === 27 || c === 29 || c === 41 || c === 43;

      if (nearHorizRoad || nearVertRoad) {
        row.push(TileType.Sidewalk);
        continue;
      }

      // 4. DISTRICT SPECIFIC ZONING

      // --- DISTRICT 1: Blacksite Citadel (Top Section, rows 1-9) ---
      if (r < 10) {
        // High security server vaults & command bunkers
        const isCitadelBlock =
          (c >= 4 && c <= 10 && r >= 3 && r <= 7) ||
          (c >= 18 && c <= 24 && r >= 3 && r <= 7) ||
          (c >= 32 && c <= 38 && r >= 3 && r <= 7) ||
          (c >= 46 && c <= 52 && r >= 3 && r <= 7);

        if (isCitadelBlock) {
          row.push((c + r) % 2 === 0 ? TileType.Wall : TileType.Building);
        } else if ((r + c) % 8 === 0) {
          row.push(TileType.ShadowZone);
        } else {
          row.push(TileType.Plaza);
        }
        continue;
      }

      // --- DISTRICT 2: Cyber Oasis / Neo-Park (Middle-West, cols 1-13, rows 11-19) ---
      if (c < 13 && r >= 11 && r < 20) {
        // Central reflecting pond
        if (c >= 5 && c <= 8 && r >= 13 && r <= 16) {
          row.push(TileType.Water);
        } else if ((c === 4 || c === 9) && (r >= 13 && r <= 16)) {
          row.push(TileType.Plaza);
        } else {
          row.push(TileType.Park);
        }
        continue;
      }

      // --- DISTRICT 3: Neon Promenade (Central-East, cols 15-41, rows 11-19) ---
      if (c >= 15 && c < 41 && r >= 11 && r < 20) {
        const isNeonTower =
          (c >= 17 && c <= 25 && r >= 13 && r <= 17) ||
          (c >= 31 && c <= 39 && r >= 13 && r <= 17);

        if (isNeonTower) {
          row.push(TileType.NeonBuilding);
        } else if ((r === 12 || r === 18) && (c % 4 === 0)) {
          row.push(TileType.Plaza);
        } else {
          row.push(TileType.Sidewalk);
        }
        continue;
      }

      // --- DISTRICT 4: High-Rise Corporate Towers (East Sector, cols 43-54, rows 11-19) ---
      if (c >= 43 && r >= 11 && r < 20) {
        const isTower = c >= 46 && c <= 52 && r >= 13 && r <= 17;
        if (isTower) {
          row.push(TileType.Building);
        } else {
          row.push(TileType.Sidewalk);
        }
        continue;
      }

      // --- DISTRICT 5: Night Bazaar & Retail Strip (Middle-South, cols 29-54, rows 21-29) ---
      if (c >= 29 && r >= 21 && r < 30) {
        const isShopBlock =
          (c >= 32 && c <= 38 && r >= 23 && r <= 27) ||
          (c >= 46 && c <= 52 && r >= 23 && r <= 27);

        if (isShopBlock) {
          // Perimeter is shopfronts with illuminated awnings
          if (r === 23 || r === 27 || c === 32 || c === 38 || c === 46 || c === 52) {
            row.push(TileType.ShopFront);
          } else {
            row.push(TileType.Building);
          }
        } else {
          row.push(TileType.Plaza);
        }
        continue;
      }

      // --- DISTRICT 6: The Underbelly & Slums (South-West, rows 21-41) ---
      if (r >= 21) {
        const isSlumBlock =
          (c >= 4 && c <= 10 && r >= 23 && r <= 27) ||
          (c >= 18 && c <= 24 && r >= 23 && r <= 27) ||
          (c >= 4 && c <= 10 && r >= 33 && r <= 38) ||
          (c >= 18 && c <= 24 && r >= 33 && r <= 38) ||
          (c >= 32 && c <= 38 && r >= 33 && r <= 38) ||
          (c >= 46 && c <= 52 && r >= 33 && r <= 38);

        if (isSlumBlock) {
          row.push(TileType.Building);
        } else if ((r + c) % 4 === 0) {
          row.push(TileType.ShadowZone);
        } else {
          row.push(TileType.Sidewalk);
        }
        continue;
      }

      row.push(TileType.Sidewalk);
    }
    grid.push(row);
  }

  // Ensure clear spawn plaza at spawnCol, spawnRow
  const sR = GAME_CONFIG.spawnRow;
  const sC = GAME_CONFIG.spawnCol;
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const cr = sR + dr;
      const cc = sC + dc;
      if (cr >= 1 && cr < rows - 1 && cc >= 1 && cc < cols - 1) {
        grid[cr][cc] = dr === 0 && dc === 0 ? TileType.Road : TileType.Sidewalk;
      }
    }
  }

  return grid;
}

export const DISTRICTS_DATA: DistrictInfo[] = [
  {
    id: 'citadel',
    name: 'Blacksite Citadel',
    subtitle: 'Sector 01 // Corporate Command',
    description: 'High-security monoliths, encrypted neural servers, and surveillance drones.',
    themeColor: '#00e5ff',
    bounds: { minX: 0, maxX: MAP_COLS * TILE_SIZE, minY: 0, maxY: 10 * TILE_SIZE },
  },
  {
    id: 'neo_park',
    name: 'Cyber Oasis Park',
    subtitle: 'Sector 02 // Bio-Synthetic Reserve',
    description: 'Bioluminescent synth-flora, cascading water basins, and open air walkways.',
    themeColor: '#16ca8e',
    bounds: { minX: 0, maxX: 14 * TILE_SIZE, minY: 10 * TILE_SIZE, maxY: 20 * TILE_SIZE },
  },
  {
    id: 'promenade',
    name: 'Neon Promenade',
    subtitle: 'Sector 03 // Commercial Core',
    description: 'Towering skyways, holographic corporate billboards, and autonomous traffic avenues.',
    themeColor: '#9e54f2',
    bounds: { minX: 14 * TILE_SIZE, maxX: MAP_COLS * TILE_SIZE, minY: 10 * TILE_SIZE, maxY: 20 * TILE_SIZE },
  },
  {
    id: 'bazaar',
    name: 'Night Bazaar',
    subtitle: 'Sector 04 // Black Market Strips',
    description: '24-hour synth-ramen stalls, underground ripperdoc clinics, and illegal hardware mods.',
    themeColor: '#ffaa00',
    bounds: { minX: 28 * TILE_SIZE, maxX: MAP_COLS * TILE_SIZE, minY: 20 * TILE_SIZE, maxY: 30 * TILE_SIZE },
  },
  {
    id: 'underbelly',
    name: 'The Underbelly',
    subtitle: 'Sector 05 // Industrial Fringe',
    description: 'Rain-soaked drainage grids, shadow zones, scrap yards, and off-grid alleyways.',
    themeColor: '#ff007f',
    bounds: { minX: 0, maxX: MAP_COLS * TILE_SIZE, minY: 20 * TILE_SIZE, maxY: MAP_ROWS * TILE_SIZE },
  },
];

export const cityMap: WorldMap = {
  cols: MAP_COLS,
  rows: MAP_ROWS,
  tileSize: TILE_SIZE,
  grid: generateCityGrid(MAP_COLS, MAP_ROWS),
  spawnCol: GAME_CONFIG.spawnCol,
  spawnRow: GAME_CONFIG.spawnRow,
  districts: DISTRICTS_DATA,
};

export function getDistrictAtPosition(worldX: number, worldY: number): DistrictInfo {
  const district = cityMap.districts.find(
    (d) =>
      worldX >= d.bounds.minX &&
      worldX <= d.bounds.maxX &&
      worldY >= d.bounds.minY &&
      worldY <= d.bounds.maxY
  );
  return district || cityMap.districts[2];
}