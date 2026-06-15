'use client';

import type { Grade } from '@/types';
import { gradeColor } from '@/lib/grading';

interface Props {
  grade: Grade;
  payPercent: number;
  basePay: number;
  finalPay: number;
  cutAccuracy: number;
  missedPatches: number;
  obstacleHits: number;
  locationName: string;
  onContinue: () => void;
}

export default function GradeScreen({
  grade, payPercent, basePay, finalPay, cutAccuracy,
  missedPatches, obstacleHits, locationName, onContinue,
}: Props) {
  const color = gradeColor(grade);

  return (
    <div className="min-h-screen bg-green-950 text-white flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-bold text-green-400 mb-1">{locationName}</h2>
      <p className="text-green-500 text-sm mb-6">Customer Satisfaction Report</p>

      <div
        className="text-8xl font-black mb-2 drop-shadow-2xl"
        style={{ color }}
      >
        {grade}
      </div>
      <p className="text-green-400 mb-8">
        {grade.startsWith('A') ? 'Outstanding work!' :
         grade.startsWith('B') ? 'Good effort.' :
         grade.startsWith('C') ? 'Room to improve.' :
         grade.startsWith('D') ? 'Customer was unhappy.' :
         'The customer is furious.'}
      </p>

      <div className="w-full max-w-sm bg-green-900/60 border border-green-700 rounded-2xl p-5 space-y-3 mb-8">
        <Row label="Cut Accuracy" value={`${(cutAccuracy * 100).toFixed(1)}%`} />
        <Row label="Missed Patches" value={String(missedPatches)} />
        <Row label="Obstacle Hits" value={String(obstacleHits)} warn={obstacleHits > 0} />
        <div className="border-t border-green-700 pt-3 mt-3" />
        <Row label="Base Pay" value={`$${basePay.toFixed(2)}`} />
        <Row label="Pay Rate" value={`${(payPercent * 100).toFixed(0)}%`} />
        <Row label="You Earned" value={`$${finalPay.toFixed(2)}`} highlight />
      </div>

      <button
        onClick={onContinue}
        className="px-10 py-3 bg-yellow-500 hover:bg-yellow-400 text-green-950 font-black text-lg rounded-2xl transition-colors"
      >
        Collect & Continue →
      </button>
    </div>
  );
}

function Row({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-green-400">{label}</span>
      <span className={`font-bold ${highlight ? 'text-yellow-300' : warn ? 'text-red-400' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
