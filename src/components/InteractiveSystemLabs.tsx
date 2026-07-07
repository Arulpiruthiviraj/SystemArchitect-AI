import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Hash, Server, Zap, ShieldAlert, Activity, CheckCircle2, 
  AlertTriangle, Play, Pause, RotateCcw, ChevronRight, Sliders, 
  Cpu, Coins, Lock, Users, Smartphone, Laptop, Map, Video, Globe, 
  RefreshCw, Check, X, Shield, HelpCircle, Key, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import CAPTheoremLab from './labs/CAPTheoremLab';
import CAPSimulator from './labs/CAPSimulator';
import CircuitBreakerLab from './labs/CircuitBreakerLab';
import RateLimiterLab from './labs/RateLimiterLab';

// --- SUB-COMPONENTS FOR EACH LAB TOPIC ---

// 1. Sharding & Hot Shard Lab
function ShardingLab() {
  const [strategy, setStrategy] = useState<'HASH' | 'RANGE'>('HASH');
  const [isCelebrityActive, setIsCelebrityActive] = useState(false);
  const [shards, setShards] = useState([
    { id: 1, label: 'Shard 1 (A-G)', count: 20, isHot: false },
    { id: 2, label: 'Shard 2 (H-N)', count: 18, isHot: false },
    { id: 3, label: 'Shard 3 (O-U)', count: 22, isHot: false },
    { id: 4, label: 'Shard 4 (V-Z)', count: 15, isHot: false },
  ]);
  const [writesLog, setWritesLog] = useState<{ id: number; key: string; shard: number; isCelebrity?: boolean }[]>([]);

  const triggerWrite = (celebrity = false) => {
    let key = '';
    let shardIdx = 0;

    if (celebrity) {
      key = '@TaylorSwift'; // Celebrity key
      // Under Range sharding: T goes to Shard 3. Under Hash: let's force it to Shard 3 as well for visualization
      shardIdx = 2; 
    } else {
      const names = ['Alice', 'Bob', 'Charlie', 'David', 'Frank', 'Grace', 'Ivy', 'Jack', 'Kevin', 'Sam', 'Zach'];
      key = names[Math.floor(Math.random() * names.length)];
      if (strategy === 'RANGE') {
        const char = key[0].toUpperCase();
        if (char <= 'G') shardIdx = 0;
        else if (char <= 'N') shardIdx = 1;
        else if (char <= 'U') shardIdx = 2;
        else shardIdx = 3;
      } else {
        // Hash Sharding
        let hash = 0;
        for (let i = 0; i < key.length; i++) hash += key.charCodeAt(i);
        shardIdx = hash % 4;
      }
    }

    setShards(prev => prev.map((s, idx) => {
      if (idx === shardIdx) {
        return { 
          ...s, 
          count: s.count + (celebrity ? 15 : 1),
          isHot: s.isHot || celebrity
        };
      }
      return s;
    }));

    setWritesLog(prev => [
      { id: Date.now(), key, shard: shardIdx + 1, isCelebrity: celebrity },
      ...prev.slice(0, 8)
    ]);
  };

  const resetLab = () => {
    setShards([
      { id: 1, label: 'Shard 1 (A-G)', count: 20, isHot: false },
      { id: 2, label: 'Shard 2 (H-N)', count: 18, isHot: false },
      { id: 3, label: 'Shard 3 (O-U)', count: 22, isHot: false },
      { id: 4, label: 'Shard 4 (V-Z)', count: 15, isHot: false },
    ]);
    setWritesLog([]);
    setIsCelebrityActive(false);
  };

  useEffect(() => {
    let interval: any;
    if (isCelebrityActive) {
      interval = setInterval(() => {
        triggerWrite(true);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isCelebrityActive, strategy]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Sharding & Hot Shards</h4>
            <p className="text-xs text-gray-400">Animate how Range vs Hash-based partitioning handles traffic and celebrity hot-spots.</p>
         </div>
         <div className="flex bg-[#111113] border border-[#27272A] rounded-xl p-1">
            <button 
              onClick={() => { setStrategy('HASH'); resetLab(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${strategy === 'HASH' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Hash-Based
            </button>
            <button 
              onClick={() => { setStrategy('RANGE'); resetLab(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${strategy === 'RANGE' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Range-Based
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         {/* Left interactive control panel */}
         <div className="md:col-span-5 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
               <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Simulation Controls</h5>
               <p className="text-xs text-gray-500 leading-relaxed">
                 {strategy === 'HASH' 
                   ? 'Hash sharding applies a hash function (e.g. key % N) to distribute keys uniformly. However, highly popular keys (celebrities) still target a single shard.' 
                   : 'Range sharding assigns data ranges based on the key values (e.g. names starting A-G to Shard 1). This is susceptible to severe data skew.'}
               </p>
               <div className="flex flex-col gap-2 pt-2">
                  <button onClick={() => triggerWrite(false)} className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-gray-100 rounded-xl text-xs font-bold transition-all flex items-center justify-between">
                     <span>Inject Standard Write</span>
                     <span className="text-[10px] text-blue-400 font-mono">1 op</span>
                  </button>
                  <button 
                    onClick={() => setIsCelebrityActive(!isCelebrityActive)} 
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${isCelebrityActive ? 'bg-red-600 text-white' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                  >
                     <span>{isCelebrityActive ? 'Stop Celebrity Post Spikes' : 'Simulate Celebrity Event (@TaylorSwift)'}</span>
                     <span className="text-[10px] font-mono uppercase">{isCelebrityActive ? 'Active' : 'Spike'}</span>
                  </button>
               </div>
            </div>

            <div className="pt-4 border-t border-[#1F1F22]">
               <div className="flex items-center justify-between mb-2">
                  <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Router Log</h5>
                  <button onClick={resetLab} className="text-[10px] text-gray-600 hover:text-white flex items-center gap-1">
                     <RotateCcw className="w-2.5 h-2.5" /> Reset
                  </button>
               </div>
               <div className="bg-[#0A0A0B] rounded-xl p-3 border border-[#27272A] font-mono text-[10px] space-y-1.5 h-28 overflow-y-auto custom-scrollbar">
                  {writesLog.length === 0 ? (
                     <div className="text-gray-600 text-center py-6">No operations written yet.</div>
                  ) : (
                     writesLog.map(w => (
                        <div key={w.id} className="flex justify-between text-gray-400 items-center">
                           <span className={w.isCelebrity ? 'text-red-400 font-bold' : 'text-blue-400'}>
                              WRITE key={w.key}
                           </span>
                           <span className="text-gray-600">→</span>
                           <span className={w.isCelebrity ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                              Shard {w.shard}
                           </span>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>

         {/* Right interactive visualization */}
         <div className="md:col-span-7 bg-[#111113] border border-[#27272A] p-6 rounded-2xl flex flex-col justify-between min-h-[300px]">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Shard Utilization Map</h5>
            <div className="grid grid-cols-2 gap-4 flex-1">
               {shards.map((s) => (
                  <div 
                    key={s.id} 
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 relative ${s.isHot ? 'bg-red-500/10 border-red-500/50 shadow-2xl animate-pulse' : 'bg-[#0A0A0B] border-[#27272A]'}`}
                  >
                     <div className="flex items-center justify-between mb-2">
                        <Database className={`w-4 h-4 ${s.isHot ? 'text-red-400' : 'text-blue-400'}`} />
                        <span className={`text-[10px] font-mono font-bold ${s.isHot ? 'text-red-400' : 'text-gray-500'}`}>
                           {s.isHot ? 'HOT SHARD!' : 'OK'}
                        </span>
                     </div>
                     <div>
                        <h6 className="text-xs font-bold text-gray-300">{s.label}</h6>
                        <div className="flex items-end justify-between mt-2">
                           <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden mr-3">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${s.isHot ? 'bg-red-500' : 'bg-blue-500'}`} 
                                style={{ width: `${Math.min(s.count * 1.5, 100)}%` }} 
                              />
                           </div>
                           <span className="text-[10px] font-mono text-gray-400">{s.count} rows</span>
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

// 2. Consistent Hashing Ring Lab
function ConsistentHashingLab() {
  const [nodes, setNodes] = useState<{ id: string; angle: number; active: boolean }[]>([
    { id: 'Node A', angle: 45, active: true },
    { id: 'Node B', angle: 135, active: true },
    { id: 'Node C', angle: 225, active: true },
    { id: 'Node D', angle: 315, active: true },
  ]);
  const [keys, setKeys] = useState<{ id: string; angle: number; node: string }[]>([]);

  const addKey = () => {
    const angle = Math.floor(Math.random() * 360);
    const activeNodes = nodes.filter(n => n.active);
    if (activeNodes.length === 0) return;

    // Find the next active node clockwise on the ring
    let targetNode = activeNodes[0];
    let minDiff = 360;

    activeNodes.forEach(n => {
      let diff = n.angle - angle;
      if (diff < 0) diff += 360;
      if (diff < minDiff) {
        minDiff = diff;
        targetNode = n;
      }
    });

    setKeys(prev => [...prev, { id: `key_${Math.floor(Math.random() * 1000)}`, angle, node: targetNode.id }]);
  };

  const toggleNode = (id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, active: !n.active } : n));
  };

  // Recalculate key assignments when active nodes change
  useEffect(() => {
    const activeNodes = nodes.filter(n => n.active);
    if (activeNodes.length === 0) {
      setKeys([]);
      return;
    }
    setKeys(prev => prev.map(k => {
      let targetNode = activeNodes[0];
      let minDiff = 360;
      activeNodes.forEach(n => {
        let diff = n.angle - k.angle;
        if (diff < 0) diff += 360;
        if (diff < minDiff) {
          minDiff = diff;
          targetNode = n;
        }
      });
      return { ...k, node: targetNode.id };
    }));
  }, [nodes]);

  return (
    <div className="space-y-6">
      <div>
         <h4 className="text-sm font-bold text-white uppercase tracking-wider">Consistent Hashing Ring</h4>
         <p className="text-xs text-gray-400">Animate a server ring. Adding or removing a server node redistributes only a minimal fraction of keys.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-4 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
               <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nodes Configuration</h5>
               <div className="space-y-2">
                  {nodes.map(n => (
                     <div key={n.id} className="flex items-center justify-between bg-[#0A0A0B] p-2.5 rounded-xl border border-[#27272A]">
                        <span className="text-xs font-bold text-gray-300">{n.id} <span className="text-[10px] text-gray-500">({n.angle}°)</span></span>
                        <button 
                          onClick={() => toggleNode(n.id)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md ${n.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
                        >
                           {n.active ? 'Online' : 'Offline'}
                        </button>
                     </div>
                  ))}
               </div>
               <button onClick={addKey} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                  <Hash className="w-4 h-4" /> Hash New Key onto Ring
               </button>
            </div>
            <div className="pt-4 border-t border-[#1F1F22] mt-4 text-[10px] text-gray-500 space-y-2">
               <div className="flex justify-between">
                  <span>Total Nodes:</span>
                  <span className="font-mono text-gray-300">{nodes.filter(n => n.active).length} active</span>
               </div>
               <div className="flex justify-between">
                  <span>Total Keys:</span>
                  <span className="font-mono text-gray-300">{keys.length} keys</span>
               </div>
            </div>
         </div>

         {/* SVG Ring Visualization */}
         <div className="md:col-span-8 bg-[#111113] border border-[#27272A] p-6 rounded-2xl flex flex-col items-center justify-center relative min-h-[350px]">
            <svg width="240" height="240" className="relative">
               {/* Hashing Ring Circle */}
               <circle cx="120" cy="120" r="80" stroke="#27272A" strokeWidth="4" fill="none" />
               
               {/* Nodes */}
               {nodes.map(n => {
                 const rad = (n.angle * Math.PI) / 180;
                 const x = 120 + 80 * Math.cos(rad);
                 const y = 120 + 80 * Math.sin(rad);
                 return (
                    <g key={n.id}>
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="14" 
                        fill={n.active ? '#3b82f6' : '#27272a'} 
                        stroke="#0a0a0b" 
                        strokeWidth="2" 
                        className="transition-colors duration-300"
                      />
                      <text 
                        x={x} 
                        y={y + 4} 
                        fill="#ffffff" 
                        fontSize="9" 
                        fontWeight="bold" 
                        textAnchor="middle"
                      >
                         {n.id.replace('Node ', '')}
                      </text>
                    </g>
                 );
               })}

               {/* Keys mapping on ring */}
               {keys.map((k, idx) => {
                 const rad = (k.angle * Math.PI) / 180;
                 const x = 120 + 80 * Math.cos(rad);
                 const y = 120 + 80 * Math.sin(rad);
                 const targetNode = nodes.find(n => n.id === k.node);
                 const dotColor = targetNode?.active 
                   ? (targetNode.id === 'Node A' ? '#f59e0b' : targetNode.id === 'Node B' ? '#10b981' : targetNode.id === 'Node C' ? '#8b5cf6' : '#ec4899')
                   : '#6b7280';
                 return (
                    <motion.circle 
                      key={idx}
                      cx={x} 
                      cy={y} 
                      r="5" 
                      fill={dotColor} 
                      stroke="#0a0a0b" 
                      strokeWidth="1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                 );
               })}
            </svg>

            {/* Color key */}
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
               {nodes.map(n => (
                  <div key={n.id} className="flex items-center gap-1 text-[10px] text-gray-400">
                     <span className={`w-2.5 h-2.5 rounded-full ${!n.active ? 'bg-gray-500' : n.id === 'Node A' ? 'bg-[#f59e0b]' : n.id === 'Node B' ? 'bg-[#10b981]' : n.id === 'Node C' ? 'bg-[#8b5cf6]' : 'bg-[#ec4899]'}`} />
                     <span>{n.id}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

// 3. Database Replication & Lag Lab
function ReplicationLagLab() {
  const [architecture, setArchitecture] = useState<'MASTER_SLAVE' | 'MULTI_MASTER'>('MASTER_SLAVE');
  const [replicationType, setReplicationType] = useState<'ASYNC' | 'SYNC'>('ASYNC');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lagMs, setLagMs] = useState(2000);
  const [logs, setLogs] = useState<{ id: number; msg: string; type: 'write' | 'read' | 'lag' | 'success' | 'conflict' }[]>([]);
  
  // Master-Slave states
  const [profileData, setProfileData] = useState('Old Profile Bio');
  const [replicaData, setReplicaData] = useState('Old Profile Bio');

  // Multi-Master states
  const [masterAData, setMasterAData] = useState('Original Stock: 100');
  const [masterBData, setMasterBData] = useState('Original Stock: 100');
  const [conflictStrategy, setConflictStrategy] = useState<'LWW' | 'VECTOR_MERGE'>('LWW');

  const triggerProfileUpdate = () => {
    setIsSyncing(true);
    const newBio = `Bio updated at ${new Date().toLocaleTimeString()}`;
    
    // Write to Primary DB immediately
    setProfileData(newBio);
    setLogs(prev => [{ id: Date.now(), msg: `Primary DB (Master) updated: "${newBio}"`, type: 'write' }, ...prev]);

    if (replicationType === 'SYNC') {
      // Synchronous wait: Write blocks until replica is written
      setTimeout(() => {
        setReplicaData(newBio);
        setIsSyncing(false);
        setLogs(prev => [
          { id: Date.now() + 1, msg: `Replica DB synced (Block Complete)`, type: 'success' },
          ...prev
        ]);
      }, 600);
    } else {
      // Asynchronous: returns immediately, replica updates after replication lag delay
      setTimeout(() => {
        setReplicaData(newBio);
        setIsSyncing(false);
        setLogs(prev => [
          { id: Date.now() + 2, msg: `Replica DB eventually synced after asynchronous lag`, type: 'lag' },
          ...prev
        ]);
      }, lagMs);
    }
  };

  const triggerImmediateRead = () => {
    // Immediate read from replica to demonstrate "Read-Your-Writes" or stale read
    const isStale = replicaData !== profileData;
    setLogs(prev => [
      { 
        id: Date.now(), 
        msg: `READ from Replica: "${replicaData}" ${isStale ? '❌ STALE READ (Replication Lag!)' : '✅ Consistent Read'}`, 
        type: isStale ? 'lag' : 'success' 
      }, 
      ...prev
    ]);
  };

  // Multi-Master simulations
  const simulateMultiMasterConflict = () => {
    setIsSyncing(true);
    const timeA = Date.now();
    const valA = "Stock updated: 95 (User Tokyo)";
    
    // Simulation logic for Multi-Master conflict
    setMasterAData(valA);
    setLogs(prev => [
      { id: Date.now(), msg: `Tokyo node received local write: "${valA}"`, type: 'write' },
      ...prev
    ]);

    setTimeout(() => {
      const valB = "Stock updated: 88 (User London)";
      setMasterBData(valB);
      setLogs(prev => [
        { id: Date.now(), msg: `London node received concurrent local write: "${valB}"`, type: 'write' },
        ...prev
      ]);
    }, 200);

    // After replica cross-sync delay
    setTimeout(() => {
      setIsSyncing(false);
      if (conflictStrategy === 'LWW') {
        // Last-Write-Wins wins based on time
        setMasterAData("Stock updated: 88 (User London)");
        setMasterBData("Stock updated: 88 (User London)");
        setLogs(prev => [
          { id: Date.now(), msg: `[RECONCILE] Conflict resolved via Last-Write-Wins (LWW). Tokyo synced to London (latest write wins).`, type: 'success' },
          ...prev
        ]);
      } else {
        // Vector Clock / Merge strategy: detect divergent values and merge
        const merged = "Stock: Tokyo (95) & London (88) [Resolution Required]";
        setMasterAData(merged);
        setMasterBData(merged);
        setLogs(prev => [
          { id: Date.now(), msg: `[CONFLICT] Divergent states detected! Automatically flagged for application-level merge.`, type: 'conflict' },
          ...prev
        ]);
      }
    }, lagMs);
  };

  const resetReplicationLab = () => {
    setProfileData('Old Profile Bio');
    setReplicaData('Old Profile Bio');
    setMasterAData('Original Stock: 100');
    setMasterBData('Original Stock: 100');
    setLogs([]);
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Replication Topologies & Lag Simulation</h4>
            <p className="text-xs text-gray-400">Compare Master-Slave (Read-Your-Writes consistency) vs. Multi-Master architecture with sync conflicts.</p>
         </div>

         <div className="flex gap-2">
           {/* Architecture Selector */}
           <div className="flex bg-[#111113] border border-[#27272A] rounded-xl p-1">
              <button 
                onClick={() => { setArchitecture('MASTER_SLAVE'); resetReplicationLab(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${architecture === 'MASTER_SLAVE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Master-Slave
              </button>
              <button 
                onClick={() => { setArchitecture('MULTI_MASTER'); resetReplicationLab(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${architecture === 'MULTI_MASTER' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Multi-Master
              </button>
           </div>

           {/* Replication type (only for Master-Slave) */}
           {architecture === 'MASTER_SLAVE' && (
             <div className="flex bg-[#111113] border border-[#27272A] rounded-xl p-1">
                <button 
                  onClick={() => { setReplicationType('ASYNC'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${replicationType === 'ASYNC' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Async
                </button>
                <button 
                  onClick={() => { setReplicationType('SYNC'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${replicationType === 'SYNC' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Sync
                </button>
             </div>
           )}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         {/* Operations column */}
         <div className="md:col-span-4 bg-[#111113] border border-[#27272A] p-5 rounded-2xl space-y-4">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Database Operations</h5>
            
            {architecture === 'MASTER_SLAVE' ? (
              <div className="flex flex-col gap-2">
                 <button onClick={triggerProfileUpdate} className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-between">
                    <span>1. Write Profile Update</span>
                    <span className="text-[10px] text-indigo-200">Primary DB</span>
                 </button>
                 <button onClick={triggerImmediateRead} className="py-2.5 px-4 bg-[#1A1A1D] border border-[#27272A] text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-between">
                    <span>2. Read Immediate Profile</span>
                    <span className="text-[10px] text-emerald-400">Read Replica</span>
                 </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                 <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-bold uppercase block">Conflict Resolver</label>
                    <div className="grid grid-cols-2 gap-1.5 bg-[#0A0A0B] p-1 border border-[#27272A] rounded-xl">
                       <button 
                         onClick={() => setConflictStrategy('LWW')}
                         className={`py-1 rounded-lg text-[10px] font-bold transition-all ${conflictStrategy === 'LWW' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
                       >
                          Last-Write-Wins
                       </button>
                       <button 
                         onClick={() => setConflictStrategy('VECTOR_MERGE')}
                         className={`py-1 rounded-lg text-[10px] font-bold transition-all ${conflictStrategy === 'VECTOR_MERGE' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
                       >
                          Vector Merge
                       </button>
                    </div>
                 </div>

                 <button onClick={simulateMultiMasterConflict} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all">
                    Simulate Concurrent Writes
                 </button>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-[#1F1F22]">
               <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Replication Lag</span>
                  <span className="text-blue-400 font-mono font-bold">{lagMs}ms</span>
               </div>
               <input 
                 type="range" 
                 min="500" 
                 max="4000" 
                 step="500"
                 value={lagMs}
                 onChange={(e) => setLagMs(parseInt(e.target.value))}
                 className="w-full accent-blue-500 bg-[#1A1A1D] h-1.5 rounded-full appearance-none" 
               />
            </div>
         </div>

         {/* Visualization column */}
         <div className="md:col-span-8 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col min-h-[280px]">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              {architecture === 'MASTER_SLAVE' ? 'Master-Slave Replication Visualizer' : 'Multi-Master Active-Active Cluster'}
            </h5>
            
            {architecture === 'MASTER_SLAVE' ? (
              <div className="flex justify-around items-center flex-1 py-4 border-b border-[#1F1F22]">
                 {/* Primary Master node */}
                 <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-xl bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center mb-2">
                       <Database className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span className="text-xs font-bold text-white">Primary (Master)</span>
                    <span className="text-[10px] text-gray-500 mt-1 truncate max-w-[120px]">{profileData}</span>
                 </div>

                 {/* Replication network pipeline */}
                 <div className="flex-1 max-w-[100px] flex flex-col items-center justify-center relative">
                    <div className="w-full h-0.5 bg-[#27272A] relative overflow-hidden">
                       {isSyncing && (
                          <motion.div 
                            className="absolute h-full w-4 bg-emerald-500"
                            animate={{ left: ['0%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          />
                       )}
                    </div>
                    <span className="text-[9px] text-gray-600 mt-1 uppercase tracking-wider font-mono">Sync Link</span>
                 </div>

                 {/* Read replica node */}
                 <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-2 border transition-all duration-300 ${replicaData !== profileData ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-600/20 border-emerald-500/30'}`}>
                       <Database className={`w-6 h-6 ${replicaData !== profileData ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
                    </div>
                    <span className="text-xs font-bold text-white">Replica (Slave)</span>
                    <span className="text-[10px] text-gray-500 mt-1 truncate max-w-[120px]">{replicaData}</span>
                 </div>
              </div>
            ) : (
              <div className="flex justify-around items-center flex-1 py-4 border-b border-[#1F1F22]">
                 {/* Master A */}
                 <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-xl bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center mb-2">
                       <Database className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span className="text-xs font-bold text-white">Master A (Tokyo)</span>
                    <span className="text-[10px] text-gray-400 mt-1 truncate max-w-[130px] font-mono">{masterAData}</span>
                 </div>

                 {/* Inter-master sync pipelines */}
                 <div className="flex-1 max-w-[120px] flex flex-col items-center justify-center relative">
                    <div className="w-full h-1 bg-[#27272A] relative overflow-hidden flex items-center">
                       {isSyncing && (
                          <>
                            <motion.div 
                              className="absolute h-full w-3 bg-indigo-500"
                              animate={{ left: ['0%', '100%'] }}
                              transition={{ repeat: Infinity, duration: 1.2 }}
                            />
                            <motion.div 
                              className="absolute h-full w-3 bg-blue-500"
                              animate={{ left: ['100%', '0%'] }}
                              transition={{ repeat: Infinity, duration: 1.2 }}
                            />
                          </>
                       )}
                    </div>
                    <span className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider font-mono">Bi-Directional</span>
                 </div>

                 {/* Master B */}
                 <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center mb-2">
                       <Database className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-xs font-bold text-white">Master B (London)</span>
                    <span className="text-[10px] text-gray-400 mt-1 truncate max-w-[130px] font-mono">{masterBData}</span>
                 </div>
              </div>
            )}

            <div className="mt-4 flex-1">
               <h6 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 font-mono">Topology Event Log</h6>
               <div className="max-h-24 overflow-y-auto custom-scrollbar font-mono text-[9px] space-y-1">
                  {logs.length === 0 ? (
                     <div className="text-gray-600 py-4 text-center">Execute operations to observe state replication.</div>
                  ) : (
                     logs.map((l, i) => (
                        <div key={i} className={`flex gap-2 ${l.type === 'lag' ? 'text-amber-400' : l.type === 'write' ? 'text-indigo-400' : l.type === 'conflict' ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                           <span>[{new Date(l.id).toLocaleTimeString()}]</span>
                           <span>{l.msg}</span>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// 4. Bloom Filter & Count-Min Sketch Lab
function BloomFilterLab() {
  const [activeTab, setActiveTab] = useState<'BLOOM' | 'COUNT_MIN'>('BLOOM');

  // Bloom Filter states
  const [bitArray, setBitArray] = useState<number[]>(Array(12).fill(0));
  const [usernames, setUsernames] = useState<string[]>([]);
  const [usernameInput, setUsernameInput] = useState('');
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<'MAYBE' | 'NO' | null>(null);

  // Count-Min Sketch states
  const [sketchGrid, setSketchGrid] = useState<number[][]>([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ]);
  const [streamEvents, setStreamEvents] = useState<{ [key: string]: number }>({});
  const [cmsInput, setCmsInput] = useState('');
  const [cmsTestInput, setCmsTestInput] = useState('');
  const [cmsEstimation, setCmsEstimation] = useState<{ estimated: number; actual: number } | null>(null);

  // Bloom hash functions
  const hash1 = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 12;
    return Math.abs(hash);
  };

  const hash2 = (str: string) => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) hash = (hash * 33 + str.charCodeAt(i)) % 12;
    return Math.abs(hash);
  };

  const registerUsername = () => {
    if (!usernameInput) return;
    const h1 = hash1(usernameInput);
    const h2 = hash2(usernameInput);
    
    setBitArray(prev => {
      const next = [...prev];
      next[h1] = 1;
      next[h2] = 1;
      return next;
    });

    setUsernames(prev => [...prev, usernameInput]);
    setUsernameInput('');
  };

  const checkUsername = () => {
    if (!testInput) return;
    const h1 = hash1(testInput);
    const h2 = hash2(testInput);

    if (bitArray[h1] === 1 && bitArray[h2] === 1) {
      setTestResult('MAYBE');
    } else {
      setTestResult('NO');
    }
  };

  const clearBloom = () => {
    setBitArray(Array(12).fill(0));
    setUsernames([]);
    setUsernameInput('');
    setTestInput('');
    setTestResult(null);
  };

  // Count-Min Sketch hash function
  const cmsHash = (str: string, row: number) => {
    let hash = row * 17 + 7;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % 8;
    }
    return Math.abs(hash);
  };

  const addStreamEvent = (wordToUse?: string) => {
    const val = wordToUse || cmsInput;
    if (!val) return;

    setStreamEvents(prev => ({
      ...prev,
      [val]: (prev[val] || 0) + 1
    }));

    setSketchGrid(prev => {
      const next = prev.map(row => [...row]);
      for (let r = 0; r < 3; r++) {
        const col = cmsHash(val, r);
        next[r][col] += 1;
      }
      return next;
    });

    if (!wordToUse) setCmsInput('');
  };

  const estimateCmsFrequency = () => {
    if (!cmsTestInput) return;
    const h0 = cmsHash(cmsTestInput, 0);
    const h1 = cmsHash(cmsTestInput, 1);
    const h2 = cmsHash(cmsTestInput, 2);

    const v0 = sketchGrid[0][h0];
    const v1 = sketchGrid[1][h1];
    const v2 = sketchGrid[2][h2];

    const estimated = Math.min(v0, v1, v2);
    const actual = streamEvents[cmsTestInput] || 0;

    setCmsEstimation({ estimated, actual });
  };

  const clearCms = () => {
    setSketchGrid([
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]);
    setStreamEvents({});
    setCmsInput('');
    setCmsTestInput('');
    setCmsEstimation(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Probabilistic Algorithms Lab</h4>
            <p className="text-xs text-gray-400">Interact with Bloom Filters (membership testing) & Count-Min Sketch (frequency estimation) models.</p>
         </div>
         <div className="flex bg-[#111113] border border-[#27272A] rounded-xl p-1 shrink-0">
            <button 
              onClick={() => setActiveTab('BLOOM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'BLOOM' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Bloom Filter
            </button>
            <button 
              onClick={() => setActiveTab('COUNT_MIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'COUNT_MIN' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Count-Min Sketch
            </button>
         </div>
      </div>

      {activeTab === 'BLOOM' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
           <div className="md:col-span-5 bg-[#111113] border border-[#27272A] p-5 rounded-2xl space-y-4">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-400">1. Add Username (Populate Filter)</label>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. ian123..." 
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="flex-1 bg-[#1A1A1D] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                    <button onClick={registerUsername} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all">
                       Register
                    </button>
                 </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#1F1F22]">
                 <label className="text-xs font-bold text-gray-400">2. Test Username (Lookup)</label>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. check username..." 
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      className="flex-1 bg-[#1A1A1D] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    />
                    <button onClick={checkUsername} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all">
                       Test
                    </button>
                 </div>
                 
                 {testResult && (
                    <div className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${testResult === 'MAYBE' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                       <span>Result: {testResult === 'MAYBE' ? 'Maybe Registered' : 'Definitively Not Taken'}</span>
                       <span className="text-[10px] opacity-60">{testResult === 'MAYBE' ? 'Bloom Match' : 'Zero Risk'}</span>
                    </div>
                 )}
              </div>
           </div>

           <div className="md:col-span-7 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between">
              <div>
                 <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bit Array Visualization (M=12)</h5>
                    <button onClick={clearBloom} className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1">
                       <RotateCcw className="w-2.5 h-2.5" /> Clear Array
                    </button>
                 </div>
                 <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                    {bitArray.map((bit, idx) => (
                       <div key={idx} className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold border transition-all duration-300 ${bit === 1 ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10' : 'bg-[#0A0A0B] border-[#27272A] text-gray-700'}`}>
                             {bit}
                          </div>
                          <span className="text-[9px] text-gray-500 mt-1">idx {idx}</span>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="pt-4 border-t border-[#1F1F22] mt-4">
                 <h6 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Registered Usernames List (Primary DB)</h6>
                 <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto custom-scrollbar">
                    {usernames.length === 0 ? (
                       <span className="text-[10px] text-gray-600">No usernames registered.</span>
                    ) : (
                       usernames.map((u, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">{u}</span>
                       ))
                    )}
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
           {/* Controls column */}
           <div className="md:col-span-5 bg-[#111113] border border-[#27272A] p-5 rounded-2xl space-y-4">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-400">1. Publish Stream Event</label>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. @TaylorSwift..." 
                      value={cmsInput}
                      onChange={(e) => setCmsInput(e.target.value)}
                      className="flex-1 bg-[#1A1A1D] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                    <button onClick={() => addStreamEvent()} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all">
                       Emit
                    </button>
                 </div>
                 
                 {/* Quick clicks for stream generation */}
                 <div className="flex flex-wrap gap-1.5 pt-1.5">
                   {['@TaylorSwift', '@TaylorSwift', '@ian', '@bot', '@bot', '@bot'].map((pre, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => addStreamEvent(pre)}
                        className="px-2 py-1 bg-zinc-800 text-[9px] hover:bg-zinc-700 text-zinc-300 rounded"
                      >
                        +{pre}
                      </button>
                   ))}
                 </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#1F1F22]">
                 <label className="text-xs font-bold text-gray-400">2. Estimate Frequency</label>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. @TaylorSwift..." 
                      value={cmsTestInput}
                      onChange={(e) => setCmsTestInput(e.target.value)}
                      className="flex-1 bg-[#1A1A1D] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    />
                    <button onClick={estimateCmsFrequency} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all">
                       Estimate
                    </button>
                 </div>

                 {cmsEstimation && (
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1.5 text-xs">
                       <div className="flex justify-between font-mono">
                          <span className="text-gray-400">Estimated Hits:</span>
                          <span className="text-emerald-400 font-bold">{cmsEstimation.estimated}</span>
                       </div>
                       <div className="flex justify-between font-mono border-t border-[#1F1F22] pt-1">
                          <span className="text-gray-400">Real (DB) Hits:</span>
                          <span className="text-blue-400 font-bold">{cmsEstimation.actual}</span>
                       </div>
                       <p className="text-[9px] text-gray-500 leading-tight">
                         {cmsEstimation.estimated > cmsEstimation.actual 
                           ? "⚠️ Overestimation detected due to hash collisions! (Expected behavior)." 
                           : "✅ Perfectly accurate estimate (No colliding hashes)."}
                       </p>
                    </div>
                 )}
              </div>
           </div>

           {/* Grid Visualization Column */}
           <div className="md:col-span-7 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between">
              <div>
                 <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Count-Min Grid (3 Hash rows x 8 Cols)</h5>
                    <button onClick={clearCms} className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1">
                       <RotateCcw className="w-2.5 h-2.5" /> Reset Grid
                    </button>
                 </div>

                 <div className="space-y-4">
                    {sketchGrid.map((row, rIdx) => (
                       <div key={rIdx} className="space-y-1">
                          <div className="flex justify-between text-[8px] text-gray-500 font-mono">
                             <span>Hash Function Row #{rIdx}</span>
                             <span>Active Indices</span>
                          </div>
                          <div className="grid grid-cols-8 gap-1">
                             {row.map((val, cIdx) => (
                                <div 
                                  key={cIdx} 
                                  className={`aspect-square sm:p-2 rounded-lg flex items-center justify-center font-mono text-xs font-bold border transition-all ${
                                    val > 0 
                                      ? 'bg-blue-600/20 border-blue-500/60 text-blue-400' 
                                      : 'bg-[#0A0A0B] border-[#27272A] text-gray-700'
                                  }`}
                                >
                                   {val}
                                </div>
                             ))}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="pt-4 border-t border-[#1F1F22] mt-4 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                 <span>Space Required: 24 counters</span>
                 <span className="text-gray-400">Handles infinite streams</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

// 5. CAP Theorem Partition Lab (imported from ./labs/CAPTheoremLab)

// 5b. E-Commerce Shoe Inventory Conflict Lab (Eventual vs Strong Consistency)
function ShoeConflictLab() {
  const [consistencyMode, setConsistencyMode] = useState<'STRONG' | 'EVENTUAL'>('STRONG');
  const [stock, setStock] = useState<number>(1);
  const [tokyoStatus, setTokyoStatus] = useState<'IDLE' | 'BUYING' | 'CONFIRMED' | 'REJECTED'>('IDLE');
  const [londonStatus, setLondonStatus] = useState<'IDLE' | 'BUYING' | 'CONFIRMED' | 'REJECTED' | 'REFUNDED_COUPON'>('IDLE');
  const [tokyoLogs, setTokyoLogs] = useState<string[]>([]);
  const [londonLogs, setLondonLogs] = useState<string[]>([]);
  const [reconcileStrategy, setReconcileStrategy] = useState<'CANCEL_OLDER' | 'COUPON_MERGE'>('CANCEL_OLDER');
  const [isReplicating, setIsReplicating] = useState(false);

  const startSimulation = () => {
    // Reset statuses
    setStock(1);
    setTokyoStatus('IDLE');
    setLondonStatus('IDLE');
    setTokyoLogs([]);
    setLondonLogs([]);
    setIsReplicating(false);

    if (consistencyMode === 'STRONG') {
      // Tokyo clicks slightly faster or gets lock first
      setTokyoStatus('BUYING');
      setTokyoLogs(prev => [`[TOKYO] Initiating transaction...`, `[DB] Acquiring row-level write lock on Shoe #42`, ...prev]);
      
      setTimeout(() => {
        setLondonStatus('BUYING');
        setLondonLogs(prev => [`[LONDON] Initiating transaction...`, `[DB] Waiting on row lock held by Tokyo...`, ...prev]);
      }, 200);

      setTimeout(() => {
        setStock(0);
        setTokyoStatus('CONFIRMED');
        setTokyoLogs(prev => [`[DB] Lock held. Decremented stock to 0.`, `[TOKYO] Order #883 confirmed!`, `[DB] Releasing row lock.`, ...prev]);
      }, 1000);

      setTimeout(() => {
        setLondonStatus('REJECTED');
        setLondonLogs(prev => [`[DB] Acquired lock. Stock is 0.`, `[LONDON] Order failed: OUT OF STOCK.`, `[DB] Releasing row lock.`, ...prev]);
      }, 1800);

    } else {
      // Eventual Consistency: Local writes accepted instantly on local replicas
      setTokyoStatus('BUYING');
      setTokyoLogs(prev => [`[TOKYO_DB] Local replica accepts write instantly (No global lock).`, ...prev]);
      
      setTimeout(() => {
        setLondonStatus('BUYING');
        setLondonLogs(prev => [`[LONDON_DB] Local replica accepts write instantly (No global lock).`, ...prev]);
      }, 150);

      setTimeout(() => {
        setTokyoStatus('CONFIRMED');
        setTokyoLogs(prev => [`[TOKYO] Order #883 CONFIRMED locally! (Stock 1 -> 0)`, ...prev]);
      }, 800);

      setTimeout(() => {
        setLondonStatus('CONFIRMED');
        setLondonLogs(prev => [`[LONDON] Order #884 CONFIRMED locally! (Stock 1 -> 0)`, ...prev]);
      }, 900);

      // Trigger cross-region replication conflict
      setTimeout(() => {
        setIsReplicating(true);
        setTokyoLogs(prev => [`[REPLICATION] Syncing local logs to London...`, ...prev]);
        setLondonLogs(prev => [`[REPLICATION] Syncing local logs to Tokyo...`, ...prev]);
      }, 2200);

      // Detect and reconcile
      setTimeout(() => {
        setIsReplicating(false);
        setTokyoLogs(prev => [`[CONFLICT] Conflict detected: Over-sold Shoe #42! 2 sales for 1 stock!`, ...prev]);
        setLondonLogs(prev => [`[CONFLICT] Conflict detected: Over-sold Shoe #42! 2 sales for 1 stock!`, ...prev]);

        if (reconcileStrategy === 'CANCEL_OLDER') {
          setLondonStatus('REJECTED');
          setLondonLogs(prev => [`[RECONCILE] Strategy: Cancel older transaction. London order cancelled. Refund processed.`, ...prev]);
          setTokyoLogs(prev => [`[RECONCILE] Tokyo order preserved.`, ...prev]);
        } else {
          setLondonStatus('REFUNDED_COUPON');
          setLondonLogs(prev => [`[RECONCILE] Business Merge policy: Refund processed + 20% Discount Coupon emitted.`, ...prev]);
          setTokyoLogs(prev => [`[RECONCILE] Tokyo order processed.`, ...prev]);
        }
      }, 4200);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Eventual vs. Strong Consistency Simulator</h4>
            <p className="text-xs text-gray-400">Watch what happens when customers across the globe buy the last pair of shoes at the exact same millisecond.</p>
         </div>

         <div className="flex bg-[#111113] border border-[#27272A] rounded-xl p-1 shrink-0">
            <button 
              onClick={() => { setConsistencyMode('STRONG'); startSimulation(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${consistencyMode === 'STRONG' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Strong Consistency
            </button>
            <button 
              onClick={() => { setConsistencyMode('EVENTUAL'); startSimulation(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${consistencyMode === 'EVENTUAL' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Eventual Consistency
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         {/* Control Panel */}
         <div className="md:col-span-4 bg-[#111113] border border-[#27272A] p-5 rounded-2xl space-y-4">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Simulation Sandbox</h5>
            
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
               <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Global Shoe Inventory:</span>
                  <span className="text-orange-400 font-bold font-mono text-sm">{stock} Left</span>
               </div>
               <p className="text-[10px] text-gray-500 leading-tight">
                 {consistencyMode === 'STRONG' 
                   ? "Locks DB record globally. Slow writes, but zero risk of double selling."
                   : "Accepts local orders instantly. Very fast, but creates conflicts during lag sync."}
               </p>
            </div>

            {consistencyMode === 'EVENTUAL' && (
              <div className="space-y-1.5 pt-2">
                 <label className="text-[10px] text-gray-500 font-bold uppercase block">Eventual Conflict Resolution Strategy</label>
                 <div className="grid grid-cols-2 gap-1.5 bg-[#0A0A0B] p-1 border border-[#27272A] rounded-xl">
                    <button 
                      onClick={() => setReconcileStrategy('CANCEL_OLDER')}
                      className={`py-1 rounded-lg text-[10px] font-bold transition-all ${reconcileStrategy === 'CANCEL_OLDER' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
                    >
                       Last-Write-Wins
                    </button>
                    <button 
                      onClick={() => setReconcileStrategy('COUPON_MERGE')}
                      className={`py-1 rounded-lg text-[10px] font-bold transition-all ${reconcileStrategy === 'COUPON_MERGE' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
                    >
                       Coupon Merge
                    </button>
                 </div>
              </div>
            )}

            <button onClick={startSimulation} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5">
               <Zap className="w-4 h-4 text-orange-400" /> Start Checkout Conflict
            </button>
         </div>

         {/* Visual Cluster Map */}
         <div className="md:col-span-8 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between min-h-[300px]">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cross-Region Checkout Replication Map</h5>

            <div className="flex justify-around items-center flex-1 py-4 border-b border-[#1F1F22] relative">
               {/* Region Tokyo */}
               <div className="flex flex-col items-center text-center w-36 z-10">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Region: Tokyo</span>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center my-2 border transition-all duration-300 ${
                    tokyoStatus === 'CONFIRMED' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' :
                    tokyoStatus === 'BUYING' ? 'bg-blue-600/20 border-blue-500 text-blue-400 animate-pulse' :
                    'bg-[#0A0A0B] border-[#27272A] text-gray-500'
                  }`}>
                     <Database className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white">Tokyo Client</span>
                  <span className={`text-[9px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded ${
                    tokyoStatus === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' :
                    tokyoStatus === 'BUYING' ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                     {tokyoStatus === 'IDLE' ? 'Ready' : tokyoStatus}
                  </span>
               </div>

               {/* Network replication pipeline */}
               <div className="flex-1 max-w-[120px] flex flex-col items-center justify-center relative">
                  <div className="w-full h-1 bg-[#27272A] relative overflow-hidden flex items-center">
                     {isReplicating && (
                        <>
                          <motion.div 
                            className="absolute h-full w-4 bg-orange-500"
                            animate={{ left: ['0%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                          />
                          <motion.div 
                            className="absolute h-full w-4 bg-orange-500"
                            animate={{ left: ['100%', '0%'] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                          />
                        </>
                     )}
                     {consistencyMode === 'STRONG' && (tokyoStatus === 'BUYING' || londonStatus === 'BUYING') && (
                        <div className="absolute inset-0 bg-red-500/20 animate-pulse flex items-center justify-center">
                           <span className="text-[7px] text-red-400 font-bold tracking-wider">ROW_LOCK</span>
                        </div>
                     )}
                  </div>
                  <span className="text-[8px] text-gray-600 mt-1 uppercase tracking-widest font-mono">Sync Channel</span>
               </div>

               {/* Region London */}
               <div className="flex flex-col items-center text-center w-36 z-10">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Region: London</span>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center my-2 border transition-all duration-300 ${
                    londonStatus === 'CONFIRMED' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' :
                    londonStatus === 'REJECTED' ? 'bg-red-600/20 border-red-500 text-red-400' :
                    londonStatus === 'REFUNDED_COUPON' ? 'bg-amber-600/20 border-amber-500 text-amber-400' :
                    londonStatus === 'BUYING' ? 'bg-blue-600/20 border-blue-500 text-blue-400 animate-pulse' :
                    'bg-[#0A0A0B] border-[#27272A] text-gray-500'
                  }`}>
                     <Database className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white">London Client</span>
                  <span className={`text-[9px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded ${
                    londonStatus === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' :
                    londonStatus === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                    londonStatus === 'REFUNDED_COUPON' ? 'bg-amber-500/10 text-amber-400' :
                    londonStatus === 'BUYING' ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                     {londonStatus === 'IDLE' ? 'Ready' : londonStatus.replace('_', ' ')}
                  </span>
               </div>
            </div>

            {/* Split region logs */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#1F1F22]">
               <div>
                  <h6 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tokyo DB Logs</h6>
                  <div className="h-20 overflow-y-auto custom-scrollbar font-mono text-[8px] space-y-1 text-gray-400">
                     {tokyoLogs.map((log, idx) => <div key={idx}>{log}</div>)}
                     {tokyoLogs.length === 0 && <span className="text-gray-600">Idle...</span>}
                  </div>
               </div>
               <div className="border-l border-[#1F1F22] pl-4">
                  <h6 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">London DB Logs</h6>
                  <div className="h-20 overflow-y-auto custom-scrollbar font-mono text-[8px] space-y-1 text-gray-400">
                     {londonLogs.map((log, idx) => <div key={idx}>{log}</div>)}
                     {londonLogs.length === 0 && <span className="text-gray-600">Idle...</span>}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// 6. Raft Consensus Leader Election
function RaftElectionLab() {
  const [nodes, setNodes] = useState<{ id: string; role: 'LEADER' | 'CANDIDATE' | 'FOLLOWER'; votes: number }[]>([
    { id: 'Node 1', role: 'FOLLOWER', votes: 0 },
    { id: 'Node 2', role: 'FOLLOWER', votes: 0 },
    { id: 'Node 3', role: 'LEADER', votes: 0 },
    { id: 'Node 4', role: 'FOLLOWER', votes: 0 },
    { id: 'Node 5', role: 'FOLLOWER', votes: 0 },
  ]);
  const [isElecting, setIsElecting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const triggerLeaderCrashAndElection = () => {
    setIsElecting(true);
    setLogs(prev => ['[SYSTEM] Current Leader (Node 3) crashed / offline.', ...prev]);
    
    setNodes(prev => prev.map(n => n.id === 'Node 3' ? { ...n, role: 'FOLLOWER' } : n));

    setTimeout(() => {
      setLogs(prev => ['[RAFT] Node 1 timer timed out. Declaring candidacy...', ...prev]);
      setNodes(prev => prev.map(n => n.id === 'Node 1' ? { ...n, role: 'CANDIDATE' } : n));
    }, 1200);

    setTimeout(() => {
      setLogs(prev => ['[RAFT] Node 1 requesting votes from peers...', ...prev]);
    }, 2000);

    setTimeout(() => {
      setLogs(prev => [
        '[RAFT] Vote received from Node 2 (Granted)',
        '[RAFT] Vote received from Node 4 (Granted)',
        '[RAFT] Vote received from Node 5 (Granted)',
        '[RAFT] Quorum (4/5 votes) reached!',
        ...prev
      ]);
      setNodes(prev => prev.map(n => n.id === 'Node 1' ? { ...n, role: 'LEADER', votes: 4 } : n));
      setIsElecting(false);
    }, 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Raft Quorum Consensus</h4>
            <p className="text-xs text-gray-400">Crash the current database leader and watch peers run a Raft voting protocol to elect a new leader.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-4 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
               <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Consensus Admin</h5>
               <p className="text-xs text-gray-500 leading-relaxed">
                  Consensus algorithms require a majority quorum (e.g., 3 out of 5 nodes) to perform cluster operations and safely elect leaders.
               </p>
               <button 
                 onClick={triggerLeaderCrashAndElection}
                 disabled={isElecting}
                 className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-500/20 text-white rounded-xl text-xs font-bold transition-all"
               >
                  {isElecting ? 'Election in Progress...' : 'Crash Leader (Node 3)'}
               </button>
            </div>
            <div className="pt-4 border-t border-[#1F1F22] mt-4">
               <span className="text-[10px] text-gray-500 block uppercase tracking-wider mb-2">Protocol History</span>
               <div className="bg-[#0A0A0B] p-3 rounded-xl border border-[#27272A] h-28 overflow-y-auto custom-scrollbar font-mono text-[9px] text-gray-400 space-y-1">
                  {logs.length === 0 ? (
                     <div className="text-gray-600 text-center py-6">Raft cluster stable.</div>
                  ) : (
                     logs.map((l, i) => <div key={i}>{l}</div>)
                  )}
               </div>
            </div>
         </div>

         <div className="md:col-span-8 bg-[#111113] border border-[#27272A] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-8">Node States Map</h5>
            <div className="flex flex-wrap gap-4 justify-center items-center">
               {nodes.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-4 rounded-xl border w-28 text-center flex flex-col justify-center items-center transition-all duration-300 ${n.role === 'LEADER' ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg' : n.role === 'CANDIDATE' ? 'bg-blue-500/10 border-blue-500/50 animate-pulse' : 'bg-[#0A0A0B] border-[#27272A]'}`}
                  >
                     <Cpu className={`w-6 h-6 mb-2 ${n.role === 'LEADER' ? 'text-emerald-400' : n.role === 'CANDIDATE' ? 'text-blue-400' : 'text-gray-400'}`} />
                     <span className="text-xs font-bold text-white">{n.id}</span>
                     <span className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded uppercase ${n.role === 'LEADER' ? 'bg-emerald-500/20 text-emerald-400' : n.role === 'CANDIDATE' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-500'}`}>
                        {n.role}
                     </span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

// 7. Message Queue Guarantees
function QueueGuaranteesLab() {
  const [guarantee, setGuarantee] = useState<'AT_MOST' | 'AT_LEAST' | 'EXACTLY'>('AT_MOST');
  const [logs, setLogs] = useState<string[]>([]);
  const [messagesInFlight, setMessagesInFlight] = useState<number[]>([]);

  const publishMessage = () => {
    const msgId = Math.floor(Math.random() * 100) + 100;
    setLogs(prev => [`Producer: Sent Msg #${msgId}`, ...prev]);
    setMessagesInFlight([msgId]);

    setTimeout(() => {
      const isDropped = Math.random() > 0.6; // Simulating packet drop

      if (isDropped) {
        if (guarantee === 'AT_MOST') {
          // At most once: broker drops it, no retries, client never receives
          setLogs(prev => [
            `Broker: Packet dropped. Msg #${msgId} is lost forever.`,
            `Guarantees: Completed with 0-1 delivery.`,
            ...prev
          ]);
          setMessagesInFlight([]);
        } else if (guarantee === 'AT_LEAST') {
          // At least once: drop detected, producer retries, resulting in duplicate delivery possibility
          setLogs(prev => [
            `Broker: Packet dropped! Triggering Producer Retry...`,
            `Producer Retry: Re-sending Msg #${msgId}`,
            `Consumer: Received duplicate Msg #${msgId}`,
            `Guarantees: Completed with 1+ delivery guarantee.`,
            ...prev
          ]);
          setMessagesInFlight([]);
        } else {
          // Exactly once: deduplication filter ensures exactly one receipt
          setLogs(prev => [
            `Broker: Packet dropped! Triggering Producer Retry...`,
            `Producer Retry: Re-sending Msg #${msgId}`,
            `Consumer: Detected duplicate Msg #${msgId}. Deduplicating index.`,
            `Consumer: Handled exactly once Msg #${msgId}`,
            ...prev
          ]);
          setMessagesInFlight([]);
        }
      } else {
        // Normal direct delivery
        setLogs(prev => [
          `Consumer: Successfully processed Msg #${msgId}`,
          ...prev
        ]);
        setMessagesInFlight([]);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">MQ Delivery Guarantees</h4>
            <p className="text-xs text-gray-400">Observe delivery semantics under network loss: At-Most-Once vs At-Least-Once vs Exactly-Once.</p>
         </div>
         <div className="flex bg-[#111113] border border-[#27272A] rounded-xl p-1">
            <button 
              onClick={() => { setGuarantee('AT_MOST'); setLogs([]); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${guarantee === 'AT_MOST' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              At-Most-Once
            </button>
            <button 
              onClick={() => { setGuarantee('AT_LEAST'); setLogs([]); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${guarantee === 'AT_LEAST' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              At-Least-Once
            </button>
            <button 
              onClick={() => { setGuarantee('EXACTLY'); setLogs([]); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${guarantee === 'EXACTLY' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Exactly-Once
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-4 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
               <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Publish Console</h5>
               <p className="text-xs text-gray-500 leading-relaxed">
                  {guarantee === 'AT_MOST' && 'At-Most-Once does not retry. It has lowest overhead but risks loss.'}
                  {guarantee === 'AT_LEAST' && 'At-Least-Once guarantees delivery via retries, but can duplicate records.'}
                  {guarantee === 'EXACTLY' && 'Exactly-Once guarantees delivery without duplication using unique txn IDs.'}
               </p>
               <button onClick={publishMessage} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all">
                  Publish Message
               </button>
            </div>
            <div className="pt-4 border-t border-[#1F1F22]">
               <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Deduplication Map:</span>
                  <span className="font-mono text-gray-300">{guarantee === 'EXACTLY' ? 'Active' : 'Bypassed'}</span>
               </div>
            </div>
         </div>

         <div className="md:col-span-8 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col min-h-[250px]">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Pipeline Animation</h5>
            
            <div className="flex justify-around items-center flex-1 py-4 border-b border-[#1F1F22]">
               <div className="text-center">
                  <Smartphone className="w-8 h-8 text-indigo-400 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-400">Producer</span>
               </div>
               
               <div className="flex-1 max-w-[150px] relative">
                  <div className="h-1 bg-[#27272A]" />
                  {messagesInFlight.map(id => (
                     <motion.div 
                       key={id}
                       className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white"
                       animate={{ left: ['0%', '100%'] }}
                       transition={{ duration: 1.5 }}
                     >
                        m
                     </motion.div>
                  ))}
               </div>

               <div className="text-center">
                  <Server className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-400">Broker</span>
               </div>
            </div>

            <div className="mt-4 flex-1">
               <h6 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 font-mono">Message Delivery Log</h6>
               <div className="max-h-24 overflow-y-auto custom-scrollbar font-mono text-[9px] text-gray-400 space-y-1">
                  {logs.length === 0 ? (
                     <div className="text-gray-600 py-4 text-center">Publish a message to watch lifecycle events.</div>
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

// 8. Backpressure Lab
function BackpressureLab() {
  const [backpressureOn, setBackpressureOn] = useState(false);
  const [producerRate, setProducerRate] = useState(10); // requests per interval
  const [consumerLag, setConsumerLag] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    let interval: any;
    interval = setInterval(() => {
      // Simulate slow Consumer Processing
      const processed = Math.min(consumerLag + producerRate, 4); // max process is 4 ops
      const newLag = Math.max(0, consumerLag + producerRate - processed);

      if (backpressureOn && newLag > 15) {
        // Trigger backpressure, automatically scale down producer rate
        setProducerRate(2);
        setLogs(prev => ['[BACKPRESSURE] Consumer queue overloaded! Signal sent upstream to throttle producer rate to 2 op/s.', ...prev]);
      } else if (!backpressureOn && newLag > 25) {
        setLogs(prev => ['[ALERT] Queue capacity limit breached! Dropping requests & memory overflowing.', ...prev]);
      }

      setConsumerLag(newLag);
    }, 1000);

    return () => clearInterval(interval);
  }, [producerRate, consumerLag, backpressureOn]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Backpressure Ingestion Signal</h4>
            <p className="text-xs text-gray-400">Animate producer overflowing slow database. Turn on backpressure to protect memory buffers from crashing.</p>
         </div>
         <div className="flex bg-[#111113] border border-[#27272A] rounded-xl p-1">
            <button 
              onClick={() => { setBackpressureOn(true); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${backpressureOn ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Backpressure ON
            </button>
            <button 
              onClick={() => { setBackpressureOn(false); setProducerRate(10); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!backpressureOn ? 'bg-zinc-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Disabled
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-4 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
               <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Simulator Stats</h5>
               <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                     <span className="text-gray-500">Producer Ingress Rate:</span>
                     <span className="text-blue-400 font-mono font-bold">{producerRate} req/sec</span>
                  </div>
                  <div className="flex justify-between text-xs">
                     <span className="text-gray-500">Consumer Capacity:</span>
                     <span className="text-emerald-400 font-mono font-bold">4 req/sec</span>
                  </div>
                  <div className="flex justify-between text-xs">
                     <span className="text-gray-500">Memory Queue Size:</span>
                     <span className={`font-mono font-bold ${consumerLag > 20 ? 'text-red-400 animate-pulse' : 'text-zinc-300'}`}>{consumerLag} items</span>
                  </div>
               </div>
               <button 
                 onClick={() => { setProducerRate(12); setLogs(prev => ['[ADMIN] Increasing Producer speed manually.', ...prev]); }}
                 className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all"
               >
                  Set High Input Rate (12 r/s)
               </button>
            </div>
         </div>

         <div className="md:col-span-8 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col min-h-[250px]">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Ingress Visualizer</h5>
            
            <div className="h-2 bg-[#0a0a0b] rounded-full overflow-hidden border border-[#27272A] flex mb-6">
               <div 
                 className={`h-full transition-all duration-500 ${consumerLag > 20 ? 'bg-red-500' : 'bg-blue-500'}`} 
                 style={{ width: `${Math.min((consumerLag / 30) * 100, 100)}%` }} 
               />
            </div>

            <div className="flex-1 max-h-32 overflow-y-auto custom-scrollbar font-mono text-[9px] text-gray-400 space-y-1 bg-[#0A0A0B] p-3 rounded-xl border border-[#27272A]">
               {logs.length === 0 ? (
                  <div className="text-gray-600 text-center py-6">All systems stable under regular capacity.</div>
               ) : (
                  logs.map((l, i) => <div key={i}>{l}</div>)
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

// 9. CQRS & Event Sourcing
function CqrsSourcingLab() {
  const [commands, setCommands] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [readDb, setReadDb] = useState<{ id: number; item: string; stock: number }[]>([
    { id: 1, item: 'Shoe', stock: 15 },
    { id: 2, item: 'Laptop', stock: 5 },
  ]);

  const placeOrder = (item: string) => {
    // 1. Write Command
    const cmdId = `Cmd_${Math.floor(Math.random()*900)+100}`;
    setCommands(prev => [`[Command] POST_ORDER item=${item} (${cmdId})`, ...prev]);

    // 2. Emit Event
    setTimeout(() => {
      const evtId = `Evt_${Math.floor(Math.random()*900)+100}`;
      setEvents(prev => [`[Event] OrderCreated item=${item} (${evtId})`, ...prev]);
    }, 600);

    // 3. Update Read Database
    setTimeout(() => {
      setReadDb(prev => prev.map(dbItem => {
        if (dbItem.item === item) {
          return { ...dbItem, stock: Math.max(0, dbItem.stock - 1) };
        }
        return dbItem;
      }));
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div>
         <h4 className="text-sm font-bold text-white uppercase tracking-wider">CQRS & Event Sourcing Pipeline</h4>
         <p className="text-xs text-gray-400">Separates Write models (Commands) from Read models (Queries). Watch actions populate as immutable event stores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-4 bg-[#111113] border border-[#27272A] p-5 rounded-2xl space-y-4">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Write APIs (Commands)</h5>
            <div className="grid grid-cols-2 gap-2">
               <button onClick={() => placeOrder('Shoe')} className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all">
                  Order Shoe
               </button>
               <button onClick={() => placeOrder('Laptop')} className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all">
                  Order Laptop
               </button>
            </div>
            
            <div className="bg-[#0A0A0B] p-3 rounded-xl border border-[#27272A] space-y-2">
               <h6 className="text-[10px] font-bold text-gray-500 uppercase">Command Handler Log</h6>
               <div className="max-h-24 overflow-y-auto custom-scrollbar font-mono text-[9px] text-gray-400 space-y-1">
                  {commands.map((c, i) => <div key={i}>{c}</div>)}
               </div>
            </div>
         </div>

         <div className="md:col-span-8 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Event Store */}
               <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#27272A] flex flex-col min-h-[150px]">
                  <h6 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Immutable Event Store</h6>
                  <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[9px] text-gray-400 space-y-1">
                     {events.map((e, i) => <div key={i} className="text-yellow-400">{e}</div>)}
                  </div>
               </div>

               {/* Read DB */}
               <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#27272A] flex flex-col min-h-[150px]">
                  <h6 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Query Database (Materialized View)</h6>
                  <div className="flex-1 space-y-2">
                     {readDb.map(d => (
                        <div key={d.id} className="flex justify-between text-xs border-b border-[#1F1F22] pb-1">
                           <span className="text-gray-300 font-bold">{d.item}</span>
                           <span className="text-emerald-400 font-mono">Stock: {d.stock}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// 10. Circuit Breakers (imported from ./labs/CircuitBreakerLab)

// 11. Rate Limiting Algorithms (imported from ./labs/RateLimiterLab)

// 12. Idempotency Lab
function IdempotencyLab() {
  const [useIdempotencyKey, setUseIdempotencyKey] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [balance, setBalance] = useState(100);

  const performCheckout = () => {
    const key = useIdempotencyKey ? 'idempotency-key-8899' : null;
    
    setLogs(prev => [`[CLIENT] Double-clicked Pay button. sending request...`, ...prev]);

    // Send first write
    setBalance(b => Math.max(0, b - 20));
    setLogs(prev => [`[SERVER] Charge processed for $20. New Balance: $${balance - 20}`, ...prev]);

    // Double-click event: instant secondary request
    setTimeout(() => {
      if (key) {
        setLogs(prev => [`[SERVER] Detected existing key "${key}". Returning cached payout confirmation.`, ...prev]);
      } else {
        setBalance(b => Math.max(0, b - 20));
        setLogs(prev => [
          `[SERVER] Payout processed! Charged an additional $20 (Duplicate Checkout!)`,
          ...prev
        ]);
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Idempotency Checkout Keys</h4>
            <p className="text-xs text-gray-400">Turn on Idempotency keys. Prevent double payment charges when users double click Pay buttons.</p>
         </div>
         <div className="flex bg-[#111113] border border-[#27272A] rounded-xl p-1">
            <button 
              onClick={() => { setUseIdempotencyKey(true); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${useIdempotencyKey ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Idempotent Key ON
            </button>
            <button 
              onClick={() => { setUseIdempotencyKey(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!useIdempotencyKey ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              No Keys (Vulnerable)
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-4 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
               <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Checkout Simulator</h5>
               <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/50 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Available Balance:</span>
                  <span className="text-emerald-400 font-mono font-bold">${balance}</span>
               </div>
               <button onClick={performCheckout} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all">
                  Double Click Pay (Submit Payout)
               </button>
            </div>
         </div>

         <div className="md:col-span-8 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col min-h-[250px]">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Payment Ingress Logger</h5>
            <div className="flex-1 bg-[#0A0A0B] p-3 rounded-xl border border-[#27272A] h-28 overflow-y-auto custom-scrollbar font-mono text-[9px] text-gray-400 space-y-1.5">
               {logs.length === 0 ? (
                  <div className="text-gray-600 text-center py-6 font-sans">Simulate payment checkouts to watch deduplication actions.</div>
               ) : (
                  logs.map((l, i) => <div key={i} className={l.includes('Duplicate') ? 'text-red-400 font-bold' : 'text-gray-400'}>{l}</div>)
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

// 13. Real-Time Collaboration (OT vs CRDT)
function CollabLab() {
  const [collabType, setCollabType] = useState<'OT' | 'CRDT'>('OT');
  const [userADoc, setUserADoc] = useState('Welcome');
  const [userBDoc, setUserBDoc] = useState('Welcome');
  const [conflictLogs, setConflictLogs] = useState<string[]>([]);

  const simulateSimultaneousEdits = () => {
    // User A adds " to" -> "Welcome to"
    // User B adds " world" -> "Welcome world"
    setUserADoc('Welcome to');
    setUserBDoc('Welcome world');
    setConflictLogs(prev => [`[EDIT] User A: "Welcome to" | User B: "Welcome world"`, ...prev]);

    setTimeout(() => {
      if (collabType === 'OT') {
        // Operational Transformation transforms index shifts
        setUserADoc('Welcome to world');
        setUserBDoc('Welcome to world');
        setLogs(prev => [`[OT ENGINE] Operations transformed. Index adjusted to result: "Welcome to world"`, ...prev]);
      } else {
        // CRDT handles conflict resolution using unique nodes
        setUserADoc('Welcome to world');
        setUserBDoc('Welcome to world');
        setLogs(prev => [`[CRDT ENGINE] Unique ID Nodes linked: "Welcome to world"`, ...prev]);
      }
    }, 1500);
  };

  const setLogs = (fn: (prev: string[]) => string[]) => {
    setConflictLogs(fn);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Operational Transformation & CRDTs</h4>
            <p className="text-xs text-gray-400">Animate document sync strategies when two users type on the same line at the same time.</p>
         </div>
         <div className="flex bg-[#111113] border border-[#27272A] rounded-xl p-1">
            <button 
              onClick={() => { setCollabType('OT'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${collabType === 'OT' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              OT (Operational)
            </button>
            <button 
              onClick={() => { setCollabType('CRDT'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${collabType === 'CRDT' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              CRDT (State-based)
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-4 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
               <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Input Actions</h5>
               <button onClick={simulateSimultaneousEdits} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all">
                  Simulate Concurrent Edits
               </button>
            </div>
         </div>

         <div className="md:col-span-8 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col min-h-[250px]">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Live Shared State</h5>
            <div className="grid grid-cols-2 gap-4 mb-4">
               <div className="p-3 bg-[#0A0A0B] border border-[#27272A] rounded-xl">
                  <span className="text-[10px] text-gray-500">User A document:</span>
                  <div className="text-xs text-white font-mono mt-1">{userADoc}</div>
               </div>
               <div className="p-3 bg-[#0A0A0B] border border-[#27272A] rounded-xl">
                  <span className="text-[10px] text-gray-500">User B document:</span>
                  <div className="text-xs text-white font-mono mt-1">{userBDoc}</div>
               </div>
            </div>

            <div className="bg-[#0A0A0B] p-2 rounded-xl border border-[#27272A] h-24 overflow-y-auto custom-scrollbar font-mono text-[9px] text-gray-400">
               {conflictLogs.length === 0 ? (
                  <div className="text-gray-600 text-center py-6">All synchronized.</div>
               ) : (
                  conflictLogs.map((l, i) => <div key={i}>{l}</div>)
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

// 14. Location-Based Services (Quadtree Grid)
function QuadtreeLab() {
  const [searchRadius, setSearchRadius] = useState(50);
  const [foundCars, setFoundCars] = useState<number>(0);

  // Generate random car coordinates
  const [cars] = useState([
    { x: 40, y: 30 }, { x: 50, y: 60 }, { x: 120, y: 140 }, { x: 180, y: 90 },
    { x: 190, y: 220 }, { x: 220, y: 40 }, { x: 100, y: 210 }, { x: 110, y: 50 }
  ]);

  const [mousePos, setMousePos] = useState({ x: 120, y: 120 });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Calculate proximity
    let matches = 0;
    cars.forEach(car => {
      const dist = Math.sqrt((car.x - x) ** 2 + (car.y - y) ** 2);
      if (dist <= searchRadius) matches++;
    });
    setFoundCars(matches);
  };

  return (
    <div className="space-y-6">
      <div>
         <h4 className="text-sm font-bold text-white uppercase tracking-wider">Spatial Quadtrees & Geohashing</h4>
         <p className="text-xs text-gray-400">Simulate local proximity searches. Move your cursor on the grid map to fetch nearby cars instantaneously using spatial indexing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-4 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
               <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Location Scope</h5>
               <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                     <span className="text-gray-500">Query Range (Radius):</span>
                     <span className="text-blue-400 font-mono font-bold">{searchRadius}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="100" 
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                    className="w-full accent-blue-500 bg-[#1A1A1D] h-1.5 rounded-full appearance-none" 
                  />
                  <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/50 flex justify-between items-center text-xs">
                     <span className="text-gray-400">Drivers Fetched:</span>
                     <span className="text-emerald-400 font-mono font-bold">{foundCars} Drivers</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="md:col-span-8 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col items-center justify-center min-h-[250px]">
            <svg width="240" height="240" className="bg-[#0A0A0B] border border-[#27272A] rounded-xl cursor-crosshair" onMouseMove={handleMouseMove}>
               {/* Quadtree quadrants */}
               <line x1="120" y1="0" x2="120" y2="240" stroke="#1F1F22" strokeWidth="1" />
               <line x1="0" y1="120" x2="240" y2="120" stroke="#1F1F22" strokeWidth="1" />
               <line x1="60" y1="0" x2="60" y2="120" stroke="#1F1F22" strokeWidth="0.5" />
               <line x1="180" y1="0" x2="180" y2="120" stroke="#1F1F22" strokeWidth="0.5" />

               {/* Searching cursor shadow ring */}
               <circle cx={mousePos.x} cy={mousePos.y} r={searchRadius} fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />

               {/* Cars */}
               {cars.map((car, idx) => {
                 const isFound = Math.sqrt((car.x - mousePos.x)**2 + (car.y - mousePos.y)**2) <= searchRadius;
                 return (
                    <circle 
                      key={idx}
                      cx={car.x}
                      cy={car.y}
                      r="4"
                      fill={isFound ? '#10b981' : '#6b7280'}
                      className="transition-colors duration-200"
                    />
                 );
               })}
            </svg>
         </div>
      </div>
    </div>
  );
}

// 15. Heavy Media Streaming CDN
function HeavyStreamingLab() {
  const [selectedQuality, setSelectedQuality] = useState<'1080p' | '720p' | '480p'>('1080p');
  const [playbackLogs, setPlaybackLogs] = useState<string[]>([]);
  const [chunkIndex, setChunkIndex] = useState(0);

  const startStream = () => {
    setChunkIndex(0);
    setPlaybackLogs(prev => [`[CDN] Transcoding requested. Format: MP4-H.264`, `[CDN] Resolved closest Edge node (Node-Chicago-4)`, ...prev]);

    const timer = setInterval(() => {
      setChunkIndex(c => {
        if (c >= 5) {
          clearInterval(timer);
          setPlaybackLogs(p => [`[CDN] Streaming Buffer completed. playback continuous.`, ...p]);
          return c;
        }
        setPlaybackLogs(p => [`[STREAM] Fetched chunk #${c + 1} (${selectedQuality}) size: ${selectedQuality === '1080p' ? '12MB' : selectedQuality === '720p' ? '7MB' : '3MB'}`, ...p]);
        return c + 1;
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
         <h4 className="text-sm font-bold text-white uppercase tracking-wider">CDN Caching & Video Transcoding</h4>
         <p className="text-xs text-gray-400">Select resolution parameters. Observe chunked streaming flow from nearest localized CDN nodes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         <div className="md:col-span-4 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
               <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quality Controls</h5>
               <div className="grid grid-cols-3 gap-2">
                  {(['1080p', '720p', '480p'] as const).map(q => (
                     <button 
                       key={q}
                       onClick={() => { setSelectedQuality(q); }}
                       className={`py-1.5 rounded-lg text-xs font-bold transition-all ${selectedQuality === q ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-800 text-gray-500'}`}
                     >
                        {q}
                     </button>
                  ))}
               </div>
               <button onClick={startStream} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all">
                  Simulate Streaming Ingress
               </button>
            </div>
         </div>

         <div className="md:col-span-8 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col min-h-[250px]">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Buffer Progress</h5>
            <div className="flex gap-1 bg-[#0A0A0B] p-2 rounded-xl border border-[#27272A] mb-4">
               {Array.from({ length: 5 }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`flex-1 h-3 rounded transition-all duration-300 ${idx < chunkIndex ? 'bg-emerald-500' : 'bg-zinc-800'}`} 
                  />
               ))}
            </div>

            <div className="flex-1 bg-[#0A0A0B] p-3 rounded-xl border border-[#27272A] h-28 overflow-y-auto custom-scrollbar font-mono text-[9px] text-gray-400 space-y-1">
               {playbackLogs.length === 0 ? (
                  <div className="text-gray-600 text-center py-6 font-sans">Click ingress to start media streaming buffers.</div>
               ) : (
                  playbackLogs.map((l, i) => <div key={i}>{l}</div>)
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

// --- MAIN WRAPPER CONTAINER FOR SYSTEM LABS ---

type TabCategory = 'STORAGE' | 'CONSTRAINTS' | 'MESSAGING' | 'RESILIENCY' | 'DOMAINS';

export default function InteractiveSystemLabs() {
  const [activeCategory, setActiveCategory] = useState<TabCategory>('STORAGE');
  const [selectedTopic, setSelectedTopic] = useState<string>('SHARDING');

  const topics: Record<TabCategory, { id: string; name: string }[]> = {
    STORAGE: [
      { id: 'SHARDING', name: 'Sharding & Hot Shards' },
      { id: 'HASHING', name: 'Consistent Hashing' },
      { id: 'REPLICATION', name: 'Replication & Sync Lag' },
      { id: 'BLOOM', name: 'Bloom Filter Check' },
    ],
    CONSTRAINTS: [
      { id: 'CAP', name: 'CAP Partition Sandbox' },
      { id: 'CAP_SIM', name: 'CAP Tradeoff Simulator' },
      { id: 'CONFLICT', name: 'Strong vs Eventual (Shoe Sale)' },
      { id: 'RAFT', name: 'Raft Consensus election' },
    ],
    MESSAGING: [
      { id: 'MQ', name: 'MQ Semantics & Guarantees' },
      { id: 'BACKPRESSURE', name: 'Backpressure Ingestion' },
      { id: 'CQRS', name: 'CQRS & Event Sourcing' },
    ],
    RESILIENCY: [
      { id: 'CIRCUIT', name: 'Circuit Breaker logic' },
      { id: 'RATELIMIT', name: 'Rate Limiting Algos' },
      { id: 'IDEMPOTENCY', name: 'Idempotent checkout' },
    ],
    DOMAINS: [
      { id: 'COLLAB', name: 'OT / CRDT Real-time' },
      { id: 'QUADTREE', name: 'Spatial Quadtrees Map' },
      { id: 'CDN', name: 'Heavy Streaming CDN' },
    ]
  };

  // Automatically select the first topic when category changes
  useEffect(() => {
    setSelectedTopic(topics[activeCategory][0].id);
  }, [activeCategory]);

  return (
    <div className="flex h-full bg-[#0A0A0B] text-gray-300">
      {/* Topics Sidebar */}
      <div className="w-64 border-r border-[#1F1F22] bg-[#111113]/50 flex flex-col shrink-0">
         <div className="p-4 border-b border-[#1F1F22] bg-[#111113]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
               <Sliders className="w-3.5 h-3.5 text-blue-400" /> Lab Selector
            </h3>
         </div>

         {/* Categories */}
         <div className="flex border-b border-[#1F1F22] text-[10px] uppercase tracking-widest font-bold">
            {(['STORAGE', 'CONSTRAINTS', 'MESSAGING', 'RESILIENCY', 'DOMAINS'] as TabCategory[]).map(cat => (
               <button 
                 key={cat}
                 onClick={() => setActiveCategory(cat)}
                 className={`flex-1 py-3 text-center border-b-2 transition-all ${activeCategory === cat ? 'border-blue-500 text-white bg-blue-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
               >
                 {cat.slice(0, 4)}
               </button>
            ))}
         </div>

         {/* Topics list */}
         <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-1">
            {topics[activeCategory].map(topic => (
               <button 
                 key={topic.id}
                 onClick={() => setSelectedTopic(topic.id)}
                 className={`w-full text-left px-3 py-2 text-xs rounded-xl font-medium transition-all ${selectedTopic === topic.id ? 'bg-blue-600/10 text-white border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1D]'}`}
               >
                 {topic.name}
               </button>
            ))}
         </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
         {selectedTopic === 'SHARDING' && <ShardingLab />}
         {selectedTopic === 'HASHING' && <ConsistentHashingLab />}
         {selectedTopic === 'REPLICATION' && <ReplicationLagLab />}
         {selectedTopic === 'BLOOM' && <BloomFilterLab />}
         {selectedTopic === 'CAP' && <CAPTheoremLab />}
         {selectedTopic === 'CAP_SIM' && <CAPSimulator />}
         {selectedTopic === 'CONFLICT' && <ShoeConflictLab />}
         {selectedTopic === 'RAFT' && <RaftElectionLab />}
         {selectedTopic === 'MQ' && <QueueGuaranteesLab />}
         {selectedTopic === 'BACKPRESSURE' && <BackpressureLab />}
         {selectedTopic === 'CQRS' && <CqrsSourcingLab />}
         {selectedTopic === 'CIRCUIT' && <CircuitBreakerLab />}
         {selectedTopic === 'RATELIMIT' && <RateLimiterLab />}
         {selectedTopic === 'IDEMPOTENCY' && <IdempotencyLab />}
         {selectedTopic === 'COLLAB' && <CollabLab />}
         {selectedTopic === 'QUADTREE' && <QuadtreeLab />}
         {selectedTopic === 'CDN' && <HeavyStreamingLab />}
      </div>
    </div>
  );
}
