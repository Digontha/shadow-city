import { GAME_CONFIG } from '../../config/gameConfig';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CollisionResult {
  x: number;
  y: number;
  collidedX: boolean;
  collidedY: boolean;
}

export function isSolidTileType(tileType: number): boolean {
  // Tile type legend:
  // 0: Road / Asphalt (walkable)
  // 1: Sidewalk / Pavement (walkable)
  // 2: Building facade / Rooftop wall (solid)
  // 3: Perimeter wall / Security fence (solid)
  // 4: Shadow zone / Alleyway (walkable)
  // 5: Water / River basin (solid)
  // 6: Barrier / Dumpster / Crate (solid)
  // 7: Neon booth / Terminal (solid)
  return tileType === 2 || tileType === 3 || tileType === 5 || tileType === 6 || tileType === 7;
}

export function checkTileCollision(
  box: BoundingBox,
  mapGrid: number[][],
  tileSize: number = GAME_CONFIG.tileSize
): boolean {
  const startCol = Math.floor(box.x / tileSize);
  const endCol = Math.floor((box.x + box.width - 0.01) / tileSize);
  const startRow = Math.floor(box.y / tileSize);
  const endRow = Math.floor((box.y + box.height - 0.01) / tileSize);

  const numRows = mapGrid.length;
  const numCols = mapGrid[0]?.length || 0;

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      // Treat out-of-bounds as solid boundaries
      if (row < 0 || row >= numRows || col < 0 || col >= numCols) {
        return true;
      }
      const tile = mapGrid[row][col];
      if (isSolidTileType(tile)) {
        return true;
      }
    }
  }

  return false;
}

export function resolveMovement(
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number,
  width: number,
  height: number,
  mapGrid: number[][],
  tileSize: number = GAME_CONFIG.tileSize
): CollisionResult {
  let finalX = currentX;
  let finalY = currentY;
  let collidedX = false;
  let collidedY = false;

  // Step 1: Attempt movement on X axis
  const testBoxX: BoundingBox = {
    x: targetX,
    y: currentY,
    width,
    height,
  };

  if (!checkTileCollision(testBoxX, mapGrid, tileSize)) {
    finalX = targetX;
  } else {
    collidedX = true;
  }

  // Step 2: Attempt movement on Y axis using resolved X
  const testBoxY: BoundingBox = {
    x: finalX,
    y: targetY,
    width,
    height,
  };

  if (!checkTileCollision(testBoxY, mapGrid, tileSize)) {
    finalY = targetY;
  } else {
    collidedY = true;
  }

  return {
    x: finalX,
    y: finalY,
    collidedX,
    collidedY,
  };
}