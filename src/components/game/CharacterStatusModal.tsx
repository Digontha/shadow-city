import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, Zap, Crosshair, Award, Cpu, User, Heart, Activity } from 'lucide-react';
import { gameState } from '@/game/state/gameState';

interface CharacterStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CharacterStatusModal({ open, onOpenChange }: CharacterStatusModalProps) {
  const state = gameState.getState();
  const playTimeMin = Math.floor(state.gameTimeSeconds / 60);

  const attributes = [
    { name: 'Reflex Sync', val: 82, desc: 'Sprint speed & evasion recovery', icon: Zap },
    { name: 'Bio-Mesh Hardening', val: 75, desc: 'Damage reduction against kinetic trauma', icon: Shield },
    { name: 'Neural Overclock', val: 90, desc: 'Terminal hacking speed & cache detect', icon: Cpu },
    { name: 'Targeting Accuracy', val: 68, desc: 'Critical strike threshold & blade poise', icon: Crosshair },
  ];

  const cyberware = [
    { slot: 'Neural Cortex', name: 'Militech Overclock Mk.II', rarity: 'rare', bonus: '+15% Energy Regen' },
    { slot: 'Subdermal Shell', name: 'Carbon-Titan Weave', rarity: 'legendary', bonus: '+25 Max Armor' },
    { slot: 'Ocular HUD', name: 'Kiroshi Tactical Scanner', rarity: 'epic', bonus: 'Hostile Range Radar' },
    { slot: 'Kinetic Thrusters', name: 'Kereznikov Booster', rarity: 'uncommon', bonus: 'Sprint Energy Drain -20%' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-primary/50 bg-card/95 backdrop-blur-xl shadow-glow text-foreground p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  CIPHER // OPERATIVE
                  <Badge variant="outline" className="border-primary/50 bg-primary/15 text-primary text-xs">
                    LVL 7
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs font-mono text-muted-foreground">
                  ID: #SHADOW-8824 • Syndicate Outcast • District: {state.activeDistrict}
                </DialogDescription>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs text-muted-foreground block">CREDIT BALANCE</span>
              <span className="font-mono text-lg font-bold text-accent">₵{state.credits?.toLocaleString()}</span>
            </div>
          </div>
        </DialogHeader>

        {/* Vitals Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
          <Card className="border-border/60 bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
              <Heart className="h-3.5 w-3.5 text-destructive" /> BIO-HEALTH
            </div>
            <span className="font-mono text-lg font-bold text-foreground">{state.stats.health} / {state.stats.maxHealth}</span>
            <Progress value={(state.stats.health / state.stats.maxHealth) * 100} className="h-1.5 mt-1.5 bg-muted" />
          </Card>

          <Card className="border-border/60 bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
              <Zap className="h-3.5 w-3.5 text-primary" /> KINETIC CELL
            </div>
            <span className="font-mono text-lg font-bold text-foreground">{state.stats.energy} / {state.stats.maxEnergy}</span>
            <Progress value={(state.stats.energy / state.stats.maxEnergy) * 100} className="h-1.5 mt-1.5 bg-muted" />
          </Card>

          <Card className="border-border/60 bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
              <Activity className="h-3.5 w-3.5 text-accent" /> CONDITION
            </div>
            <span className="font-mono text-lg font-bold uppercase text-primary">{state.condition}</span>
            <span className="text-[10px] font-mono text-muted-foreground block mt-1">Uplink Active</span>
          </Card>

          <Card className="border-border/60 bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
              <Award className="h-3.5 w-3.5 text-amber-400" /> SURVIVAL TIME
            </div>
            <span className="font-mono text-lg font-bold text-foreground">{playTimeMin}m</span>
            <span className="text-[10px] font-mono text-muted-foreground block mt-1">Operational</span>
          </Card>
        </div>

        {/* Attributes System */}
        <div className="space-y-3">
          <h4 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" /> AUGMENTATION ATTRIBUTES
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {attributes.map((attr) => (
              <div key={attr.name} className="rounded-lg border border-border/70 bg-muted/30 p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <attr.icon className="h-3.5 w-3.5 text-primary" />
                    {attr.name}
                  </span>
                  <span className="font-mono text-xs font-bold text-primary">{attr.val}%</span>
                </div>
                <Progress value={attr.val} className="h-1.5 bg-background/60" />
                <span className="text-[10px] font-mono text-muted-foreground mt-1.5">{attr.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Installed Cyberware */}
        <div className="space-y-3 pt-2">
          <h4 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> INSTALLED CYBERWARE SLOTS
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {cyberware.map((item) => (
              <div key={item.slot} className="rounded-lg border border-border/70 bg-muted/20 p-2.5 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground block">{item.slot}</span>
                  <span className="text-xs font-semibold text-foreground block mt-0.5">{item.name}</span>
                  <span className="text-[11px] font-mono text-primary block mt-0.5">{item.bonus}</span>
                </div>
                <Badge variant="secondary" className="text-[9px] font-mono uppercase bg-primary/10 text-primary border-primary/30">
                  {item.rarity}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end border-t border-border/60">
          <Button variant="default" onClick={() => onOpenChange(false)} className="font-display text-xs">
            CLOSE DOSSIER (C)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}