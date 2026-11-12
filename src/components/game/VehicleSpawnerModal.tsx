import { useState } from 'react';
import { VEHICLE_MODELS, VehicleDefinition } from '@/game/vehicles/vehicleTypes';
import { vehicleManager } from '@/game/vehicles/vehicleManager';
import { Player } from '@/game/entities/Player';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Car, Zap, Shield, Gauge, Check, X, Flame } from 'lucide-react';
import { toast } from 'sonner';

interface VehicleSpawnerModalProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
}

export default function VehicleSpawnerModal({ player, isOpen, onClose }: VehicleSpawnerModalProps) {
  const [selectedId, setSelectedId] = useState<string>('neon_phantom');
  const vehiclesList = Object.values(VEHICLE_MODELS);
  const selectedVehicle: VehicleDefinition = VEHICLE_MODELS[selectedId] || vehiclesList[0];

  if (!isOpen) return null;

  const handleSpawnAndEnter = () => {
    // Spawn in front of player
    const spawnDistance = 45;
    let spawnX = player.x;
    let spawnY = player.y;

    if (player.facing === 'down') spawnY += spawnDistance;
    else if (player.facing === 'up') spawnY -= spawnDistance;
    else if (player.facing === 'left') spawnX -= spawnDistance;
    else if (player.facing === 'right') spawnX += spawnDistance;

    const newVeh = vehicleManager.spawnVehicle(selectedId, spawnX, spawnY);
    vehicleManager.enterVehicle(newVeh, player);

    toast.success(`Dispatched ${selectedVehicle.name}!`, {
      description: 'Vehicle initialized with full fuel & turbo boost. Drive safely.',
    });
    onClose();
  };

  const handleSpawnParked = () => {
    const spawnDistance = 40;
    let spawnX = player.x;
    let spawnY = player.y;

    if (player.facing === 'down') spawnY += spawnDistance;
    else if (player.facing === 'up') spawnY -= spawnDistance;
    else if (player.facing === 'left') spawnX -= spawnDistance;
    else if (player.facing === 'right') spawnX += spawnDistance;

    vehicleManager.spawnVehicle(selectedId, spawnX, spawnY);
    toast.success(`Parked ${selectedVehicle.name} nearby!`, {
      description: 'Approach and press [F] or TAP [ENTER VEHICLE] to drive.',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl rounded-xl border border-primary/40 bg-card p-6 shadow-2xl shadow-primary/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/20 p-2.5 text-primary">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold tracking-wider text-foreground">
                AUTONET // VEHICLE REQUISITION
              </h2>
              <p className="text-xs text-muted-foreground">
                Select and requisition a high-speed vehicle directly to your current location
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close vehicle bay">
            <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>

        {/* Content Grid */}
        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Vehicle List */}
          <div className="md:col-span-5 space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {vehiclesList.map((veh) => {
              const isSelected = veh.id === selectedId;
              return (
                <div
                  key={veh.id}
                  onClick={() => setSelectedId(veh.id)}
                  className={`group cursor-pointer rounded-lg border p-3.5 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                      : 'border-border bg-background/50 hover:border-primary/40 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">{veh.name}</span>
                        {isSelected && <Badge variant="default" className="text-[10px] px-1.5 py-0">ACTIVE</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{veh.model}</p>
                    </div>
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-border"
                      style={{ backgroundColor: veh.primaryColor }}
                    />
                  </div>

                  <div className="mt-2.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Gauge className="h-3 w-3 text-primary" /> {veh.maxSpeed} KM/H
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-cyan-400" /> {veh.maxHealth} HP
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-400" /> {veh.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details & Specs Card */}
          <div className="md:col-span-7">
            <Card className="border border-border/80 bg-background/80">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-primary/50 text-primary uppercase text-xs">
                    {selectedVehicle.category.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">REF: {selectedVehicle.id}</span>
                </div>
                <CardTitle className="text-xl font-bold text-foreground mt-1">{selectedVehicle.name}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{selectedVehicle.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-1">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-md border border-border/60 bg-muted/30 p-2.5">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5 text-primary" /> Top Velocity</span>
                      <span className="font-bold text-foreground">{selectedVehicle.maxSpeed} km/h</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, (selectedVehicle.maxSpeed / 360) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-md border border-border/60 bg-muted/30 p-2.5">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-amber-400" /> Acceleration</span>
                      <span className="font-bold text-foreground">{selectedVehicle.acceleration} Px/s²</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${Math.min(100, (selectedVehicle.acceleration / 260) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-md border border-border/60 bg-muted/30 p-2.5">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-cyan-400" /> Armor & HP</span>
                      <span className="font-bold text-foreground">{selectedVehicle.maxHealth} HP</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-cyan-400"
                        style={{ width: `${Math.min(100, (selectedVehicle.maxHealth / 500) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-md border border-border/60 bg-muted/30 p-2.5">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-purple-400" /> Nitro Boost</span>
                      <span className="font-bold text-foreground">+{Math.round((selectedVehicle.nitroBoost - 1) * 100)}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-purple-400"
                        style={{ width: `${Math.min(100, (selectedVehicle.nitroBoost / 2) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Driving Control Guide */}
                <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-[11px] text-muted-foreground">
                  <span className="font-bold text-primary block mb-1">DRIVING INSTRUCTIONS:</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    <span>[W / Up] : Accelerate</span>
                    <span>[S / Down] : Brake / Reverse</span>
                    <span>[A / D] : Steer Left / Right</span>
                    <span>[Shift] : Nitro Afterburner</span>
                    <span>[F] : Enter / Exit Vehicle</span>
                    <span>[Space] : Handbrake / Drift</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={handleSpawnParked}>
                  Spawn Parked
                </Button>
                <Button variant="default" size="sm" onClick={handleSpawnAndEnter} className="gap-2">
                  <Check className="h-4 w-4" /> Mount & Drive
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}