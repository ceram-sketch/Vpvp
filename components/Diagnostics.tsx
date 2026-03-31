'use client';

import { useState } from 'react';
import { Stethoscope, Activity, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Diagnostics() {
  const [diag, setDiag] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiag = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/diagnostics');
      const data = await res.json();
      setDiag(data);
    } catch (e) {
      setDiag({ status: 'error', ping: 'Failed to run diagnostics' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-zinc-100">عیب‌یابی شبکه</h3>
          <p className="text-xs text-zinc-500">بررسی وضعیت اینترنت و DNS</p>
        </div>
        <button
          onClick={runDiag}
          disabled={isLoading}
          className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${diag?.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {diag?.status === 'ok' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-200">وضعیت پینگ (8.8.8.8)</span>
            <span className="text-xs text-zinc-500">{diag?.status === 'ok' ? 'ارتباط برقرار است' : 'ارتباط قطع است'}</span>
          </div>
        </div>
        
        {diag?.ping && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-[10px] text-zinc-400 overflow-x-auto whitespace-pre-wrap" dir="ltr">
            {diag.ping}
          </div>
        )}
      </div>
      
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex items-center justify-center text-zinc-500 text-sm">
        <Stethoscope className="w-4 h-4 ml-2 opacity-50" />
        امکانات بیشتر عیب‌یابی به زودی اضافه می‌شود...
      </div>
    </div>
  );
}
