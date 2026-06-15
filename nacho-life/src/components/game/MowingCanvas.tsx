'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { MowerStats, WeedEaterStats, TimeOfDay } from '@/types';
import type { CharacterConfig } from '@/lib/characters';

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'tree' | 'garden_bed' | 'fence' | 'sidewalk' | 'sprinkler' | 'gnome';
  isMajor: boolean;
  color: string;
}

interface MowingCanvasProps {
  character: CharacterConfig;
  mower: MowerStats;
  weedEater: WeedEaterStats;
  timeOfDay: TimeOfDay;
  heatIndex: number;
  grassColor: string;       // uncut grass color (dark)
  cutGrassColor: string;    // cut grass color (light)
  obstacles: Obstacle[];
  phase: 'mowing' | 'trimming';
  onPhaseComplete: (accuracy: number) => void;
  onMajorObstacleHit: () => void;
  onMinorObstacleHit: () => void;
  onStaminaEmpty: () => void;
  stamina: number;
  hydration: number;
  onStaminaChange: (v: number) => void;
  onHydrationChange: (v: number) => void;
  isMobile: boolean;
}

interface PlayerState {
  x: number;
  y: number;
  angle: number;           // radians
  speed: number;
  isMoving: boolean;
  lastStripeY: number;     // for straight-line tracking
  cutConfidence: number;   // 0–1
}

const CANVAS_W = 800;
const CANVAS_H = 600;
const YARD_PADDING = 60; // border strip that must be weed-eaten

export default function MowingCanvas({
  character,
  mower,
  timeOfDay,
  heatIndex,
  grassColor,
  cutGrassColor,
  obstacles,
  phase,
  onPhaseComplete,
  onMajorObstacleHit,
  onMinorObstacleHit,
  onStaminaChange,
  onHydrationChange,
  stamina,
  hydration,
  isMobile,
}: MowingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cutMaskRef = useRef<boolean[]>([]); // true = cut
  const playerRef = useRef<PlayerState>({
    x: CANVAS_W / 2,
    y: CANVAS_H - YARD_PADDING - 20,
    angle: -Math.PI / 2,
    speed: 0,
    isMoving: false,
    lastStripeY: CANVAS_H - YARD_PADDING - 20,
    cutConfidence: 1,
  });
  const keysRef = useRef<Set<string>>(new Set());
  const joystickRef = useRef({ dx: 0, dy: 0, active: false });
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const staminaRef = useRef(stamina);
  const hydrationRef = useRef(hydration);

  staminaRef.current = stamina;
  hydrationRef.current = hydration;

  // Initialize cut mask (false = uncut)
  useEffect(() => {
    const cols = Math.ceil(CANVAS_W / 4);
    const rows = Math.ceil(CANVAS_H / 4);
    cutMaskRef.current = new Array(cols * rows).fill(false);
  }, []);

  const markCut = useCallback((px: number, py: number, width: number) => {
    const half = width / 2;
    const cols = Math.ceil(CANVAS_W / 4);
    for (let dx = -half; dx <= half; dx += 4) {
      const cx = Math.floor((px + dx) / 4);
      const cy = Math.floor(py / 4);
      if (cx >= 0 && cx < cols && cy >= 0 && cy < Math.ceil(CANVAS_H / 4)) {
        cutMaskRef.current[cy * cols + cx] = true;
      }
    }
  }, []);

  const getCoveragePercent = useCallback(() => {
    const mask = cutMaskRef.current;
    const total = mask.length;
    const cut = mask.filter(Boolean).length;
    return cut / total;
  }, []);

  const checkObstacleCollision = useCallback((px: number, py: number): Obstacle | null => {
    for (const obs of obstacles) {
      if (px > obs.x && px < obs.x + obs.w && py > obs.y && py < obs.y + obs.h) {
        return obs;
      }
    }
    return null;
  }, [obstacles]);

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D) => {
    const mask = cutMaskRef.current;
    const cols = Math.ceil(CANVAS_W / 4);
    const rows = Math.ceil(CANVAS_H / 4);

    // Draw grass (uncut)
    ctx.fillStyle = grassColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw cut areas
    ctx.fillStyle = cutGrassColor;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (mask[r * cols + c]) {
          ctx.fillRect(c * 4, r * 4, 4, 4);
        }
      }
    }

    // Draw tire tracks (stripes) — slightly darker than cut grass
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    const p = playerRef.current;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (mask[r * cols + c]) {
          // Stripe effect every mower-width columns
          const stripeWidth = Math.floor(mower.cutWidth / 4);
          if (Math.floor(c / stripeWidth) % 2 === 0) {
            ctx.fillRect(c * 4, r * 4, 4, 4);
          }
        }
      }
    }

    // Draw obstacles
    for (const obs of obstacles) {
      ctx.fillStyle = obs.color;
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      if (obs.type === 'tree') {
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw player mower
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle + Math.PI / 2);
    // Body
    ctx.fillStyle = p.isMoving ? '#22c55e' : '#86efac';
    ctx.fillRect(-10, -16, 20, 32);
    // Blade indicator
    ctx.fillStyle = '#silver';
    ctx.fillRect(-8, -4, 16, 8);
    ctx.restore();

    // Cut Confidence meter — top center
    const barW = 200;
    const barX = CANVAS_W / 2 - barW / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(barX - 2, 12, barW + 4, 18);
    const confColor = p.cutConfidence > 0.75 ? '#22c55e' : p.cutConfidence > 0.45 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = confColor;
    ctx.fillRect(barX, 14, barW * p.cutConfidence, 14);
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Cut Confidence', CANVAS_W / 2, 11);

    // Stamina bar — top left
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 12, 104, 12);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(11, 13, (staminaRef.current / 100) * 102, 10);
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Stamina', 10, 11);

    // Hydration bar — below stamina
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 30, 104, 12);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(11, 31, (hydrationRef.current / 100) * 102, 10);
    ctx.fillStyle = '#fff';
    ctx.fillText('Hydration', 10, 29);
  }, [grassColor, cutGrassColor, mower.cutWidth, obstacles]);

  const update = useCallback((dt: number) => {
    const p = playerRef.current;
    const keys = keysRef.current;
    const joy = joystickRef.current;

    // Determine input direction
    let turnLeft = keys.has('ArrowLeft') || keys.has('a');
    let turnRight = keys.has('ArrowRight') || keys.has('d');
    let forward = keys.has('ArrowUp') || keys.has('w');
    let backward = keys.has('ArrowDown') || keys.has('s');

    if (joy.active) {
      if (joy.dx < -0.2) turnLeft = true;
      if (joy.dx > 0.2) turnRight = true;
      if (joy.dy < -0.2) forward = true;
      if (joy.dy > 0.2) backward = true;
    }

    const turnSpeed = 2.5;
    if (turnLeft) p.angle -= turnSpeed * dt;
    if (turnRight) p.angle += turnSpeed * dt;

    const baseSpeed = mower.speed * character.mowSpeed;
    p.isMoving = forward || backward;

    if (forward) {
      p.x += Math.cos(p.angle) * baseSpeed * dt;
      p.y += Math.sin(p.angle) * baseSpeed * dt;
    }
    if (backward) {
      p.x -= Math.cos(p.angle) * baseSpeed * dt * 0.5;
      p.y -= Math.sin(p.angle) * baseSpeed * dt * 0.5;
    }

    // Clamp to yard
    p.x = Math.max(YARD_PADDING, Math.min(CANVAS_W - YARD_PADDING, p.x));
    p.y = Math.max(YARD_PADDING, Math.min(CANVAS_H - YARD_PADDING, p.y));

    // Obstacle collision
    const hit = checkObstacleCollision(p.x, p.y);
    if (hit) {
      if (hit.isMajor) {
        onMajorObstacleHit();
      } else {
        onMinorObstacleHit();
      }
      // Push player back
      p.x -= Math.cos(p.angle) * 10;
      p.y -= Math.sin(p.angle) * 10;
    }

    // Mark cut when moving forward
    if (forward && phase === 'mowing') {
      markCut(p.x, p.y, mower.cutWidth);
    }

    // Cut Confidence — measure deviation from expected horizontal stripe
    if (forward) {
      const dyFromStripe = Math.abs(p.y - p.lastStripeY);
      const normalizedDev = Math.min(dyFromStripe / 30, 1);
      const rawConf = 1 - normalizedDev;
      p.cutConfidence = p.cutConfidence * 0.92 + rawConf * 0.08 * character.precision;
      p.cutConfidence = Math.max(0, Math.min(1, p.cutConfidence));
    }

    // Stamina / hydration drain
    if (p.isMoving) {
      const drain = mower.staminaDrain * heatIndex * dt;
      const newStamina = Math.max(0, staminaRef.current - drain * 0.6);
      const newHydration = Math.max(0, hydrationRef.current - drain * 0.4);
      onStaminaChange(newStamina);
      onHydrationChange(newHydration);
    } else {
      // Gradual recovery when idle
      const recovery = dt * 3;
      onStaminaChange(Math.min(character.staminaMax, staminaRef.current + recovery));
      onHydrationChange(Math.min(character.hydrationMax, hydrationRef.current + recovery * 0.5));
    }
  }, [character, mower, heatIndex, phase, markCut, checkObstacleCollision, onMajorObstacleHit, onMinorObstacleHit, onStaminaChange, onHydrationChange]);

  const loop = useCallback((time: number) => {
    const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = time;

    update(dt);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawFrame(ctx);
    }

    // Check if phase complete (95% cut)
    if (phase === 'mowing' && getCoveragePercent() >= 0.95) {
      const accuracy = playerRef.current.cutConfidence;
      onPhaseComplete(accuracy);
      return;
    }

    animFrameRef.current = requestAnimationFrame(loop);
  }, [update, drawFrame, getCoveragePercent, phase, onPhaseComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keysRef.current.add(e.key);
    const offKey = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', offKey);
    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', offKey);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [loop]);

  // Virtual joystick touch handlers
  const joystickOriginRef = useRef({ x: 0, y: 0 });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    joystickOriginRef.current = { x: t.clientX, y: t.clientY };
    joystickRef.current.active = true;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    const dx = (t.clientX - joystickOriginRef.current.x) / 40;
    const dy = (t.clientY - joystickOriginRef.current.y) / 40;
    joystickRef.current.dx = Math.max(-1, Math.min(1, dx));
    joystickRef.current.dy = Math.max(-1, Math.min(1, dy));
  }, []);

  const onTouchEnd = useCallback(() => {
    joystickRef.current = { dx: 0, dy: 0, active: false };
  }, []);

  return (
    <div className="relative select-none">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="block border-4 border-green-800 rounded-lg"
        style={{ touchAction: 'none' }}
        onTouchStart={isMobile ? onTouchStart : undefined}
        onTouchMove={isMobile ? onTouchMove : undefined}
        onTouchEnd={isMobile ? onTouchEnd : undefined}
      />
      {isMobile && (
        <div
          className="absolute bottom-6 left-6 w-20 h-20 rounded-full border-4 border-white/50 bg-white/20 flex items-center justify-center"
          style={{ touchAction: 'none' }}
        >
          <div className="w-8 h-8 rounded-full bg-white/60" />
        </div>
      )}
    </div>
  );
}
