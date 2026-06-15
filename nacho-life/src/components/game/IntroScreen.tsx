'use client';

import type { Character } from '@/types';
import { CHARACTERS } from '@/lib/characters';

interface Props {
  onSelect: (character: Character) => void;
}

export default function IntroScreen({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-950 flex flex-col items-center justify-center p-6 text-white">
      <h1 className="text-6xl font-black tracking-tight mb-2 drop-shadow-lg">
        🌿 Nacho Life
      </h1>
      <p className="text-green-300 text-lg mb-2 italic">
        Premium Yard Care · Tourist Town Specialist
      </p>
      <p className="text-green-400 text-sm mb-10 max-w-md text-center">
        Mow your way across America's most iconic destinations. Build your business, upgrade your equipment, and make every yard a masterpiece.
      </p>

      <h2 className="text-2xl font-bold mb-6 text-yellow-300">Choose Your Operator</h2>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
        {(Object.values(CHARACTERS)).map((char) => (
          <button
            key={char.id}
            onClick={() => onSelect(char.id)}
            className="flex-1 bg-green-700/60 hover:bg-green-600/80 border-2 border-green-400 rounded-2xl p-6 text-left transition-all hover:scale-105 hover:border-yellow-400 group"
          >
            {/* Portrait placeholder */}
            <div
              className="w-20 h-20 rounded-full mb-4 border-4 border-white/30 group-hover:border-yellow-400 transition-colors mx-auto"
              style={{ backgroundColor: char.portrait }}
            />
            <h3 className="text-xl font-bold text-center text-white mb-1">{char.name}</h3>
            <p className="text-xs text-green-300 text-center mb-4 italic">{char.fullName}</p>
            <p className="text-sm text-green-100 mb-4">{char.description}</p>

            <div className="space-y-1 text-xs">
              <StatBar label="Mow Speed" value={char.mowSpeed / 1.2} color="bg-blue-400" />
              <StatBar label="Precision" value={char.precision / 1.2} color="bg-yellow-400" />
              <StatBar label="Stamina" value={char.staminaMax / 110} color="bg-orange-400" />
              <StatBar label="Equip Access" value={char.equipmentUnlockBonus > 0 ? 0.85 : 0.5} color="bg-purple-400" />
              <StatBar label="Item Access" value={char.itemUnlockBonus > 0 ? 0.85 : 0.5} color="bg-green-400" />
            </div>
          </button>
        ))}
      </div>

      <p className="mt-8 text-green-500 text-xs">
        Your character choice is permanent for this save. Start a new game to switch.
      </p>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 text-green-300">{label}</span>
      <div className="flex-1 bg-green-900/60 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(100, value * 100)}%` }} />
      </div>
    </div>
  );
}
