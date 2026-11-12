import { ItemDefinition, ITEM_REGISTRY } from '../inventory/itemTypes';
import { inventoryManager } from '../inventory/inventoryManager';

export interface ShopMerchant {
  id: string;
  name: string;
  tagline: string;
  district: string;
  greeting: string;
  farewell: string;
  itemsForSale: string[]; // item IDs
  x: number;
  y: number;
  radius: number;
}

export const CITY_SHOPS: Record<string, ShopMerchant> = {
  'shop-cyber': {
    id: 'shop-cyber',
    name: "Kuro's Neural Nexus",
    tagline: 'High-frequency cyberdecks, capacitors, and neural hardware.',
    district: 'Neon Promenade',
    greeting: 'Watch the ICE, runner. Cash upfront, no corporate refunds.',
    farewell: 'Keep your optics clear in the lower alleys.',
    itemsForSale: ['battery-cell', 'neural-deck-mk1', 'sandevistan-spine', 'optical-semiconductor'],
    x: 680,
    y: 520,
    radius: 65,
  },
  'shop-med': {
    id: 'shop-med',
    name: 'Dr. Vance Bio-Synthetics',
    tagline: 'Underground trauma recovery and nano-pharmaceuticals.',
    district: 'Industrial Slums',
    greeting: 'Bleeding out? Step up to the scanner. Fresh nanites in stock.',
    farewell: 'Avoid blunt trauma on your way out.',
    itemsForSale: ['med-stim-v1', 'trauma-ampoule', 'neuro-injector', 'street-noodle'],
    x: 380,
    y: 440,
    radius: 65,
  },
  'shop-arms': {
    id: 'shop-arms',
    name: 'Ronin Black Market Arsenal',
    tagline: 'Forged carbonite blades, monowires, and ballistic chassis.',
    district: 'The Undercity',
    greeting: 'Honor is dead in Shadow City. Only cutting edge steel survives.',
    farewell: 'Make every strike count.',
    itemsForSale: ['combat-vibroblade', 'plasma-cutter', 'neon-nodachi', 'monomolecular-wire', 'aegis-titan-suit'],
    x: 940,
    y: 720,
    radius: 65,
  },
  'shop-general': {
    id: 'shop-general',
    name: 'Nova Street Food & Salvage',
    tagline: 'Hot synth-pork ramen, basic armor vests, and rare corporate chips.',
    district: 'Commercial Plaza',
    greeting: 'Welcome, wanderer! Fresh steam from the pots and gear from the docks!',
    farewell: 'Tell your syndicate friends about Nova!',
    itemsForSale: ['street-noodle', 'street-kevlar', 'subdermal-mesh', 'med-stim-v1', 'battery-cell'],
    x: 740,
    y: 840,
    radius: 65,
  },
};

export class EconomyService {
  public buyItem(itemId: string, quantity = 1): { success: boolean; message: string } {
    const item = ITEM_REGISTRY[itemId];
    if (!item) return { success: false, message: 'Item not found in catalog.' };

    const totalCost = item.price * quantity;
    if (inventoryManager.credits < totalCost) {
      return { success: false, message: `Insufficient credits! Requires ${totalCost} Ͼ.` };
    }

    if (inventoryManager.getUsedSlotCount() >= inventoryManager.maxCapacity && !item.stackable) {
      return { success: false, message: 'Inventory is completely full!' };
    }

    const added = inventoryManager.addItem(itemId, quantity);
    if (!added) {
      return { success: false, message: 'Could not fit item into inventory.' };
    }

    inventoryManager.spendCredits(totalCost);
    return {
      success: true,
      message: `Purchased ${item.name} (x${quantity}) for ${totalCost} Ͼ.`,
    };
  }

  public sellItem(slotIndex: number, quantity = 1): { success: boolean; message: string } {
    const slot = inventoryManager.items[slotIndex];
    if (!slot) return { success: false, message: 'No item in selected slot.' };

    const actualQty = Math.min(slot.quantity, quantity);
    const totalEarnings = slot.item.sellPrice * actualQty;

    inventoryManager.removeItem(slotIndex, actualQty);
    inventoryManager.addCredits(totalEarnings);

    return {
      success: true,
      message: `Sold ${slot.item.name} (x${actualQty}) for +${totalEarnings} Ͼ.`,
    };
  }
}

export const economyService = new EconomyService();