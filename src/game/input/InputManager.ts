export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  interact: boolean;
  attack: boolean;
}

export class InputManager {
  private state: InputState;
  private keyMap: Map<string, boolean>;
  private isListening: boolean;

  constructor() {
    this.state = {
      up: false,
      down: false,
      left: false,
      right: false,
      sprint: false,
      interact: false,
      attack: false,
    };
    this.keyMap = new Map();
    this.isListening = false;
    this.init();
  }

  public init(): void {
    if (this.isListening) return;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    this.isListening = true;
  }

  public destroy(): void {
    if (!this.isListening) return;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    this.keyMap.clear();
    this.resetState();
    this.isListening = false;
  }

  public getState(): InputState {
    return { ...this.state };
  }

  public isPressed(action: keyof InputState): boolean {
    return this.state[action];
  }

  public setVirtualInput(action: keyof InputState, active: boolean): void {
    this.state[action] = active;
  }

public resetState(): void {
    this.state.up = false;
    this.state.down = false;
    this.state.left = false;
    this.state.right = false;
    this.state.sprint = false;
    this.state.interact = false;
    this.state.attack = false;
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    // Prevent default scroll behavior for game navigation keys
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(
        e.code
      )
    ) {
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    }

    this.keyMap.set(e.code, true);
    this.updateState();
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keyMap.set(e.code, false);
    this.updateState();
  };

  private handleBlur = (): void => {
    this.keyMap.clear();
    this.resetState();
  };

private updateState(): void {
    this.state.up = !!(this.keyMap.get('KeyW') || this.keyMap.get('ArrowUp'));
    this.state.down = !!(this.keyMap.get('KeyS') || this.keyMap.get('ArrowDown'));
    this.state.left = !!(this.keyMap.get('KeyA') || this.keyMap.get('ArrowLeft'));
    this.state.right = !!(this.keyMap.get('KeyD') || this.keyMap.get('ArrowRight'));
    this.state.sprint = !!(this.keyMap.get('ShiftLeft') || this.keyMap.get('ShiftRight'));
    // Dedicated keys: E for Interaction, Space for Attack
    this.state.interact = !!this.keyMap.get('KeyE');
    this.state.attack = !!this.keyMap.get('Space');
  }
}