import fs from 'fs';
import path from 'path';
import os from 'os';

const DB_DIR = path.join(os.homedir(), '.sasa-connect');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const readDB = (filename: string, defaultData: any = {}) => {
  const file = path.join(DB_DIR, filename);
  if (!fs.existsSync(file)) return defaultData;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return defaultData;
  }
};

export const writeDB = (filename: string, data: any) => {
  const file = path.join(DB_DIR, filename);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
};
