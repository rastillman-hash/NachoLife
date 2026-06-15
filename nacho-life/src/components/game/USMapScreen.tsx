'use client';

import type { RegionId, Difficulty } from '@/types';
import { REGIONS, LOCATIONS } from '@/data/locations';

interface Props {
  yardsCompleted: number;
  completedSets: RegionId[];
  currentRegion: RegionId | null;
  onSelectRegion: (id: RegionId) => void;
}

const REGION_POSITIONS: Record<RegionId, { x: number; y: number }> = {
  appalachian:    { x: 72, y: 42 },
  hill_country:   { x: 42, y: 62 },
  ozark_midwest:  { x: 52, y: 38 },
  rocky_mountain: { x: 28, y: 36 },
  pacific_coast:  { x: 10, y: 38 },
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  starter:  'bg-green-500',
  normal:   'bg-blue-500',
  hard:     'bg-yellow-500',
  advanced: 'bg-orange-500',
  expert:   'bg-red-600',
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  starter:  'Starter',
  normal:   'Normal',
  hard:     'Hard',
  advanced: 'Advanced',
  expert:   'Expert',
};

export default function USMapScreen({ yardsCompleted, completedSets, currentRegion, onSelectRegion }: Props) {
  return (
    <div className="min-h-screen bg-green-950 text-white flex flex-col">
      <div className="p-4 border-b border-green-800 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-yellow-300">🗺 Select a Region</h2>
        <span className="text-green-400 text-sm">Yards Completed: {yardsCompleted}</span>
      </div>

      {/* Schematic US map */}
      <div className="relative flex-1 bg-green-900/30 m-4 rounded-xl overflow-hidden" style={{ minHeight: 400 }}>
        {/* Simple US outline suggestion */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 60" preserveAspectRatio="none">
          <rect x="5" y="10" width="90" height="45" rx="6" fill="#fff" />
        </svg>

        {Object.values(REGIONS).map((region) => {
          const pos = REGION_POSITIONS[region.id];
          const isUnlocked = yardsCompleted >= region.unlockRequirement;
          const isComplete = completedSets.includes(region.id);
          const isCurrent = currentRegion === region.id;
          const completedCount = region.locations.filter(
            (lid) => LOCATIONS[lid]
          ).length; // placeholder — real tracking via save

          return (
            <div
              key={region.id}
              className="absolute"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)' }}
            >
              <button
                disabled={!isUnlocked}
                onClick={() => onSelectRegion(region.id)}
                className={`
                  flex flex-col items-center gap-1 group
                  ${!isUnlocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-110 transition-transform'}
                `}
              >
                <div className={`
                  w-14 h-14 rounded-full border-4 flex items-center justify-center text-lg font-bold shadow-lg
                  ${isComplete ? 'bg-yellow-500 border-yellow-300' : isCurrent ? 'bg-green-500 border-green-300 animate-pulse' : 'bg-green-700 border-green-500'}
                  ${isUnlocked ? 'group-hover:border-white' : ''}
                `}>
                  {isComplete ? '✓' : isUnlocked ? '▶' : '🔒'}
                </div>
                <div className="text-center bg-green-950/80 rounded px-2 py-0.5">
                  <p className="text-xs font-bold text-white whitespace-nowrap">{region.name}</p>
                  <span className={`text-xs px-1 py-0.5 rounded ${DIFFICULTY_COLORS[region.difficulty]}`}>
                    {DIFFICULTY_LABELS[region.difficulty]}
                  </span>
                  {!isUnlocked && (
                    <p className="text-xs text-red-400 mt-0.5">
                      Unlock at {region.unlockRequirement} yards
                    </p>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center p-3 text-xs text-green-400 flex-wrap">
        {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full inline-block ${DIFFICULTY_COLORS[k as Difficulty]}`} />
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
