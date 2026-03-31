import { buildConfig } from '../singbox/config-builder';
import { startSingbox, stopSingbox } from '../process/manager';
import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';

const DB_DIR = path.join(os.homedir(), '.sasa-connect');
const TEST_CONFIG = path.join(DB_DIR, 'test_config.json');

export const testNode = async (node: any, upstreamProxy?: any) => {
  const config = buildConfig(node, upstreamProxy);
  fs.writeFileSync(TEST_CONFIG, JSON.stringify(config, null, 2), 'utf-8');
  
  await startSingbox(TEST_CONFIG);
  
  // Wait for sing-box to start
  await new Promise(r => setTimeout(r, 2000));
  
  const agent = new SocksProxyAgent('socks5://127.0.0.1:2080');
  const start = Date.now();
  
  try {
    await axios.get('https://www.google.com/generate_204', {
      httpAgent: agent,
      httpsAgent: agent,
      timeout: 5000
    });
    const latency = Date.now() - start;
    await stopSingbox();
    return { verdict: 'working', latencyMs: latency, stage: 1, mode: 'direct' };
  } catch (e: any) {
    await stopSingbox();
    return { verdict: 'failed', latencyMs: 0, stage: 1, mode: 'direct', shortReason: e.message };
  }
};
