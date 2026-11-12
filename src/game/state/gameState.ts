import { GamePhase, PlayerStatsState } from '@/game/types';

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  showMinimap: boolean;
  showFps: boolean;
  screenShake: boolean;
  graphicsQuality: 'high' | 'medium' | 'low';
}

export interface GameState {
  phase: GamePhase;
  stats: PlayerStatsState;
  position: { x: number; y: number };
  fps: number;
  isSprinting: boolean;
  isAttacking: boolean;
  isDead: boolean;
  condition: string;
  activeDistrict: string;
  gameTimeSeconds: number;
  notification: string | null;
  credits: number;
  settings: GameSettings;
}

type Listener = (state: GameState) => void;

class GameStateManager {
  private state: GameState = {
    phase: 'playing',
    stats: {
      health: 100,
      maxHealth: 100,
      energy: 100,
      maxEnergy: 100,
      district: 'Neon Promenade',
    },
    position: { x: 0, y: 0 },
    fps: 60,
    isSprinting: false,
    isAttacking: false,
    isDead: false,
    condition: 'normal',
    activeDistrict: 'Neon Promenade',
    gameTimeSeconds: 0,
    notification: null,
    credits: 1450,
    settings: {
      masterVolume: 80,
      sfxVolume: 90,
      musicVolume: 70,
      showMinimap: true,
      showFps: true,
      screenShake: true,
      graphicsQuality: 'high',
    },
  };

  private listeners = new Set<Listener>();

  public getState(): GameState {
    return this.state;
  }

  public setPhase(phase: GamePhase): void {
    this.updateState({ phase });
  }

  public setNotification(text: string | null): void {
    this.updateState({ notification: text });
  }

  public updateStats(stats: Partial<PlayerStatsState>): void {
    this.updateState({
      stats: { ...this.state.stats, ...stats },
    });
  }

public updatePosition(x: number, y: number, district: string, isSprinting: boolean): void {
    const prevDistrict = this.state.activeDistrict;
    this.updateState({
      position: { x: Math.round(x), y: Math.round(y) },
      activeDistrict: district,
      isSprinting,
    });

    if (prevDistrict && district && prevDistrict !== district) {
      import('@/game/effects/transitionManager').then(({ transitionManager }) => {
        transitionManager.showDistrictBanner(district);
      });
      import('@/game/audio/musicManager').then(({ musicManager }) => {
        musicManager.setDistrict(district);
      });
    }
  }

  public updateFps(fps: number): void {
    this.updateState({ fps: Math.round(fps) });
  }

  public setCredits(credits: number): void {
    this.updateState({ credits: Math.max(0, credits) });
  }

  public addCredits(amount: number): void {
    this.updateState({ credits: Math.max(0, this.state.credits + amount) });
  }

  public updateSettings(partial: Partial<GameSettings>): void {
    const nextSettings = { ...this.state.settings, ...partial };
    this.updateState({ settings: nextSettings });
    try {
      localStorage.setItem('shadow_city_settings', JSON.stringify(nextSettings));
    } catch {
      // Ignore localStorage write failures in sandboxes
    }
  }

  public incrementTime(deltaSeconds: number): void {
    this.state.gameTimeSeconds += deltaSeconds;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(partial: Partial<GameState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const gameState = new GameStateManager();