import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const DB_DIR = path.join(os.homedir(), '.sasa-connect');
const PID_FILE = path.join(DB_DIR, 'singbox.pid');
const LOG_FILE = path.join(DB_DIR, 'singbox.log');

export const startSingbox = async (configPath: string): Promise<void> => {
  await stopSingbox();
  
  const out = fs.openSync(LOG_FILE, 'a');
  const err = fs.openSync(LOG_FILE, 'a');

  const child = spawn('sing-box', ['run', '-c', configPath], {
    detached: true,
    stdio: ['ignore', out, err]
  });

  if (child.pid) {
    fs.writeFileSync(PID_FILE, child.pid.toString(), 'utf-8');
  }
  child.unref();
};

export const stopSingbox = async (): Promise<void> => {
  if (fs.existsSync(PID_FILE)) {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8'), 10);
    try {
      process.kill(pid, 'SIGTERM');
    } catch (e) {
      // Process might not exist
    }
    fs.unlinkSync(PID_FILE);
  }
};

export const getSingboxStatus = (): boolean => {
  if (fs.existsSync(PID_FILE)) {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8'), 10);
    try {
      process.kill(pid, 0); // Check if process exists
      return true;
    } catch (e) {
      fs.unlinkSync(PID_FILE);
      return false;
    }
  }
  return false;
};

export const getSingboxLogs = (): string => {
  if (fs.existsSync(LOG_FILE)) {
    const logs = fs.readFileSync(LOG_FILE, 'utf-8');
    // Return last 100 lines
    return logs.split('\n').slice(-100).join('\n');
  }
  return '';
};
