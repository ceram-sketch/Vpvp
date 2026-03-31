'use client';

import { useState, useEffect } from 'react';
import { PlaySquare, StopCircle, Activity, ShieldCheck, Terminal, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Tester() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});
  const [mode, setMode] = useState<'first' | 'all'>('first');

  useEffect(() => {
    fetch('/api/subscriptions')
      .then(res => res.json())
      .then(data => setNodes(data.nodes || []));
  }, []);

  const handleTest = async () => {
    if (nodes.length === 0) return alert('هیچ نودی برای تست وجود ندارد.');
    
    setIsTesting(true);
    setResults({});
    
    for (const node of nodes) {
      if (!isTesting) break; // Allow manual stop
      
      try {
        const res = await fetch('/api/tester', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ node, mode: 'direct' })
        });
        const data = await res.json();
        
        setResults(prev => ({ ...prev, [node.id]: data }));
        
        if (mode === 'first' && data.verdict === 'working') {
          break;
        }
      } catch (e) {
        setResults(prev => ({ ...prev, [node.id]: { verdict: 'failed', shortReason: 'Network Error' } }));
      }
    }
    
    setIsTesting(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-zinc-100">تستر هوشمند</h3>
          <p className="text-xs text-zinc-500">بررسی خودکار نودها</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input
              type="radio"
              checked={mode === 'first'}
              onChange={() => setMode('first')}
              className="text-emerald-500 focus:ring-emerald-500 bg-zinc-800 border-zinc-700"
            />
            توقف روی اولین نود سالم
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input
              type="radio"
              checked={mode === 'all'}
              onChange={() => setMode('all')}
              className="text-emerald-500 focus:ring-emerald-500 bg-zinc-800 border-zinc-700"
            />
            اسکن همه نودها
          </label>
        </div>

        <button
          onClick={() => isTesting ? setIsTesting(false) : handleTest()}
          className={`w-full py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            isTesting 
              ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' 
              : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-600'
          }`}
        >
          {isTesting ? (
            <>
              <StopCircle className="w-5 h-5" />
              توقف تست
            </>
          ) : (
            <>
              <PlaySquare className="w-5 h-5" />
              شروع تست ({nodes.length} نود)
            </>
          )}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {nodes.map(node => {
          const result = results[node.id];
          if (!result && !isTesting) return null; // Hide untested if not testing
          
          return (
            <div key={node.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex flex-col gap-1 overflow-hidden">
                <span className="text-sm font-medium text-zinc-300 truncate">{node.name}</span>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono" dir="ltr">
                  <span>{node.address}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {result ? (
                  result.verdict === 'working' ? (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-mono">{result.latencyMs}ms</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20" title={result.shortReason}>
                      <XCircle className="w-4 h-4" />
                      <span className="text-[10px] uppercase">Failed</span>
                    </div>
                  )
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-zinc-500 animate-spin" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
