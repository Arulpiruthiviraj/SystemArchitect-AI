import React, { useState } from 'react';
import { Skull, AlertTriangle, ShieldAlert, Zap, Server, Activity, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FailurePlayground() {
  const [activeFailure, setActiveFailure] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ id: number; msg: string; type: 'error' | 'warn' | 'success'; time: string }[]>([]);

  const triggerFailure = (id: string, name: string) => {
    setActiveFailure(id);
    setLogs([{ id: Date.now(), msg: `INJECTED FAULT: ${name}`, type: 'error', time: new Date().toLocaleTimeString() }]);

    setTimeout(() => {
      setLogs(prev => [
        { id: Date.now(), msg: `Auto-scaling group detected failure. Provisioning replacement...`, type: 'warn', time: new Date().toLocaleTimeString() },
        ...prev
      ]);
    }, 2000);

    setTimeout(() => {
       setLogs(prev => [
         { id: Date.now(), msg: `System recovered. Traffic routed to healthy nodes.`, type: 'success', time: new Date().toLocaleTimeString() },
         ...prev
       ]);
       setActiveFailure(null);
    }, 5000);
  };

  const failures = [
    { id: 'db-down', name: 'Database Primary Failure', icon: Server, desc: 'Simulate a primary DB node crash to observe failover.' },
    { id: 'kafka-broker', name: 'Kafka Broker Down', icon: Zap, desc: 'Take a Kafka broker offline to test partition reassignment.' },
    { id: 'network-partition', name: 'Network Partition', icon: ShieldAlert, desc: 'Split the network between services to test circuit breakers.' },
    { id: 'cache-stampede', name: 'Cache Stampede', icon: Activity, desc: 'Evict hot keys under heavy load.' },
  ];

  return (
    <div className="p-8 bg-[#0A0A0B] h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <Skull className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Failure Simulation Engine</h3>
            <p className="text-xs text-gray-500 font-medium">Chaos engineering and resilience testing</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
           {failures.map((f) => {
             const Icon = f.icon;
             return (
               <div 
                 key={f.id}
                 className={`p-6 rounded-2xl border transition-all ${
                   activeFailure === f.id 
                     ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
                     : 'bg-[#111113] border-[#27272A] hover:border-gray-600'
                 }`}
               >
                 <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${activeFailure === f.id ? 'bg-red-500/20 text-red-400' : 'bg-[#1A1A1D] text-gray-400'}`}>
                       <Icon className="w-5 h-5" />
                    </div>
                    {activeFailure === f.id && <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                 </div>
                 <h4 className={`text-sm font-bold mb-2 ${activeFailure === f.id ? 'text-white' : 'text-gray-300'}`}>{f.name}</h4>
                 <p className="text-xs text-gray-500 leading-relaxed mb-6 h-10">{f.desc}</p>
                 <button 
                   onClick={() => triggerFailure(f.id, f.name)}
                   disabled={activeFailure !== null}
                   className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                     activeFailure === f.id 
                       ? 'bg-red-500 text-white animate-pulse' 
                       : activeFailure !== null 
                         ? 'bg-[#1A1A1D] text-gray-600 cursor-not-allowed'
                         : 'bg-[#1A1A1D] border border-[#27272A] text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500'
                   }`}
                 >
                    {activeFailure === f.id ? 'Recovering...' : 'Inject Fault'}
                 </button>
               </div>
             )
           })}
        </div>

        <div className="lg:col-span-6 bg-[#111113] border border-[#27272A] rounded-2xl p-6 flex flex-col">
           <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                 <Activity className="w-3.5 h-3.5" /> System Recovery Logs
              </h4>
              <button onClick={() => setLogs([])} className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
                 <RotateCcw className="w-3 h-3" /> Clear
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              <AnimatePresence mode="popLayout">
                 {logs.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border ${
                        log.type === 'error' ? 'bg-red-500/5 border-red-500/20' :
                        log.type === 'warn' ? 'bg-amber-500/5 border-amber-500/20' :
                        'bg-emerald-500/5 border-emerald-500/20'
                      }`}
                    >
                       <div className="flex items-center gap-3 mb-1">
                          {log.type === 'error' ? <AlertTriangle className="w-4 h-4 text-red-500" /> :
                           log.type === 'warn' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> :
                           <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          <span className={`text-xs font-bold ${
                            log.type === 'error' ? 'text-red-400' :
                            log.type === 'warn' ? 'text-amber-400' :
                            'text-emerald-400'
                          }`}>{log.msg}</span>
                       </div>
                       <div className="text-[10px] text-gray-500 font-mono ml-7">{log.time}</div>
                    </motion.div>
                 ))}
                 {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                       <ShieldAlert className="w-8 h-8 text-zinc-800 mb-2" />
                       <p className="text-xs text-gray-600">Inject a fault to observe system resilience.</p>
                    </div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
