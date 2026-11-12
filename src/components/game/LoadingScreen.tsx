import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, Sparkles, Terminal, ArrowRight } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  'Initializing Shadow City raster pipeline...',
  'Mapping neural grid sectors & district telemetry...',
  'Synchronizing 44x32 collision physics buffers...',
  'Injecting neon ambient shaders and kinetic trackers...',
  'Establishing cyber-operative link at Sector 9...',
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(15);
  const [logIndex, setLogIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setReady(true);
          return 100;
        }
        const increment = Math.floor(Math.random() * 20) + 12;
        return Math.min(prev + increment, 100);
      });
    }, 280);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const logTimer = setInterval(() => {
      setLogIndex((prev) => (prev < BOOT_LOGS.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(logTimer);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-6">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-surface opacity-80" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      {/* Main Terminal Card */}
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card/95 p-8 shadow-elegant backdrop-blur-md">
        {/* Header Branding */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-eyebrow text-primary">PROJECT OMEGA</span>
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                SHADOW CITY
              </h2>
            </div>
          </div>
          <span className="rounded border border-border bg-muted/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">
            v1.0.4
          </span>
        </div>

        {/* Description */}
        <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
          A neon-drenched 2D open-world adventure. Infiltrate corporate districts, avoid solid
          barricades, and roam the underbelly at your own pace.
        </p>

        {/* Progress Bar & Telemetry */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between font-mono text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 text-foreground">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              SYSTEM DIAGNOSTICS
            </span>
            <span className="text-primary font-bold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-muted/80" />
        </div>

        {/* Console Log Stream */}
        <div className="mb-8 rounded border border-border/80 bg-background/80 p-3 font-mono text-xs text-muted-foreground">
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <Sparkles className="h-3 w-3" />
            <span>BOOT PROTOCOL:</span>
          </div>
          <div className="truncate text-foreground/90">{BOOT_LOGS[logIndex]}</div>
        </div>

        {/* Action Button */}
        {ready ? (
          <Button
            size="lg"
            onClick={onComplete}
            className="w-full font-display font-semibold tracking-wider shadow-glow animate-fade-in"
          >
            INITIALIZE UPLINK
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button size="lg" disabled className="w-full font-display">
            CONNECTING NEURAL GRID...
          </Button>
        )}
      </div>

      {/* Footer Info */}
      <div className="relative z-10 mt-8 text-center font-mono text-xs text-muted-foreground">
        Use WASD to move • SHIFT to sprint • Collision enabled
      </div>
    </div>
  );
}