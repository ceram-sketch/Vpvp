import { NextResponse } from 'next/server';
import { detectUpstream } from '@/lib/network/upstream';

export async function GET() {
  const upstream = await detectUpstream();
  return NextResponse.json(upstream);
}
