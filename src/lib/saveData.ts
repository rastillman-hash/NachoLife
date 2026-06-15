import { neon } from '@neondatabase/serverless';
import type { GameSave, PlayerStats } from '@/types';

function getBrowserId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('nacho_browser_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('nacho_browser_id', id);
  }
  return id;
}

export async function loadSave(): Promise<GameSave | null> {
  const browserId = getBrowserId();
  const res = await fetch(`/api/save?browserId=${browserId}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.save ?? null;
}

export async function writeSave(player: PlayerStats, extra: Partial<GameSave>): Promise<void> {
  const browserId = getBrowserId();
  await fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ browserId, player, ...extra }),
  });
}

// Server-side only — call from API route
export async function dbLoadSave(browserId: string): Promise<GameSave | null> {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT * FROM saves WHERE browser_id = ${browserId} LIMIT 1`;
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    browserId: row.browser_id,
    player: row.player_data,
    jobHistory: row.job_history,
    emergencyExpenses: row.emergency_expenses,
    totalRevenue: row.total_revenue,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function dbWriteSave(save: Omit<GameSave, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`
    INSERT INTO saves (browser_id, player_data, job_history, emergency_expenses, total_revenue, updated_at)
    VALUES (
      ${save.browserId},
      ${JSON.stringify(save.player)},
      ${JSON.stringify(save.jobHistory)},
      ${save.emergencyExpenses},
      ${save.totalRevenue},
      NOW()
    )
    ON CONFLICT (browser_id) DO UPDATE SET
      player_data        = EXCLUDED.player_data,
      job_history        = EXCLUDED.job_history,
      emergency_expenses = EXCLUDED.emergency_expenses,
      total_revenue      = EXCLUDED.total_revenue,
      updated_at         = NOW()
  `;
}
