import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, ShieldAlert, Home, Save } from 'lucide-react';

interface GameOverModalProps {
  district: string;
  onRespawn: () => void;
  onLoadGame: () => void;
  onMainMenu: () => void;
}

export default function GameOverModal({
  district,
  onRespawn,
  onLoadGame,
  onMainMenu,
}: GameOverModalProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4 select-none">
      <Card className="w-full max-w-md border border-destructive/80 bg-card/95 p-7 text-center shadow-2xl relative overflow-hidden">
        {/* Top Glitch Aesthetic Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-destructive animate-pulse" />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 border border-destructive/40 text-destructive mb-3 animate-pulse">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <span className="text-[11px] font-mono uppercase tracking-widest text-destructive font-bold">
          BIO-SYNAPTIC LINK SEVERED
        </span>

        <h2 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-foreground">
          NEURAL TERMINATION
        </h2>

        <p className="mt-2.5 text-xs font-mono text-muted-foreground leading-relaxed">
          Critical trauma recorded in <span className="text-foreground font-semibold">{district}</span>. 
          Your memory core remains preserved at the district safe hub.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            variant="destructive"
            onClick={onRespawn}
            className="w-full font-display font-semibold shadow-lg text-xs py-5 gap-2"
          >
            <RotateCcw className="h-4 w-4" /> REBOOT AT CENTRAL HUB
          </Button>

          <Button
            variant="outline"
            onClick={onLoadGame}
            className="w-full font-display text-xs border-border/80 text-foreground gap-2"
          >
            <Save className="h-4 w-4 text-primary" /> RESTORE RECENT SAVE
          </Button>

          <Button
            variant="ghost"
            onClick={onMainMenu}
            className="w-full font-display text-xs text-muted-foreground hover:text-foreground gap-2"
          >
            <Home className="h-4 w-4" /> RETURN TO MAIN MENU
          </Button>
        </div>
      </Card>
    </div>
  );
}