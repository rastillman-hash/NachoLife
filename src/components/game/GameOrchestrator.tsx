'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Character, PlayerStats, TimeOfDay, RegionId, Grade } from '@/types';
import { CHARACTERS } from '@/lib/characters';
import { LOCATIONS, REGIONS } from '@/data/locations';
import { MOWERS, WEED_EATERS } from '@/data/equipment';
import { calculateGrade, gradeToPayPercent, BASE_PAY } from '@/lib/grading';
import { loadSave, writeSave } from '@/lib/saveData';

import IntroScreen from './IntroScreen';
import USMapScreen from './USMapScreen';
import JobLoadScreen from './JobLoadScreen';
import MowingCanvas from './MowingCanvas';
import GradeScreen from './GradeScreen';

type Screen =
  | 'intro'
  | 'map'
  | 'job_load'
  | 'item_shop'
  | 'mowing'
  | 'trimming'
  | 'grade'
  | 'equip_upgrade'
  | 'home_purchase'
  | 'home_upgrade'
  | 'managed_props'
  | 'hub';

const GRASS_COLORS: Record<string, string> = {
  tall_fescue:       '#2d5a1b',
  kentucky_bluegrass: '#1e4d2b',
  bermuda:           '#3a6e1f',
  buffalo:           '#5a7c2a',
  st_augustine:      '#2a6035',
  zoysia:            '#2e5e22',
  fine_fescue:       '#264d1a',
  alpine_meadow:     '#3d6b2c',
  desert_scrub:      '#7a7040',
};

const CUT_COLORS: Record<string, string> = {
  tall_fescue:       '#4a8c30',
  kentucky_bluegrass: '#3d7a45',
  bermuda:           '#5a9c35',
  buffalo:           '#8aac45',
  st_augustine:      '#4a9055',
  zoysia:            '#4e8a38',
  fine_fescue:       '#3e7a2c',
  alpine_meadow:     '#5a9a40',
  desert_scrub:      '#a8a060',
};

function defaultPlayer(character: Character): PlayerStats {
  return {
    character,
    balance: 500,
    yardsCompleted: 0,
    currentRegion: null,
    currentHomeLocationId: null,
    ownedHomes: [],
    mower: 1,
    weedEater: 1,
    mowerColor: '#6B7280',
    weedEaterColor: '#78716C',
    inventory: [],
    completedLocationSets: [],
    unlockedRegions: ['appalachian'],
    tutorialComplete: false,
  };
}

export default function GameOrchestrator() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [player, setPlayer] = useState<PlayerStats | null>(null);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [stamina, setStamina] = useState(100);
  const [hydration, setHydration] = useState(100);
  const [gradeResult, setGradeResult] = useState<{ grade: Grade; payPercent: number; basePay: number; finalPay: number; accuracy: number } | null>(null);
  const [obstacleHits, setObstacleHits] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    loadSave().then((save) => {
      if (save) {
        setPlayer(save.player);
        setScreen('map');
      }
    });
  }, []);

  const handleCharacterSelect = useCallback((character: Character) => {
    const p = defaultPlayer(character);
    setPlayer(p);
    writeSave(p, {});
    setScreen('map'); // Tutorial will be first entry point — for now go to map
  }, []);

  const handleSelectRegion = useCallback((regionId: RegionId) => {
    if (!player) return;
    setPlayer((prev) => prev ? { ...prev, currentRegion: regionId } : prev);
    setActiveLocationId(REGIONS[regionId].locations[0]);
    setScreen('job_load');
  }, [player]);

  const handleMowingComplete = useCallback((accuracy: number) => {
    if (!activeLocationId || !player) return;
    const loc = LOCATIONS[activeLocationId];
    const char = CHARACTERS[player.character];

    // Apply character variance
    const variance = (Math.random() - 0.5) * 2 * char.variance;
    const finalAccuracy = Math.max(0, Math.min(1, accuracy + variance));
    const grade = calculateGrade(finalAccuracy);
    const payPct = gradeToPayPercent(grade);
    const base = BASE_PAY[loc.wealthTier] ?? 45;
    const earned = +(base * payPct).toFixed(2);

    setGradeResult({ grade, payPercent: payPct, basePay: base, finalPay: earned, accuracy: finalAccuracy });
    setScreen('grade');
  }, [activeLocationId, player]);

  const handleGradeContinue = useCallback(() => {
    if (!gradeResult || !player) return;
    const updated: PlayerStats = {
      ...player,
      balance: player.balance + gradeResult.finalPay,
      yardsCompleted: player.yardsCompleted + 1,
    };
    setPlayer(updated);
    writeSave(updated, {});
    setScreen('equip_upgrade');
  }, [gradeResult, player]);

  if (screen === 'intro') {
    return <IntroScreen onSelect={handleCharacterSelect} />;
  }

  if (screen === 'map' && player) {
    return (
      <USMapScreen
        yardsCompleted={player.yardsCompleted}
        completedSets={player.completedLocationSets}
        currentRegion={player.currentRegion}
        onSelectRegion={handleSelectRegion}
      />
    );
  }

  if (screen === 'job_load' && player && activeLocationId) {
    const loc = LOCATIONS[activeLocationId];
    return (
      <JobLoadScreen
        location={loc}
        timeOfDay={timeOfDay}
        onSetTime={setTimeOfDay}
        balance={player.balance}
        onStart={() => {
          setStamina(CHARACTERS[player.character].staminaMax);
          setHydration(CHARACTERS[player.character].hydrationMax);
          setObstacleHits(0);
          setScreen('mowing');
        }}
        onBack={() => setScreen('map')}
      />
    );
  }

  if ((screen === 'mowing' || screen === 'trimming') && player && activeLocationId) {
    const loc = LOCATIONS[activeLocationId];
    const mower = MOWERS[player.mower - 1];
    const weedEater = WEED_EATERS[player.weedEater - 1];
    const char = CHARACTERS[player.character];

    return (
      <div className="min-h-screen bg-green-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="text-white text-sm flex gap-4">
            <span>{loc.town}, {loc.state}</span>
            <span className="text-yellow-300 capitalize">{timeOfDay.replace('_', ' ')}</span>
            <span className="text-green-400 capitalize">{screen === 'mowing' ? '🚜 Mowing' : '✂️ Trimming'}</span>
          </div>
          <MowingCanvas
            character={char}
            mower={mower}
            weedEater={weedEater}
            timeOfDay={timeOfDay}
            heatIndex={loc.heatIndex[timeOfDay]}
            grassColor={GRASS_COLORS[loc.grassType] ?? '#2d5a1b'}
            cutGrassColor={CUT_COLORS[loc.grassType] ?? '#4a8c30'}
            obstacles={[]}
            phase={screen === 'mowing' ? 'mowing' : 'trimming'}
            onPhaseComplete={handleMowingComplete}
            onMajorObstacleHit={() => setScreen('map')}
            onMinorObstacleHit={() => setObstacleHits((n) => n + 1)}
            onStaminaEmpty={() => {}}
            stamina={stamina}
            hydration={hydration}
            onStaminaChange={setStamina}
            onHydrationChange={setHydration}
            isMobile={isMobile}
          />
          <p className="text-green-500 text-xs">
            {isMobile ? 'Drag joystick to steer' : 'WASD / Arrow Keys to steer · Space to stop'}
          </p>
        </div>
      </div>
    );
  }

  if (screen === 'grade' && gradeResult && activeLocationId) {
    const loc = LOCATIONS[activeLocationId];
    return (
      <GradeScreen
        grade={gradeResult.grade}
        payPercent={gradeResult.payPercent}
        basePay={gradeResult.basePay}
        finalPay={gradeResult.finalPay}
        cutAccuracy={gradeResult.accuracy}
        missedPatches={0}
        obstacleHits={obstacleHits}
        locationName={`${loc.town}, ${loc.state}`}
        onContinue={handleGradeContinue}
      />
    );
  }

  // Placeholder screens — to be built out
  if (screen === 'equip_upgrade' && player) {
    return (
      <div className="min-h-screen bg-green-950 text-white flex flex-col items-center justify-center gap-4 p-6">
        <h2 className="text-2xl font-bold text-yellow-300">Equipment Upgrade</h2>
        <p className="text-green-400">Balance: <span className="text-yellow-300 font-bold">${player.balance.toLocaleString()}</span></p>
        <p className="text-green-500 text-sm">(Full upgrade shop coming soon)</p>
        <button onClick={() => setScreen('map')} className="px-6 py-3 bg-yellow-500 text-green-950 font-bold rounded-xl">
          Continue to Map →
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-950 text-green-400 flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}
