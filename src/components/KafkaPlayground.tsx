import React, { useState } from 'react';
import { Layers, Database, Activity, Clock, Zap, ArrowRight, Settings, Info, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function KafkaPlayground() {
  const [activeTopic, setActiveTopic] = useState('orders.created');
  
  const topics = [
    { name: 'orders.created', partitions: 3, messages: 14205, throughput: '1.2k msg/s' },
    { name: 'payments.processed', partitions: 2, messages: 8530, throughput: '950 msg/s' },
    { name: 'inventory.reserved', partitions: 3, messages: 14190, throughput: '1.1k msg/s' }
  ];

  return (
    <div className="p-8 bg-[#0A0A0B] h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Kafka Cluster Inspector</h3>
            <p className="text-xs text-gray-500 font-medium">Real-time message streaming & partition visualization</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 text-xs font-bold">
              <Activity className="w-3.5 h-3.5" /> Cluster Healthy (3/3 Brokers)
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Topics List */}
         <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Topics</h4>
            {topics.map(t => (
               <button 
                 key={t.name}
                 onClick={() => setActiveTopic(t.name)}
                 className={`w-full text-left p-4 rounded-xl border transition-all ${
                   activeTopic === t.name 
                     ? 'bg-[#111113] border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.1)]' 
                     : 'bg-[#111113] border-[#27272A] hover:border-gray-600'
                 }`}
               >
                  <div className="flex justify-between items-start mb-2">
                     <span className={`font-mono text-sm font-bold ${activeTopic === t.name ? 'text-indigo-400' : 'text-gray-300'}`}>{t.name}</span>
                     <span className="text-[10px] bg-[#1A1A1D] px-1.5 py-0.5 rounded text-gray-400">{t.partitions}P</span>
                  </div>
                  <div className="flex justify-between items-end">
                     <div className="text-xs text-gray-500 flex items-center gap-1"><Database className="w-3 h-3" /> {t.messages.toLocaleString()}</div>
                     <div className="text-[10px] text-emerald-500 flex items-center gap-1"><Zap className="w-3 h-3" /> {t.throughput}</div>
                  </div>
               </button>
            ))}
         </div>

         {/* Topic Detail & Partitions */}
         <div className="lg:col-span-9 bg-[#111113] border border-[#27272A] rounded-2xl p-6 relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h2 className="text-xl font-bold font-mono text-white mb-2">{activeTopic}</h2>
                  <div className="flex gap-4 text-xs text-gray-400">
                     <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Retention: 7 Days</span>
                     <span className="flex items-center gap-1"><Settings className="w-3.5 h-3.5" /> Replication Factor: 3</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-2">
                 <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Consumer Groups</div>
                    <div className="text-sm font-bold text-indigo-400 mt-1">inventory-worker, analytics-agg</div>
                 </div>
               </div>
            </div>

            {/* Partitions Visualization */}
            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
               {[0, 1, 2].map((partition) => (
                  <div key={partition} className="bg-[#0A0A0B] border border-[#1F1F22] rounded-xl p-4">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <span className="px-2 py-1 bg-zinc-800 rounded font-mono text-xs text-white font-bold">Partition {partition}</span>
                           <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Leader: Broker {partition + 1}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 flex gap-4 font-mono">
                           <span>Log End Offset: <span className="text-emerald-400">4,5{partition}2</span></span>
                           <span>High Watermark: <span className="text-emerald-400">4,5{partition}2</span></span>
                        </div>
                     </div>
                     
                     {/* Message Log stream */}
                     <div className="relative h-16 flex items-center bg-[#111113] rounded-lg border border-[#27272A] overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#111113] to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#111113] to-transparent z-10 pointer-events-none" />
                        
                        <div className="flex items-center gap-2 px-4 animate-[slide_20s_linear_infinite] whitespace-nowrap">
                           {Array.from({ length: 15 }).map((_, i) => (
                              <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                                 <div className="w-16 h-8 bg-indigo-500/10 border border-indigo-500/30 rounded flex items-center justify-center font-mono text-[10px] text-indigo-300 relative group-hover:border-indigo-400 transition-colors cursor-pointer">
                                    msg_{4500 - i}
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Consumers Reading from Partition */}
                     <div className="mt-4 flex items-center gap-8 pl-4">
                        <div className="flex items-center gap-2">
                           <ArrowRight className="w-4 h-4 text-gray-600" />
                           <div className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded flex flex-col">
                              <span className="text-[9px] text-amber-500 uppercase font-bold tracking-widest">inventory-worker-1</span>
                              <span className="text-[10px] font-mono text-gray-400">Offset: 4,5{partition}0 (Lag: 2)</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <ArrowRight className="w-4 h-4 text-gray-600" />
                           <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded flex flex-col">
                              <span className="text-[9px] text-blue-500 uppercase font-bold tracking-widest">analytics-agg-2</span>
                              <span className="text-[10px] font-mono text-gray-400">Offset: 4,5{partition}2 (Lag: 0)</span>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
