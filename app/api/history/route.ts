import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/storage/json-db';

export async function GET() {
  const history = readDB('history.json', { history: [] });
  return NextResponse.json(history);
}

export async function POST(req: Request) {
  const { action } = await req.json();
  if (action === 'clear') {
    writeDB('history.json', { history: [] });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
