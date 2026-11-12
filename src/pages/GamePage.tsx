import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/game/LoadingScreen';
import GameCanvas from '@/components/game/GameCanvas';
import VehicleSpawnerModal from '@/components/game/VehicleSpawnerModal';
import VehicleControlPanel from '@/components/game/VehicleControlPanel';
import SettingsSaveModal from '@/components/game/SettingsSaveModal';
import { Player } from '@/game/entities/Player';
import { vehicleManager } from '@/game/vehicles/vehicleManager';
import { Button } from '@/components/ui/button';
import { Car, Save, Settings2, Volume2, VolumeX } from 'lucide-react';

export default function GamePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isGarageOpen, setIsGarageOpen] = useState(false);
const [playerRef, setPlayerRef] = useState<Player | null>(null);
  const [isMusicActive, setIsMusicActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleToggleMusic = () => setIsMusicActive((prev) => !prev);
  const handleQuickSave = () => {};

  // Keybind listener for F (Enter/Exit Vehicle) and V (Vehicle Garage Requisition)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'v' || e.key === 'V') {
        setIsGarageOpen((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        if (!playerRef) return;
        if (vehicleManager.activeVehicle) {
          vehicleManager.exitVehicle(playerRef);
        } else {
          const nearest = vehicleManager.getNearestVehicle(playerRef.x, playerRef.y);
          if (nearest && nearest.distance < vehicleManager.interactionDistance) {
            vehicleManager.enterVehicle(nearest.vehicle, playerRef);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerRef]);

return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground select-none font-sans antialiased">
      {isLoading ? (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      ) : (
        <>
          <GameCanvas onPlayerReady={(p: Player) => setPlayerRef(p)} />

{/* Quick Vehicle Bay Access Button & Utility Toolbar */}
          <div className="fixed top-4 right-44 z-40 pointer-events-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGarageOpen(true)}
              className="gap-2 border-primary/50 bg-black/80 backdrop-blur text-xs font-semibold hover:border-primary shadow-lg shadow-primary/20"
            >
              <Car className="h-4 w-4 text-primary" />
              <span>VEHICLES [V]</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleMusic}
              className="border-primary/50 bg-black/80 backdrop-blur text-xs font-semibold hover:border-primary shadow-lg shadow-primary/20 px-2.5"
              title="Toggle Cyberpunk Ambient BGM"
            >
              {isMusicActive ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickSave}
              className="gap-1 border-primary/50 bg-black/80 backdrop-blur text-xs font-semibold hover:border-primary shadow-lg shadow-primary/20 px-2.5"
              title="Quick Save Game State"
            >
              <Save className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline text-[10px]">SAVE</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="border-primary/50 bg-black/80 backdrop-blur text-xs font-semibold hover:border-primary shadow-lg shadow-primary/20 px-2.5"
              title="Audio & Save File Management"
            >
              <Settings2 className="h-4 w-4 text-primary" />
            </Button>
          </div>

          {/* Settings & Save Management Modal */}
          <SettingsSaveModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />

          {/* Driving HUD & Proximity Alerts */}
          {playerRef && (
            <VehicleControlPanel
              player={playerRef}
              onOpenGarage={() => setIsGarageOpen(true)}
            />
          )}

          {/* Vehicle Requisition & Spawner Modal */}
          {playerRef && (
            <VehicleSpawnerModal
              player={playerRef}
              isOpen={isGarageOpen}
              onClose={() => setIsGarageOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
}