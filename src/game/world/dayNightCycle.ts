export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night' | 'midnight';

export class DayNightCycle {
  // In-game 24h clock: 0.0 to 24.0. Defaults to 21:40 (Cyberpunk Night)
  public time: number = 21.65;
  // 1 real second = 0.04 in-game hours (1 full cycle ~ 10 minutes)
  public timeSpeed: number = 0.035;

  public update(deltaTime: number): void {
    this.time = (this.time + deltaTime * this.timeSpeed) % 24;
  }

  public getTimeString(): string {
    const hours = Math.floor(this.time);
    const minutes = Math.floor((this.time - hours) * 60);
    const padH = hours < 10 ? `0${hours}` : `${hours}`;
    const padM = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${padH}:${padM}`;
  }

  public getTimePhase(): TimeOfDay {
    if (this.time >= 4.5 && this.time < 7.0) return 'dawn';
    if (this.time >= 7.0 && this.time < 18.0) return 'day';
    if (this.time >= 18.0 && this.time < 21.0) return 'dusk';
    if (this.time >= 21.0 || this.time < 1.0) return 'night';
    return 'midnight';
  }

  public getDarknessLevel(): number {
    const phase = this.getTimePhase();
    switch (phase) {
      case 'day':
        return 0.15;
      case 'dawn':
        return 0.45;
      case 'dusk':
        return 0.58;
      case 'night':
        return 0.78;
      case 'midnight':
        return 0.86;
    }
  }

  public getAmbientTint(): { r: number; g: number; b: number } {
    const phase = this.getTimePhase();
    switch (phase) {
      case 'day':
        return { r: 18, g: 26, b: 38 };
      case 'dawn':
        return { r: 40, g: 24, b: 50 };
      case 'dusk':
        return { r: 52, g: 20, b: 46 };
      case 'night':
        return { r: 6, g: 9, b: 18 };
      case 'midnight':
        return { r: 3, g: 5, b: 12 };
    }
  }

  public areLightsOn(): boolean {
    return this.time >= 18.5 || this.time <= 6.5;
  }
}

export const dayNightCycle = new DayNightCycle();