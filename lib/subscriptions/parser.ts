import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const fetchAndParseSub = async (url: string) => {
  const res = await axios.get(url, { timeout: 10000 });
  const data = res.data;
  const decoded = Buffer.from(data, 'base64').toString('utf-8');
  const lines = decoded.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  
  const nodes = lines.map(line => {
    if (line.startsWith('vless://')) {
      return parseVless(line);
    }
    return null;
  }).filter(Boolean);
  
  return nodes;
};

const parseVless = (uri: string) => {
  try {
    const url = new URL(uri);
    const uuid = url.username;
    const address = url.hostname;
    const port = parseInt(url.port || '443', 10);
    const params = new URLSearchParams(url.search);
    
    return {
      id: uuidv4(),
      type: 'vless',
      name: decodeURIComponent(url.hash.replace('#', '')) || 'VLESS Node',
      address,
      port,
      uuid,
      flow: params.get('flow') || '',
      encryption: params.get('encryption') || 'none',
      network: params.get('type') || 'tcp',
      security: params.get('security') || 'none',
      sni: params.get('sni') || '',
      fp: params.get('fp') || '',
      pbk: params.get('pbk') || '',
      sid: params.get('sid') || '',
      raw: uri
    };
  } catch (e) {
    return null;
  }
};
