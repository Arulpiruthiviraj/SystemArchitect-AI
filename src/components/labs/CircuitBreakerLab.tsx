import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';

export default function CircuitBreakerLab() {
  const [breakerState, setBreakerState] = useState<'CLOSED' | 'OPEN' | 'HALF_OPEN'>('CLOSED');
  const [failureCount, setFailureCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const makeApiCall = (isFailing = false) => {
    if (breakerState === 'OPEN') {
      setLogs(prev => [`[BREAKER] API Call blocked. Circuit is OPEN (Fail-fast fallback active).`, ...prev]);
      return;
    }

    if (isFailing) {
      const nextFailures = failureCount + 1;
      setFailureCount(nextFailures);
      setLogs(prev => [`[API] Call Failed! (Consecutive Failures: ${nextFailures})`, ...prev]);

      if (nextFailures >= 3) {
        setBreakerState('OPEN');
        setLogs(prev => [`[BREAKER] Circuit tripped! Transited to OPEN state. Requests now block automatically.`, ...prev]);
        
        // Auto-heal to Half-Open after 5s
        setTimeout(() => {
          setBreakerState('HALF_OPEN');
          setLogs(prev => [`[BREAKER] Cooldown complete. Transited to HALF-OPEN. Canary requests allowed.`, ...prev]);
        }, 5000);
      }
    } else {
      setFailureCount(0);
      if (breakerState === 'HALF_OPEN') {
        setBreakerState('CLOSED');
        setLogs(prev => [`[BREAKER] Canary call succeeded! Circuit closed. Normal traffic resumed.`, ...prev]);
      } else {
        setLogs(prev => [`[API] Call Succeeded!`, ...prev]);
      }
    }
  };

  return (
    <div id="circuit-breaker-lab" className="space-y-6">
      <div>
         <h4 className="text-sm font-bold text-white uppercase tracking-wider">Circuit Breaker State Machine</h4>
         <p className="text-xs text-gray-400">Trigger API timeouts to trip the circuit breaker into OPEN (fails fast) then allow it to transition back to HALF-OPEN.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-4 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
               <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Service Caller</h5>
               <div className="flex flex-col gap-2">
                  <button 
                    id="btn-invoke-api-success"
                    onClick={() => makeApiCall(false)} 
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                     Invoke API (Success)
                  </button>
                  <button 
                    id="btn-invoke-api-fail"
                    onClick={() => makeApiCall(true)} 
                    className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                     Invoke API (Fail/Timeout)
                  </button>
               </div>
            </div>
            <div className="pt-4 border-t border-[#1F1F22] mt-4 space-y-2 text-[10px] text-gray-500">
               <div className="flex justify-between">
                  <span>Breaker State:</span>
                  <span className={`font-bold uppercase ${breakerState === 'CLOSED' ? 'text-emerald-400' : breakerState === 'OPEN' ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>{breakerState}</span>
               </div>
               <div className="flex justify-between">
                  <span>Fail Threshold:</span>
                  <span className="font-mono text-gray-300">3 failed calls</span>
               </div>
            </div>
         </div>

         <div className="md:col-span-8 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between min-h-[250px]">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Breaker State Flow</h5>
            
            <div className="flex justify-around items-center py-4 border-b border-[#1F1F22]">
               <div className={`p-4 rounded-xl border text-center w-24 ${breakerState === 'CLOSED' ? 'bg-emerald-500/20 border-emerald-500/60' : 'bg-[#0A0A0B] border-zinc-800'}`}>
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                  <span className="text-[10px] font-bold text-white">CLOSED</span>
               </div>
               <ArrowRight className="w-4 h-4 text-gray-600" />
               <div className={`p-4 rounded-xl border text-center w-24 ${breakerState === 'OPEN' ? 'bg-red-500/20 border-red-500/60' : 'bg-[#0A0A0B] border-zinc-800'}`}>
                  <ShieldAlert className="w-5 h-5 mx-auto mb-1 text-red-400" />
                  <span className="text-[10px] font-bold text-white">OPEN</span>
               </div>
               <ArrowRight className="w-4 h-4 text-gray-600" />
               <div className={`p-4 rounded-xl border text-center w-24 ${breakerState === 'HALF_OPEN' ? 'bg-amber-500/20 border-amber-500/60' : 'bg-[#0A0A0B] border-zinc-800'}`}>
                  <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                  <span className="text-[10px] font-bold text-white">HALF-OPEN</span>
               </div>
            </div>

            <div className="mt-4 flex-1">
               <div className="bg-[#0A0A0B] p-3 rounded-xl border border-[#27272A] h-28 overflow-y-auto custom-scrollbar font-mono text-[9px] text-gray-400 space-y-1">
                  {logs.length === 0 ? (
                     <div className="text-gray-600 py-6 text-center font-sans">Simulate endpoint calls to observe breaker states.</div>
                  ) : (
                     logs.map((l, i) => <div key={i}>{l}</div>)
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
