import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera } from '@/game/engine/Camera';
import { GameLoop } from '@/game/engine/GameLoop';
import { Renderer } from '@/game/engine/Renderer';
import { InputManager } from '@/game/input/InputManager';
import { Player } from '@/game/entities/Player';
import { cityMap, getDistrictAtPosition } from '@/game/world/cityMap';
import { gameState } from '@/game/state/gameState';
import { GAME_CONFIG } from '@/config/gameConfig';
interface InteractableEntity {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
radius: number;
  width: number;
  height: number;
  message: string;
  actionText: string;
}
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, Zap, Activity, Play, Pause, RotateCcw, Volume2, VolumeX, Swords, Radio, Crosshair, ShieldAlert, Flame, Skull, Award, MessageSquare, Target, Package, Store, Coins, ScrollText, Sliders, Save, User, Menu, Backpack, Car, Settings, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

import Minimap from '@/components/game/Minimap';
import CharacterStatusModal from '@/components/game/CharacterStatusModal';
import SettingsModal from '@/components/game/SettingsModal';
import SaveGameModal from '@/components/game/SaveGameModal';
import GameOverModal from '@/components/game/GameOverModal';
import PauseMenu from '@/components/game/PauseMenu';
import MainMenu from '@/components/game/MainMenu';
import { combatManager } from '@/game/combat/combatManager';
import { WEAPON_LIST } from '@/game/combat/weaponSystem';
import { soundFX } from '@/game/audio/soundFX';
import { NPCCharacter } from '@/game/missions/missionTypes';
import { missionManager } from '@/game/missions/missionManager';
import DialogueModal from '@/components/game/DialogueModal';
import MissionTracker from '@/components/game/MissionTracker';
import InventoryModal from '@/components/game/InventoryModal';
import ShopModal from '@/components/game/ShopModal';
import { inventoryManager } from '@/game/inventory/inventoryManager';
import { CITY_SHOPS, ShopMerchant } from '@/game/economy/shopManager';
import { WorldDroppedItem } from '@/game/inventory/itemTypes';
import { vehicleManager } from '@/game/vehicles/vehicleManager';
import VehicleSpawnerModal from '@/components/game/VehicleSpawnerModal';

type NPCWithPosition = NPCCharacter & { col: number; row: number };
const NPC_LIST: NPCWithPosition[] = [];

interface GameCanvasProps {
  onInteract?: (entity: any) => void;
  onPlayerReady?: (player: Player) => void;
}

export default function GameCanvas({ onInteract, onPlayerReady }: GameCanvasProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const playerRef = useRef<Player | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const inputRef = useRef<InputManager | null>(null);
  const loopRef = useRef<GameLoop | null>(null);

const [isPaused, setIsPaused] = useState(false);
const [district, setDistrict] = useState('Neon Promenade');
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [energy, setEnergy] = useState(100);
  const [health, setHealth] = useState(100);
  const [sprinting, setSprinting] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // System UI Modals
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [settings, setSettings] = useState(gameState.getState().settings);

  // Combat system feedback
  const [kills, setKills] = useState(0);
  const [credits, setCredits] = useState(120);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [nextLevelXp, setNextLevelXp] = useState(100);
  const [combo, setCombo] = useState(0);
  const [selectedWeaponId, setSelectedWeaponId] = useState(combatManager.activeWeapon.id);

// Player mechanics feedback
  const [isDead, setIsDead] = useState(false);
  const [condition, setCondition] = useState<string>('normal');
  const [activeInteraction, setActiveInteraction] = useState<InteractableEntity | null>(null);
  const [recentAction, setRecentAction] = useState<string>('PATROL ACTIVE');
// NPC dialogue & mission tracking state
  const [activeNpc, setActiveNpc] = useState<NPCCharacter | null>(null);
  const [nearbyNpc, setNearbyNpc] = useState<NPCCharacter | null>(null);

  // System Modals state
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isCharacterOpen, setIsCharacterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isVehicleSpawnerOpen, setIsVehicleSpawnerOpen] = useState(false);

// Inventory & Economy State
  const [showInventory, setShowInventory] = useState(false);
  const [activeShop, setActiveShop] = useState<ShopMerchant | null>(null);
  const [inventoryCredits, setInventoryCredits] = useState(inventoryManager.credits);
  const [nearbyDrop, setNearbyDrop] = useState<WorldDroppedItem | null>(null);
  const [nearbyShop, setNearbyShop] = useState<ShopMerchant | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const initialWidth = container.clientWidth || 800;
    const initialHeight = container.clientHeight || 600;

    // Instantiate game systems
    const input = new InputManager();
const camera = new Camera(initialWidth, initialHeight);
    const renderer = new Renderer(canvas);
const spawnX = cityMap.spawnCol * GAME_CONFIG.tileSize + GAME_CONFIG.tileSize / 4;
    const spawnY = cityMap.spawnRow * GAME_CONFIG.tileSize + GAME_CONFIG.tileSize / 4;
    const player = new Player(spawnX, spawnY);

    // World interactables list
    const interactables: InteractableEntity[] = [
      {
        id: 'term-hub',
        name: 'Nexus Data Terminal',
        type: 'terminal',
        x: spawnX + 80,
        y: spawnY,
radius: 60,
        width: 40,
        height: 40,
        message: 'Decentralized shadow network uplink ready.',
        actionText: 'Access Network Logs',
      },
      {
        id: 'med-clinic',
        name: 'Synthetix Nano-Clinic',
        type: 'medical',
        x: spawnX - 80,
        y: spawnY + 40,
radius: 65,
        width: 40,
        height: 40,
        message: 'Bio-stimulator online. Vitals restorable.',
        actionText: 'Apply Bio-Repair (Heal)',
      },
      {
        id: 'cache-east',
        name: 'Encrypted Shadow Cache',
        type: 'cache',
        x: spawnX + 160,
        y: spawnY + 90,
radius: 60,
        width: 40,
        height: 40,
        message: 'Secured kinetic battery module detected.',
        actionText: 'Extract Energy Cell',
      },
    ];

inputRef.current = input;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    playerRef.current = player;
    onPlayerReady?.(player);

    camera.follow(player.x, player.y);

    let frameCounter = 0;
    let fpsTimer = 0;

    const gameLoop = new GameLoop(
// Fixed Step Update
      (dt: number) => {
        const inputState = input.getState();
        // 1. Update Vehicle Physics & Interactions
        vehicleManager.update(dt, inputState, cityMap.grid, player);

        // 1b. Update Player (if on foot)
        if (!player.isInVehicle) {
          player.update(dt, inputState, cityMap.grid);
        }
        camera.follow(player.x + player.width / 2, player.y + player.height / 2);

// Interaction Proximity Check
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;

// Check for nearby mission NPCs
        let closeNpc: NPCCharacter | null = null;
        for (const npc of NPC_LIST) {
          const ndx = (npc.col * GAME_CONFIG.tileSize + GAME_CONFIG.tileSize / 2) - playerCenterX;
          const ndy = (npc.row * GAME_CONFIG.tileSize + GAME_CONFIG.tileSize / 2) - playerCenterY;
          if (Math.hypot(ndx, ndy) <= 75) {
            closeNpc = npc;
            break;
          }
        }
        setNearbyNpc(closeNpc);

        let detected: InteractableEntity | null = null;
        for (const item of interactables) {
          const dx = item.x - playerCenterX;
          const dy = item.y - playerCenterY;
          const dist = Math.hypot(dx, dy);
          if (dist <= item.radius) {
            detected = item;
            break;
          }
        }
        player.nearbyInteractable = detected;
        setActiveInteraction(detected);

        // Interaction execution via E key
        if (inputState.interact && player.interactionCooldown <= 0) {
          if (closeNpc) {
            player.interactionCooldown = 0.5;
            setActiveNpc(closeNpc);
            setRecentAction(`TALKING TO ${closeNpc.name.toUpperCase()}`);
          } else if (detected) {
            player.interactionCooldown = 0.5;
            if (detected.type === 'medical') {
              player.heal(40);
              setRecentAction('BIOMETRIC RESTORATION +40');
              toast.success('Bio-repair applied. Health restored!');
            } else if (detected.type === 'cache') {
              player.restoreEnergy(50);
              setRecentAction('KINETIC CELL HARVESTED +50');
              toast.success('Energy cell recovered!');
            } else {
              setRecentAction(`UPLINK: ${detected.name}`);
              toast.info(`${detected.name}: ${detected.message}`);
            }
          }
        }

// Real-time Melee Combat Execution on Attack Input
        if (inputState.attack && player.attackTimer > 0.18 && !player.isDead) {
          combatManager.executePlayerAttack(player);
          setRecentAction(`${combatManager.activeWeapon.name.toUpperCase()} STRIKE`);
        }

        // Update real-time combat stats
        combatManager.update(dt, player, cityMap.grid);
        setKills(combatManager.stats.kills);
        setCredits(combatManager.stats.credits);
        setLevel(combatManager.stats.level);
        setXp(combatManager.stats.xp);
        setNextLevelXp(combatManager.stats.nextLevelXp);
        setCombo(combatManager.stats.comboCount);

        // Update district & vitals tracking
const currentDistrict = getDistrictAtPosition(player.x, player.y).name;
        setDistrict(currentDistrict);
        setCoords({ x: Math.round(player.x), y: Math.round(player.y) });
        setEnergy(Math.round(player.stats.energy));
        setHealth(Math.round(player.stats.health));
        setSprinting(player.isSprinting);
        setIsDead(player.isDead);
        setCondition(player.condition);

        gameState.updatePosition(player.x, player.y, currentDistrict, player.isSprinting);
        gameState.updateStats(player.stats);
      },
      // Render
      (_interpolation: number) => {
renderer.render(cityMap.grid, player, camera, _interpolation);
        frameCounter++;
      }
    );

    loopRef.current = gameLoop;
    gameLoop.start();

    // FPS ticker
    const fpsInterval = window.setInterval(() => {
      gameState.updateFps(frameCounter);
      frameCounter = 0;
      fpsTimer += 1;
      gameState.incrementTime(1);
    }, 1000);

    // Responsive Canvas Resize Observer
    const handleResize = () => {
      if (!container || !canvas) return;
      const w = container.clientWidth;
      const h = container.clientHeight;

      renderer.resize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(container);
    handleResize();

// Global shortcut listener for gameplay modals
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      const key = e.key.toLowerCase();
      if (key === 'i') {
        setIsInventoryOpen((prev) => !prev);
      } else if (key === 'b') {
        setIsShopOpen((prev) => !prev);
      } else if (key === 'c') {
        setIsCharacterOpen((prev) => !prev);
      } else if (key === 'v') {
        setIsVehicleSpawnerOpen((prev) => !prev);
      } else if (key === 'k') {
        setIsSaveOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(fpsInterval);
      resizeObserver.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      gameLoop.stop();
      input.destroy();
    };
  }, []);

  const togglePause = () => {
    if (!loopRef.current) return;
    if (isPaused) {
      loopRef.current.start();
      setIsPaused(false);
      gameState.setPhase('playing');
    } else {
      loopRef.current.stop();
      setIsPaused(true);
      gameState.setPhase('paused');
    }
  };

const handleRespawn = useCallback(() => {
    if (!playerRef.current || !cameraRef.current) return;
    playerRef.current.respawn();
    setIsDead(false);
    setHealth(100);
    setEnergy(100);
    setCondition('normal');
    setRecentAction('SYSTEM REBOOT: RESPAWN COMPLETE');
    cameraRef.current.follow(playerRef.current.x, playerRef.current.y);
    toast.success('Cipher reconstructed at district safe node.');
  }, []);

const handleTestDamage = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current.takeDamage(25);
    setHealth(Math.round(playerRef.current.stats.health));
    if (playerRef.current.isDead) {
      missionManager.onPlayerDeath();
    }
    setRecentAction('ALERT: HOSTILE HIT -25 HP');
    toast.error('Direct hit! Cipher sustained 25 kinetic damage.');
  }, []);

  const handleSelectWeapon = useCallback((weaponId: string) => {
    combatManager.setWeapon(weaponId);
    if (playerRef.current) {
      playerRef.current.setAttackCooldown(combatManager.activeWeapon.cooldown);
    }
    setSelectedWeaponId(weaponId);
    toast.info(`Equipped ${combatManager.activeWeapon.name}`);
  }, []);

  const toggleAudio = useCallback(() => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundFX.setEnabled(next);
    if (next) {
      soundFX.playWeaponSwitch();
      toast.success('Combat synthesizer audio enabled.');
    } else {
      toast.info('Audio muted.');
    }
  }, [audioEnabled]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full flex-col overflow-hidden bg-background select-none"
    >
      {/* Primary Canvas Target */}
      <canvas
        ref={canvasRef}
        className="block h-full w-full flex-1 touch-none cursor-crosshair outline-none"
      />

      {/* Top HUD Bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 md:p-6">
        {/* District & Location */}
        <div className="flex flex-col gap-1.5 rounded-lg border border-border/80 bg-background/85 p-3 backdrop-blur-md shadow-soft">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary animate-pulse" />
            <span className="font-display text-sm font-semibold tracking-wide text-foreground">
              {district}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <span>
              X: {coords.x} | Y: {coords.y}
            </span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="text-primary font-medium">LIVE GRID</span>
          </div>
        </div>

        {/* Quick System Actions */}
        <div className="pointer-events-auto flex items-center gap-2">
<Button
            variant="secondary"
            size="icon"
            onClick={toggleAudio}
            aria-label={audioEnabled ? 'Mute city audio' : 'Unmute city audio'}
            className="border border-border/60 bg-background/80 backdrop-blur-sm"
          >
            {audioEnabled ? (
              <Volume2 className="h-4 w-4 text-primary" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>

<Button
            variant="secondary"
            size="sm"
            onClick={handleTestDamage}
            aria-label="Simulate Hazard Damage"
            className="hidden sm:inline-flex gap-1.5 border border-destructive/40 bg-background/80 backdrop-blur-sm text-xs font-mono text-destructive hover:bg-destructive/15"
          >
            <Flame className="h-3.5 w-3.5" /> TEST DAMAGE
          </Button>

<Button
            variant="secondary"
            size="icon"
            onClick={() => setIsInventoryOpen(true)}
            aria-label="Open Inventory (I)"
            title="Inventory (I)"
            className="border border-border/60 bg-background/80 backdrop-blur-sm"
          >
            <Backpack className="h-4 w-4 text-primary" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsShopOpen(true)}
            aria-label="Open Black Market Shop (B)"
            title="Black Market (B)"
            className="border border-border/60 bg-background/80 backdrop-blur-sm"
          >
            <ShoppingBag className="h-4 w-4 text-accent" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsVehicleSpawnerOpen(true)}
            aria-label="Vehicle Terminal (V)"
            title="Vehicle Terminal (V)"
            className="border border-border/60 bg-background/80 backdrop-blur-sm"
          >
            <Car className="h-4 w-4 text-primary" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsCharacterOpen(true)}
            aria-label="Character Status (C)"
            title="Character Status (C)"
            className="border border-border/60 bg-background/80 backdrop-blur-sm"
          >
            <User className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsSaveOpen(true)}
            aria-label="Save / Load Game (K)"
            title="Save / Load Game (K)"
            className="border border-border/60 bg-background/80 backdrop-blur-sm"
          >
            <Save className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Settings"
            title="Settings"
            className="border border-border/60 bg-background/80 backdrop-blur-sm"
          >
            <Settings className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={handleRespawn}
            aria-label="Respawn at Central Hub"
            className="border border-border/60 bg-background/80 backdrop-blur-sm"
          >
            <RotateCcw className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>

          <Button
            variant={isPaused ? 'default' : 'secondary'}
            size="sm"
            onClick={togglePause}
            className="gap-1.5 border border-border/60 backdrop-blur-sm shadow-soft font-display text-xs"
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5 fill-current" /> RESUME
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5" /> PAUSE
              </>
            )}
          </Button>
        </div>
      </div>

{/* Mission Tracker Widget */}
      <MissionTracker />

      {/* NPC Dialogue Modal */}
      {activeNpc && (
        <DialogueModal
          npc={activeNpc}
          onClose={() => setActiveNpc(null)}
        />
      )}

      {/* NPC Interaction Prompt */}
      {nearbyNpc && !isDead && !activeNpc && (
        <div className="pointer-events-auto absolute left-1/2 top-20 -translate-x-1/2 z-20 animate-fade-in">
          <div className="flex items-center gap-2.5 rounded-full border border-primary/80 bg-background/95 px-4 py-2 shadow-glow backdrop-blur-md">
            <MessageSquare className="h-4 w-4 text-primary animate-bounce" />
            <div className="flex flex-col">
              <span className="text-xs font-display font-semibold text-foreground">
                {nearbyNpc.name}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {nearbyNpc.role}
              </span>
            </div>
            <kbd className="ml-2 rounded border border-primary/50 bg-primary/20 px-2 py-0.5 text-xs font-mono font-bold text-primary">
              E TALK
            </kbd>
          </div>
        </div>
      )}

      {/* Interaction Indicator Pill (Floating near center screen when interactable is close) */}
      {activeInteraction && !nearbyNpc && !isDead && (
        <div className="pointer-events-auto absolute left-1/2 top-20 -translate-x-1/2 z-20 animate-fade-in">
          <div className="flex items-center gap-2.5 rounded-full border border-primary/60 bg-background/95 px-4 py-2 shadow-glow backdrop-blur-md">
            <Radio className="h-4 w-4 text-primary animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-display font-semibold text-foreground">
                {activeInteraction.name}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {activeInteraction.actionText}
              </span>
            </div>
            <kbd className="ml-2 rounded border border-primary/50 bg-primary/15 px-2 py-0.5 text-xs font-mono font-bold text-primary">
              E
            </kbd>
          </div>
        </div>
      )}

      {/* Bottom HUD: Status Monitors & Key Bindings */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center justify-between gap-4 p-4 md:flex-row md:items-end md:p-6">
{/* Vitals & Combat Progression Deck */}
        <div className="w-full max-w-sm rounded-lg border border-border/80 bg-background/90 p-3.5 backdrop-blur-md shadow-soft">
          <div className="space-y-2.5">
            {/* Level & Combat Stats Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary/20 px-1.5 py-0.5 text-primary font-bold">
                  LVL {level}
                </span>
                <span className="text-muted-foreground font-semibold flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-primary" /> {xp}/{nextLevelXp} XP
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-foreground font-bold">
                  <Skull className="h-3.5 w-3.5 text-destructive" /> {kills}
                </span>
                {combo > 1 && (
                  <span className="animate-pulse font-extrabold text-accent">
                    {combo}x COMBO!
                  </span>
                )}
              </div>
            </div>

            {/* Health Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-medium mb-1">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Activity className="h-3.5 w-3.5 text-destructive" /> BIO-METRIC
                </span>
                <span className="text-muted-foreground">{health}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className="h-full bg-destructive transition-all duration-200"
                  style={{ width: `${health}%` }}
                />
              </div>
            </div>

            {/* Kinetic Energy / Sprint Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-medium mb-1">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Zap className={`h-3.5 w-3.5 ${sprinting ? 'text-accent' : 'text-primary'}`} />
                  KINETIC CELL
                </span>
                <div className="flex items-center gap-1.5">
                  {condition === 'exhausted' && (
                    <span className="text-[10px] text-destructive font-bold uppercase animate-pulse">
                      EXHAUSTED
                    </span>
                  )}
                  <span className="text-muted-foreground">{energy}%</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className={`h-full transition-all duration-150 ${
                    condition === 'exhausted'
                      ? 'bg-destructive'
                      : sprinting
                      ? 'bg-accent'
                      : 'bg-primary'
                  }`}
                  style={{ width: `${energy}%` }}
                />
              </div>
            </div>

            {/* Weapon Selector Strip */}
            <div className="pt-1.5 border-t border-border/40">
              <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5 flex items-center justify-between">
                <span>ARMAMENT ARSENAL</span>
                <span className="text-primary font-semibold">{combatManager.activeWeapon.name}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {WEAPON_LIST.map((w) => {
                  const isSelected = selectedWeaponId === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleSelectWeapon(w.id)}
                      className={`pointer-events-auto flex flex-col items-center justify-center rounded border p-1 text-[10px] font-mono transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/20 text-foreground font-bold shadow-sm'
                          : 'border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <span className="truncate w-full text-center">{w.name.split(' ')[0]}</span>
                      <span className="text-[9px] opacity-75">{w.damage} DMG</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tactical Status Line */}
            <div className="pt-1 flex items-center justify-between text-[11px] font-mono border-t border-border/40 text-muted-foreground">
              <span className="flex items-center gap-1 text-foreground">
                <Crosshair className="h-3 w-3 text-primary" /> STATUS:
                <span className="text-primary font-semibold uppercase">{condition}</span>
              </span>
              <span className="truncate max-w-[140px] text-accent font-medium">{recentAction}</span>
            </div>
          </div>
        </div>

        {/* Tactical Key Guide */}
        <div className="hidden rounded-lg border border-border/80 bg-background/85 px-4 py-2.5 backdrop-blur-md shadow-soft md:flex items-center gap-3.5 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted/80 px-1.5 py-0.5 text-foreground font-semibold">
              W
            </kbd>
            <kbd className="rounded border border-border bg-muted/80 px-1.5 py-0.5 text-foreground font-semibold">
              A
            </kbd>
            <kbd className="rounded border border-border bg-muted/80 px-1.5 py-0.5 text-foreground font-semibold">
              S
            </kbd>
            <kbd className="rounded border border-border bg-muted/80 px-1.5 py-0.5 text-foreground font-semibold">
              D
            </kbd>
            <span className="ml-1">Move</span>
          </div>

          <div className="h-3 w-px bg-border" />

          <div className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted/80 px-1.5 py-0.5 text-foreground font-semibold">
              SHIFT
            </kbd>
            <span className="ml-1">Sprint</span>
          </div>

          <div className="h-3 w-px bg-border" />

<div className="flex items-center gap-1">
            <kbd className="rounded border border-primary/50 bg-primary/20 px-1.5 py-0.5 text-primary font-bold animate-pulse">
              SPACE
            </kbd>
            <span className="ml-1 text-primary font-semibold">Melee Attack</span>
          </div>

          <div className="h-3 w-px bg-border" />

          <div className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted/80 px-1.5 py-0.5 text-foreground font-semibold">
              E
            </kbd>
            <span className="ml-1">Interact</span>
          </div>
        </div>
      </div>

      {/* Death & Neural Desync Overlay Modal */}
      {isDead && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="mx-4 max-w-md rounded-xl border border-destructive/80 bg-card p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 border border-destructive/40 text-destructive mb-3 animate-pulse">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-destructive">
              NEURAL UPLINK COLLAPSED
            </span>
            <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground">
              CIPHER DOWN
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Critical biometric failure in {district}. Safe node beacon available for neural
              reconstruction.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="destructive"
                onClick={handleRespawn}
                className="w-full font-display font-semibold shadow-lg text-sm py-5"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> RECONSTRUCT AT SAFE HUB
              </Button>
            </div>
          </div>
        </div>
      )}

{/* Paused Overlay Modal */}
      {isPaused && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/70 backdrop-blur-sm animate-fade-in">
          <div className="mx-4 max-w-sm rounded-lg border border-border bg-card p-6 text-center shadow-elegant">
            <span className="text-eyebrow text-primary">TRANSMISSION SUSPENDED</span>
            <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
              CITY SIMULATION PAUSED
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Neural uplink standby. Review district perimeters or resume your patrol when ready.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Button onClick={togglePause} className="w-full font-display">
                <Play className="mr-2 h-4 w-4 fill-current" /> RESUME PATROL
              </Button>
              <Button variant="outline" onClick={handleRespawn} className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" /> RESET TO SPAWN TILE
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Integrated Gameplay Subsystems */}
{isInventoryOpen && (
        <InventoryModal
          onClose={() => setIsInventoryOpen(false)}
          player={playerRef.current}
        />
      )}

{isShopOpen && (
        <ShopModal
          onClose={() => setIsShopOpen(false)}
          playerDistrict={district}
        />
      )}

{isCharacterOpen && (
        <CharacterStatusModal
          onClose={() => setIsCharacterOpen(false)}
        />
      )}

{isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

{isSaveOpen && (
        <SaveGameModal
          onClose={() => setIsSaveOpen(false)}
        />
      )}

      {playerRef.current && (
        <VehicleSpawnerModal
          isOpen={isVehicleSpawnerOpen}
          onClose={() => setIsVehicleSpawnerOpen(false)}
          player={playerRef.current}
        />
      )}
    </div>
  );
}