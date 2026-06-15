import type { Character } from '@/types';

export interface CharacterConfig {
  id: Character;
  name: string;
  fullName: string;
  description: string;
  mowSpeed: number;          // base pixels/sec multiplier
  precision: number;         // base Cut Confidence bonus
  variance: number;          // how much outcomes swing (higher = more variable)
  staminaMax: number;
  hydrationMax: number;
  equipmentDiscountRate: number;  // cheaper equipment unlocks (as decimal %)
  itemDiscountRate: number;       // cheaper consumable items
  equipmentUnlockBonus: number;   // yards sooner than standard to unlock equipment
  itemUnlockBonus: number;        // yards sooner to unlock items
  portrait: string;               // placeholder color for portrait
}

export const CHARACTERS: Record<Character, CharacterConfig> = {
  nacho: {
    id: 'nacho',
    name: 'Nacho',
    fullName: 'Ignacio "Nacho" Reyes',
    description:
      'Nacho takes his time and does it right. His methodical approach earns consistently high grades and unlocks premium mower upgrades earlier than anyone else. He runs a little slow, but customers notice the difference.',
    mowSpeed: 0.80,
    precision: 1.20,
    variance: 0.05,
    staminaMax: 100,
    hydrationMax: 100,
    equipmentDiscountRate: 0.10,
    itemDiscountRate: 0.0,
    equipmentUnlockBonus: 2,
    itemUnlockBonus: 0,
    portrait: '#78350F',
  },
  stilly: {
    id: 'stilly',
    name: 'Stilly',
    fullName: 'Stilly Reyes',
    description:
      'Stilly gets the job done fast — customers love the quick turnaround. He\'s accurate on average but swings wide in both directions. He stocks up on items better and cheaper, though his equipment choices aren\'t always the best.',
    mowSpeed: 1.20,
    precision: 0.90,
    variance: 0.18,
    staminaMax: 110,
    hydrationMax: 90,
    equipmentDiscountRate: 0.0,
    itemDiscountRate: 0.12,
    equipmentUnlockBonus: 0,
    itemUnlockBonus: 2,
    portrait: '#F5F5DC',
  },
};
