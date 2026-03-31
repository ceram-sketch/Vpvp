import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);
const CONFIG_DIR = path.join(os.homedir(), '.sasa-connect');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');
const LOG_PATH = path.join(CONFIG_DIR, 'singbox.log');

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  try {
    if (action === 'status') {
      try {
        // In Termux, killall -0 checks if process exists
        await execAsync('killall -0 sing-box');
        return NextResponse.json({ status: 'connected' });
      } catch (e) {
        return NextResponse.json({ status: 'disconnected' });
      }
    }
    
    if (action === 'logs') {
      if (fs.existsSync(LOG_PATH)) {
        const logs = fs.readFileSync(LOG_PATH, 'utf-8');
        // Return last 50 lines
        const lines = logs.split('\n').slice(-50).join('\n');
        return NextResponse.json({ logs: lines });
      }
      return NextResponse.json({ logs: 'لاگی یافت نشد. (No logs)' });
    }
    
    if (action === 'get_config') {
      if (fs.existsSync(CONFIG_PATH)) {
        return NextResponse.json({ config: fs.readFileSync(CONFIG_PATH, 'utf-8') });
      }
      return NextResponse.json({ config: '' });
    }
    
    return NextResponse.json({ error: 'عملیات نامعتبر' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ status: 'disconnected', error: String(e) });
  }
}

export async function POST(req: Request) {
  try {
    const { action, config } = await req.json();

    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    if (action === 'save_config') {
      fs.writeFileSync(CONFIG_PATH, config);
      return NextResponse.json({ success: true });
    }

    if (action === 'start') {
      // Kill existing sing-box if any
      try { await execAsync('killall sing-box'); } catch (e) {}
      
      if (!fs.existsSync(CONFIG_PATH)) {
        return NextResponse.json({ error: 'کانفیگ یافت نشد. ابتدا کانفیگ را ذخیره کنید.' }, { status: 400 });
      }
      
      // Run sing-box in background
      const cmd = `nohup sing-box run -c ${CONFIG_PATH} > ${LOG_PATH} 2>&1 &`;
      await execAsync(cmd);
      return NextResponse.json({ success: true });
    }

    if (action === 'stop') {
      try { await execAsync('killall sing-box'); } catch (e) {}
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'عملیات نامعتبر' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
