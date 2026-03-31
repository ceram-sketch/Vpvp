import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/storage/json-db';
import { fetchAndParseSub } from '@/lib/subscriptions/parser';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const subs = readDB('subscriptions.json', { urls: [], nodes: [] });
  return NextResponse.json(subs);
}

export async function POST(req: Request) {
  const { action, url, id } = await req.json();
  const subs = readDB('subscriptions.json', { urls: [], nodes: [] });

  if (action === 'add') {
    if (!subs.urls.includes(url)) {
      subs.urls.push(url);
      writeDB('subscriptions.json', subs);
    }
    return NextResponse.json({ success: true });
  }

  if (action === 'refresh') {
    let allNodes: any[] = [];
    for (const u of subs.urls) {
      try {
        const nodes = await fetchAndParseSub(u);
        allNodes = [...allNodes, ...nodes];
      } catch (e) {
        // Ignore failed
      }
    }
    subs.nodes = allNodes;
    writeDB('subscriptions.json', subs);
    return NextResponse.json({ success: true, nodes: allNodes });
  }

  if (action === 'delete') {
    subs.nodes = subs.nodes.filter((n: any) => n.id !== id);
    writeDB('subscriptions.json', subs);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
