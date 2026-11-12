import { useState, useEffect } from 'react';
import { NPCCharacter, DialogueNode, DialogueChoice } from '@/game/missions/missionTypes';
import { missionManager } from '@/game/missions/missionManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Shield, CheckCircle2, ChevronRight, X, Radio } from 'lucide-react';
import { soundFX } from '@/game/audio/soundFX';

interface DialogueModalProps {
  npc: NPCCharacter | null;
  onClose: () => void;
}

export default function DialogueModal({ npc, onClose }: DialogueModalProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string>('greeting');

  useEffect(() => {
    if (npc) {
      setCurrentNodeId(npc.initialNodeId);
      missionManager.onNPCInteracted(npc.id);
soundFX.playHit();
    }
  }, [npc]);

  if (!npc) return null;

  const currentNode: DialogueNode = npc.dialogueTree[currentNodeId] || {
    id: 'fallback',
    text: 'Cipher. The network lines are currently unstable. Reconnect shortly.',
    choices: [{ text: 'Close uplink', action: 'close' }],
  };

  const handleChoice = (choice: DialogueChoice) => {
    soundFX.playHit();

    if (choice.action === 'close') {
      onClose();
      return;
    }

    if (choice.action === 'accept_mission' && choice.missionId) {
      missionManager.acceptMission(choice.missionId);
      onClose();
      return;
    }

    if (choice.action === 'next_node' && choice.nextNodeId) {
      setCurrentNodeId(choice.nextNodeId);
      return;
    }

    if (choice.nextNodeId) {
      setCurrentNodeId(choice.nextNodeId);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-primary/50 bg-card p-6 shadow-glow">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-lg border font-mono font-bold text-sm shadow-inner"
              style={{
                borderColor: `${npc.color}80`,
                backgroundColor: `${npc.color}20`,
                color: npc.color,
              }}
            >
              {npc.badge.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold tracking-wide text-foreground">
                  {npc.name}
                </h3>
                <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">
                  {npc.role}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-0.5">
                <Radio className="h-3 w-3 text-primary animate-pulse" />
                <span>{npc.faction}</span>
                <span>•</span>
                <span className="text-foreground">{npc.district}</span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close dialogue"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Dialogue Narrative Text */}
        <div className="my-5 rounded-lg border border-border/60 bg-muted/30 p-4 font-mono text-sm leading-relaxed text-foreground/95 shadow-inner">
          <p className="border-l-2 border-primary/70 pl-3 italic">
            "{currentNode.text}"
          </p>
        </div>

        {/* Interactive Response Options */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            SELECT RESPONSE:
          </span>
          <ScrollArea className="max-h-56 pr-2">
            <div className="flex flex-col gap-2">
              {currentNode.choices.map((choice, index) => {
                const isAccept = choice.action === 'accept_mission';
                return (
                  <Button
                    key={index}
                    variant={isAccept ? 'default' : 'secondary'}
                    onClick={() => handleChoice(choice)}
                    className="group justify-between h-auto py-3 px-4 text-left font-mono text-xs transition-all duration-200 border border-border/60 hover:border-primary/60"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                        {index + 1}
                      </span>
                      <span>{choice.text}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Footer Lore Hint */}
        <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-3 text-[11px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-primary" /> SECURED NEURAL UPLINK
          </span>
          <span>PRESS ESC TO CLOSE</span>
        </div>
      </div>
    </div>
  );
}