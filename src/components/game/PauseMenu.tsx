import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, RotateCcw, Package, ScrollText, Sliders, Save, User, Home, Volume2, Shield } from 'lucide-react';
import { gameState } from '@/game/state/gameState';

interface PauseMenuProps {
  onResume: () => void;
  onOpenInventory: () => void;
  onOpenMissions: () => void;
  onOpenStatus: () => void;
  onOpenSettings: () => void;
  onOpenSave: () => void;
  onRespawn: () => void;
  onMainMenu: () => void;
}

export default function PauseMenu({
  onResume,
  onOpenInventory,
  onOpenMissions,
  onOpenStatus,
  onOpenSettings,
  onOpenSave,
  onRespawn,
  onMainMenu,
}: PauseMenuProps) {
  const state = gameState.getState();

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4 select-none">
      <Card className="w-full max-w-md border border-primary/40 bg-card/95 p-6 shadow-glow text-foreground">
        <div className="border-b border-border/60 pb-3 text-center">
          <span className="text-[11px] font-mono tracking-widest text-primary uppercase font-bold">
            NEURAL TRANSMISSION HALTED
          </span>
          <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-foreground">
            SHADOW CITY // TACTICAL PAUSE
          </h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Operative: <span className="text-foreground font-semibold">CIPHER</span> • {state.activeDistrict} • ₵{state.credits?.toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 my-5">
          <Button
            variant="default"
            size="lg"
            onClick={onResume}
            className="col-span-2 font-display text-sm font-bold shadow-lg gap-2 py-5"
          >
            <Play className="h-4 w-4 fill-current" /> RESUME MISSION (ESC)
          </Button>

          <Button
            variant="secondary"
            onClick={onOpenInventory}
            className="font-display text-xs border border-border/60 justify-start gap-2 h-11"
          >
            <Package className="h-4 w-4 text-primary" /> INVENTORY (I)
          </Button>

          <Button
            variant="secondary"
            onClick={onOpenMissions}
            className="font-display text-xs border border-border/60 justify-start gap-2 h-11"
          >
            <ScrollText className="h-4 w-4 text-primary" /> MISSIONS (M)
          </Button>

          <Button
            variant="secondary"
            onClick={onOpenStatus}
            className="font-display text-xs border border-border/60 justify-start gap-2 h-11"
          >
            <User className="h-4 w-4 text-primary" /> CHARACTER (C)
          </Button>

          <Button
            variant="secondary"
            onClick={onOpenSave}
            className="font-display text-xs border border-border/60 justify-start gap-2 h-11"
          >
            <Save className="h-4 w-4 text-primary" /> SAVE / LOAD
          </Button>

          <Button
            variant="secondary"
            onClick={onOpenSettings}
            className="col-span-2 font-display text-xs border border-border/60 justify-start gap-2 h-11"
          >
            <Sliders className="h-4 w-4 text-primary" /> SYSTEM SETTINGS (O)
          </Button>
        </div>

        <div className="border-t border-border/60 pt-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRespawn}
            className="text-xs font-mono text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" /> RESET POSITION
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onMainMenu}
            className="text-xs font-display text-destructive hover:bg-destructive/10 border-destructive/40 gap-1.5"
          >
            <Home className="h-3.5 w-3.5" /> MAIN MENU
          </Button>
        </div>
      </Card>
    </div>
  );
}