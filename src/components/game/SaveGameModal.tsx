import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Save, Download, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { gameState } from '@/game/state/gameState';
import { toast } from 'sonner';

interface SaveSlot {
  id: string;
  name: string;
  timestamp: string;
  district: string;
  health: number;
  credits: number;
  playtimeSeconds: number;
}

interface SaveGameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadSave?: (slot: SaveSlot) => void;
}

export default function SaveGameModal({ open, onOpenChange, onLoadSave }: SaveGameModalProps) {
  const [slots, setSlots] = useState<Record<string, SaveSlot | null>>({
    slot1: null,
    slot2: null,
    slot3: null,
  });

  useEffect(() => {
    try {
      const s1 = localStorage.getItem('shadow_city_slot1');
      const s2 = localStorage.getItem('shadow_city_slot2');
      const s3 = localStorage.getItem('shadow_city_slot3');
      setSlots({
        slot1: s1 ? JSON.parse(s1) : null,
        slot2: s2 ? JSON.parse(s2) : null,
        slot3: s3 ? JSON.parse(s3) : null,
      });
    } catch {
      // ignore
    }
  }, [open]);

  const handleSaveToSlot = (slotKey: string, slotTitle: string) => {
    const state = gameState.getState();
    const newSave: SaveSlot = {
      id: slotKey,
      name: slotTitle,
      timestamp: new Date().toLocaleString(),
      district: state.activeDistrict,
      health: Math.round(state.stats.health),
      credits: state.credits,
      playtimeSeconds: Math.round(state.gameTimeSeconds),
    };

    try {
      localStorage.setItem(`shadow_city_${slotKey}`, JSON.stringify(newSave));
      setSlots((prev) => ({ ...prev, [slotKey]: newSave }));
      toast.success(`Game saved successfully to ${slotTitle}!`);
    } catch {
      toast.error('Failed to write save data to storage.');
    }
  };

  const handleLoadFromSlot = (slot: SaveSlot) => {
    gameState.updateStats({ health: slot.health });
    gameState.setCredits(slot.credits);
    if (onLoadSave) {
      onLoadSave(slot);
    }
    toast.success(`Data restored from ${slot.name}! Welcome back.`);
    onOpenChange(false);
  };

  const handleDeleteSlot = (slotKey: string) => {
    try {
      localStorage.removeItem(`shadow_city_${slotKey}`);
      setSlots((prev) => ({ ...prev, [slotKey]: null }));
      toast.info(`Deleted ${slotKey?.toUpperCase()} data.`);
    } catch {
      // ignore
    }
  };

  const slotKeys = [
    { key: 'slot1', label: 'SLOT 01 // PRIMARY DATABANK' },
    { key: 'slot2', label: 'SLOT 02 // SECONDARY MIRROR' },
    { key: 'slot3', label: 'SLOT 03 // COVERT BACKUP' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-primary/50 bg-card/95 backdrop-blur-xl shadow-glow text-foreground p-6">
        <DialogHeader className="border-b border-border/60 pb-3">
          <DialogTitle className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" /> NEURAL STATE DATABANKS
          </DialogTitle>
          <DialogDescription className="text-xs font-mono text-muted-foreground">
            Archive or restore your cybernetic state across safe node memory drives.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 py-3">
          {slotKeys.map(({ key, label }) => {
            const data = slots[key];
            return (
              <Card key={key} className="border-border/70 bg-muted/30 p-4 transition-all hover:border-primary/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs font-bold text-foreground tracking-wide">
                        {label}
                      </span>
                      {data ? (
                        <Badge variant="outline" className="border-accent/40 bg-accent/15 text-[10px] font-mono text-accent">
                          ONLINE
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] font-mono text-muted-foreground">
                          EMPTY DRIVE
                        </Badge>
                      )}
                    </div>

                    {data ? (
                      <div className="mt-2 space-y-1 font-mono text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="text-foreground font-medium">{data.district}</span>
                          <span>•</span>
                          <span>HP: {data.health}%</span>
                          <span>•</span>
                          <span className="text-accent font-semibold">₵{data.credits?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{data.timestamp} ({Math.floor(data.playtimeSeconds / 60)} min played)</span>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                        Unallocated storage sector. Ready for state archive.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {data && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleLoadFromSlot(data)}
                          className="text-xs font-display gap-1 border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          <Download className="h-3.5 w-3.5" /> LOAD
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSlot(key)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/15"
                          aria-label="Delete Save Slot"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant={data ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleSaveToSlot(key, label)}
                      className="text-xs font-display gap-1 shadow-sm"
                    >
                      <Save className="h-3.5 w-3.5" /> {data ? 'OVERWRITE' : 'SAVE NOW'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end border-t border-border/60">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="font-display text-xs">
            CLOSE (ESC)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}