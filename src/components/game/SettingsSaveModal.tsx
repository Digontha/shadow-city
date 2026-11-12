import { useState, useEffect } from 'react';
import { saveManager, GameSettings } from '@/game/save/saveManager';
import { musicManager } from '@/game/audio/musicManager';
import { soundFX } from '@/game/audio/soundFX';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, Download, Volume2, Music, Trash2, Sparkles, Monitor, CheckCircle2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerRef?: { x: number; y: number; stats: { health: number; energy: number } };
}

export default function SettingsSaveModal({ isOpen, onClose, playerRef }: SettingsSaveModalProps) {
  const [settings, setSettings] = useState<GameSettings>(saveManager.getSettings());
  const [hasSave, setHasSave] = useState<boolean>(saveManager.hasSave());
  const [saveMetadata, setSaveMetadata] = useState(saveManager.getSaveMetadata());
  const [isMusicActive, setIsMusicActive] = useState<boolean>(musicManager.getIsPlaying());

  useEffect(() => {
    if (isOpen) {
      setSettings(saveManager.getSettings());
      setHasSave(saveManager.hasSave());
      setSaveMetadata(saveManager.getSaveMetadata());
      setIsMusicActive(musicManager.getIsPlaying());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSettingChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveManager.updateSettings({ [key]: value });

    if (key === 'musicEnabled') {
      if (value) {
        musicManager.start();
        setIsMusicActive(true);
      } else {
        musicManager.stop();
        setIsMusicActive(false);
      }
    } else if (key === 'bgmVolume') {
      musicManager.setVolume((value as number) / 100);
    }
  };

  const handleManualSave = () => {
    const success = saveManager.saveGame(true);
    if (success) {
      setHasSave(true);
      setSaveMetadata(saveManager.getSaveMetadata());
    }
  };

  const handleManualLoad = () => {
    const success = saveManager.loadGame(playerRef);
    if (success) {
      onClose();
    }
  };

  const handleDeleteSave = () => {
    if (window.confirm('Delete local neural save? This action cannot be undone.')) {
      saveManager.deleteSave();
      setHasSave(false);
      setSaveMetadata(null);
    }
  };

  const handleToggleBgm = () => {
    const active = musicManager.toggle();
    setIsMusicActive(active);
    handleSettingChange('musicEnabled', active);
    if (active) {
      soundFX.playWeaponSwitch();
      toast.success('BGM Synthesizer Active');
    } else {
      toast.info('BGM Synthesizer Muted');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-xl border border-primary/40 bg-card p-6 shadow-2xl text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Save className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">SYSTEM // DATA STORAGE & AUDIO</h2>
              <p className="text-xs text-muted-foreground font-mono">
                LOCAL GAME SAVE RESTORATION // NEURAL BGM & AUDIO CONTROLS
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs font-mono">
            ESC / CLOSE
          </Button>
        </div>

        <ScrollArea className="max-h-[70vh] pr-4 mt-4 space-y-6">
          {/* SECTION 1: Game Save & Restoration */}
          <div className="rounded-lg border border-border bg-background/50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold tracking-wide uppercase">Save Game State</h3>
              </div>
              <Badge variant={hasSave ? 'default' : 'secondary'} className="text-[10px] font-mono">
                {hasSave ? 'SAVE FILE PRESENT' : 'NO LOCAL SAVE'}
              </Badge>
            </div>

            {hasSave && saveMetadata ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded bg-card/60 p-3 text-xs font-mono border border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">SAVED AT</span>
                  <span className="font-bold text-foreground">
                    {new Date(saveMetadata.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">OPERATIVE LVL</span>
                  <span className="font-bold text-primary">LVL {saveMetadata.level}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">CREDITS</span>
                  <span className="font-bold text-amber-400">₵{saveMetadata.credits?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">DISTRICT</span>
                  <span className="font-bold text-cyan-400 truncate block">{saveMetadata.district}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No active neural state saved yet. Click Save to record player position, inventory items, credits, and active missions.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button onClick={handleManualSave} className="gap-2 text-xs font-semibold">
                <Save className="h-3.5 w-3.5" /> Save Game Now
              </Button>
              <Button
                variant="secondary"
                disabled={!hasSave}
                onClick={handleManualLoad}
                className="gap-2 text-xs font-semibold"
              >
                <Download className="h-3.5 w-3.5" /> Load Saved Progress
              </Button>
              {hasSave && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleDeleteSave}
                  title="Wipe Saved Game"
                  className="h-9 w-9 ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* SECTION 2: Background Music & Audio Controls */}
          <div className="rounded-lg border border-border bg-background/50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold tracking-wide uppercase">Audio & Background Music</h3>
              </div>
              <Button
                size="sm"
                variant={isMusicActive ? 'default' : 'outline'}
                onClick={handleToggleBgm}
                className="text-xs gap-1.5 h-7"
              >
                {isMusicActive ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                {isMusicActive ? 'BGM PLAYING' : 'START MUSIC'}
              </Button>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="sfx-toggle" className="text-xs font-semibold">
                    Sound Effects (SFX)
                  </Label>
                  <p className="text-[11px] text-muted-foreground">Footsteps, combat slashes, impacts, alarms, and engine hum</p>
                </div>
                <Switch
                  id="sfx-toggle"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Background Music Volume</span>
                  <span className="text-primary font-bold">{settings.bgmVolume}%</span>
                </div>
                <Slider
                  value={[settings.bgmVolume]}
                  max={100}
                  step={5}
                  onValueChange={(val) => handleSettingChange('bgmVolume', val[0])}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Master Volume</span>
                  <span className="text-primary font-bold">{settings.masterVolume}%</span>
                </div>
                <Slider
                  value={[settings.masterVolume]}
                  max={100}
                  step={5}
                  onValueChange={(val) => handleSettingChange('masterVolume', val[0])}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Visual & FX Settings */}
          <div className="rounded-lg border border-border bg-background/50 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold tracking-wide uppercase">Graphics & Visual FX</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold">Particle Simulation</Label>
                  <p className="text-[11px] text-muted-foreground">Combat sparks, blood splatter, footstep dust, tire smoke</p>
                </div>
                <Switch
                  checked={settings.particlesEnabled}
                  onCheckedChange={(checked) => handleSettingChange('particlesEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold">Camera Shake</Label>
                  <p className="text-[11px] text-muted-foreground">Impact trauma recoil on combat strikes and vehicular bumps</p>
                </div>
                <Switch
                  checked={settings.screenShake}
                  onCheckedChange={(checked) => handleSettingChange('screenShake', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold">Retro CRT Scanlines</Label>
                  <p className="text-[11px] text-muted-foreground">Cyberpunk display raster line effect</p>
                </div>
                <Switch
                  checked={settings.retroScanlines}
                  onCheckedChange={(checked) => handleSettingChange('retroScanlines', checked)}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Auto-Save Active (every 60s)
          </div>
          <Button onClick={onClose} size="sm" className="font-mono text-xs">
            DONE
          </Button>
        </div>
      </div>
    </div>
  );
}