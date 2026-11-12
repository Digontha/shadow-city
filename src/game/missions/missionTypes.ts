export type MissionCategory = 'story' | 'side' | 'bounty';
export type MissionStatus = 'available' | 'active' | 'completed' | 'failed';
export type ObjectiveType = 
  | 'eliminate' 
  | 'explore' 
  | 'hack_terminal' 
  | 'interact_npc' 
  | 'collect' 
  | 'survive';

export interface MissionObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  targetCount: number;
  currentCount: number;
  targetId?: string; // e.g. district name, enemy archetype, or NPC id
  completed: boolean;
}

export interface MissionRewards {
  credits: number;
  xp: number;
  unlockedWeapon?: string;
  healthBonus?: number;
  energyBonus?: number;
}

export interface Mission {
  id: string;
  title: string;
  category: MissionCategory;
  giverNpcId: string;
  district: string;
  description: string;
  loreText: string;
  objectives: MissionObjective[];
  rewards: MissionRewards;
  status: MissionStatus;
  recommendedLevel?: number;
  failureCondition?: string;
}

export interface DialogueChoice {
  text: string;
  action?: 'accept_mission' | 'complete_mission' | 'open_shop' | 'close' | 'next_node';
  nextNodeId?: string;
  missionId?: string;
}

export interface DialogueNode {
  id: string;
  text: string;
  choices: DialogueChoice[];
}

export interface NPCCharacter {
  id: string;
  name: string;
  role: string;
  faction: string;
  district: string;
  x: number;
  y: number;
  color: string;
  badge: string;
  bio: string;
  dialogueTree: Record<string, DialogueNode>;
  initialNodeId: string;
  offeredMissionIds: string[];
}