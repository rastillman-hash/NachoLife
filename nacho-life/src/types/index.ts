export type Character = 'nacho' | 'stilly';

export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F';

export type Difficulty = 'starter' | 'normal' | 'hard' | 'advanced' | 'expert';

export type GrassType =
  | 'tall_fescue'
  | 'kentucky_bluegrass'
  | 'bermuda'
  | 'buffalo'
  | 'st_augustine'
  | 'zoysia'
  | 'fine_fescue'
  | 'alpine_meadow'
  | 'desert_scrub';

export type ArchitectureStyle =
  | 'mountain_cabin'
  | 'log_cabin'
  | 'craftsman'
  | 'farmhouse'
  | 'colonial'
  | 'german_limestone'
  | 'texas_ranch'
  | 'creole_cottage'
  | 'victorian'
  | 'southern_plantation'
  | 'ozark_stone'
  | 'brick_victorian'
  | 'clapboard'
  | 'grand_victorian'
  | 'antebellum'
  | 'timber_lodge'
  | 'adobe_pueblo'
  | 'mountain_chalet'
  | 'southwest_adobe'
  | 'luxury_lodge'
  | 'coastal_craftsman'
  | 'pacific_cottage'
  | 'storybook_cottage'
  | 'dutch_colonial'
  | 'victorian_sea_captain';

export type WealthTier = 'mid' | 'mid_upper' | 'upper_mid' | 'upper' | 'wealthy';

export type TimeOfDay = 'early_morning' | 'morning' | 'midday' | 'afternoon' | 'evening';

export type MowerTier = 1 | 2 | 3 | 4; // push reel → gas self-propelled → zero-turn → commercial riding
export type WeedEaterTier = 1 | 2 | 3 | 4; // scythe → corded → simple cordless → high-end industrial

export interface MowerStats {
  tier: MowerTier;
  name: string;
  speed: number;          // pixels per second
  cutWidth: number;       // pixels wide
  staminaDrain: number;   // per second multiplier
  lineTolerance: number;  // how forgiving the Cut Confidence meter is
  cutQuality: number;     // base quality multiplier (0–1)
  color: string;
  unlockCost: number;
}

export interface WeedEaterStats {
  tier: WeedEaterTier;
  name: string;
  speed: number;
  trimWidth: number;
  staminaDrain: number;
  unlockCost: number;
  color: string;
}

export interface Location {
  id: string;
  town: string;
  state: string;
  region: RegionId;
  grassType: GrassType;
  architecture: ArchitectureStyle;
  wealthTier: WealthTier;
  difficulty: Difficulty;
  climate: string;        // short description for time-of-day stamina modifier
  ambientSounds: string[];
  heatIndex: Record<TimeOfDay, number>; // stamina drain multiplier
}

export type RegionId = 'appalachian' | 'hill_country' | 'ozark_midwest' | 'rocky_mountain' | 'pacific_coast';

export interface Region {
  id: RegionId;
  name: string;
  difficulty: Difficulty;
  locations: string[];    // location ids
  unlockRequirement: number; // yards completed before this region is accessible
}

export interface PlayerStats {
  character: Character;
  balance: number;
  yardsCompleted: number;
  currentRegion: RegionId | null;
  currentHomeLocationId: string | null;
  ownedHomes: OwnedHome[];
  mower: MowerTier;
  weedEater: WeedEaterTier;
  mowerColor: string;
  weedEaterColor: string;
  inventory: InventoryItem[];
  completedLocationSets: RegionId[];
  unlockedRegions: RegionId[];
  tutorialComplete: boolean;
}

export interface OwnedHome {
  locationId: string;
  purchasePrice: number;
  currentValue: number;
  upgrades: HomeUpgrade[];
  rentalIncome: number;
  isCurrentHub: boolean;
  exteriorColor: string;
  interiorStyle: InteriorStyle | null;
}

export type InteriorStyle = 'default' | 'bohemian' | 'modern' | 'rustic' | 'coastal' | 'farmhouse';

export interface HomeUpgrade {
  category: 'garage' | 'shed' | 'bigger_lot' | 'appliances' | 'landscaping' | 'siding_roofing' | 'exterior_paint' | 'shutters';
  level: number;
  color?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  staminaRestore: number;
  hydrationRestore: number;
  speedBoost?: number;
  duration?: number;
}

export interface JobResult {
  locationId: string;
  grade: Grade;
  payPercent: number;
  basePay: number;
  finalPay: number;
  cutAccuracy: number;
  missedPatches: number;
  obstacleHits: number;
  timeBonus: boolean;
}

export interface GameSave {
  id: string;
  browserId: string;
  player: PlayerStats;
  jobHistory: JobResult[];
  emergencyExpenses: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}
