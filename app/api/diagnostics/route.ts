import { NextResponse } from 'next/server';
import { runDiagnostics } from '@/lib/network/diagnostics';

export async function GET() {
  const result = runDiagnostics();
  return NextResponse.json(result);
}
