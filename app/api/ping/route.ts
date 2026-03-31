import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Ping 1.1.1.1 with 1 packet, timeout 2s
    const { stdout } = await execAsync('ping -c 1 -W 2 1.1.1.1');
    const match = stdout.match(/time=([\d.]+)\s*ms/);
    if (match && match[1]) {
      return NextResponse.json({ ping: `${match[1]} ms`, status: 'ok' });
    }
    return NextResponse.json({ ping: 'Error', status: 'error' });
  } catch (e) {
    return NextResponse.json({ ping: 'Timeout', status: 'error' });
  }
}
