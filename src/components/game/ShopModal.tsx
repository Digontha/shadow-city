import { useState } from 'react';
import { ShopMerchant, economyService } from '@/game/economy/shopManager';
import { ITEM_REGISTRY, ItemDefinition } from '@/game/inventory/itemTypes';
import { inventoryManager } from '@/game/inventory/inventoryManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Store, Coins, X, ShoppingBag, ArrowRightLeft, Check, Shield, Zap, Flame, Swords, HeartPulse, Cpu, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ShopModalProps {
  shop?: ShopMerchant | null;
  onClose: () => void;
}

export default function ShopModal({ shop, onClose }: ShopModalProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(shop?.itemsForSale?.[0] || null);
  const [selectedInventorySlot, setSelectedInventorySlot] = useState<number | null>(null);
  const [, setRefreshKey] = useState(0);

  if (!shop) return null;

  const refresh = () => setRefreshKey((k) => k + 1);

  const credits = inventoryManager.credits;
  const inventorySlots = inventoryManager.items;

  // Buy handler
  const handleBuy = (itemId: string) => {
    const res = economyService.buyItem(itemId, 1);
    if (res.success) {
      toast.success(res.message);
      refresh();
    } else {
      toast.error(res.message);
    }
  };

  // Sell handler
  const handleSell = (slotIdx: number) => {
    const res = economyService.sellItem(slotIdx, 1);
    if (res.success) {
      toast.success(res.message);
      refresh();
      if (!inventoryManager.items[slotIdx]) {
        setSelectedInventorySlot(null);
      }
    } else {
      toast.error(res.message);
    }
  };

  const selectedBuyItem = selectedItemId ? ITEM_REGISTRY[selectedItemId] : null;
  const selectedSellSlot = selectedInventorySlot !== null ? inventorySlots[selectedInventorySlot] : null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="flex h-full max-h-[600px] w-full max-w-4xl flex-col rounded-xl border border-primary/50 bg-card/95 shadow-2xl overflow-hidden">
        {/* Merchant Header */}
        <div className="flex items-center justify-between border-b border-border/80 bg-background/85 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary text-primary">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                  {shop.name}
                </h2>
                <Badge variant="outline" className="font-mono text-[10px] text-primary">
                  {shop.district}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground italic font-mono">
                "{shop.greeting}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Player Wallet */}
            <div className="flex items-center gap-2 rounded-full border border-amber-500/50 bg-amber-950/40 px-3.5 py-1.5 text-xs font-mono font-bold text-amber-400">
              <Coins className="h-4 w-4" />
              <span>{credits} Ͼ</span>
            </div>

            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Trade Mode Selector */}
        <div className="flex border-b border-border/60 bg-muted/20 px-6 pt-2">
          <Button
            variant={activeTab === 'buy' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('buy')}
            className="rounded-b-none gap-2 font-display text-xs px-6"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> BUY CATALOG
          </Button>
          <Button
            variant={activeTab === 'sell' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('sell')}
            className="rounded-b-none gap-2 font-display text-xs px-6"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" /> SELL INVENTORY
          </Button>
        </div>

        {/* Trade Body */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-12 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border/60">
          {/* List Column */}
          <div className="md:col-span-7 p-4">
            <ScrollArea className="h-full pr-3">
{activeTab === 'buy' ? (
                <div className="space-y-2">
                  {(shop.itemsForSale || []).map((itemId) => {
                    const item = ITEM_REGISTRY[itemId];
                    if (!item) return null;
                    const isSelected = selectedItemId === itemId;
                    const canAfford = credits >= item.price;

                    return (
                      <div
                        key={itemId}
                        onClick={() => setSelectedItemId(itemId)}
                        className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-soft'
                            : 'border-border/60 bg-background/50 hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded bg-muted/60 text-primary">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {item.name}
                            </p>
                            <span className="text-[11px] font-mono text-muted-foreground uppercase">
                              {item.type} | {item.rarity}
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span
                            className={`text-sm font-bold ${
                              canAfford ? 'text-amber-400' : 'text-destructive'
                            }`}
                          >
                            {item.price} Ͼ
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {inventorySlots.filter((s) => s !== null).length === 0 ? (
                    <div className="flex h-48 items-center justify-center text-xs font-mono text-muted-foreground">
                      No items available to sell in inventory.
                    </div>
                  ) : (
                    inventorySlots.map((slot, idx) => {
                      if (!slot) return null;
                      const isSelected = selectedInventorySlot === idx;

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedInventorySlot(idx)}
                          className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10 shadow-soft'
                              : 'border-border/60 bg-background/50 hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded bg-muted/60 text-primary">
                              <ShoppingBag className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {slot.item.name}
                              </p>
                              <span className="text-[11px] font-mono text-muted-foreground">
                                Qty: {slot.quantity} | {slot.item.rarity}
                              </span>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <span className="text-sm font-bold text-amber-400">
                              +{slot.item.sellPrice} Ͼ
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Details & Transaction Column */}
          <div className="md:col-span-5 flex flex-col justify-between p-5 bg-background/40">
            {activeTab === 'buy' && selectedBuyItem && (
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="font-mono text-xs uppercase mb-1 text-primary">
                    {selectedBuyItem.rarity} {selectedBuyItem.type}
                  </Badge>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {selectedBuyItem.name}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {selectedBuyItem.description}
                  </p>
                </div>

                {selectedBuyItem.stats && (
                  <div className="rounded-lg border border-border/80 bg-background/70 p-3 font-mono text-xs space-y-1">
                    <span className="text-[10px] text-muted-foreground">STAT MODIFIERS:</span>
                    {selectedBuyItem.stats.damageBonus && (
                      <p className="text-emerald-400">+{selectedBuyItem.stats.damageBonus} Attack Power</p>
                    )}
                    {selectedBuyItem.stats.armorBonus && (
                      <p className="text-cyan-400">+{selectedBuyItem.stats.armorBonus} Armor Rating</p>
                    )}
                    {selectedBuyItem.stats.healthBonus && (
                      <p className="text-primary">+{selectedBuyItem.stats.healthBonus} Max Health</p>
                    )}
                    {selectedBuyItem.stats.energyBonus && (
                      <p className="text-accent">+{selectedBuyItem.stats.energyBonus} Sprint Energy</p>
                    )}
                  </div>
                )}

                <div className="border-t border-border/60 pt-3">
                  <div className="flex justify-between items-center text-xs font-mono mb-3">
                    <span className="text-muted-foreground">TOTAL TRANSACTION:</span>
                    <span className="text-base font-bold text-amber-400">
                      {selectedBuyItem.price} Ͼ
                    </span>
                  </div>

                  <Button
                    onClick={() => handleBuy(selectedBuyItem.id)}
                    disabled={credits < selectedBuyItem.price}
                    className="w-full font-display text-xs gap-2 py-5"
                  >
                    <Check className="h-4 w-4" /> AUTHORIZE PURCHASE
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'sell' && selectedSellSlot && (
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="font-mono text-xs uppercase mb-1 text-emerald-400">
                    SELL VALUE
                  </Badge>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {selectedSellSlot.item.name}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {selectedSellSlot.item.description}
                  </p>
                </div>

                <div className="border-t border-border/60 pt-3">
                  <div className="flex justify-between items-center text-xs font-mono mb-3">
                    <span className="text-muted-foreground">PAYOUT AMOUNT:</span>
                    <span className="text-base font-bold text-emerald-400">
                      +{selectedSellSlot.item.sellPrice} Ͼ
                    </span>
                  </div>

                  <Button
                    onClick={() => handleSell(selectedInventorySlot!)}
                    className="w-full font-display text-xs gap-2 py-5 bg-emerald-600 hover:bg-emerald-500"
                  >
                    <Coins className="h-4 w-4" /> SELL 1 UNIT
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'buy' && !selectedBuyItem && (
              <div className="text-center text-xs font-mono text-muted-foreground">
                Select an item from the merchant catalog.
              </div>
            )}
            {activeTab === 'sell' && !selectedSellSlot && (
              <div className="text-center text-xs font-mono text-muted-foreground">
                Select an item from your inventory to sell.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}