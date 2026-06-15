'use client';

import type { Location, TimeOfDay } from '@/types';

interface Props {
  location: Location;
  timeOfDay: TimeOfDay;
  onSetTime: (t: TimeOfDay) => void;
  balance: number;
  onStart: () => void;
  onBack: () => void;
}

const TIME_OPTIONS: { value: TimeOfDay; label: string; icon: string }[] = [
  { value: 'early_morning', label: 'Early Morning', icon: '🌄' },
  { value: 'morning',       label: 'Morning',        icon: '🌅' },
  { value: 'midday',        label: 'Midday',          icon: '☀️' },
  { value: 'afternoon',     label: 'Afternoon',       icon: '🌤️' },
  { value: 'evening',       label: 'Evening',         icon: '🌇' },
];

function heatLabel(index: number): { text: string; color: string } {
  if (index <= 0.7) return { text: 'Cool', color: 'text-blue-400' };
  if (index <= 1.0) return { text: 'Comfortable', color: 'text-green-400' };
  if (index <= 1.3) return { text: 'Warm', color: 'text-yellow-400' };
  if (index <= 1.6) return { text: 'Hot', color: 'text-orange-400' };
  return { text: 'Brutal', color: 'text-red-500' };
}

export default function JobLoadScreen({ location, timeOfDay, onSetTime, balance, onStart, onBack }: Props) {
  const heat = location.heatIndex[timeOfDay];
  const heatInfo = heatLabel(heat);

  return (
    <div className="min-h-screen bg-green-950 text-white flex flex-col p-6 max-w-lg mx-auto">
      <button onClick={onBack} className="text-green-400 text-sm mb-4 self-start hover:text-white transition-colors">
        ← Back to Map
      </button>

      <h2 className="text-3xl font-black text-yellow-300 mb-1">{location.town}, {location.state}</h2>
      <p className="text-green-400 text-sm mb-1 italic">{location.climate}</p>
      <p className="text-green-500 text-xs mb-6">
        Grass: <span className="text-white">{location.grassType.replace(/_/g, ' ')}</span>
        &nbsp;·&nbsp;
        Architecture: <span className="text-white">{location.architecture.replace(/_/g, ' ')}</span>
      </p>

      <h3 className="text-lg font-bold mb-3 text-yellow-200">Choose Start Time</h3>
      <div className="grid grid-cols-5 gap-2 mb-6">
        {TIME_OPTIONS.map((opt) => {
          const h = location.heatIndex[opt.value];
          const hi = heatLabel(h);
          return (
            <button
              key={opt.value}
              onClick={() => onSetTime(opt.value)}
              className={`
                flex flex-col items-center p-2 rounded-xl border-2 transition-all
                ${timeOfDay === opt.value
                  ? 'border-yellow-400 bg-green-700'
                  : 'border-green-700 bg-green-900/40 hover:border-green-500'}
              `}
            >
              <span className="text-xl">{opt.icon}</span>
              <span className="text-xs text-center leading-tight mt-1">{opt.label}</span>
              <span className={`text-xs font-bold mt-1 ${hi.color}`}>{hi.text}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-green-900/50 border border-green-700 rounded-xl p-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-green-300">Selected time</span>
          <span className="font-bold">{TIME_OPTIONS.find(t => t.value === timeOfDay)?.label}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-green-300">Stamina drain</span>
          <span className={`font-bold ${heatInfo.color}`}>{heatInfo.text} ({(heat * 100).toFixed(0)}%)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-300">Your balance</span>
          <span className="font-bold text-yellow-300">${balance.toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-green-950 font-black text-xl rounded-2xl transition-colors shadow-lg"
      >
        Start Mowing →
      </button>
    </div>
  );
}
