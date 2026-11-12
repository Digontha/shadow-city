import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Compass, Navigation } from 'lucide-react';
import { cityMap } from '@/game/world/cityMap';
import { GAME_CONFIG } from '@/config/gameConfig';

interface MinimapProps {
  playerX: number;
  playerY: number;
  district: string;
  className?: string;
  onExpand?: () => void;
}

export default function Minimap({
  playerX,
  playerY,
  district,
  className = '',
  onExpand,
}: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Map background
    ctx.fillStyle = '#05070d';
    ctx.fillRect(0, 0, width, height);

    // Radar circular scanline and grid
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const worldWidth = cityMap.cols * GAME_CONFIG.tileSize;
    const worldHeight = cityMap.rows * GAME_CONFIG.tileSize;

    // View window centered on player
    const scale = 0.08;
    const centerX = width / 2;
    const centerY = height / 2;

    const startCol = Math.max(0, Math.floor((playerX - centerX / scale) / GAME_CONFIG.tileSize));
    const endCol = Math.min(cityMap.cols, Math.ceil((playerX + centerX / scale) / GAME_CONFIG.tileSize));
    const startRow = Math.max(0, Math.floor((playerY - centerY / scale) / GAME_CONFIG.tileSize));
    const endRow = Math.min(cityMap.rows, Math.ceil((playerY + centerY / scale) / GAME_CONFIG.tileSize));

    // Draw tiles
    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const tile = cityMap.grid[r]?.[c];
        const tx = centerX + (c * GAME_CONFIG.tileSize - playerX) * scale;
        const ty = centerY + (r * GAME_CONFIG.tileSize - playerY) * scale;
        const size = Math.max(1, GAME_CONFIG.tileSize * scale);

        if (tile === 2 || tile === 5) {
          // Buildings
          ctx.fillStyle = tile === 5 ? 'rgba(236, 72, 153, 0.45)' : 'rgba(30, 41, 59, 0.9)';
          ctx.fillRect(tx, ty, size, size);
        } else if (tile === 0 || tile === 9) {
          // Roads / Crosswalks
          ctx.fillStyle = 'rgba(51, 65, 85, 0.7)';
          ctx.fillRect(tx, ty, size, size);
        } else if (tile === 7) {
          // Water
          ctx.fillStyle = 'rgba(14, 165, 233, 0.5)';
          ctx.fillRect(tx, ty, size, size);
        } else if (tile === 6) {
          // Park
          ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.fillRect(tx, ty, size, size);
        }
      }
    }

    // Radar scan ring
    const radius = Math.min(width, height) / 2 - 4;
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Pulse ring
    const now = Date.now() / 1000;
    const pulseRadius = (now % 2) * (radius / 2);
    ctx.strokeStyle = `rgba(6, 182, 212, ${Math.max(0, 0.5 - (now % 2) * 0.25)})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Central player blip
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // View cone pointer
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 6);
    ctx.lineTo(centerX - 3, centerY);
    ctx.lineTo(centerX + 3, centerY);
    ctx.closePath();
    ctx.stroke();
  }, [playerX, playerY]);

  return (
    <Card
      onClick={onExpand}
      className={`relative overflow-hidden border border-primary/40 bg-background/90 p-2 shadow-glow backdrop-blur-md transition-all hover:border-primary cursor-pointer select-none ${className}`}
    >
      <div className="flex items-center justify-between pb-1.5 px-1 border-b border-border/40">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-primary font-semibold">
          <Compass className="h-3.5 w-3.5 animate-spin text-primary" style={{ animationDuration: '10s' }} />
          <span>RADAR TACTICAL</span>
        </div>
        <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[9px] font-mono text-primary px-1.5 py-0">
          LIVE
        </Badge>
      </div>

      <div className="relative mt-1 flex justify-center">
        <canvas
          ref={canvasRef}
          width={130}
          height={130}
          className="rounded-md border border-border/60 bg-black/80"
        />
        <div className="pointer-events-none absolute bottom-1 right-2 flex items-center gap-1 font-mono text-[9px] text-muted-foreground bg-background/80 px-1 rounded">
          <Navigation className="h-2.5 w-2.5 text-primary" />
          <span>{Math.round(playerX)}, {Math.round(playerY)}</span>
        </div>
      </div>

      <div className="mt-1.5 px-1 flex items-center justify-between text-[10px] font-mono">
        <span className="truncate max-w-[95px] text-foreground/90 font-medium">{district}</span>
        <span className="text-[9px] text-primary hover:underline">RADAR (M)</span>
      </div>
    </Card>
  );
}