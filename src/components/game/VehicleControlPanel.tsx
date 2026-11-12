import { vehicleManager } from '@/game/vehicles/vehicleManager';
import { Player } from '@/game/entities/Player';
import { Button } from '@/components/ui/button';
import { Gauge, Shield, Flame, LogOut } from 'lucide-react';

interface VehicleControlPanelProps {
  player: Player;
  onOpenGarage: () => void;
}

export default function VehicleControlPanel({ player, onOpenGarage }: VehicleControlPanelProps) {
  const activeVehicle = vehicleManager.activeVehicle;
  const nearest = !activeVehicle ? vehicleManager.getNearestVehicle(player.x, player.y) : null;
  const canEnter = nearest && nearest.distance < vehicleManager.interactionDistance;

  const handleEnterExit = () => {
    if (activeVehicle) {
      vehicleManager.exitVehicle(player);
    } else if (canEnter && nearest) {
      vehicleManager.enterVehicle(nearest.vehicle, player);
    }
  };

  return (
    <>
      {/* Driving Telemetry HUD (When Inside a Vehicle) */}
      {activeVehicle && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-auto">
          <div className="flex items-center gap-4 rounded-xl border border-primary/50 bg-black/85 backdrop-blur-md px-5 py-3 shadow-2xl shadow-primary/20">
            {/* Speed Gauge */}
            <div className="text-center min-w-[70px]">
              <span className="font-mono text-2xl font-black text-primary">
                {Math.round(Math.abs(activeVehicle.speed))}
              </span>
              <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">KM/H</span>
            </div>

            {/* Divider */}
            <div className="h-8 w-[1px] bg-border" />

            {/* Vehicle Name & Status Bars */}
            <div className="space-y-1.5 min-w-[160px]">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-foreground truncate max-w-[120px]">{activeVehicle.def.name}</span>
                <span className="text-[10px] font-mono text-cyan-400">
                  {Math.round(activeVehicle.health)} / {activeVehicle.maxHealth} HP
                </span>
              </div>

              {/* Health bar */}
              <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-150"
                  style={{ width: `${Math.max(0, (activeVehicle.health / activeVehicle.maxHealth) * 100)}%` }}
                />
              </div>

              {/* Nitro bar */}
              <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Flame className="h-2.5 w-2.5 text-amber-400" /> NITRO
                </span>
                <span className="font-mono text-amber-400">{Math.round(activeVehicle.nitroRemaining)}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-150"
                  style={{ width: `${Math.max(0, (activeVehicle.nitroRemaining / activeVehicle.maxNitro) * 100)}%` }}
                />
              </div>
            </div>

            {/* Exit Action Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEnterExit}
              className="gap-1.5 text-xs font-semibold px-3 h-8 shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5" /> EXIT [F]
            </Button>
          </div>
        </div>
      )}

      {/* Nearby Vehicle Enter Prompt (When walking near a car/bike) */}
      {!activeVehicle && canEnter && nearest && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-bounce">
          <Button
            variant="default"
            size="lg"
            onClick={handleEnterExit}
            className="gap-2 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30 text-sm px-5"
          >
            <Gauge className="h-4 w-4" /> ENTER {nearest.vehicle.def.name?.toUpperCase()} [PRESS F]
          </Button>
        </div>
      )}
    </>
  );
}