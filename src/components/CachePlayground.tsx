import React, { useState } from 'react';
import { Database, Zap, Clock, Shield, XCircle, CheckCircle2, RotateCcw, AlertTriangle, ArrowRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CachePlayground() {
  const [cacheSize, setCacheSize] = useState(100);
  const [cacheTtl, setCacheTtl] = useState(60);
  const [logs, setLogs] = useState<{ id: number; key: string; status: 'HIT' | 'MISS'; time: string }[]>([]);
  const [cacheItems, setCacheItems] = useState<{ key: string; value: string; expiresAt: number }[]>([]);

  const simulateRequest = () => {
    const keys = ['user:1042', 'product:992', 'config:global', 'cart:441', 'user:881'];
    const key = keys[Math.floor(Math.random() * keys.length)];
    
    const now = Date.now();
    const existing = cacheItems.find(item => item.key === key);
    
    let status: 'HIT' | 'MISS' = 'MISS';
    let newItems = [...cacheItems];

    if (existing && existing.expiresAt > now) {
      status = 'HIT';
    } else {
      status = 'MISS';
      if (existing) {
         newItems = newItems.filter(i => i.key !== key);
      }
      if (newItems.length >= cacheSize) {
         newItems.shift(); // Evict oldest (simple LRU for demo)
      }
      newItems.push({ key, value: 'data_blob', expiresAt: now + cacheTtl * 1000 });
      setCacheItems(newItems);
    }

    setLogs(prev => [
      { id: Date.now(), key, status, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9)
    ]);
  };

  const clearCache = () => {
    setCacheItems([]);
    setLogs([]);
  };

  return (
    <div className="p-8 bg-[#0A0A0B] h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Cache Simulator</h3>
            <p className="text-xs text-gray-500 font-medium">Observe cache hits, misses, TTLs, and evictions</p>
          </div>
        </div>
        <button onClick={clearCache} className="px-4 py-2 bg-[#1A1A1D] border border-[#27272A] rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2">
           <Trash2 className="w-3.5 h-3.5" /> Purge Cache
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
         {/* Controls */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6">
               <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Cache Configuration</h4>
               
               <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-400 flex items-center gap-2">
                         <Database className="w-3.5 h-3.5" /> Max Keys (LRU)
                      </label>
                      <span className="text-xs font-bold text-emerald-400">{cacheSize}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="20" 
                      value={cacheSize}
                      onChange={(e) => setCacheSize(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 bg-[#1A1A1D] h-1.5 rounded-full appearance-none" 
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-400 flex items-center gap-2">
                         <Clock className="w-3.5 h-3.5" /> TTL (Seconds)
                      </label>
                      <span className="text-xs font-bold text-emerald-400">{cacheTtl}s</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="120" 
                      value={cacheTtl}
                      onChange={(e) => setCacheTtl(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 bg-[#1A1A1D] h-1.5 rounded-full appearance-none" 
                    />
                  </div>

                  <button onClick={simulateRequest} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-4">
                     <ArrowRight className="w-4 h-4" /> Simulate Request
                  </button>
               </div>
            </div>

            <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6 flex-1 flex flex-col">
               <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Request Log</h4>
               <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <AnimatePresence mode="popLayout">
                     {logs.map((log) => (
                        <motion.div 
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-2 rounded-lg border border-[#1F1F22] bg-[#0A0A0B]"
                        >
                           <div className="flex items-center gap-3">
                              {log.status === 'HIT' ? (
                                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                 <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className="text-xs font-mono text-gray-300">{log.key}</span>
                           </div>
                           <span className={`text-[10px] font-bold ${log.status === 'HIT' ? 'text-emerald-500' : 'text-red-500'}`}>
                              {log.status}
                           </span>
                        </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            </div>
         </div>

         {/* Visualizer */}
         <div className="lg:col-span-8 bg-[#111113] border border-[#27272A] rounded-2xl p-6 relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Memory Store Visualizer</h4>
               <span className="text-xs text-gray-400 font-mono">Used: {cacheItems.length} / {cacheSize} slots</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2 content-start">
               <AnimatePresence>
                  {cacheItems.map((item) => (
                     <motion.div 
                       key={item.key}
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.8 }}
                       className="p-4 bg-[#0A0A0B] border border-emerald-500/30 rounded-xl relative overflow-hidden group"
                     >
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#1F1F22]">
                           <div className="h-full bg-emerald-500" style={{ width: '100%', animation: `shrink ${cacheTtl}s linear forwards` }} />
                        </div>
                        <style>{`
                          @keyframes shrink {
                            from { width: 100%; }
                            to { width: 0%; }
                          }
                        `}</style>
                        <div className="mt-2 text-xs font-mono font-bold text-white truncate">{item.key}</div>
                        <div className="mt-1 text-[10px] text-gray-500 flex items-center gap-1">
                           <Clock className="w-3 h-3" /> TTL Active
                        </div>
                     </motion.div>
                  ))}
               </AnimatePresence>
               
               {/* Empty Slots */}
               {Array.from({ length: Math.max(0, cacheSize - cacheItems.length) }).slice(0, 16).map((_, i) => (
                  <div key={`empty-${i}`} className="p-4 bg-[#0A0A0B]/50 border border-[#1F1F22] border-dashed rounded-xl flex items-center justify-center">
                     <span className="text-[10px] text-gray-600 font-mono">EMPTY</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
