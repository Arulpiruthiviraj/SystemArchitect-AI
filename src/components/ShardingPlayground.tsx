import React, { useState } from 'react';
import { Database, Hash, Send, Server, Info, AlertTriangle, CheckCircle2, ChevronRight, Search, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ShardingPlayground() {
  const [shardingStrategy, setShardingStrategy] = useState<'RANGE' | 'HASH' | 'GEO'>('HASH');
  const [shardsCount, setShardsCount] = useState(4);
  const [activeShard, setActiveShard] = useState<number | null>(null);
  const [searchId, setSearchId] = useState('');
  const [routingResult, setRoutingResult] = useState<number | null>(null);

  const calculateShard = () => {
    if (!searchId) return;
    
    let shardIdx = 0;
    if (shardingStrategy === 'HASH') {
      let hash = 0;
      for (let i = 0; i < searchId.length; i++) {
        hash = ((hash << 5) - hash) + searchId.charCodeAt(i);
        hash |= 0;
      }
      shardIdx = Math.abs(hash % shardsCount);
    } else if (shardingStrategy === 'RANGE') {
      // Range-based sharding: map alphabetical or numerical ranges
      const char = searchId[0]?.toUpperCase() || 'A';
      if (char >= '0' && char <= '9') {
        const val = parseInt(searchId) || 0;
        shardIdx = val % shardsCount;
      } else {
        const alphabetPos = char.charCodeAt(0) - 65; // A=0, Z=25
        const step = Math.ceil(26 / shardsCount);
        shardIdx = Math.min(shardsCount - 1, Math.max(0, Math.floor(alphabetPos / step)));
      }
    } else {
      // GEO-based sharding: check for geo indicators
      const idLower = searchId.toLowerCase();
      if (idLower.includes('eu') || idLower.includes('london') || idLower.includes('paris')) {
        shardIdx = 1 % shardsCount;
      } else if (idLower.includes('as') || idLower.includes('tokyo') || idLower.includes('singapore')) {
        shardIdx = Math.min(shardsCount - 1, 2 % shardsCount);
      } else {
        shardIdx = 0; // Default US/General
      }
    }

    setRoutingResult(shardIdx);
    setActiveShard(shardIdx);
    setTimeout(() => setRoutingResult(null), 3000);
  };

  return (
    <div className="p-8 bg-[#0A0A0B]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Hash className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Database Sharding Explorer</h3>
            <p className="text-xs text-gray-500 font-medium">Visualize data distribution across distributed database clusters</p>
          </div>
        </div>
        <div className="flex bg-[#111113] border border-[#27272A] rounded-xl p-1">
           {['HASH', 'RANGE', 'GEO'].map(s => (
              <button 
                key={s}
                onClick={() => setShardingStrategy(s as any)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-widest transition-all ${shardingStrategy === s ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {s}
              </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sharding Logic Controls */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Routing Configuration</h4>
              
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400">Shard Key Definition</label>
                    <div className="p-3 bg-black/40 rounded-xl border border-[#27272A] font-mono text-xs text-blue-400 flex items-center justify-between">
                       <span>user_id : UUID</span>
                       <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <label className="text-xs font-bold text-gray-400">Number of Shards</label>
                       <span className="text-xs font-bold text-blue-400">{shardsCount} Clusters</span>
                    </div>
                    <input 
                      type="range" 
                      min="2" 
                      max="16" 
                      value={shardsCount}
                      onChange={(e) => setShardsCount(parseInt(e.target.value))}
                      className="w-full accent-blue-500 bg-[#1A1A1D] h-1.5 rounded-full appearance-none" 
                    />
                 </div>

                 <div className="pt-4 border-t border-[#1F1F22] space-y-4">
                    <h5 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Router Simulator</h5>
                    <div className="relative">
                       <input 
                         type="text" 
                         placeholder="Enter User ID (e.g. 1042)..."
                         value={searchId}
                         onChange={(e) => setSearchId(e.target.value)}
                         className="w-full bg-[#1A1A1D] border border-[#27272A] rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                       />
                       <button 
                         onClick={calculateShard}
                         className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors"
                       >
                          <Send className="w-4 h-4" />
                       </button>
                    </div>
                    {routingResult !== null && (
                       <motion.div 
                         initial={{ opacity: 0, y: 5 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between"
                       >
                          <div className="flex items-center gap-2">
                             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                             <span className="text-xs text-emerald-100/90 font-medium">Routed to Shard #{routingResult + 1}</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-500/60">CRC32 Hash</span>
                       </motion.div>
                    )}
                 </div>
              </div>
           </div>

           <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                 <AlertTriangle className="w-4 h-4 text-amber-500" />
                 <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Sharding Caveats</h4>
              </div>
              <ul className="space-y-3">
                 <li className="text-[11px] text-amber-100/60 leading-relaxed">• Cross-shard joins are extremely expensive and should be avoided.</li>
                 <li className="text-[11px] text-amber-100/60 leading-relaxed">• Resharding (adding new shards) requires a complex data migration process.</li>
                 <li className="text-[11px] text-amber-100/60 leading-relaxed">• Hot spots can occur if the shard key is not evenly distributed.</li>
              </ul>
           </div>
        </div>

        {/* Shard Visualization */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
              {Array.from({ length: shardsCount }).map((_, i) => (
                 <motion.div 
                   key={i}
                   onHoverStart={() => setActiveShard(i)}
                   onHoverEnd={() => setActiveShard(null)}
                   className={`bg-[#111113] border-2 rounded-2xl p-5 flex flex-col transition-all duration-300 relative overflow-hidden group cursor-pointer ${activeShard === i ? 'border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)] scale-[1.02]' : 'border-[#27272A] hover:border-gray-700'}`}
                 >
                    {/* Active Glow */}
                    {activeShard === i && (
                       <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-2xl rounded-full" />
                    )}

                    <div className="flex items-center justify-between mb-4">
                       <div className={`p-2.5 rounded-xl ${activeShard === i ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-500'}`}>
                          <Database className="w-4 h-4" />
                       </div>
                       <span className="text-[10px] font-mono text-gray-600">v15.2</span>
                    </div>

                    <h5 className={`text-sm font-bold mb-1 ${activeShard === i ? 'text-white' : 'text-gray-400'}`}>Shard Cluster {i + 1}</h5>
                    <div className="flex items-center gap-2 mb-4">
                       <div className="flex-1 h-1.5 bg-[#1A1A1D] rounded-full overflow-hidden border border-[#27272A]">
                          <div className={`h-full rounded-full ${activeShard === i ? 'bg-blue-500' : 'bg-zinc-700'}`} style={{ width: `${Math.floor(Math.random() * 40 + 30)}%` }} />
                       </div>
                       <span className="text-[10px] font-bold text-gray-500">62%</span>
                    </div>

                    <div className="flex-1 space-y-2 mt-2">
                       {Array.from({ length: 4 }).map((_, j) => (
                          <div key={j} className={`h-2 rounded-sm ${activeShard === i ? 'bg-blue-500/20' : 'bg-[#1A1A1D]'} flex items-center justify-between px-2`}>
                             <div className={`w-12 h-0.5 rounded-full ${activeShard === i ? 'bg-blue-500/40' : 'bg-gray-800'}`} />
                             <div className={`w-4 h-0.5 rounded-full ${activeShard === i ? 'bg-blue-500/40' : 'bg-gray-800'}`} />
                          </div>
                       ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#1F1F22] flex items-center justify-between">
                       <div className="flex items-center gap-1">
                          <Server className="w-3 h-3 text-gray-600" />
                          <span className="text-[10px] text-gray-500">Primary + 2 RO</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3 text-emerald-500" />
                          <span className="text-[10px] text-emerald-500">4.2k Ops</span>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </div>

           {/* Shard Detail Detail */}
           <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <Info className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Shard Distribution Visualizer</h4>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-blue-500" />
                       <span className="text-[10px] text-gray-500 uppercase tracking-widest">Active Writes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" />
                       <span className="text-[10px] text-gray-500 uppercase tracking-widest">Replication</span>
                    </div>
                 </div>
              </div>
              
              <div className="h-24 bg-[#0A0A0B] rounded-xl border border-[#27272A] p-4 flex items-end gap-1 overflow-hidden">
                 {Array.from({ length: 60 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-t-sm transition-all duration-500 ${activeShard !== null && i % shardsCount === activeShard ? 'bg-blue-500 opacity-80' : 'bg-zinc-800 opacity-30'}`}
                      style={{ height: `${Math.random() * 80 + 10}%` }}
                    />
                 ))}
              </div>
              <p className="text-[10px] text-gray-600 mt-3 text-center uppercase tracking-widest">Partition Key Distribution over virtual shards (vnodes)</p>
           </div>
        </div>
      </div>
    </div>
  );
}
