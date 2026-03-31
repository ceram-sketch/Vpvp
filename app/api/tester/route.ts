import { NextResponse } from 'next/server';
import { testNode } from '@/lib/testing/runner';
import { detectUpstream } from '@/lib/network/upstream';
import { readDB, writeDB } from '@/lib/storage/json-db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const { node, mode } = await req.json();
  
  try {
    const upstream = await detectUpstream();
    const result = await testNode(node, upstream);
    
    // Save to history
    const history = readDB('history.json', { history: [] });
    history.history.push({
      id: uuidv4(),
      nodeId: node.id,
      nodeName: node.name,
      startedAt: new Date().toISOString(),
      ...result
    });
    // Keep last 100
    if (history.history.length > 100) history.history.shift();
    writeDB('history.json', history);
    
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
