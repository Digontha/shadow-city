import { useState } from 'react';
import { ItemDefinition, ItemType, EquipmentSlot } from '@/game/inventory/itemTypes';
import { inventoryManager } from '@/game/inventory/inventoryManager';
import { Player } from '@/game/entities/Player';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, Swords, Shield, Cpu, Coins, X, Trash2, Sparkles, Zap, HeartPulse, Activity, Flame, Coffee, Database, HardDrive, Crown, ShieldAlert, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryModalProps {
  player: Player | null;
  onClose: () => void;
}

const RARITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  common: { bg: 'bg-muted/80', text: 'text-foreground', border: 'border-border' },
  uncommon: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-500/50' },
  rare: { bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-500/50' },
  epic: { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-500/50' },
  legendary: { bg: 'bg-amber-950/50', text: 'text-amber-400', border: 'border-amber-500/70 shadow-glow' },
};

function renderItemIcon(iconName: string, className = 'h-5 w-5') {
  switch (iconName) {
    case 'HeartPulse': return <HeartPulse className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Coffee': return <Coffee className={className} />;
    case 'Swords': return <Swords className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'Database': return <Database className={className} />;
    case 'HardDrive': return <HardDrive className={className} />;
    case 'Crown': return <Crown className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    default: return <Package className={className} />;
  }
}

export default function InventoryModal({ player, onClose }: InventoryModalProps) {
  const [filter, setFilter] = useState<'all' | ItemType>('all');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  const slots = inventoryManager.items;
  const equipment = inventoryManager.equipment;
  const credits = inventoryManager.credits;
  const usedSlots = inventoryManager.getUsedSlotCount();
  const maxSlots = inventoryManager.maxCapacity;

  const selectedSlot = selectedSlotIndex !== null ? slots[selectedSlotIndex] : null;
  const selectedItem = selectedSlot ? selectedSlot.item : null;

  const handleUse = (idx: number) => {
    if (!player) return;
    const res = inventoryManager.useConsumable(idx, player);
    if (res.success) {
      toast.success(res.message);
      refresh();
    } else {
      toast.error(res.message);
    }
  };

  const handleEquip = (idx: number) => {
    const res = inventoryManager.equipItem(idx);
    if (res.success) {
      toast.success(res.message);
      refresh();
    } else {
      toast.error(res.message);
    }
  };

  const handleUnequip = (slotType: EquipmentSlot) => {
    const res = inventoryManager.unequipItem(slotType);
    if (res.success) {
      toast.info(res.message);
      refresh();
    } else {
      toast.error(res.message);
    }
  };

  const handleDrop = (idx: number) => {
    if (!player) return;
    const itemName = slots[idx]?.item.name;
    const success = inventoryManager.dropItem(idx, player.x, player.y);
    if (success) {
      toast.info(`Dropped ${itemName} on city grounds.`);
      setSelectedSlotIndex(null);
      refresh();
    }
  };

  const equipmentBonuses = inventoryManager.getEquipmentBonus();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="flex h-full max-h-[640px] w-full max-w-4xl flex-col rounded-xl border border-border/80 bg-card/95 shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/70 bg-background/80 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 border border-primary/40 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                CIPHER TACTICAL INVENTORY
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                LOADOUT & GEAR MANAGEMENT
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Wallet Pill */}
            <div className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/30 px-3.5 py-1 text-xs font-mono font-semibold text-amber-400">
              <Coins className="h-4 w-4" />
              <span>{credits} Ͼ CREDITS</span>
            </div>

            {/* Capacity gauge */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <span>STORAGE:</span>
              <span className={`font-bold ${usedSlots >= maxSlots ? 'text-destructive' : 'text-primary'}`}>
                {usedSlots} / {maxSlots}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content Body: Left Column Equipment & Stats, Center Inventory Grid, Right Details */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-12 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border/60">
          {/* Equipment & Loadout Column */}
          <div className="md:col-span-3 flex flex-col justify-between p-4 bg-background/40">
            <div>
              <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-muted-foreground">
                CURRENT LOADOUT
              </span>

              <div className="mt-3 space-y-2.5">
                {/* Weapon Slot */}
                <div className="rounded-lg border border-border/80 bg-background/70 p-2.5">
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1.5">
                    <span className="flex items-center gap-1">
                      <Swords className="h-3.5 w-3.5 text-primary" /> WEAPON
                    </span>
                    {equipment.weapon && (
                      <button
                        onClick={() => handleUnequip('weapon')}
                        className="text-[10px] text-destructive hover:underline"
                      >
                        Unequip
                      </button>
                    )}
                  </div>
                  {equipment.weapon ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                        {renderItemIcon(equipment.weapon.iconName, 'h-4 w-4')}
                      </div>
                      <div className="truncate">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {equipment.weapon.name}
                        </p>
                        <p className="text-[10px] font-mono text-emerald-400">
                          +{equipment.weapon.stats?.damageBonus} ATK
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-9 items-center justify-center rounded border border-dashed border-border/70 text-[11px] font-mono text-muted-foreground">
                      Bare Fists (Basic)
                    </div>
                  )}
                </div>

                {/* Armor Slot */}
                <div className="rounded-lg border border-border/80 bg-background/70 p-2.5">
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1.5">
                    <span className="flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-primary" /> CHASSIS ARMOR
                    </span>
                    {equipment.armor && (
                      <button
                        onClick={() => handleUnequip('armor')}
                        className="text-[10px] text-destructive hover:underline"
                      >
                        Unequip
                      </button>
                    )}
                  </div>
                  {equipment.armor ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                        {renderItemIcon(equipment.armor.iconName, 'h-4 w-4')}
                      </div>
                      <div className="truncate">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {equipment.armor.name}
                        </p>
                        <p className="text-[10px] font-mono text-cyan-400">
                          +{equipment.armor.stats?.armorBonus} DEF | +{equipment.armor.stats?.healthBonus} HP
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-9 items-center justify-center rounded border border-dashed border-border/70 text-[11px] font-mono text-muted-foreground">
                      Standard Mesh (0 DEF)
                    </div>
                  )}
                </div>

                {/* Cyberdeck Slot */}
                <div className="rounded-lg border border-border/80 bg-background/70 p-2.5">
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1.5">
                    <span className="flex items-center gap-1">
                      <Cpu className="h-3.5 w-3.5 text-primary" /> CYBERDECK
                    </span>
                    {equipment.cyberdeck && (
                      <button
                        onClick={() => handleUnequip('cyberdeck')}
                        className="text-[10px] text-destructive hover:underline"
                      >
                        Unequip
                      </button>
                    )}
                  </div>
                  {equipment.cyberdeck ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                        {renderItemIcon(equipment.cyberdeck.iconName, 'h-4 w-4')}
                      </div>
                      <div className="truncate">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {equipment.cyberdeck.name}
                        </p>
                        <p className="text-[10px] font-mono text-purple-400">
                          +{equipment.cyberdeck.stats?.energyBonus} NRG | +{equipment.cyberdeck.stats?.speedBonus} SPD
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-9 items-center justify-center rounded border border-dashed border-border/70 text-[11px] font-mono text-muted-foreground">
                      None Installed
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Total Loadout Modifiers */}
            <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5 font-mono text-[11px] space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">COMBAT MODIFIERS</span>
              <div className="flex justify-between text-foreground">
                <span>Bonus DMG:</span>
                <span className="text-emerald-400">+{equipmentBonuses.damage}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Bonus Armor:</span>
                <span className="text-cyan-400">+{equipmentBonuses.armor}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Bonus Vitals:</span>
                <span className="text-primary">+{equipmentBonuses.health} HP</span>
              </div>
            </div>
          </div>

          {/* Center Inventory Grid Column */}
          <div className="md:col-span-6 flex flex-col p-4">
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pb-3">
              {(['all', 'weapon', 'armor', 'cyberdeck', 'consumable', 'valuable'] as const).map(
                (cat) => (
                  <Button
                    key={cat}
                    variant={filter === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(cat)}
                    className="h-7 text-xs font-mono uppercase px-2.5"
                  >
                    {cat}
                  </Button>
                )
              )}
            </div>

            {/* Slots Grid */}
            <ScrollArea className="flex-1 pr-2">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pb-2">
                {slots.map((slot, idx) => {
                  if (!slot) {
                    return (
                      <div
                        key={idx}
                        className="flex aspect-square flex-col items-center justify-center rounded-lg border border-border/40 bg-background/30 text-muted-foreground/30 font-mono text-[11px]"
                      >
                        {idx + 1}
                      </div>
                    );
                  }

                  const matchesFilter = filter === 'all' || slot.item.type === filter;
                  const isSelected = selectedSlotIndex === idx;
                  const rarityStyle = RARITY_COLORS[slot.item.rarity] || RARITY_COLORS.common;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlotIndex(idx)}
                      className={`group relative flex aspect-square flex-col items-center justify-center rounded-lg border p-1 text-left transition-all ${
                        rarityStyle.border
                      } ${rarityStyle.bg} ${
                        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                      } ${!matchesFilter ? 'opacity-30' : 'hover:scale-[1.03]'}`}
                    >
                      <div className={`${rarityStyle.text}`}>
                        {renderItemIcon(slot.item.iconName, 'h-6 w-6')}
                      </div>

                      {slot.quantity > 1 && (
                        <span className="absolute bottom-1 right-1.5 rounded bg-background/90 px-1 font-mono text-[10px] font-bold text-foreground">
                          x{slot.quantity}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right Column: Item Inspection & Actions */}
          <div className="md:col-span-3 flex flex-col justify-between p-4 bg-background/50">
            {selectedSlot && selectedItem ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge
                      variant="outline"
                      className={`font-mono text-[10px] uppercase font-bold ${
                        RARITY_COLORS[selectedItem.rarity]?.text
                      }`}
                    >
                      {selectedItem.rarity}
                    </Badge>
                    <span className="text-[11px] font-mono text-muted-foreground uppercase">
                      {selectedItem.type}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-foreground">
                    {selectedItem.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Stats / Effects Block */}
                {selectedItem.stats && (
                  <div className="rounded-lg border border-border/80 bg-background/80 p-2.5 font-mono text-xs space-y-1">
                    <span className="text-[10px] text-muted-foreground">PROPERTIES:</span>
                    {selectedItem.stats.damageBonus && (
                      <p className="text-emerald-400">+{selectedItem.stats.damageBonus} ATK Power</p>
                    )}
                    {selectedItem.stats.armorBonus && (
                      <p className="text-cyan-400">+{selectedItem.stats.armorBonus} Armor DEF</p>
                    )}
                    {selectedItem.stats.healthBonus && (
                      <p className="text-primary">+{selectedItem.stats.healthBonus} Max Health</p>
                    )}
                    {selectedItem.stats.energyBonus && (
                      <p className="text-accent">+{selectedItem.stats.energyBonus} Sprint Cell</p>
                    )}
                    {selectedItem.stats.speedBonus && (
                      <p className="text-amber-400">+{selectedItem.stats.speedBonus} Mobility</p>
                    )}
                  </div>
                )}

                {/* Price metadata */}
                <div className="flex items-center justify-between text-xs font-mono border-t border-border/60 pt-2 text-muted-foreground">
                  <span>Merchant Resell:</span>
                  <span className="text-amber-400 font-bold">+{selectedItem.sellPrice} Ͼ</span>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  {selectedItem.type === 'consumable' && (
                    <Button
                      onClick={() => handleUse(selectedSlotIndex!)}
                      className="w-full gap-2 font-display text-xs"
                    >
                      <CheckCircle2 className="h-4 w-4" /> CONSUME
                    </Button>
                  )}

                  {selectedItem.equipSlot && (
                    <Button
                      onClick={() => handleEquip(selectedSlotIndex!)}
                      className="w-full gap-2 font-display text-xs"
                    >
                      <Shield className="h-4 w-4" /> EQUIP TO {selectedItem.equipSlot?.toUpperCase()}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => handleDrop(selectedSlotIndex!)}
                    className="w-full gap-2 font-display text-xs text-destructive hover:bg-destructive/15 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" /> DROP ITEM ON GROUND
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-4">
                <Package className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs font-mono">Select an inventory item to inspect properties or execute actions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}