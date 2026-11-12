import { ItemDefinition, InventorySlot, EquipmentSlot, WorldDroppedItem, ITEM_REGISTRY } from './itemTypes';
import { Player } from '../entities/Player';

type InventoryListener = () => void;

class InventoryManager {
  public maxCapacity = 24;
  public credits = 350; // Starting pocket money
  public items: (InventorySlot | null)[] = [];
  public equipment: Record<EquipmentSlot, ItemDefinition | null> = {
    weapon: ITEM_REGISTRY['combat-vibroblade'],
    armor: ITEM_REGISTRY['street-kevlar'],
    cyberdeck: null,
  };
  public droppedItems: WorldDroppedItem[] = [];

  private listeners: Set<InventoryListener> = new Set();

  constructor() {
    this.initInventory();
    this.initSampleWorldDrops();
  }

  private initInventory(): void {
    this.items = new Array(this.maxCapacity).fill(null);

    // Initial Starter Kit
    this.addItem('med-stim-v1', 3);
    this.addItem('battery-cell', 2);
    this.addItem('street-noodle', 1);
    this.addItem('encrypted-datacube', 1);
  }

  private initSampleWorldDrops(): void {
    // Hidden caches scattered in the world for exploration
    this.droppedItems = [
      {
        id: 'drop-1',
        item: ITEM_REGISTRY['med-stim-v1'],
        quantity: 2,
        x: 650,
        y: 450,
        radius: 45,
      },
      {
        id: 'drop-2',
        item: ITEM_REGISTRY['optical-semiconductor'],
        quantity: 1,
        x: 880,
        y: 360,
        radius: 45,
      },
      {
        id: 'drop-3',
        item: ITEM_REGISTRY['plasma-cutter'],
        quantity: 1,
        x: 1240,
        y: 620,
        radius: 45,
      },
      {
        id: 'drop-4',
        item: ITEM_REGISTRY['battery-cell'],
        quantity: 3,
        x: 420,
        y: 840,
        radius: 45,
      },
    ];
  }

  public subscribe(listener: InventoryListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  public getUsedSlotCount(): number {
    return this.items.filter((slot) => slot !== null).length;
  }

  public addItem(itemId: string, quantity = 1): boolean {
    const itemDef = ITEM_REGISTRY[itemId];
    if (!itemDef) return false;

    let remaining = quantity;

    // Check stackables
    if (itemDef.stackable) {
      for (let i = 0; i < this.items.length; i++) {
        const slot = this.items[i];
        if (slot && slot.item.id === itemId) {
          const maxStack = slot.item.maxStack || 99;
          const space = maxStack - slot.quantity;
          if (space > 0) {
            const added = Math.min(space, remaining);
            slot.quantity += added;
            remaining -= added;
            if (remaining <= 0) {
              this.notify();
              return true;
            }
          }
        }
      }
    }

    // Place remaining in empty slots
    while (remaining > 0) {
      const emptyIdx = this.items.findIndex((s) => s === null);
      if (emptyIdx === -1) {
        this.notify();
        return false; // Inventory full
      }
      const maxStack = itemDef.maxStack || (itemDef.stackable ? 99 : 1);
      const toPut = Math.min(maxStack, remaining);
      this.items[emptyIdx] = {
        slotId: emptyIdx,
        item: itemDef,
        quantity: toPut,
      };
      remaining -= toPut;
    }

    this.notify();
    return true;
  }

  public removeItem(slotIndex: number, quantity = 1): boolean {
    const slot = this.items[slotIndex];
    if (!slot) return false;

    if (slot.quantity <= quantity) {
      this.items[slotIndex] = null;
    } else {
      slot.quantity -= quantity;
    }

    this.notify();
    return true;
  }

  public useConsumable(slotIndex: number, player: Player): { success: boolean; message: string } {
    const slot = this.items[slotIndex];
    if (!slot || slot.item.type !== 'consumable') {
      return { success: false, message: 'Item is not a consumable.' };
    }

    const { useEffect } = slot.item;
    if (useEffect) {
      if (useEffect.healAmount) {
        player.heal(useEffect.healAmount);
      }
      if (useEffect.energyAmount) {
        player.restoreEnergy(useEffect.energyAmount);
      }
      const msg = useEffect.logMessage || `Used ${slot.item.name}`;
      this.removeItem(slotIndex, 1);
      return { success: true, message: msg };
    }

    return { success: false, message: 'Could not consume item.' };
  }

  public equipItem(slotIndex: number): { success: boolean; message: string } {
    const slot = this.items[slotIndex];
    if (!slot || !slot.item.equipSlot) {
      return { success: false, message: 'This item cannot be equipped.' };
    }

    const slotType = slot.item.equipSlot;
    const previouslyEquipped = this.equipment[slotType];
    const itemToEquip = slot.item;

    // Remove from inventory
    this.removeItem(slotIndex, 1);

    // Swap if already equipped
    this.equipment[slotType] = itemToEquip;
    if (previouslyEquipped) {
      this.addItem(previouslyEquipped.id, 1);
    }

    this.notify();
    return { success: true, message: `Equipped ${itemToEquip.name}.` };
  }

  public unequipItem(slotType: EquipmentSlot): { success: boolean; message: string } {
    const equipped = this.equipment[slotType];
    if (!equipped) {
      return { success: false, message: 'Nothing equipped in this slot.' };
    }

    if (this.getUsedSlotCount() >= this.maxCapacity) {
      return { success: false, message: 'Inventory is full. Drop something first.' };
    }

    this.equipment[slotType] = null;
    this.addItem(equipped.id, 1);

    this.notify();
    return { success: true, message: `Unequipped ${equipped.name}.` };
  }

  public dropItem(slotIndex: number, playerX: number, playerY: number): boolean {
    const slot = this.items[slotIndex];
    if (!slot) return false;

    const dropped: WorldDroppedItem = {
      id: `drop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      item: slot.item,
      quantity: slot.quantity,
      x: playerX + (Math.random() * 30 - 15),
      y: playerY + (Math.random() * 30 - 15),
      radius: 40,
    };

    this.droppedItems.push(dropped);
    this.items[slotIndex] = null;
    this.notify();
    return true;
  }

  public pickupWorldItem(dropId: string): { success: boolean; item?: ItemDefinition; message: string } {
    const idx = this.droppedItems.findIndex((d) => d.id === dropId);
    if (idx === -1) return { success: false, message: 'Loot no longer exists.' };

    const drop = this.droppedItems[idx];
    const added = this.addItem(drop.item.id, drop.quantity);

    if (added) {
      this.droppedItems.splice(idx, 1);
      this.notify();
      return {
        success: true,
        item: drop.item,
        message: `Acquired ${drop.item.name} x${drop.quantity}!`,
      };
    } else {
      return { success: false, message: 'Inventory is full!' };
    }
  }

  public addCredits(amount: number): void {
    this.credits = Math.max(0, this.credits + amount);
    this.notify();
  }

  public spendCredits(amount: number): boolean {
    if (this.credits < amount) return false;
    this.credits -= amount;
    this.notify();
    return true;
  }

  public getEquipmentBonus(): {
    damage: number;
    armor: number;
    health: number;
    energy: number;
    speed: number;
  } {
    const totals = { damage: 0, armor: 0, health: 0, energy: 0, speed: 0 };
    Object.values(this.equipment).forEach((item) => {
      if (item && item.stats) {
        totals.damage += item.stats.damageBonus || 0;
        totals.armor += item.stats.armorBonus || 0;
        totals.health += item.stats.healthBonus || 0;
        totals.energy += item.stats.energyBonus || 0;
        totals.speed += item.stats.speedBonus || 0;
      }
    });
    return totals;
  }
}

export const inventoryManager = new InventoryManager();