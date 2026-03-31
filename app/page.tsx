'use client';

import { useState, useEffect, useRef } from 'react';
import { Power, Settings, Activity, Save, RefreshCw, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

const DECOY_SNIS = [
  'www.yahoo.com',
  'www.speedtest.net',
  'discord.com',
  'gateway.icloud.com',
  'www.samsung.com',
  'addons.mozilla.org'
];

export default function SasaConnect() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'config' | 'logs'>('dashboard');
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [ping, setPing] = useState<string>('--');
  const [configText, setConfigText] = useState<string>('');
  const [logs, setLogs] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Poll status and logs
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/singbox?action=status');
        const data = await res.json();
        setStatus(data.status);
      } catch (e) {
        setStatus('disconnected');
      }
    };

    const fetchPing = async () => {
      if (status === 'connected') {
        try {
          const res = await fetch('/api/ping');
          const data = await res.json();
          setPing(data.ping);
        } catch (e) {
          setPing('Error');
        }
      } else {
        setPing('--');
      }
    };

    const fetchLogs = async () => {
      if (activeTab === 'logs' || status === 'connected') {
        try {
          const res = await fetch('/api/singbox?action=logs');
          const data = await res.json();
          setLogs(data.logs);
        } catch (e) {
          // Ignore
        }
      }
    };

    fetchStatus();
    fetchPing();
    fetchLogs();

    const interval = setInterval(() => {
      fetchStatus();
      fetchPing();
      fetchLogs();
    }, 3000);

    return () => clearInterval(interval);
  }, [status, activeTab]);

  // Load initial config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/singbox?action=get_config');
        const data = await res.json();
        if (data.config) {
          setConfigText(data.config);
        }
      } catch (e) {}
    };
    loadConfig();
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (activeTab === 'logs' && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  const handleToggleConnection = async () => {
    setErrorMsg('');
    setStatus('loading');
    try {
      if (status === 'connected') {
        await fetch('/api/singbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'stop' })
        });
        setStatus('disconnected');
      } else {
        const res = await fetch('/api/singbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'start' })
        });
        const data = await res.json();
        if (data.error) {
          setErrorMsg(data.error);
          setStatus('disconnected');
        } else {
          setStatus('connected');
        }
      }
    } catch (e) {
      setErrorMsg('خطا در برقراری ارتباط با سرور محلی.');
      setStatus('disconnected');
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      // Basic JSON validation
      JSON.parse(configText);
      
      const res = await fetch('/api/singbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_config', config: configText })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      alert('کانفیگ با موفقیت ذخیره شد.');
    } catch (e) {
      setErrorMsg('فرمت JSON نامعتبر است یا خطا در ذخیره‌سازی رخ داد.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInjectSNI = (sni: string) => {
    try {
      // Simple regex to replace server_name in REALITY config
      const updated = configText.replace(/"server_name":\s*"[^"]*"/g, `"server_name": "${sni}"`);
      setConfigText(updated);
    } catch (e) {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-5 h-5 text-zinc-950" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Sasa Connect</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-zinc-800/50 px-2 py-1 rounded-md border border-zinc-700/50">
            <span className="text-zinc-400">Ping:</span>
            <span className={ping === 'Error' || ping === 'Timeout' ? 'text-red-400' : 'text-emerald-400'}>{ping}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 pb-24">
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-right" dir="rtl">
            {errorMsg}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            {/* Big Power Button */}
            <div className="relative mb-12">
              {/* Pulse effect when connected */}
              {status === 'connected' && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-emerald-500/20"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              
              <button
                onClick={handleToggleConnection}
                disabled={status === 'loading'}
                className={`relative z-10 w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                  status === 'connected' 
                    ? 'bg-emerald-500 shadow-emerald-500/40 text-zinc-950 hover:bg-emerald-400' 
                    : status === 'loading'
                    ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                    : 'bg-zinc-800 shadow-black/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700/50'
                }`}
              >
                <Power className={`w-16 h-16 ${status === 'loading' ? 'animate-pulse' : ''}`} />
              </button>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {status === 'connected' ? 'متصل' : status === 'loading' ? 'در حال بررسی...' : 'قطع'}
              </h2>
              <p className="text-zinc-400 text-sm" dir="rtl">
                {status === 'connected' 
                  ? 'ترافیک شما در حال عبور از تونل REALITY است.' 
                  : 'برای اتصال به اینترنت آزاد دکمه بالا را لمس کنید.'}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="w-full grid grid-cols-2 gap-4 mt-12">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-zinc-400">پروتکل</span>
                <span className="font-mono text-sm">VLESS+REALITY</span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-zinc-400">هسته</span>
                <span className="font-mono text-sm">sing-box</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'config' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            dir="rtl"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                کانفیگ JSON (sing-box)
              </label>
              <textarea
                value={configText}
                onChange={(e) => setConfigText(e.target.value)}
                placeholder="کانفیگ VLESS + REALITY خود را اینجا Paste کنید..."
                className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm font-mono text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                dir="ltr"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300">تغییر سریع SNI (Decoy)</label>
              <div className="flex flex-wrap gap-2" dir="ltr">
                {DECOY_SNIS.map(sni => (
                  <button
                    key={sni}
                    onClick={() => handleInjectSNI(sni)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-mono transition-colors"
                  >
                    {sni}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-500">
                * با کلیک روی هر SNI، مقدار <code className="text-zinc-400">server_name</code> در کانفیگ شما جایگزین می‌شود.
              </p>
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={isSaving || !configText.trim()}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              ذخیره کانفیگ
            </button>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between" dir="rtl">
              <h3 className="text-sm font-medium text-zinc-300">لاگ‌های sing-box</h3>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-zinc-500">Live</span>
              </div>
            </div>
            <div className="w-full h-[60vh] bg-zinc-950 border border-zinc-800 rounded-xl p-4 overflow-y-auto font-mono text-xs text-zinc-400 leading-relaxed">
              {logs ? (
                <pre className="whitespace-pre-wrap break-all">{logs}</pre>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600">
                  لاگی برای نمایش وجود ندارد.
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
          </motion.div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800 pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-around p-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 p-2 w-20 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Power className="w-6 h-6" />
            <span className="text-[10px] font-medium">داشبورد</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex flex-col items-center gap-1 p-2 w-20 rounded-xl transition-colors ${activeTab === 'config' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-medium">کانفیگ</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex flex-col items-center gap-1 p-2 w-20 rounded-xl transition-colors ${activeTab === 'logs' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Terminal className="w-6 h-6" />
            <span className="text-[10px] font-medium">لاگ‌ها</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
