import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Volume2, Monitor, Keyboard, Sliders, Check } from 'lucide-react';
import { gameState } from '@/game/state/gameState';
import { toast } from 'sonner';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const current = gameState.getState().settings;

  const [masterVolume, setMasterVolume] = useState(current.masterVolume);
  const [sfxVolume, setSfxVolume] = useState(current.sfxVolume);
  const [musicVolume, setMusicVolume] = useState(current.musicVolume);
  const [showMinimap, setShowMinimap] = useState(current.showMinimap);
  const [showFps, setShowFps] = useState(current.showFps);
  const [screenShake, setScreenShake] = useState(current.screenShake);
  const [graphicsQuality, setGraphicsQuality] = useState<'high' | 'medium' | 'low'>(current.graphicsQuality);

  const handleSave = () => {
    gameState.updateSettings({
      masterVolume,
      sfxVolume,
      musicVolume,
      showMinimap,
      showFps,
      screenShake,
      graphicsQuality,
    });
    toast.success('Simulation telemetry settings updated.');
    onOpenChange(false);
  };

  const handleResetDefaults = () => {
    setMasterVolume(80);
    setSfxVolume(90);
    setMusicVolume(70);
    setShowMinimap(true);
    setShowFps(true);
    setScreenShake(true);
    setGraphicsQuality('high');
    toast.info('Default audio/visual parameters restored.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-primary/50 bg-card/95 backdrop-blur-xl shadow-glow text-foreground p-6">
        <DialogHeader className="border-b border-border/60 pb-3">
          <DialogTitle className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" /> SYSTEM CONFIGURATION
          </DialogTitle>
          <DialogDescription className="text-xs font-mono text-muted-foreground">
            Configure audio, HUD telemetry, rendering fidelity, and key bindings.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="audio" className="pt-2">
          <TabsList className="grid grid-cols-3 bg-muted/60 border border-border/60">
            <TabsTrigger value="audio" className="text-xs font-mono flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5" /> AUDIO
            </TabsTrigger>
            <TabsTrigger value="display" className="text-xs font-mono flex items-center gap-1.5">
              <Monitor className="h-3.5 w-3.5" /> DISPLAY & HUD
            </TabsTrigger>
            <TabsTrigger value="controls" className="text-xs font-mono flex items-center gap-1.5">
              <Keyboard className="h-3.5 w-3.5" /> CONTROLS
            </TabsTrigger>
          </TabsList>

          {/* Audio Tab */}
          <TabsContent value="audio" className="space-y-4 py-3">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <Label>Master Audio Volume</Label>
                <span className="text-primary font-bold">{masterVolume}%</span>
              </div>
              <Slider
                value={[masterVolume]}
                min={0}
                max={100}
                step={1}
                onValueChange={(v) => setMasterVolume(v[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <Label>Sound Effects & Combat Audio</Label>
                <span className="text-primary font-bold">{sfxVolume}%</span>
              </div>
              <Slider
                value={[sfxVolume]}
                min={0}
                max={100}
                step={1}
                onValueChange={(v) => setSfxVolume(v[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <Label>Synthwave & Cyber Ambient Music</Label>
                <span className="text-primary font-bold">{musicVolume}%</span>
              </div>
              <Slider
                value={[musicVolume]}
                min={0}
                max={100}
                step={1}
                onValueChange={(v) => setMusicVolume(v[0])}
              />
            </div>
          </TabsContent>

          {/* Display & HUD Tab */}
          <TabsContent value="display" className="space-y-4 py-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <Label className="text-xs font-semibold block">Tactical Minimap</Label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Display radar grid on top-right HUD
                </span>
              </div>
              <Switch checked={showMinimap} onCheckedChange={setShowMinimap} />
            </div>

            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <Label className="text-xs font-semibold block">FPS & Position Overlay</Label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Show engine performance diagnostic
                </span>
              </div>
              <Switch checked={showFps} onCheckedChange={setShowFps} />
            </div>

            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <Label className="text-xs font-semibold block">Camera Combat Shake</Label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Enable reactive trauma screenshake on impact
                </span>
              </div>
              <Switch checked={screenShake} onCheckedChange={setScreenShake} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold block">Rendering Quality</Label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Post-processing lighting and particle detail
                </span>
              </div>
              <Select
                value={graphicsQuality}
                onValueChange={(v: 'high' | 'medium' | 'low') => setGraphicsQuality(v)}
              >
                <SelectTrigger className="w-32 h-8 text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">HIGH (NEON)</SelectItem>
                  <SelectItem value="medium">MEDIUM</SelectItem>
                  <SelectItem value="low">LOW (PERF)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-2 py-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="rounded border border-border/60 bg-muted/30 p-2 flex justify-between items-center">
                <span>Move Up / Down / Left / Right</span>
                <span className="text-primary font-bold">W A S D</span>
              </div>
              <div className="rounded border border-border/60 bg-muted/30 p-2 flex justify-between items-center">
                <span>Sprint Booster</span>
                <span className="text-primary font-bold">SHIFT</span>
              </div>
              <div className="rounded border border-border/60 bg-muted/30 p-2 flex justify-between items-center">
                <span>Blade / Weapon Attack</span>
                <span className="text-primary font-bold">SPACE</span>
              </div>
              <div className="rounded border border-border/60 bg-muted/30 p-2 flex justify-between items-center">
                <span>Interact / Harvest / Talk</span>
                <span className="text-primary font-bold">E</span>
              </div>
              <div className="rounded border border-border/60 bg-muted/30 p-2 flex justify-between items-center">
                <span>Inventory & Equipment</span>
                <span className="text-primary font-bold">I</span>
              </div>
              <div className="rounded border border-border/60 bg-muted/30 p-2 flex justify-between items-center">
                <span>Mission Dossier & Journal</span>
                <span className="text-primary font-bold">M / J</span>
              </div>
              <div className="rounded border border-border/60 bg-muted/30 p-2 flex justify-between items-center">
                <span>Character Status / Cyberware</span>
                <span className="text-primary font-bold">C</span>
              </div>
              <div className="rounded border border-border/60 bg-muted/30 p-2 flex justify-between items-center">
                <span>Pause Menu / Settings</span>
                <span className="text-primary font-bold">ESC / P</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t border-border/60 pt-3 flex items-center justify-between sm:justify-between w-full">
          <Button variant="ghost" size="sm" onClick={handleResetDefaults} className="text-xs font-mono text-muted-foreground hover:text-foreground">
            RESTORE DEFAULTS
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs font-display">
              CANCEL
            </Button>
            <Button variant="default" size="sm" onClick={handleSave} className="text-xs font-display gap-1.5 shadow-md">
              <Check className="h-3.5 w-3.5" /> APPLY CHANGES
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}