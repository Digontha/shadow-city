import { NPCCharacter } from './missionTypes';
import { GAME_CONFIG } from '@/config/gameConfig';

const TILE = GAME_CONFIG.tileSize;

export const NPC_LIST: NPCCharacter[] = [
  {
    id: 'npc_vex',
    name: 'Vex Mercer',
    role: 'Syndicate Fixer',
    faction: 'Shadow Network',
    district: 'Neon Promenade',
    x: (GAME_CONFIG.spawnCol + 4) * TILE,
    y: (GAME_CONFIG.spawnRow - 2) * TILE,
    color: '#06b6d4', // Cyan
    badge: 'FIXER',
    bio: 'Broker of encrypted intelligence across the four districts. Speaks in neural cipher and expects quick turnaround.',
    initialNodeId: 'greeting',
    offeredMissionIds: ['m_awake', 'm_hack_nodes'],
    dialogueTree: {
      greeting: {
        id: 'greeting',
        text: 'Cipher. Your neural readings are finally stable after the desync. The Promenade is buzzing with corporate patrols. Are you operational?',
        choices: [
          {
            text: 'Operational. What is our first objective?',
            action: 'next_node',
            nextNodeId: 'mission_hub',
          },
          {
            text: 'Who scrambled my cortical stack?',
            action: 'next_node',
            nextNodeId: 'lore_backstory',
          },
          {
            text: 'I need to check my gear first.',
            action: 'close',
          },
        ],
      },
      lore_backstory: {
        id: 'lore_backstory',
        text: 'A strike team from Hyperion Security hit our safehouse. You took a heavy concussive blow protecting the encryption key. We need to re-establish our grid presence.',
        choices: [
          {
            text: 'Understood. Give me my assignment.',
            action: 'next_node',
            nextNodeId: 'mission_hub',
          },
          {
            text: 'I will be ready soon.',
            action: 'close',
          },
        ],
      },
      mission_hub: {
        id: 'mission_hub',
        text: 'I have secured the perimeter nodes. Begin by reconnecting to the Nexus Terminal, then we clean out the patrol drones.',
        choices: [
          {
            text: 'Accept: Neural Awakening [Story]',
            action: 'accept_mission',
            missionId: 'm_awake',
          },
          {
            text: 'Accept: Encrypted Frequency [Story]',
            action: 'accept_mission',
            missionId: 'm_hack_nodes',
          },
          {
            text: 'Stand down for now.',
            action: 'close',
          },
        ],
      },
    },
  },
  {
    id: 'npc_dr_aris',
    name: 'Dr. Kenneth Aris',
    role: 'Synthetix Bio-Engineer',
    faction: 'Independent Gene-Lab',
    district: 'Neon Promenade',
    x: (GAME_CONFIG.spawnCol - 3) * TILE,
    y: (GAME_CONFIG.spawnRow + 2) * TILE,
    color: '#10b981', // Emerald
    badge: 'BIO-MED',
    bio: 'Pioneered experimental nanite stimulants before deserting corporate pharmacology.',
    initialNodeId: 'intro',
    offeredMissionIds: ['m_med_nanites'],
    dialogueTree: {
      intro: {
        id: 'intro',
        text: 'Keep your voice down. The stim injector is humming, but my supplies of synthetic adrenaline are running dangerously low.',
        choices: [
          {
            text: 'Can you patch my cortical implants?',
            action: 'next_node',
            nextNodeId: 'treatment',
          },
          {
            text: 'How can I assist your clinic?',
            action: 'accept_mission',
            missionId: 'm_med_nanites',
          },
          {
            text: 'Just passing through, Doctor.',
            action: 'close',
          },
        ],
      },
      treatment: {
        id: 'treatment',
        text: 'Bio-stimulators are always open to operators of the resistance. Keep your vitals above critical, and return when injured.',
        choices: [
          {
            text: 'I will collect what you need.',
            action: 'accept_mission',
            missionId: 'm_med_nanites',
          },
          {
            text: 'Understood.',
            action: 'close',
          },
        ],
      },
    },
  },
  {
    id: 'npc_vance',
    name: 'Cmdr. Sarah Vance',
    role: 'Ex-Enforcement Tactician',
    faction: 'Vanguard Irregulars',
    district: 'Industrial Sector',
    x: (GAME_CONFIG.spawnCol + 14) * TILE,
    y: (GAME_CONFIG.spawnRow + 8) * TILE,
    color: '#f97316', // Orange
    badge: 'TACTICAL',
    bio: 'Disciplined former sector commander waging an asymmetric war against the automated defense drones.',
    initialNodeId: 'base',
    offeredMissionIds: ['m_enforcer_sweep', 'm_heavy_brawlers'],
    dialogueTree: {
      base: {
        id: 'base',
        text: 'At ease, runner. The heavy factories are infested with automated enforcers and rogue syndicate grunts. We need kinetic force.',
        choices: [
          {
            text: 'Assign me combat bounties.',
            action: 'next_node',
            nextNodeId: 'bounties',
          },
          {
            text: 'What kind of forces are we facing?',
            action: 'next_node',
            nextNodeId: 'intel',
          },
          {
            text: 'Regrouping.',
            action: 'close',
          },
        ],
      },
      intel: {
        id: 'intel',
        text: 'Scouts, swift slashers, and armored brawlers with titanium plating. Keep your dodge and sprint ready, or you will be overwhelmed.',
        choices: [
          {
            text: 'I am ready to fight.',
            action: 'next_node',
            nextNodeId: 'bounties',
          },
          {
            text: 'Backing out.',
            action: 'close',
          },
        ],
      },
      bounties: {
        id: 'bounties',
        text: 'Pick your sector engagement:',
        choices: [
          {
            text: 'Take: Neon Enforcer Sweep [Side]',
            action: 'accept_mission',
            missionId: 'm_enforcer_sweep',
          },
          {
            text: 'Take: Heavy Brawler Takedown [Bounty]',
            action: 'accept_mission',
            missionId: 'm_heavy_brawlers',
          },
          {
            text: 'Return to tactical standby.',
            action: 'close',
          },
        ],
      },
    },
  },
  {
    id: 'npc_silas',
    name: 'Silas Drake',
    role: 'Black Market Armorer',
    faction: 'Underground Haven',
    district: 'Underground Haven',
    x: (GAME_CONFIG.spawnCol - 12) * TILE,
    y: (GAME_CONFIG.spawnRow + 6) * TILE,
    color: '#a855f7', // Purple
    badge: 'ARMORER',
    bio: 'Modifies high-density kinetic blades and thermal weapons salvaged from corporate convoys.',
    initialNodeId: 'shop_talk',
    offeredMissionIds: ['m_weapon_salvage', 'm_black_market'],
    dialogueTree: {
      shop_talk: {
        id: 'shop_talk',
        text: 'Looking for enhanced cutting edges or plasma modules? High-grade ordinance requires credits and raw energy batteries.',
        choices: [
          {
            text: 'Accept: Kinetic Cell Salvage [Side]',
            action: 'accept_mission',
            missionId: 'm_weapon_salvage',
          },
          {
            text: 'Accept: Black Market Armory [Story]',
            action: 'accept_mission',
            missionId: 'm_black_market',
          },
          {
            text: 'I will return when I have the supplies.',
            action: 'close',
          },
        ],
      },
    },
  },
  {
    id: 'npc_nova',
    name: 'Nova Thorne',
    role: 'Ghost Courier',
    faction: 'Free Runners',
    district: 'Shadow District',
    x: (GAME_CONFIG.spawnCol - 10) * TILE,
    y: (GAME_CONFIG.spawnRow - 10) * TILE,
    color: '#ec4899', // Pink
    badge: 'COURIER',
    bio: 'Traverses the highest district perimeters on kinetic slipstream lines, delivering raw data.',
    initialNodeId: 'courier_meet',
    offeredMissionIds: ['m_courier_run'],
    dialogueTree: {
      courier_meet: {
        id: 'courier_meet',
        text: 'You move fast on the ground, Cipher. But the rooftops and alleyways are crawling with surveillance cameras. Want to test your speed?',
        choices: [
          {
            text: 'Accept: Ghost Courier Protocol [Side]',
            action: 'accept_mission',
            missionId: 'm_courier_run',
          },
          {
            text: 'Not right now, Nova.',
            action: 'close',
          },
        ],
      },
    },
  },
  {
    id: 'npc_echo',
    name: 'Echo-07',
    role: 'Rogue Neural Subroutine',
    faction: 'Decentralized Grid',
    district: 'Corporate Plaza',
    x: (GAME_CONFIG.spawnCol + 16) * TILE,
    y: (GAME_CONFIG.spawnRow - 8) * TILE,
    color: '#38bdf8', // Sky Blue
    badge: 'AI ENTITY',
    bio: 'An autonomous neural network that broke free from the Megacorp core server.',
    initialNodeId: 'ai_interface',
    offeredMissionIds: ['m_neural_core'],
    dialogueTree: {
      ai_interface: {
        id: 'ai_interface',
        text: 'ENTITY DETECTED: CIPHER. My consciousness is splintered across three mainframe terminals in Corporate Plaza. Assist in consolidation.',
        choices: [
          {
            text: 'Accept: Neural Core Convergence [Story]',
            action: 'accept_mission',
            missionId: 'm_neural_core',
          },
          {
            text: 'Disconnect interface.',
            action: 'close',
          },
        ],
      },
    },
  },
  {
    id: 'npc_cinder',
    name: 'Tarek "Cinder"',
    role: 'Saboteur',
    faction: 'Rebel Cell',
    district: 'Industrial Sector',
    x: (GAME_CONFIG.spawnCol + 8) * TILE,
    y: (GAME_CONFIG.spawnRow + 12) * TILE,
    color: '#eab308', // Amber
    badge: 'SABOTEUR',
    bio: 'Demolitions specialist focused on disabling surveillance relays.',
    initialNodeId: 'cinder_start',
    offeredMissionIds: ['m_industrial_recon'],
    dialogueTree: {
      cinder_start: {
        id: 'cinder_start',
        text: 'The power relay station in the southern grid is feeding defensive radar. Scout the sector for me.',
        choices: [
          {
            text: 'Accept: Industrial Reconnaissance [Story]',
            action: 'accept_mission',
            missionId: 'm_industrial_recon',
          },
          {
            text: 'Hold position.',
            action: 'close',
          },
        ],
      },
    },
  },
  {
    id: 'npc_maya',
    name: 'Maya Lin',
    role: 'Underground Archivist',
    faction: 'Historians of Old Terra',
    district: 'Shadow District',
    x: (GAME_CONFIG.spawnCol + 2) * TILE,
    y: (GAME_CONFIG.spawnRow - 12) * TILE,
    color: '#6366f1', // Indigo
    badge: 'ARCHIVIST',
    bio: 'Preserves the memories of pre-collapse humanity buried under corporate databanks.',
    initialNodeId: 'maya_start',
    offeredMissionIds: ['m_archive_memory'],
    dialogueTree: {
      maya_start: {
        id: 'maya_start',
        text: 'Welcome, traveler of the shadows. History is being erased by Megacorp algorithms. Help me salvage the lost audio-logs.',
        choices: [
          {
            text: 'Accept: Echoes of the Past [Side]',
            action: 'accept_mission',
            missionId: 'm_archive_memory',
          },
          {
            text: 'Perhaps another time.',
            action: 'close',
          },
        ],
      },
    },
  },
];