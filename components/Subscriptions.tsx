'use client';

import { useState, useEffect } from 'react';
import { Layers, Plus, RefreshCw, Trash2, Link as LinkIcon, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Subscriptions() {
  const [url, setUrl] = useState('');
  const [subs, setSubs] = useState<{ urls: string[], nodes: any[] }>({ urls: [], nodes: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchSubs();
  }, []);

  const fetchSubs = async () => {
    const res = await fetch('/api/subscriptions');
    const data = await res.json();
    setSubs(data);
  };

  const handleAdd = async () => {
    if (!url) return;
    setIsLoading(true);
    await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', url })
    });
    setUrl('');
    await fetchSubs();
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'refresh' })
    });
    await fetchSubs();
    setIsRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id })
    });
    await fetchSubs();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-zinc-100">اشتراک‌ها</h3>
          <p className="text-xs text-zinc-500">مدیریت لینک‌های VLESS</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Add URL */}
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="لینک اشتراک (vless://... یا http://...)"
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50"
          dir="ltr"
        />
        <button
          onClick={handleAdd}
          disabled={isLoading || !url}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {/* URLs List */}
      {subs.urls.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-400">لینک‌های فعال</h4>
          <div className="space-y-2">
            {subs.urls.map((u, i) => (
              <div key={i} className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
                <LinkIcon className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="text-xs text-zinc-400 font-mono truncate flex-1" dir="ltr">{u}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nodes List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-zinc-400">نودها ({subs.nodes?.length || 0})</h4>
        </div>
        
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          <AnimatePresence>
            {subs.nodes?.map((node) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 flex items-center justify-between group hover:border-zinc-700 transition-colors"
              >
                <div className="flex flex-col gap-1 overflow-hidden">
                  <span className="text-sm font-medium text-zinc-300 truncate">{node.name}</span>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono" dir="ltr">
                    <span>{node.address}:{node.port}</span>
                    <span>•</span>
                    <span>{node.network}</span>
                    <span>•</span>
                    <span className="text-emerald-500/70">{node.security}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(node.id)}
                  className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {(!subs.nodes || subs.nodes.length === 0) && (
            <div className="text-center py-8 text-zinc-600 text-sm">
              هیچ نودی یافت نشد. لطفاً لینک اشتراک اضافه کنید و رفرش کنید.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
