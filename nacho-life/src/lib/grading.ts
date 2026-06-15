import type { Grade } from '@/types';

export function calculateGrade(accuracy: number): Grade {
  if (accuracy >= 0.97) return 'A+';
  if (accuracy >= 0.93) return 'A';
  if (accuracy >= 0.90) return 'A-';
  if (accuracy >= 0.87) return 'B+';
  if (accuracy >= 0.83) return 'B';
  if (accuracy >= 0.80) return 'B-';
  if (accuracy >= 0.77) return 'C+';
  if (accuracy >= 0.73) return 'C';
  if (accuracy >= 0.70) return 'C-';
  if (accuracy >= 0.67) return 'D+';
  if (accuracy >= 0.63) return 'D';
  if (accuracy >= 0.60) return 'D-';
  return 'F';
}

export function gradeToPayPercent(grade: Grade): number {
  const map: Record<Grade, number> = {
    'A+': 1.00,
    'A':  0.95,
    'A-': 0.90,
    'B+': 0.85,
    'B':  0.78,
    'B-': 0.72,
    'C+': 0.65,
    'C':  0.55,
    'C-': 0.45,
    'D+': 0.35,
    'D':  0.22,
    'D-': 0.12,
    'F':  0.05,
  };
  return map[grade];
}

export function gradeColor(grade: Grade): string {
  if (grade.startsWith('A')) return '#16a34a';
  if (grade.startsWith('B')) return '#2563eb';
  if (grade.startsWith('C')) return '#d97706';
  if (grade.startsWith('D')) return '#dc2626';
  return '#7f1d1d';
}

// Base pay per yard by wealth tier
export const BASE_PAY: Record<string, number> = {
  mid: 45,
  mid_upper: 65,
  upper_mid: 90,
  upper: 135,
  wealthy: 220,
};
