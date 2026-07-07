import React, { useState } from 'react';
import { Server } from 'lucide-react';

export default function CAPTheoremLab() {
  const [partitionActive, setPartitionActive] = useState(false);
  const [systemSetting, setSystemSetting] = useState<'AP' | 'CP'>('CP');
  const [nodeAData, setNodeAData] = useState('Val 10');
  const [nodeBData, setNodeBData] = useState('Val 10');
  const [writesCount, setWritesCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const triggerWriteToNodeA = () => {
    const newVal = `Val ${Math.floor(Math.random() * 90) + 10}`;
    setWritesCount(prev => prev + 1);

    if (partitionActive) {
      if (systemSetting === 'AP') {
        // High Availability: Allow write to local Node A, ignore node B mismatch
        setNodeAData(newVal);
        setLog(prev => [
          `AP Mode: Local write accepted at Node A ("${newVal}"). Replication Link is blocked!`,
          ...prev
        ]);
      } else {
        // High Consistency: Write fails because Node A cannot establish consensus with Node B
        setLog(prev => [
          `CP Mode: Write rejected! Network partition detected. Cannot ensure consistency across cluster.`,
          ...prev
        ]);
      }
    } else {
      // Normal healthy system: write propagates to both immediately
      setNodeAData(newVal);
      setNodeBData(newVal);
      setLog(prev => [`Write succeeded. Propagated: Node A ("${newVal}") & Node B ("${newVal}")`, ...prev]);
    }
  };

  const healPartition = () => {
    setPartitionActive(false);
    if (systemSetting === 'AP' && nodeAData !== nodeBData) {
      // Eventual sync up of data on partition resolution
      setNodeBData(nodeAData);
      setLog(prev => [`Partition Healed. Synchronizing replica Node B with Node A...`, ...prev]);
    } else {
      setLog(prev => [`Partition Healed. Network topology restored.`, ...prev]);
    }
  };

  return (
    <div id="cap-theorem-lab" className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">CAP Theorem partition simulator</h4>
            <p className="text-xs text-gray-400">Trigger a network partition. Decide whether to drop Consistency (AP) or Availability (CP).</p>
         </div>
         <div className="flex bg-[#111113] border border-[#27272A] rounded-xl p-1">
            <button 
              id="btn-setting-ap"
              onClick={() => { setSystemSetting('AP'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${systemSetting === 'AP' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              AP (Availability)
            </button>
            <button 
              id="btn-setting-cp"
              onClick={() => { setSystemSetting('CP'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${systemSetting === 'CP' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              CP (Consistency)
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-4 bg-[#111113] border border-[#27272A] p-5 rounded-2xl space-y-4">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Partition Controls</h5>
            <div className="flex flex-col gap-2">
               <button 
                 id="btn-toggle-partition"
                 onClick={() => {
                   if (partitionActive) healPartition();
                   else setPartitionActive(true);
                 }}
                 className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${partitionActive ? 'bg-emerald-600 text-white' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
               >
                  <span>{partitionActive ? 'Heal Network Link' : 'Inject Network Partition'}</span>
                  <span className="text-[10px] uppercase font-mono">{partitionActive ? 'Partitioned' : 'Healthy'}</span>
               </button>
               <button 
                 id="btn-write-value"
                 onClick={triggerWriteToNodeA} 
                 className="py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all"
               >
                  Write New Value to Cluster
               </button>
            </div>

            <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3 text-[10px] text-orange-200/80 leading-relaxed">
               {systemSetting === 'CP' 
                 ? 'CP Setup: Prioritizes consistency. Under partition, write calls fail to avoid returning diverging state.' 
                 : 'AP Setup: Prioritizes availability. Nodes accept diverging writes locally, risking eventual conflicts.'}
            </div>
         </div>

         <div className="md:col-span-8 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between min-h-[250px]">
            <div className="flex justify-around items-center py-4 border-b border-[#1F1F22]">
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center mb-1">
                     <Server className="w-5 h-5 text-gray-300" />
                  </div>
                  <span className="text-xs font-bold text-gray-300">Node A (US-East)</span>
                  <span className="text-[10px] text-gray-500 font-mono mt-1">{nodeAData}</span>
               </div>

               {/* Connection Link with scissor partition marker */}
               <div className="flex-1 max-w-[120px] flex flex-col items-center justify-center relative">
                  <div className={`w-full h-1 relative ${partitionActive ? 'bg-red-600/50 border-t border-dashed border-red-500' : 'bg-orange-500'}`} />
                  <span className={`text-[9px] mt-1 font-mono uppercase font-bold px-1.5 py-0.5 rounded ${partitionActive ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                     {partitionActive ? 'Disconnected' : 'Connected'}
                  </span>
               </div>

               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center mb-1">
                     <Server className="w-5 h-5 text-gray-300" />
                  </div>
                  <span className="text-xs font-bold text-gray-300">Node B (EU-West)</span>
                  <span className="text-[10px] text-gray-500 font-mono mt-1">{nodeBData}</span>
               </div>
            </div>

            <div className="mt-4 flex-1">
               <h6 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">CAP Audit Log</h6>
               <div className="max-h-24 overflow-y-auto custom-scrollbar font-mono text-[9px] text-gray-400 space-y-1 text-gray-400">
                  {log.length === 0 ? (
                     <div className="text-gray-600 py-4 text-center">Simulate system behaviors above.</div>
                  ) : (
                     log.map((line, i) => <div key={i} className="leading-normal">• {line}</div>)
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
