import { execSync } from 'child_process';

export const runDiagnostics = () => {
  try {
    const ping = execSync('ping -c 3 8.8.8.8').toString();
    return {
      ping,
      status: 'ok'
    };
  } catch (e: any) {
    return {
      ping: e.message,
      status: 'error'
    };
  }
};
