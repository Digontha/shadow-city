import { Mission, MissionStatus, NPCCharacter } from './missionTypes';
import { MISSIONS_LIST } from './missionData';
import { NPC_LIST } from './npcData';
import { soundFX } from '../audio/soundFX';
import { toast } from 'sonner';

type MissionUpdateListener = (missions: Mission[], activeMission: Mission | null) => void;

export class MissionManager {
  private missions: Map<string, Mission> = new Map();
  private npcs: Map<string, NPCCharacter> = new Map();
  private activeMissionId: string | null = null;
  private listeners: Set<MissionUpdateListener> = new Set();

  public playerCredits: number = 350;
  public playerXP: number = 0;
  public playerLevel: number = 1;

  constructor() {
    this.init();
  }

  private init() {
    MISSIONS_LIST.forEach((m) => {
      // Deep copy to allow runtime mutation
      this.missions.set(m.id, JSON.parse(JSON.stringify(m)));
    });

    NPC_LIST.forEach((npc) => {
      this.npcs.set(npc.id, npc);
    });

    // Default first mission to active
    const firstMission = this.missions.get('m_awake');
    if (firstMission) {
      firstMission.status = 'active';
      this.activeMissionId = firstMission.id;
    }
  }

  public subscribe(listener: MissionUpdateListener): () => void {
    this.listeners.add(listener);
    listener(this.getAllMissions(), this.getActiveMission());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const all = this.getAllMissions();
    const active = this.getActiveMission();
    this.listeners.forEach((listener) => listener(all, active));
  }

  public getAllMissions(): Mission[] {
    return Array.from(this.missions.values());
  }

  public getActiveMission(): Mission | null {
    if (!this.activeMissionId) {
      // Find first active if any
      for (const m of this.missions.values()) {
        if (m.status === 'active') {
          this.activeMissionId = m.id;
          return m;
        }
      }
      return null;
    }
    return this.missions.get(this.activeMissionId) || null;
  }

  public setActiveMission(missionId: string): void {
    const target = this.missions.get(missionId);
    if (target && target.status === 'active') {
      this.activeMissionId = missionId;
      this.notify();
    }
  }

  public getNPC(npcId: string): NPCCharacter | undefined {
    return this.npcs.get(npcId);
  }

  public getAllNPCs(): NPCCharacter[] {
    return Array.from(this.npcs.values());
  }

  public acceptMission(missionId: string): boolean {
    const mission = this.missions.get(missionId);
    if (!mission || mission.status !== 'available') return false;

    mission.status = 'active';
    this.activeMissionId = mission.id;
soundFX.playHit();
    toast.info(`Mission Accepted: ${mission.title}`, {
      description: mission.description,
    });
    this.notify();
    return true;
  }

  public onEnemyKilled(): void {
    let changed = false;
    this.missions.forEach((mission) => {
      if (mission.status !== 'active') return;

      mission.objectives.forEach((obj) => {
        if (obj.type === 'eliminate' && !obj.completed) {
          obj.currentCount = Math.min(obj.targetCount, obj.currentCount + 1);
          changed = true;
          if (obj.currentCount >= obj.targetCount) {
            obj.completed = true;
            toast.success(`Objective Complete: ${obj.description}`);
            soundFX.playHit();
          }
        }
      });

      this.checkMissionCompletion(mission);
    });

    if (changed) this.notify();
  }

  public onDistrictVisited(districtName: string): void {
    let changed = false;
    this.missions.forEach((mission) => {
      if (mission.status !== 'active') return;

      mission.objectives.forEach((obj) => {
        if (obj.type === 'explore' && !obj.completed && obj.targetId === districtName) {
          obj.currentCount = 1;
          obj.completed = true;
          changed = true;
toast.success(`District Explored: ${districtName}`);
          soundFX.playHit();
        }
      });

      this.checkMissionCompletion(mission);
    });

    if (changed) this.notify();
  }

  public onTerminalHacked(terminalId: string): void {
    let changed = false;
    this.missions.forEach((mission) => {
      if (mission.status !== 'active') return;

      mission.objectives.forEach((obj) => {
        if (obj.type === 'hack_terminal' && !obj.completed && obj.targetId === terminalId) {
          obj.currentCount = 1;
          obj.completed = true;
          changed = true;
toast.success(`Data Terminal Secured: ${obj.description}`);
          soundFX.playHit();
        }
      });

      this.checkMissionCompletion(mission);
    });

    if (changed) this.notify();
  }

  public onItemCollected(collectionId: string): void {
    let changed = false;
    this.missions.forEach((mission) => {
      if (mission.status !== 'active') return;

      mission.objectives.forEach((obj) => {
        if (obj.type === 'collect' && !obj.completed) {
          if (!obj.targetId || obj.targetId.includes(collectionId) || collectionId.includes(obj.targetId)) {
            obj.currentCount = Math.min(obj.targetCount, obj.currentCount + 1);
            changed = true;
            if (obj.currentCount >= obj.targetCount) {
              obj.completed = true;
toast.success(`Objective Complete: ${obj.description}`);
              soundFX.playHit();
            }
          }
        }
      });

      this.checkMissionCompletion(mission);
    });

    if (changed) this.notify();
  }

  public onNPCInteracted(npcId: string): void {
    let changed = false;
    this.missions.forEach((mission) => {
      if (mission.status !== 'active') return;

      mission.objectives.forEach((obj) => {
        if (obj.type === 'interact_npc' && !obj.completed && obj.targetId === npcId) {
          obj.currentCount = 1;
          obj.completed = true;
          changed = true;
toast.success(`Contact Established: ${obj.description}`);
          soundFX.playHit();
        }
      });

      this.checkMissionCompletion(mission);
    });

    if (changed) this.notify();
  }

  public onPlayerDeath(): void {
    let changed = false;
    this.missions.forEach((mission) => {
      if (mission.status === 'active' && mission.failureCondition) {
        mission.status = 'failed';
        changed = true;
        toast.error(`Mission Failed: ${mission.title}`, {
          description: mission.failureCondition,
        });
      }
    });
    if (changed) this.notify();
  }

  private checkMissionCompletion(mission: Mission): void {
    const allCompleted = mission.objectives.every((obj) => obj.completed);
    if (allCompleted && mission.status === 'active') {
      mission.status = 'completed';
soundFX.playHit();

      // Grant rewards
      this.playerCredits += mission.rewards.credits;
      this.playerXP += mission.rewards.xp;
      this.checkLevelUp();

      toast.success(`MISSION ACCOMPLISHED: ${mission.title}!`, {
        description: `+${mission.rewards.credits} Credits | +${mission.rewards.xp} XP${
          mission.rewards.unlockedWeapon ? ` | Weapon Unlocked: ${mission.rewards.unlockedWeapon}` : ''
        }`,
      });

      // Auto-set next active mission if available
      const next = Array.from(this.missions.values()).find((m) => m.status === 'active');
      this.activeMissionId = next ? next.id : null;
    }
  }

  private checkLevelUp(): void {
    const requiredXP = this.playerLevel * 300;
    if (this.playerXP >= requiredXP) {
      this.playerLevel += 1;
soundFX.playHit();
      toast.success(`NEURAL ENHANCEMENT: Level ${this.playerLevel} Achieved!`, {
        description: 'Vitals and cognitive throughput improved.',
      });
    }
  }

  public hasPendingMission(npcId: string): boolean {
    return Array.from(this.missions.values()).some(
      (m) => m.giverNpcId === npcId && m.status === 'available'
    );
  }

  public hasActiveMissionWith(npcId: string): boolean {
    return Array.from(this.missions.values()).some((m) => {
      if (m.status !== 'active') return false;
      return m.objectives.some((o) => o.type === 'interact_npc' && o.targetId === npcId && !o.completed);
    });
  }
}

export const missionManager = new MissionManager();