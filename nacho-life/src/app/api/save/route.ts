import { NextRequest, NextResponse } from 'next/server';
import { dbLoadSave, dbWriteSave } from '@/lib/saveData';

export async function GET(req: NextRequest) {
  const browserId = req.nextUrl.searchParams.get('browserId');
  if (!browserId) return NextResponse.json({ error: 'Missing browserId' }, { status: 400 });
  const save = await dbLoadSave(browserId);
  return NextResponse.json({ save });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { browserId, player, jobHistory = [], emergencyExpenses = 0, totalRevenue = 0 } = body;
  if (!browserId || !player) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  await dbWriteSave({ browserId, player, jobHistory, emergencyExpenses, totalRevenue });
  return NextResponse.json({ ok: true });
}
