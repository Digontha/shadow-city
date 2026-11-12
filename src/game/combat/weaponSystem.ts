export interface Weapon {
  id: string;
  name: string;
  category: 'blade' | 'blunt' | 'plasma' | 'dagger';
  damage: number;
  critChance: number;      // 0 to 1 (e.g. 0.2 = 20%)
  critMultiplier: number;  // e.g. 1.8x
  cooldown: number;        // in seconds
  reach: number;           // attack range in px
  knockback: number;       // knockback impulse strength
  energyCost: number;      // stamina consumption per swing
  color: string;           // visual slash neon color
  glowColor: string;
  description: string;
  iconName: string;
}

export const WEAPON_REGISTRY: Record<string, Weapon> = {
  'kinetic-blade': {
    id: 'kinetic-blade',
    name: 'Kinetic Katana',
    category: 'blade',
    damage: 24,
    critChance: 0.15,
    critMultiplier: 1.75,
    cooldown: 0.28,
    reach: 34,
    knockback: 110,
    energyCost: 6,
    color: '#16ca8e',
    glowColor: 'rgba(22, 202, 142, 0.65)',
    description: 'Carbon-alloy reinforced high-frequency blade designed for urban combat.',
    iconName: 'Swords',
  },
  'shock-baton': {
    id: 'shock-baton',
    name: 'Shock Baton M-4',
    category: 'blunt',
    damage: 18,
    critChance: 0.1,
    critMultiplier: 1.5,
    cooldown: 0.24,
    reach: 28,
    knockback: 170,
    energyCost: 5,
    color: '#00d2ff',
    glowColor: 'rgba(0, 210, 255, 0.7)',
    description: 'Enforcer issue stun rod. Delivers high impact kinetic and electrical disruption.',
    iconName: 'Zap',
  },
  'plasma-cutter': {
    id: 'plasma-cutter',
    name: 'Plasma Scythe',
    category: 'plasma',
    damage: 42,
    critChance: 0.25,
    critMultiplier: 2.2,
    cooldown: 0.45,
    reach: 40,
    knockback: 130,
    energyCost: 14,
    color: '#ff3366',
    glowColor: 'rgba(255, 51, 102, 0.8)',
    description: 'Illegal black-market thermal arc weapon that melts standard cyber plating.',
    iconName: 'Flame',
  },
  'nano-dagger': {
    id: 'nano-dagger',
    name: 'Viper Nano-Daggers',
    category: 'dagger',
    damage: 14,
    critChance: 0.35,
    critMultiplier: 2.0,
    cooldown: 0.18,
    reach: 24,
    knockback: 60,
    energyCost: 4,
    color: '#b026ff',
    glowColor: 'rgba(176, 38, 255, 0.75)',
    description: 'Ultralight twin daggers with nanite edge coating for lightning-fast critical strikes.',
    iconName: 'Crosshair',
  },
};

export const WEAPON_LIST = Object.values(WEAPON_REGISTRY);