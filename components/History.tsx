'use client';

import { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Activity, ShieldCheck, Terminal, Download, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function History() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'working' | 'failed'>('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      // Sort by newest first
      setHistory((data.history || []).sort((a: any, b: any) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()));
    } catch (e) {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('آیا از پاک کردن تاریخچه مطمئن هستید؟')) return;
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
      });
      fetchHistory();
    } catch (e) {
      alert('خطا در پاک کردن تاریخچه');
    }
  };

  const exportHistory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `sasa_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const filteredHistory = history.filter(h => {
    if (filter === 'working') return h.verdict.startsWith('working');
    if (filter === 'failed') return !h.verdict.startsWith('working');
    return true;
  });

  const getVerdictColor = (verdict: string) => {
    if (verdict.startsWith('working_direct')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (verdict.startsWith('working')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-zinc-100">تاریخچه تست‌ها</h3>
          <p className="text-xs text-zinc-500">سوابق بررسی و اتصال نودها</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportHistory}
            className="p-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 transition-colors"
            title="خروجی JSON"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={clearHistory}
            className="p-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-red-400 transition-colors"
            title="پاک کردن همه"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={fetchHistory}
            disabled={isLoading}
            className="p-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-emerald-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-zinc-800 text-zinc-200 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          همه
        </button>
        <button
          onClick={() => setFilter('working')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'working' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          موفق
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'failed' ? 'bg-red-500/20 text-red-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          ناموفق
        </button>
      </div>

      {/* History List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredHistory.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 group hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.verdict.startsWith('working') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                  <span className="text-sm font-bold text-zinc-200 font-mono" dir="ltr">
                    {new Date(item.startedAt).toLocaleString('fa-IR')}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-lg border uppercase font-mono ${getVerdictColor(item.verdict)}`}>
                  {item.verdict}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 bg-zinc-950/50 p-2 rounded-xl border border-zinc-800/50">
                  <Activity className="w-3 h-3 text-blue-400" />
                  <span className="font-mono">{item.latencyMs > 0 ? `${item.latencyMs}ms` : '--'}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 bg-zinc-950/50 p-2 rounded-xl border border-zinc-800/50">
                  <ShieldCheck className="w-3 h-3 text-purple-400" />
                  <span className="font-mono">Stage {item.stage}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 bg-zinc-950/50 p-2 rounded-xl border border-zinc-800/50">
                  <Terminal className="w-3 h-3 text-orange-400" />
                  <span className="font-mono">{item.mode}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 bg-zinc-950/50 p-2 rounded-xl border border-zinc-800/50">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span className="font-mono">{item.durationMs}ms</span>
                </div>
              </div>

              {item.shortReason && (
                <div className="text-[10px] text-zinc-500 font-mono bg-zinc-950/30 p-2 rounded-lg border border-zinc-800/30 truncate" dir="ltr">
                  {item.shortReason}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredHistory.length === 0 && (
          <div className="p-12 text-center text-zinc-600 flex flex-col items-center gap-2">
            <AlertCircle className="w-12 h-12 opacity-10" />
            <span>تاریخچه‌ای یافت نشد.</span>
          </div>
        )}
      </div>
    </div>
  );
}
