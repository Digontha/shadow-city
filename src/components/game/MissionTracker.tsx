import { useState, useEffect } from 'react';
import { Mission, MissionObjective } from '@/game/missions/missionTypes';
import { missionManager } from '@/game/missions/missionManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Target, CheckCircle2, Circle, Award, Coins, Zap, ChevronDown, ChevronUp, BookOpen, AlertCircle } from 'lucide-react';

export default function MissionTracker() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [credits, setCredits] = useState(missionManager.playerCredits);
  const [xp, setXP] = useState(missionManager.playerXP);
  const [level, setLevel] = useState(missionManager.playerLevel);

  useEffect(() => {
    const unsubscribe = missionManager.subscribe((allMissions, currentActive) => {
      setMissions(allMissions);
      setActiveMission(currentActive);
      setCredits(missionManager.playerCredits);
      setXP(missionManager.playerXP);
      setLevel(missionManager.playerLevel);
    });

    return () => unsubscribe();
  }, []);

  const completedCount = missions.filter((m) => m.status === 'completed').length;
  const activeCount = missions.filter((m) => m.status === 'active').length;

  return (
    <>
      {/* Floating Mini Tracker on Right Top */}
      <div className="pointer-events-auto absolute right-4 top-20 z-20 flex w-72 flex-col gap-2 select-none md:w-80">
        <div className="rounded-xl border border-border/80 bg-background/90 p-3.5 backdrop-blur-md shadow-soft">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-display text-xs font-bold tracking-wider text-foreground">
                MISSION TELEMETRY
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Full Quest Log Sheet Trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    aria-label="Open Full Mission Log"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md bg-card/95 border-border">
                  <SheetHeader>
                    <SheetTitle className="font-display text-lg flex items-center justify-between pr-4">
                      <span>OPERATIONS DIRECTORY</span>
                      <div className="flex items-center gap-2 text-xs font-mono font-normal">
                        <Badge variant="outline" className="gap-1 border-primary/50 text-primary">
                          <Coins className="h-3 w-3" /> {credits} CR
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          LVL {level}
                        </Badge>
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  <Tabs defaultValue="active" className="mt-4">
                    <TabsList className="grid grid-cols-3 w-full bg-muted/60 font-mono text-xs">
                      <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
                      <TabsTrigger value="available">Available</TabsTrigger>
                      <TabsTrigger value="completed">Done ({completedCount})</TabsTrigger>
                    </TabsList>

                    {/* Active Missions */}
                    <TabsContent value="active">
                      <ScrollArea className="h-[75vh] pr-3">
                        <div className="space-y-3 pt-2">
                          {missions
                            .filter((m) => m.status === 'active')
                            .map((mission) => (
                              <Card
                                key={mission.id}
                                className={`border ${
                                  activeMission?.id === mission.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border/60 bg-muted/20'
                                }`}
                              >
                                <CardHeader className="p-3 pb-2">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <Badge
                                        variant={mission.category === 'story' ? 'default' : 'secondary'}
                                        className="text-[10px] uppercase font-mono mb-1"
                                      >
                                        {mission.category}
                                      </Badge>
                                      <CardTitle className="text-sm font-display font-semibold text-foreground">
                                        {mission.title}
                                      </CardTitle>
                                    </div>
                                    <span className="text-[11px] font-mono text-muted-foreground">
                                      {mission.district}
                                    </span>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 text-xs font-mono space-y-2">
                                  <p className="text-muted-foreground leading-normal">
                                    {mission.description}
                                  </p>

                                  <div className="space-y-1.5 border-t border-border/40 pt-2">
                                    {mission.objectives.map((obj) => (
                                      <div
                                        key={obj.id}
                                        className="flex items-center justify-between text-[11px]"
                                      >
                                        <div className="flex items-center gap-1.5">
                                          {obj.completed ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                          ) : (
                                            <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                                          )}
                                          <span
                                            className={
                                              obj.completed
                                                ? 'line-through text-muted-foreground'
                                                : 'text-foreground'
                                            }
                                          >
                                            {obj.description}
                                          </span>
                                        </div>
                                        <span className="font-semibold text-primary">
                                          {obj.currentCount}/{obj.targetCount}
                                        </span>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
                                    <span>
                                      REWARD: {mission.rewards.credits} CR • {mission.rewards.xp} XP
                                    </span>
                                    {activeMission?.id !== mission.id && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-[10px] font-mono"
                                        onClick={() => missionManager.setActiveMission(mission.id)}
                                      >
                                        Track
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Available Missions */}
                    <TabsContent value="available">
                      <ScrollArea className="h-[75vh] pr-3">
                        <div className="space-y-3 pt-2">
                          {missions
                            .filter((m) => m.status === 'available')
                            .map((mission) => (
                              <Card key={mission.id} className="border-border/60 bg-muted/10">
                                <CardHeader className="p-3 pb-2">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] uppercase font-mono mb-1"
                                      >
                                        {mission.category}
                                      </Badge>
                                      <CardTitle className="text-sm font-display font-semibold text-foreground">
                                        {mission.title}
                                      </CardTitle>
                                    </div>
                                    <span className="text-[11px] font-mono text-muted-foreground">
                                      {mission.district}
                                    </span>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 text-xs font-mono space-y-2">
                                  <p className="text-muted-foreground leading-normal">
                                    {mission.description}
                                  </p>
                                  <div className="flex items-center justify-between border-t border-border/40 pt-2">
                                    <span className="text-[10px] text-primary">
                                      +{mission.rewards.credits} CR • +{mission.rewards.xp} XP
                                    </span>
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs font-mono"
                                      onClick={() => missionManager.acceptMission(mission.id)}
                                    >
                                      Accept
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Completed Missions */}
                    <TabsContent value="completed">
                      <ScrollArea className="h-[75vh] pr-3">
                        <div className="space-y-2.5 pt-2">
                          {missions
                            .filter((m) => m.status === 'completed')
                            .map((mission) => (
                              <div
                                key={mission.id}
                                className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-2.5 text-xs font-mono text-muted-foreground"
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-foreground">
                                    {mission.title}
                                  </span>
                                </div>
                                <span className="text-[10px]">+{mission.rewards.credits} CR</span>
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </SheetContent>
              </Sheet>

              {/* Collapse HUD Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                aria-label="Toggle Tracker Details"
              >
                {isCollapsed ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Active Mission Body */}
          {!isCollapsed && (
            <div className="mt-2.5 space-y-2 text-xs font-mono">
              {activeMission ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-foreground truncate max-w-[180px]">
                      {activeMission.title}
                    </span>
                    <Badge variant="outline" className="text-[9px] uppercase font-mono px-1.5 py-0">
                      {activeMission.district}
                    </Badge>
                  </div>

                  {/* Objectives list */}
                  <div className="space-y-1.5 pt-1">
                    {activeMission.objectives.map((obj) => (
                      <div
                        key={obj.id}
                        className="flex items-start justify-between gap-1.5 text-[11px]"
                      >
                        <div className="flex items-start gap-1.5 leading-snug">
                          {obj.completed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <span
                            className={
                              obj.completed ? 'line-through text-muted-foreground' : 'text-foreground/90'
                            }
                          >
                            {obj.description}
                          </span>
                        </div>
                        <span className="font-semibold text-primary shrink-0">
                          {obj.currentCount}/{obj.targetCount}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Rewards summary footer */}
                  <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1 text-primary">
                      <Award className="h-3 w-3" /> {activeMission.rewards.credits} CR
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-accent" /> {activeMission.rewards.xp} XP
                    </span>
                  </div>
                </>
              ) : (
                <div className="py-2 text-center text-muted-foreground">
                  <p>No active missions.</p>
                  <p className="text-[10px] text-primary mt-0.5">
                    Speak with Vex or open directory.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}