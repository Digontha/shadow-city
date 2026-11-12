export type VehicleCategory = 'motorcycle' | 'sports_car' | 'armored_cruiser' | 'cyber_coupe';

export interface VehicleDefinition {
  id: string;
  name: string;
  category: VehicleCategory;
  model: string;
  maxSpeed: number;
  reverseSpeed: number;
  acceleration: number;
  braking: number;
  turnSpeed: number;
  friction: number;
  width: number;
  height: number;
  maxHealth: number;
  armor: number;
  primaryColor: string;
  accentColor: string;
  glowColor: string;
  headlightDistance: number;
  nitroBoost: number;
  description: string;
}

export const VEHICLE_MODELS: Record<string, VehicleDefinition> = {
  kusanagi_bike: {
    id: 'kusanagi_bike',
    name: 'Yaiba Kusanagi CT-3X',
    category: 'motorcycle',
    model: 'Hyper-Sprint Motorcycle',
    maxSpeed: 290,
    reverseSpeed: 80,
    acceleration: 220,
    braking: 300,
    turnSpeed: 3.4,
    friction: 0.94,
    width: 20,
    height: 38,
    maxHealth: 160,
    armor: 4,
    primaryColor: '#ff0055',
    accentColor: '#00e5ff',
    glowColor: '#ff0055',
    headlightDistance: 190,
    nitroBoost: 1.6,
    description: 'Ultra-agile cybernetic superbike tuned for weaving through congested neon streets.',
  },
  neon_phantom: {
    id: 'neon_phantom',
    name: 'Quadra Turbo-V Sport',
    category: 'sports_car',
    model: 'Twin-Turbocharged Coupe',
    maxSpeed: 320,
    reverseSpeed: 95,
    acceleration: 200,
    braking: 270,
    turnSpeed: 2.8,
    friction: 0.96,
    width: 32,
    height: 54,
    maxHealth: 260,
    armor: 8,
    primaryColor: '#16ca8e',
    accentColor: '#ffe600',
    glowColor: '#16ca8e',
    headlightDistance: 220,
    nitroBoost: 1.75,
    description: 'High-performance street racer fitted with synth-carbon chassis and dual exhaust afterburners.',
  },
  enforcer_suv: {
    id: 'enforcer_suv',
    name: 'Militech Behemoth APC',
    category: 'armored_cruiser',
    model: 'Tactical Enforcer Vehicle',
    maxSpeed: 210,
    reverseSpeed: 70,
    acceleration: 140,
    braking: 230,
    turnSpeed: 2.1,
    friction: 0.92,
    width: 38,
    height: 60,
    maxHealth: 500,
    armor: 22,
    primaryColor: '#2b3952',
    accentColor: '#ff3333',
    glowColor: '#ff5500',
    headlightDistance: 240,
    nitroBoost: 1.35,
    description: 'Heavily fortified combat unit designed to breach barricades and withstand direct plasma fire.',
  },
  ghost_coupe: {
    id: 'ghost_coupe',
    name: 'Rayfield Caliburn Aero',
    category: 'cyber_coupe',
    model: 'Executive Hyper-Cruiser',
    maxSpeed: 340,
    reverseSpeed: 100,
    acceleration: 240,
    braking: 320,
    turnSpeed: 3.0,
    friction: 0.97,
    width: 30,
    height: 52,
    maxHealth: 220,
    armor: 6,
    primaryColor: '#00e5ff',
    accentColor: '#9e54f2',
    glowColor: '#00e5ff',
    headlightDistance: 230,
    nitroBoost: 1.85,
    description: 'The pinnacle of luxury cyber-aerodynamics with active magnetic ground suspension.',
  },
};