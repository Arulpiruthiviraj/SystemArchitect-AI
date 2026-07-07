import React, { useState, useEffect } from 'react';

export default function RateLimiterLab() {
  const [algorithm, setAlgorithm] = useState<'TOKEN_BUCKET' | 'LEAKY_BUCKET' | 'SLIDING_LOG'>('TOKEN_BUCKET');
  const [tokens, setTokens] = useState(10);
  const [leakyBuffer, setLeakyBuffer] = useState<number[]>([]);
  const [slidingLog, setSlidingLog] = useState<number[]>([]);
  const [limits, setLimits] = useState({ tokenMax: 10, leakMax: 8, slidingMax: 5 });
  const [audit, setAudit] = useState<string[]>([]);

  // Token Bucket Refill / Leaky Bucket Leak loop
  useEffect(() => {
    const timer = setInterval(() => {
      if (algorithm === 'TOKEN_BUCKET') {
        setTokens(t => Math.min(t + 1, limits.tokenMax));
      } else if (algorithm === 'LEAKY_BUCKET') {
        setLeakyBuffer(buf => buf.slice(1));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [algorithm, limits]);

  const handleRequestIngress = () => {
    const timestamp = Date.now();
    
    if (algorithm === 'TOKEN_BUCKET') {
      if (tokens > 0) {
        setTokens(t => t - 1);
        setAudit(prev => [`[SUCCESS] Token consumed. Request accepted.`, ...prev]);
      } else {
        setAudit(prev => [`[REJECTED] Rate limit exceeded (Empty bucket).`, ...prev]);
      }
    } else if (algorithm === 'LEAKY_BUCKET') {
      if (leakyBuffer.length < limits.leakMax) {
        setLeakyBuffer(prev => [...prev, timestamp]);
        setAudit(prev => [`[SUCCESS] Request added to processing buffer.`, ...prev]);
      } else {
        setAudit(prev => [`[REJECTED] Leaky bucket buffer overflow!`, ...prev]);
      }
    } else {
      // Sliding window logs
      const windowStart = timestamp - 10000; // 10 seconds sliding window
      const validLogs = slidingLog.filter(t => t > windowStart);
      if (validLogs.length < limits.slidingMax) {
        setSlidingLog([...validLogs, timestamp]);
        setAudit(prev => [`[SUCCESS] Request added to sliding window log (${validLogs.length + 1}/${limits.slidingMax})`, ...prev]);
      } else {
        setAudit(prev => [`[REJECTED] Sliding window window maxed (${validLogs.length}/${limits.slidingMax})`, ...prev]);
      }
    }
  };

  return (
    <div id="rate-limiter-lab" className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Rate Limiting Algorithms</h4>
            <p className="text-xs text-gray-400">Interact with Token Bucket, Leaky Bucket, and Sliding Window log implementations.</p>
         </div>
         <div className="flex bg-[#111113] border border-[#27272A] rounded-xl p-1 font-sans">
            {['TOKEN_BUCKET', 'LEAKY_BUCKET', 'SLIDING_LOG'].map(algo => (
               <button 
                 key={algo}
                 id={`btn-algo-${algo.toLowerCase()}`}
                 onClick={() => { setAlgorithm(algo as any); setAudit([]); }}
                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${algorithm === algo ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
               >
                 {algo.replace('_', ' ')}
               </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-4 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
               <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Algorithm Simulator</h5>
               <button 
                 id="btn-send-ingress"
                 onClick={handleRequestIngress} 
                 className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
               >
                  Send API Request Ingress
               </button>
            </div>
            <div className="pt-4 border-t border-[#1F1F22]">
               <span className="text-[10px] text-gray-500 uppercase tracking-wider">Ingress Log</span>
               <div className="bg-[#0A0A0B] p-2 rounded-xl border border-[#27272A] h-28 overflow-y-auto custom-scrollbar font-mono text-[9px] text-gray-400 space-y-1 mt-2">
                  {audit.length === 0 ? (
                     <div className="text-gray-600 text-center py-6 font-sans">Click ingress to send requests.</div>
                  ) : (
                     audit.map((a, i) => <div key={i} className={a.includes('REJECTED') ? 'text-red-400' : 'text-emerald-400'}>{a}</div>)
                  )}
               </div>
            </div>
         </div>

         <div className="md:col-span-8 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between min-h-[250px]">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Ingress Flow Graphic</h5>
            
            {algorithm === 'TOKEN_BUCKET' && (
               <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-400 mb-2 font-mono">Refill Rate: 1 token / second</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                     {Array.from({ length: limits.tokenMax }).map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[10px] font-bold ${idx < tokens ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-zinc-800/40 border-zinc-800 text-zinc-600'}`}
                        >
                           T
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {algorithm === 'LEAKY_BUCKET' && (
               <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-400 mb-2 font-mono">Leaking Rate: 1 request / second</div>
                  <div className="w-32 border-2 border-[#27272A] bg-[#0A0A0B] rounded-b-2xl p-4 flex flex-col gap-2">
                     {leakyBuffer.length === 0 ? (
                        <span className="text-[10px] text-gray-600 text-center font-mono">Bucket Empty</span>
                     ) : (
                        leakyBuffer.map((b, i) => (
                           <div key={i} className="h-4 bg-blue-500/20 border border-blue-500/40 rounded flex items-center justify-center text-[8px] font-mono text-blue-400">
                              Request In Queue
                           </div>
                        ))
                     )}
                  </div>
               </div>
            )}

            {algorithm === 'SLIDING_LOG' && (
               <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-400 mb-2 font-mono">Sliding Window limit: 5 requests / 10 seconds</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                     {slidingLog.slice(-5).map((log, idx) => (
                        <div key={idx} className="bg-zinc-800 text-zinc-300 font-mono text-[10px] px-2 py-1 rounded border border-[#27272A]">
                           {new Date(log).toLocaleTimeString()}
                        </div>
                     ))}
                     {slidingLog.length === 0 && <span className="text-[10px] text-gray-600 font-mono">No requests in log window.</span>}
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
