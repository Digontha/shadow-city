export type ItemType = 'weapon' | 'armor' | 'cyberdeck' | 'consumable' | 'material' | 'valuable';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type EquipmentSlot = 'weapon' | 'armor' | 'cyberdeck';

export interface ItemStats {
  damageBonus?: number;
  armorBonus?: number;
  healthBonus?: number;
  energyBonus?: number;
  speedBonus?: number;
}

export interface ItemUseEffect {
  healAmount?: number;
  energyAmount?: number;
  buffDuration?: number;
  logMessage?: string;
}

export interface ItemDefinition {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  price: number;
  sellPrice: number;
  stackable: boolean;
  maxStack?: number;
  equipSlot?: EquipmentSlot;
  stats?: ItemStats;
  useEffect?: ItemUseEffect;
  iconName: string;
}

export interface InventorySlot {
  slotId: number;
  item: ItemDefinition;
  quantity: number;
}

export interface WorldDroppedItem {
  id: string;
  item: ItemDefinition;
  quantity: number;
  x: number;
  y: number;
  radius: number;
}

export const ITEM_REGISTRY: Record<string, ItemDefinition> = {
  // Consumables
  'med-stim-v1': {
    id: 'med-stim-v1',
    name: 'Nano-Med Stim V1',
    type: 'consumable',
    rarity: 'common',
    description: 'Rapid-acting nanobots that mend ruptured tissue. Restores 35 Health.',
    price: 45,
    sellPrice: 20,
    stackable: true,
    maxStack: 10,
    useEffect: {
      healAmount: 35,
      logMessage: 'Vitals stabilized. +35 HP restored.',
    },
    iconName: 'HeartPulse',
  },
  'trauma-ampoule': {
    id: 'trauma-ampoule',
    name: 'Trauma Bio-Ampoule',
    type: 'consumable',
    rarity: 'rare',
    description: 'Military-spec surgical fluid. Restores 75 Health and purges biological toxins.',
    price: 130,
    sellPrice: 65,
    stackable: true,
    maxStack: 5,
    useEffect: {
      healAmount: 75,
      logMessage: 'Surgical nanites active. +75 HP restored.',
    },
    iconName: 'Activity',
  },
  'battery-cell': {
    id: 'battery-cell',
    name: 'Kinetic Overcharge Cell',
    type: 'consumable',
    rarity: 'common',
    description: 'High-density lithium-ion capacitor. Instantly replenishes 50 Sprint Energy.',
    price: 35,
    sellPrice: 15,
    stackable: true,
    maxStack: 15,
    useEffect: {
      energyAmount: 50,
      logMessage: 'Capacitor discharged. +50 Kinetic Energy.',
    },
    iconName: 'Zap',
  },
  'neuro-injector': {
    id: 'neuro-injector',
    name: 'Hyper-Adrenaline Injector',
    type: 'consumable',
    rarity: 'epic',
    description: 'Combat stimulant synthesized in underground labs. Restores 50 HP and full Sprint Energy.',
    price: 240,
    sellPrice: 110,
    stackable: true,
    maxStack: 5,
    useEffect: {
      healAmount: 50,
      energyAmount: 100,
      logMessage: 'Synapses burning at 200%. Full Energy and +50 HP!',
    },
    iconName: 'Flame',
  },
  'street-noodle': {
    id: 'street-noodle',
    name: 'Synth-Pork Ramen',
    type: 'consumable',
    rarity: 'common',
    description: 'Hot street food from District 4 night vendors. Restores 20 HP and 25 Energy.',
    price: 20,
    sellPrice: 8,
    stackable: true,
    maxStack: 20,
    useEffect: {
      healAmount: 20,
      energyAmount: 25,
      logMessage: 'Steaming broth consumed. +20 HP, +25 Energy.',
    },
    iconName: 'Coffee',
  },

  // Weapons
  'combat-vibroblade': {
    id: 'combat-vibroblade',
    name: 'Tanto Vibroblade',
    type: 'weapon',
    rarity: 'common',
    description: 'High-frequency ultrasonic combat blade capable of slicing thin chassis.',
    price: 180,
    sellPrice: 85,
    stackable: false,
    equipSlot: 'weapon',
    stats: {
      damageBonus: 10,
      speedBonus: 5,
    },
    iconName: 'Swords',
  },
  'plasma-cutter': {
    id: 'plasma-cutter',
    name: 'Arc Plasma Edge',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Industrial laser-welder modified into an incandescent melee blade.',
    price: 380,
    sellPrice: 175,
    stackable: false,
    equipSlot: 'weapon',
    stats: {
      damageBonus: 22,
    },
    iconName: 'Flame',
  },
  'neon-nodachi': {
    id: 'neon-nodachi',
    name: 'Kuroshio Neon Nodachi',
    type: 'weapon',
    rarity: 'rare',
    description: 'Extravagant syndicate heirloom forged with polarized carbonite edge.',
    price: 750,
    sellPrice: 350,
    stackable: false,
    equipSlot: 'weapon',
    stats: {
      damageBonus: 38,
      speedBonus: 12,
    },
    iconName: 'Sparkles',
  },
  'monomolecular-wire': {
    id: 'monomolecular-wire',
    name: 'Ghost Monowire',
    type: 'weapon',
    rarity: 'legendary',
    description: 'Single-molecule braided filament that cleaves alloy plating instantaneously.',
    price: 1800,
    sellPrice: 900,
    stackable: false,
    equipSlot: 'weapon',
    stats: {
      damageBonus: 65,
      speedBonus: 20,
      energyBonus: 30,
    },
    iconName: 'Crown',
  },

  // Armors
  'street-kevlar': {
    id: 'street-kevlar',
    name: 'Reinforced Courier Vest',
    type: 'armor',
    rarity: 'common',
    description: 'Ballistic weave layer worn by underground runners and smugglers.',
    price: 140,
    sellPrice: 65,
    stackable: false,
    equipSlot: 'armor',
    stats: {
      armorBonus: 8,
      healthBonus: 15,
    },
    iconName: 'Shield',
  },
  'subdermal-mesh': {
    id: 'subdermal-mesh',
    name: 'Graphene Mesh Duster',
    type: 'armor',
    rarity: 'uncommon',
    description: 'Weatherproof trench coat woven with kinetic dispersion graphene fibers.',
    price: 340,
    sellPrice: 160,
    stackable: false,
    equipSlot: 'armor',
    stats: {
      armorBonus: 18,
      healthBonus: 30,
      speedBonus: 8,
    },
    iconName: 'ShieldCheck',
  },
  'aegis-titan-suit': {
    id: 'aegis-titan-suit',
    name: 'Aegis Exosuit Chassis',
    type: 'armor',
    rarity: 'epic',
    description: 'Heavy corporate combat harness equipped with servo stabilizers.',
    price: 1100,
    sellPrice: 520,
    stackable: false,
    equipSlot: 'armor',
    stats: {
      armorBonus: 40,
      healthBonus: 60,
      speedBonus: -6,
    },
    iconName: 'ShieldAlert',
  },

  // Cyberdecks / Tech
  'neural-deck-mk1': {
    id: 'neural-deck-mk1',
    name: 'Cortex Deck Mk.I',
    type: 'cyberdeck',
    rarity: 'uncommon',
    description: 'Entry-level neural coprocessor that enhances reflexes and stamina endurance.',
    price: 220,
    sellPrice: 105,
    stackable: false,
    equipSlot: 'cyberdeck',
    stats: {
      energyBonus: 25,
      speedBonus: 10,
    },
    iconName: 'Cpu',
  },
  'sandevistan-spine': {
    id: 'sandevistan-spine',
    name: 'Quantum Reflex Deck',
    type: 'cyberdeck',
    rarity: 'epic',
    description: 'Black-market neural accelerator wired directly along the spinal column.',
    price: 950,
    sellPrice: 460,
    stackable: false,
    equipSlot: 'cyberdeck',
    stats: {
      energyBonus: 50,
      speedBonus: 25,
      damageBonus: 15,
    },
    iconName: 'Zap',
  },

  // Materials & Valuables
  'encrypted-datacube': {
    id: 'encrypted-datacube',
    name: 'Corporate Datacube',
    type: 'valuable',
    rarity: 'uncommon',
    description: 'Stolen enterprise ledger. Data brokers will pay handsomely for this.',
    price: 120,
    sellPrice: 95,
    stackable: true,
    maxStack: 10,
    iconName: 'Database',
  },
  'optical-semiconductor': {
    id: 'optical-semiconductor',
    name: 'Photonic Processor Chip',
    type: 'material',
    rarity: 'rare',
    description: 'Military-grade computing wafer extracted from autonomous city drones.',
    price: 190,
    sellPrice: 140,
    stackable: true,
    maxStack: 20,
    iconName: 'HardDrive',
  },
  'syndicate-gold-chit': {
    id: 'syndicate-gold-chit',
    name: 'Syndicate High-Roller Token',
    type: 'valuable',
    rarity: 'epic',
    description: 'Solid platinum bearer token stamped by the Neon Syndicate ruling council.',
    price: 500,
    sellPrice: 420,
    stackable: true,
    maxStack: 5,
    iconName: 'Coins',
  },
};