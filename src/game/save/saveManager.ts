import { gameState } from '@/game/state/gameState';
import { inventoryManager } from '@/game/inventory/inventoryManager';
import { missionManager } from '@/game/missions/missionManager';
import { soundFX } from '@/game/audio/soundFX';
import { toast } from 'sonner';

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  bgmVolume: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  particlesEnabled: boolean;
  screenShake: boolean;
  showFps: boolean;
  retroScanlines: boolean;
}

export interface SaveData {
  version: number;
  timestamp: number;
  playtimeSeconds: number;
  player: {
    x: number;
    y: number;
    health: number;
    maxHealth: number;
    energy: number;
    maxEnergy: number;
    level: number;
    xp: number;
    kills: number;
    district: string;
    activeWeaponName: string;
  };
  inventory: {
    credits: number;
    items: Array<{ id: string; quantity: number }>;
    equipped: {
      weaponId?: string;
      armorId?: string;
      cyberwareId?: string;
    };
  };
  missions: {
    activeMissions: Array<{
      id: string;
      status: string;
      objectives: Array<{ id: string; current: number; isCompleted: boolean }>;
    }>;
    completedMissionIds: string[];
  };
  settings: GameSettings;
}

const SAVE_STORAGE_KEY = 'shadow_city_save_v1';
const SETTINGS_STORAGE_KEY = 'shadow_city_settings_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 80,
  sfxVolume: 85,
  bgmVolume: 65,
  soundEnabled: true,
  musicEnabled: true,
  particlesEnabled: true,
  screenShake: true,
  showFps: true,
  retroScanlines: false,
};

class SaveManager {
  private settings: GameSettings = { ...DEFAULT_SETTINGS };
  private autoSaveTimer: number | null = null;
  private lastSavedTime: number = Date.now();

  constructor() {
    this.loadSettings();
  }

  // Settings management
  public getSettings(): GameSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...partial };
    soundFX.setEnabled(this.settings.soundEnabled);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to persist settings:', e);
    }
  }

  public loadSettings(): GameSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      this.settings = { ...DEFAULT_SETTINGS };
    }
    soundFX.setEnabled(this.settings.soundEnabled);
    return this.getSettings();
  }

  // Check if save data exists
  public hasSave(): boolean {
    try {
      return !!localStorage.getItem(SAVE_STORAGE_KEY);
    } catch {
      return false;
    }
  }

  // Get preview summary of save
  public getSaveMetadata(): { timestamp: number; level: number; credits: number; district: string } | null {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) return null;
      const data: SaveData = JSON.parse(raw);
      return {
        timestamp: data.timestamp,
        level: data.player.level,
        credits: data.inventory.credits,
        district: data.player.district,
      };
    } catch {
      return null;
    }
  }

  // Save current game state
  public saveGame(showNotification: boolean = true): boolean {
    try {
      const curState = gameState.getState();
const invState = inventoryManager;
      const missState = missionManager;

      const saveData: SaveData = {
        version: 1,
        timestamp: Date.now(),
        playtimeSeconds: curState.gameTimeSeconds,
        player: {
          x: curState.position.x,
          y: curState.position.y,
          health: curState.stats.health,
          maxHealth: curState.stats.maxHealth,
          energy: curState.stats.energy,
          maxEnergy: curState.stats.maxEnergy,
          level: curState.level,
          xp: curState.xp,
          kills: curState.kills,
          district: curState.activeDistrict,
          activeWeaponName: curState.activeWeaponName,
        },
        inventory: {
          credits: invState.credits,
          items: invState.items.map((it) => ({ id: it.id, quantity: it.quantity })),
          equipped: {
            weaponId: invState.equippedWeapon?.id,
            armorId: invState.equippedArmor?.id,
            cyberwareId: invState.equippedCyberware?.id,
          },
        },
        missions: {
          activeMissions: missState.activeMissions.map((m) => ({
            id: m.id,
            status: m.status,
            objectives: m.objectives.map((o) => ({
              id: o.id,
              current: o.current,
              isCompleted: o.isCompleted,
            })),
          })),
          completedMissionIds: missState.completedMissionIds,
        },
        settings: this.settings,
      };

      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saveData));
      this.lastSavedTime = Date.now();

      if (showNotification) {
        soundFX.playLevelUp();
        toast.success('Neural Link Synced // Game Progress Saved');
        gameState.setNotification('GAME STATE SAVED TO NEURAL STORAGE');
      }
      return true;
    } catch (err) {
      console.error('Failed to save game:', err);
      toast.error('Save failed: Neural storage quota exceeded');
      return false;
    }
  }

  // Load and restore game state
  public loadGame(playerRef?: { x: number; y: number; stats: { health: number; energy: number } }): boolean {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) {
        toast.error('No Neural link save file found in storage');
        return false;
      }
      const data: SaveData = JSON.parse(raw);

      // 1. Restore Player State
      if (playerRef) {
        playerRef.x = data.player.x;
        playerRef.y = data.player.y;
        playerRef.stats.health = data.player.health;
        playerRef.stats.energy = data.player.energy;
      }

      gameState.updatePosition(data.player.x, data.player.y, data.player.district, false);
      gameState.updateStats({
        health: data.player.health,
        maxHealth: data.player.maxHealth,
        energy: data.player.energy,
        maxEnergy: data.player.maxEnergy,
        district: data.player.district,
      });

      // 2. Restore Inventory & Currency
      if (data.inventory) {
inventoryManager.credits = data.inventory.credits;
        // Clear items and restore saved items
        data.inventory.items.forEach((savedItem) => {
          inventoryManager.addItem(savedItem.id, savedItem.quantity);
        });
        if (data.inventory.equipped.weaponId) {
inventoryManager.equipItem(Number(data.inventory.equipped.weaponId));
        }
        if (data.inventory.equipped.armorId) {
inventoryManager.equipItem(Number(data.inventory.equipped.armorId));
        }
        if (data.inventory.equipped.cyberwareId) {
inventoryManager.equipItem(Number(data.inventory.equipped.cyberwareId));
        }
      }

      // 3. Restore Missions
      if (data.missions) {
        missionManager.restoreProgress(
          data.missions.activeMissions,
          data.missions.completedMissionIds
        );
      }

      // 4. Restore Settings
      if (data.settings) {
        this.updateSettings(data.settings);
      }

      soundFX.playLevelUp();
      toast.success('Neural Link Restored // Progress Successfully Loaded');
      gameState.setNotification('NEURAL STATE RESTORED FROM STORAGE');
      return true;
    } catch (err) {
      console.error('Failed to load game:', err);
      toast.error('Corrupted neural save file');
      return false;
    }
  }

  public deleteSave(): void {
    localStorage.removeItem(SAVE_STORAGE_KEY);
    toast.info('Neural save data wiped');
  }

  // Periodic autosave every 60 seconds
  public startAutoSave(intervalMs: number = 60000): void {
    if (this.autoSaveTimer) return;
    this.autoSaveTimer = window.setInterval(() => {
      this.saveGame(false);
    }, intervalMs);
  }

  public stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}

export const saveManager = new SaveManager();