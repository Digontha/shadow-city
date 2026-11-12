import { TILE_SIZE } from '@/config/gameConfig';

export type PropType =
  | 'street_lamp'
  | 'traffic_light'
  | 'vending_machine'
  | 'synth_tree'
  | 'bench'
  | 'dumpster'
  | 'holo_ad'
  | 'hydrant';

export interface EnvironmentProp {
  id: string;
  type: PropType;
  x: number;
  y: number;
  width: number;
  height: number;
  solid: boolean;
  label?: string;
  accentColor?: string;
  state?: 'green' | 'yellow' | 'red';
  timer?: number;
}

export class PropsManager {
  public props: EnvironmentProp[] = [];

  constructor() {
    this.generateCityProps();
  }

  public update(deltaTime: number): void {
    // Cycle traffic lights
    for (const prop of this.props) {
      if (prop.type === 'traffic_light') {
        prop.timer = (prop.timer || 0) + deltaTime;
        if (prop.state === 'green' && prop.timer > 6) {
          prop.state = 'yellow';
          prop.timer = 0;
        } else if (prop.state === 'yellow' && prop.timer > 2) {
          prop.state = 'red';
          prop.timer = 0;
        } else if (prop.state === 'red' && prop.timer > 6) {
          prop.state = 'green';
          prop.timer = 0;
        }
      }
    }
  }

  private generateCityProps(): void {
    const list: EnvironmentProp[] = [];

    // 1. Street Lamps along major avenues
    const lampCols = [6, 12, 18, 26, 32, 40, 48];
    const lampRows = [8, 16, 24, 32];

    lampRows.forEach((r, rIdx) => {
      lampCols.forEach((c, cIdx) => {
        list.push({
          id: `lamp_${r}_${c}`,
          type: 'street_lamp',
          x: c * TILE_SIZE + 16,
          y: (r - 1) * TILE_SIZE + 20,
          width: 14,
          height: 24,
          solid: false,
          accentColor: (cIdx + rIdx) % 2 === 0 ? '#16ca8e' : '#00e5ff',
        });
      });
    });

    // 2. Traffic Lights at intersections
    const intersections = [
      { col: 14, row: 10 },
      { col: 28, row: 10 },
      { col: 42, row: 10 },
      { col: 14, row: 20 },
      { col: 28, row: 20 },
      { col: 42, row: 20 },
      { col: 14, row: 30 },
      { col: 28, row: 30 },
      { col: 42, row: 30 },
    ];

    intersections.forEach((pos, idx) => {
      list.push({
        id: `traffic_${idx}_w`,
        type: 'traffic_light',
        x: (pos.col - 1) * TILE_SIZE + 24,
        y: pos.row * TILE_SIZE + 6,
        width: 10,
        height: 28,
        solid: true,
        state: idx % 2 === 0 ? 'green' : 'red',
        timer: (idx * 1.5) % 5,
      });
    });

    // 3. Cyber Vending Machines
    const vendingLocations = [
      { col: 11, row: 17, label: 'NANO-STIM' },
      { col: 25, row: 17, label: 'SYNTH-COLA' },
      { col: 39, row: 17, label: 'DATAPAD-EX' },
      { col: 33, row: 27, label: 'NOODLE-BOX' },
      { col: 47, row: 27, label: 'MED-KIT' },
      { col: 17, row: 27, label: 'BLACK-ICE' },
    ];

    vendingLocations.forEach((loc, i) => {
      list.push({
        id: `vending_${i}`,
        type: 'vending_machine',
        x: loc.col * TILE_SIZE + 8,
        y: loc.row * TILE_SIZE + 4,
        width: 30,
        height: 38,
        solid: true,
        label: loc.label,
        accentColor: i % 2 === 0 ? '#ff007f' : '#00e5ff',
      });
    });

    // 4. Synth-Trees in Park & Plazas
    const treePositions = [
      { col: 5, row: 12 },
      { col: 7, row: 12 },
      { col: 5, row: 15 },
      { col: 7, row: 15 },
      { col: 9, row: 13 },
      { col: 9, row: 16 },
      { col: 20, row: 26 },
      { col: 22, row: 26 },
      { col: 24, row: 26 },
    ];

    treePositions.forEach((pos, i) => {
      list.push({
        id: `tree_${i}`,
        type: 'synth_tree',
        x: pos.col * TILE_SIZE + 6,
        y: pos.row * TILE_SIZE - 6,
        width: 36,
        height: 48,
        solid: true,
        accentColor: i % 2 === 0 ? '#16ca8e' : '#9e54f2',
      });
    });

    // 5. Park Benches
    const benchPositions = [
      { col: 6, row: 13 },
      { col: 8, row: 15 },
      { col: 21, row: 27 },
      { col: 23, row: 27 },
    ];

    benchPositions.forEach((pos, i) => {
      list.push({
        id: `bench_${i}`,
        type: 'bench',
        x: pos.col * TILE_SIZE + 8,
        y: pos.row * TILE_SIZE + 14,
        width: 32,
        height: 18,
        solid: true,
      });
    });

    // 6. Holographic Billboard Displays
    const holoLocations = [
      { col: 19, row: 8, label: 'KAIZEN NEURAL' },
      { col: 33, row: 8, label: 'AEON DYNAMICS' },
      { col: 35, row: 23, label: 'NEO-RAMEN // 24H' },
      { col: 45, row: 23, label: 'RIPPER-DOC X' },
    ];

    holoLocations.forEach((holo, i) => {
      list.push({
        id: `holo_${i}`,
        type: 'holo_ad',
        x: holo.col * TILE_SIZE + 4,
        y: holo.row * TILE_SIZE - 12,
        width: 40,
        height: 22,
        solid: false,
        label: holo.label,
        accentColor: i % 2 === 0 ? '#00e5ff' : '#ffaa00',
      });
    });

    // 7. Dumpsters in alleys & slums
    const dumpsters = [
      { col: 4, row: 34 },
      { col: 10, row: 36 },
      { col: 22, row: 34 },
      { col: 38, row: 36 },
    ];

    dumpsters.forEach((d, i) => {
      list.push({
        id: `dumpster_${i}`,
        type: 'dumpster',
        x: d.col * TILE_SIZE + 6,
        y: d.row * TILE_SIZE + 8,
        width: 34,
        height: 24,
        solid: true,
      });
    });

    // 8. Fire Hydrants
    const hydrants = [
      { col: 13, row: 19 },
      { col: 27, row: 19 },
      { col: 41, row: 19 },
      { col: 13, row: 29 },
    ];

    hydrants.forEach((h, i) => {
      list.push({
        id: `hydrant_${i}`,
        type: 'hydrant',
        x: h.col * TILE_SIZE + 28,
        y: h.row * TILE_SIZE + 24,
        width: 12,
        height: 16,
        solid: false,
      });
    });

    this.props = list;
  }
}

export const propsManager = new PropsManager();