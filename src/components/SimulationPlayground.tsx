import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, Activity, Database, Layers, 
  ChevronRight, AlertCircle, CheckCircle2, Info, Users, 
  Clock, Zap, Send, MessageSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Architecture } from '../types';

interface SimulationPlaygroundProps {
  architecture: Architecture;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  rps: number;
  onRpsChange: (val: number) => void;
  usersCount: number;
  onUsersChange: (val: number) => void;
}

export default function SimulationPlayground({ 
  architecture,
  isPlaying,
  onTogglePlay,
  onReset,
  rps,
  onRpsChange,
  usersCount,
  onUsersChange
}: SimulationPlaygroundProps) {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState<Array<{ id: number; time: string; msg: string; type: 'info' | 'success' | 'error' }>>([]);

  const steps = [
    { label: 'Edge / CDN', status: 'COMPLETED', time: '12ms' },
    { label: 'API Gateway', status: 'COMPLETED', time: '45ms' },
    { label: 'Order Service', status: 'IN_PROGRESS', time: '210ms' },
    { label: 'Kafka Cluster', status: 'PENDING', time: '--' },
    { label: 'Inventory Service', status: 'PENDING', time: '--' },
    { label: 'Payment Gateway', status: 'PENDING', time: '--' },
  ];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 1));
        if (progress % 15 === 0) {
          setActiveStep(s => (s >= steps.length - 1 ? 0 : s + 1));
          addLog();
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  const addLog = () => {
    const messages = [
      { msg: `Incoming request batch (${Math.floor(Math.random() * rps)} items) routed`, type: 'info' as const },
      { msg: 'Order validation successful. Generating UUIDs.', type: 'success' as const },
      { msg: 'Event published to Kafka Topic [orders-topic]', type: 'success' as const },
      { msg: 'Consumer Group [payment-group] offset committed', type: 'info' as const },
      { msg: 'Database transaction committed to Primary', type: 'success' as const },
      { msg: 'Replication sync to Read Replica completed', type: 'info' as const },
      { msg: 'Cache hit on Redis Cluster (98% confidence)', type: 'info' as const },
      { msg: 'Elasticsearch indexed new product event', type: 'info' as const },
      { msg: `Scaling ASG: current traffic ${rps} req/sec`, type: 'info' as const },
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setLogs(prev => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), ...randomMsg },
      ...prev.slice(0, 19)
    ]);
  };

  return (
    <div className="p-8 bg-[#0A0A0B] border-b border-[#1F1F22]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Interactive Simulation Playground</h3>
            <p className="text-xs text-gray-500 font-medium">Real-time system behavior and traffic flow monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#111113] border border-[#27272A] rounded-xl">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">System Healthy</span>
          </div>
          <button 
            onClick={onTogglePlay}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-amber-500 text-black' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'}`}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
          </button>
          <button onClick={() => { setProgress(0); setActiveStep(0); setLogs([]); onReset(); }} className="w-12 h-12 rounded-full bg-[#1A1A1D] border border-[#27272A] text-gray-400 hover:text-white flex items-center justify-center transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Simulation Controls */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6">
             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Simulation Controls</h4>
             
             <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" /> Simulation Users
                    </label>
                    <span className="text-xs font-bold text-indigo-400">{usersCount.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1000" 
                    max="50000" 
                    step="1000"
                    value={usersCount}
                    onChange={(e) => onUsersChange(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 bg-[#1A1A1D] h-1.5 rounded-full appearance-none" 
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" /> Requests / Sec
                    </label>
                    <span className="text-xs font-bold text-indigo-400">{rps} RPS</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="1000" 
                    step="10"
                    value={rps}
                    onChange={(e) => onRpsChange(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 bg-[#1A1A1D] h-1.5 rounded-full appearance-none" 
                  />
                </div>

                <div className="pt-4 border-t border-[#1F1F22] space-y-3">
                  <label className="text-xs font-bold text-gray-400 block mb-2">Dynamic Traffic Patterns</label>
                  <div className="grid grid-cols-2 gap-2">
                     <button onClick={() => { onRpsChange(150); }} className="py-2 px-3 bg-[#1A1A1D] hover:bg-indigo-500/20 hover:text-indigo-400 text-gray-400 border border-[#27272A] rounded-lg text-xs font-bold transition-all text-left">
                        Baseline (150 RPS)
                     </button>
                     <button onClick={() => { onRpsChange(850); }} className="py-2 px-3 bg-[#1A1A1D] hover:bg-amber-500/20 hover:text-amber-400 text-gray-400 border border-[#27272A] rounded-lg text-xs font-bold transition-all text-left">
                        Black Friday
                     </button>
                     <button onClick={() => { onRpsChange(1000); }} className="py-2 px-3 bg-[#1A1A1D] hover:bg-red-500/20 hover:text-red-400 text-gray-400 border border-[#27272A] rounded-lg text-xs font-bold transition-all text-left col-span-2 flex items-center justify-between">
                        <span>DDoS Attack</span>
                        <span className="text-red-500 opacity-50">+1000 RPS</span>
                     </button>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6">
             <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Health Metrics</h4>
                <Info className="w-3.5 h-3.5 text-gray-600" />
             </div>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-xs text-gray-400">Avg. Latency</span>
                   <span className="text-xs font-bold text-emerald-400">124ms</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs text-gray-400">Error Rate</span>
                   <span className="text-xs font-bold text-emerald-400">0.02%</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs text-gray-400">CPU Usage</span>
                   <span className="text-xs font-bold text-amber-400">42%</span>
                </div>
             </div>
          </div>
        </div>

        {/* Live Simulation Flow */}
        <div className="lg:col-span-6 space-y-6">
           <div className="bg-[#111113] border border-[#27272A] rounded-3xl p-8 relative overflow-hidden h-[450px] flex flex-col">
              <div className="absolute top-0 right-0 p-6">
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-[#27272A]">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">LIVE TRAFFIC STREAM</span>
                 </div>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-10 relative">
                 {/* Progress Line */}
                 <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-[#1F1F22]">
                    <motion.div 
                      className="w-full bg-indigo-500 origin-top"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: progress / 100 }}
                      transition={{ type: 'tween' }}
                    />
                 </div>

                 {steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-6 relative z-10">
                       <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                         activeStep === idx 
                           ? 'bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.4)] scale-110 border border-indigo-400' 
                           : activeStep > idx 
                             ? 'bg-emerald-500/10 border border-emerald-500/20' 
                             : 'bg-[#1A1A1D] border border-[#27272A]'
                       }`}>
                          {activeStep === idx ? (
                             <Activity className="w-8 h-8 text-white animate-pulse" />
                          ) : activeStep > idx ? (
                             <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                          ) : (
                             <Layers className="w-8 h-8 text-gray-700" />
                          )}
                       </div>
                       
                       <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                             <h5 className={`text-sm font-bold tracking-tight ${activeStep === idx ? 'text-white' : 'text-gray-500'}`}>{step.label}</h5>
                             <span className={`text-[10px] font-bold uppercase tracking-widest ${activeStep === idx ? 'text-indigo-400' : 'text-gray-600'}`}>{step.time}</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#1A1A1D] rounded-full overflow-hidden border border-[#27272A]">
                             {activeStep === idx && (
                               <motion.div 
                                 className="h-full bg-indigo-500"
                                 initial={{ width: 0 }}
                                 animate={{ width: '100%' }}
                                 transition={{ duration: 1.5, repeat: Infinity }}
                               />
                             )}
                             {activeStep > idx && <div className="h-full w-full bg-emerald-500" />}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Kafka Detail Overlay at bottom of simulation */}
              <div className="mt-8 pt-8 border-t border-[#1F1F22] flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                       <Layers className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                       <h6 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-1">Kafka Partition Status</h6>
                       <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5, 6].map(i => (
                             <div key={i} className={`w-3 h-3 rounded-sm ${activeStep >= 3 ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-800'}`} />
                          ))}
                       </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Consumer Groups</div>
                    <div className="text-xs font-bold text-indigo-400">Order-Fulfillment, Payment-Worker</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Live Activity Log */}
        <div className="lg:col-span-3">
           <div className="bg-[#111113] border border-[#27272A] rounded-2xl flex flex-col h-full max-h-[450px]">
              <div className="p-4 border-b border-[#1F1F22] flex items-center justify-between">
                 <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Real-time Activity</h4>
                 <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-indigo-500/40" />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                 <AnimatePresence mode="popLayout">
                    {logs.map((log) => (
                       <motion.div 
                         key={log.id}
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className="flex gap-3"
                       >
                          <div className={`mt-1 shrink-0 ${log.type === 'success' ? 'text-emerald-500' : log.type === 'error' ? 'text-red-500' : 'text-indigo-400'}`}>
                             {log.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : log.type === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                             <p className="text-xs text-gray-300 leading-relaxed"><span className="text-gray-600 font-mono text-[10px] mr-2">{log.time}</span> {log.msg}</p>
                          </div>
                       </motion.div>
                    ))}
                    {logs.length === 0 && (
                       <div className="h-full flex flex-col items-center justify-center text-center p-8">
                          <MessageSquare className="w-8 h-8 text-zinc-800 mb-2" />
                          <p className="text-xs text-gray-600">Start simulation to see live system activity logs</p>
                       </div>
                    )}
                 </AnimatePresence>
              </div>
              <div className="p-4 border-t border-[#1F1F22] bg-black/20">
                 <button className="w-full py-2 bg-[#1A1A1D] border border-[#27272A] rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white hover:border-gray-600 transition-all">
                    View Full System Logs
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
