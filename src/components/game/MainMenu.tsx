import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Save, Sliders, User, Compass, Crosshair, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenSave: () => void;
  onOpenSettings: () => void;
  onOpenStatus: () => void;
}

export default function MainMenu({
  onStartGame,
  onOpenSave,
  onOpenSettings,
  onOpenStatus,
}: MainMenuProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-background select-none overflow-hidden">
      {/* Background Cyberpunk Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-black" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      {/* Glow Orbs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg p-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-3.5 py-1 text-xs font-mono text-primary mb-3 shadow-glow">
            <Sparkles className="h-3.5 w-3.5" /> CYBERPUNK 2D OPEN WORLD ENGINE
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-black tracking-tight text-foreground uppercase drop-shadow-md">
            SHADOW <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">CITY</span>
          </h1>

          <p className="mt-2 text-xs md:text-sm font-mono text-muted-foreground tracking-wide">
            EXPLORE • INFILTRATE • TRADE • SURVIVE THE SYNDICATE
          </p>
        </div>

        <Card className="border border-primary/40 bg-card/90 p-6 backdrop-blur-xl shadow-glow">
          <div className="flex flex-col gap-3">
            <Button
              variant="default"
              size="lg"
              onClick={onStartGame}
              className="font-display text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 py-6 gap-2 text-primary-foreground"
            >
              <Play className="h-5 w-5 fill-current" /> ENTER THE CITY (NEW / RESUME)
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={onOpenSave}
              className="font-display text-xs border border-border/80 gap-2 h-12"
            >
              <Save className="h-4 w-4 text-primary" /> LOAD GAME / SAVED DATABANKS
            </Button>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <Button
                variant="outline"
                onClick={onOpenStatus}
                className="font-display text-xs border-border/80 gap-1.5 h-11"
              >
                <User className="h-4 w-4 text-primary" /> OPERATIVE STATS
              </Button>

              <Button
                variant="outline"
                onClick={onOpenSettings}
                className="font-display text-xs border-border/80 gap-1.5 h-11"
              >
                <Sliders className="h-4 w-4 text-primary" /> SETTINGS
              </Button>
            </div>
          </div>

          <div className="mt-6 border-t border-border/50 pt-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-primary" /> V1.4 PRODUCTION
            </span>
            <span>WASD + SHIFT + SPACE + E</span>
          </div>
        </Card>
      </div>
    </div>
  );
}