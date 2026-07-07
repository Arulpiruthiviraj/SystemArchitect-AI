import React, { useState, useEffect, useRef } from 'react';
import { 
  Server, Database, Wifi, WifiOff, Zap, FileText, 
  Activity, Shield, ShieldAlert, CheckCircle2, XCircle, 
  AlertCircle, RefreshCw, Info, ArrowRight, Play, Square 
} from 'lucide-react';

interface NodeState {
  id: string;
  name: string;
  value: string;
  version: number;
  status: 'ONLINE' | 'PARTITIONED';
  isLeader?: boolean;
}

interface ClientRequest {
  id: string;
  type: 'READ' | 'WRITE';
  targetNode: string;
  value?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  details: string;
  timestamp: number;
}

export default function CAPSimulator() {
  const [mode, setMode] = useState<'CP' | 'AP' | 'CA'>('CP');
  const [partitionActive, setPartitionActive] = useState(false);
  const [nodes, setNodes] = useState<NodeState[]>([
    { id: 'node_a', name: 'Replica A (Leader)', value: 'Data v1', version: 1, status: 'ONLINE', isLeader: true },
    { id: 'node_b', name: 'Replica B', value: 'Data v1', version: 1, status: 'ONLINE' },
    { id: 'node_c', name: 'Replica C', value: 'Data v1', version: 1, status: 'ONLINE' },
  ]);
  
  const [inputValue, setInputValue] = useState('Data v2');
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    staleReads: 0
  });
  const [simulationLogs, setSimulationLogs] = useState<string[]>([
    'CAP Simulator initialized. Default mode: CP (Consistency & Partition Tolerance).',
    'Cluster in healthy state. Node A is elected Leader. Consensus is achieved.'
  ]);

  // Handle partition toggle
  const togglePartition = () => {
    const nextPartition = !partitionActive;
    setPartitionActive(nextPartition);
    
    setNodes(prev => prev.map(node => {
      if (node.id === 'node_c') {
        return { ...node, status: nextPartition ? 'PARTITIONED' : 'ONLINE' };
      }
      return node;
    }));

    if (nextPartition) {
      if (mode === 'CA') {
        setSimulationLogs(prev => [
          `[PARTITION] WARNING: Network partition detected in CA mode! CA systems assume partitions never happen. Nodes will drop connections or halt to prevent split-brain.`,
          ...prev
        ]);
      } else {
        setSimulationLogs(prev => [
          `[PARTITION] Node C has been isolated from the main partition (Node A & B).`,
          ...prev
        ]);
      }
    } else {
      // Heal partition: sync Node C with leader (Node A)
      setNodes(prev => {
        const leader = prev.find(n => n.isLeader) || prev[0];
        return prev.map(node => {
          if (node.id === 'node_c') {
            return { 
              ...node, 
              status: 'ONLINE', 
              value: leader.value, 
              version: leader.version 
            };
          }
          return { ...node, status: 'ONLINE' };
        });
      });

      setSimulationLogs(prev => [
        `[HEAL] Network partition healed. Synchronizing Node C with Replica A (Leader) to achieve consistency.`,
        ...prev
      ]);
    }
  };

  const addLog = (msg: string) => {
    setSimulationLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  // Perform Client Write Operation
  const handleWrite = () => {
    const reqId = `W-${Math.floor(Math.random() * 9000) + 1000}`;
    const timestamp = Date.now();
    
    // Choose a random node the client contacts (Client could land on any replica)
    const targetNodeIndex = Math.floor(Math.random() * nodes.length);
    const contactedNode = nodes[targetNodeIndex];

    addLog(`Client initiated Write Request (${inputValue}) contacting ${contactedNode.name}...`);

    let requestSuccess = false;
    let details = '';
    
    setNodes(prev => {
      const updated = [...prev];
      const leader = updated.find(n => n.isLeader) || updated[0];

      if (partitionActive) {
        if (mode === 'CP') {
          // CP requires a quorum (majority) of healthy interconnected nodes to accept writes
          // Healthy group: A + B (2 out of 3 = Quorum!). Node C is isolated.
          if (contactedNode.id === 'node_c') {
            // Node C cannot talk to the majority (Leader A) -> Write fails!
            details = `Write Rejected. Node C is isolated and cannot participate in leader quorum.`;
            addLog(`[FAIL] Write Rejected: contacted node (${contactedNode.name}) is in minor partition.`);
          } else {
            // Contacted node is in healthy partition -> can establish quorum with Node B
            leader.value = inputValue;
            leader.version += 1;
            
            // Sync with Node B (who is online)
            const nodeB = updated.find(n => n.id === 'node_b')!;
            nodeB.value = leader.value;
            nodeB.version = leader.version;

            requestSuccess = true;
            details = `Write Succeeded (Quorum 2/3 achieved with Node A & B).`;
            addLog(`[SUCCESS] Write committed to Node A and Replica B.`);
          }
        } else if (mode === 'AP') {
          // AP permits partition writes locally to preserve availability
          const target = updated.find(n => n.id === contactedNode.id)!;
          target.value = inputValue;
          target.version += 1;

          // If contacted Node A or B, they can sync with each other
          if (contactedNode.id !== 'node_c') {
            const partnerId = contactedNode.id === 'node_a' ? 'node_b' : 'node_a';
            const partner = updated.find(n => n.id === partnerId)!;
            partner.value = target.value;
            partner.version = target.version;
          }

          requestSuccess = true;
          details = `Write Succeeded locally at ${contactedNode.name}. Data will diverge!`;
          addLog(`[WARNING] Write completed locally at ${contactedNode.name}. Network partition is active, so replication is pending.`);
        } else {
          // CA Mode under partition: entire system halts or throws exceptions
          details = `Write Failed. CA system does not tolerate network partitions and has halted write operations.`;
          addLog(`[CRITICAL] CA Halted: Writes disabled to prevent diverging datasets.`);
        }
      } else {
        // Healthy system: Writes propagate immediately to all nodes
        updated.forEach(n => {
          n.value = inputValue;
          n.version += 1;
        });
        requestSuccess = true;
        details = `Write propagated to all replicas successfully.`;
        addLog(`[SUCCESS] Write committed and replicated to all nodes (A, B, C).`);
      }

      return updated;
    });

    // Update Stats and client request logs
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      success: prev.success + (requestSuccess ? 1 : 0),
      failed: prev.failed + (requestSuccess ? 0 : 1)
    }));

    setRequests(prev => [
      {
        id: reqId,
        type: 'WRITE',
        targetNode: contactedNode.name,
        value: inputValue,
        status: requestSuccess ? 'SUCCESS' : 'FAILED',
        details,
        timestamp
      },
      ...prev.slice(0, 10)
    ]);
  };

  // Perform Client Read Operation
  const handleRead = () => {
    const reqId = `R-${Math.floor(Math.random() * 9000) + 1000}`;
    const timestamp = Date.now();
    
    // Choose a random replica to read from
    const targetNodeIndex = Math.floor(Math.random() * nodes.length);
    const contactedNode = nodes[targetNodeIndex];

    addLog(`Client reading from ${contactedNode.name}...`);

    let readSuccess = false;
    let isStale = false;
    let details = '';

    const leaderNode = nodes.find(n => n.isLeader)!;

    if (partitionActive) {
      if (mode === 'CP') {
        if (contactedNode.status === 'PARTITIONED') {
          // CP prevents dirty/stale reads by blocking partitioned nodes from serving reads
          details = `Read Blocked. Node is partitioned and cannot guarantee consistent data.`;
          addLog(`[FAIL] Read Blocked on ${contactedNode.name} to guarantee consistency.`);
        } else {
          // Node is in the majority partition
          readSuccess = true;
          details = `Read Succeeded. Data: "${contactedNode.value}" (Latest)`;
          addLog(`[SUCCESS] Read consistent value from ${contactedNode.name}: "${contactedNode.value}"`);
        }
      } else if (mode === 'AP') {
        // AP always answers immediately, even if data is old/stale
        readSuccess = true;
        if (contactedNode.version < leaderNode.version) {
          isStale = true;
          details = `Read Succeeded (STALE DATA). Data: "${contactedNode.value}" (Expected Version ${leaderNode.version}, got Version ${contactedNode.version})`;
          addLog(`[WARNING] Read stale value from isolated node ${contactedNode.name}: "${contactedNode.value}"`);
        } else {
          details = `Read Succeeded. Data: "${contactedNode.value}"`;
          addLog(`[SUCCESS] Read latest value from ${contactedNode.name}: "${contactedNode.value}"`);
        }
      } else {
        // CA Mode under partition
        details = `Read Failed. Cluster split prevents consistency checks.`;
        addLog(`[CRITICAL] CA Halted: Reads disabled during partition.`);
      }
    } else {
      // Normal state
      readSuccess = true;
      details = `Read Succeeded. Data: "${contactedNode.value}"`;
      addLog(`[SUCCESS] Read from ${contactedNode.name}: "${contactedNode.value}"`);
    }

    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      success: prev.success + (readSuccess ? 1 : 0),
      failed: prev.failed + (readSuccess ? 0 : 1),
      staleReads: prev.staleReads + (isStale ? 1 : 0)
    }));

    setRequests(prev => [
      {
        id: reqId,
        type: 'READ',
        targetNode: contactedNode.name,
        status: readSuccess ? 'SUCCESS' : 'FAILED',
        details,
        timestamp
      },
      ...prev.slice(0, 10)
    ]);
  };

  const resetStats = () => {
    setStats({ total: 0, success: 0, failed: 0, staleReads: 0 });
    setRequests([]);
    setSimulationLogs(['Stats reset. CAP Simulator ready.']);
  };

  return (
    <div id="cap-simulator" className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-500 animate-pulse" /> CAP Theorem Advanced Simulator
          </h4>
          <p className="text-xs text-gray-400">
            A network partition splits a distributed cluster. Experience how consistency vs availability tradeoffs play out under different configurations.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-[#111113] border border-[#27272A] rounded-xl p-1 shrink-0">
          {(['CP', 'AP', 'CA'] as const).map(m => (
            <button
              key={m}
              id={`cap-mode-btn-${m.toLowerCase()}`}
              onClick={() => {
                setMode(m);
                addLog(`Switched system design configuration to: ${m} Mode`);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === m ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {m === 'CP' ? 'CP (Consistency)' : m === 'AP' ? 'AP (Availability)' : 'CA (No Partition)'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Sandbox Interactive Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Control and Parameters Column */}
        <div className="lg:col-span-4 bg-[#111113] border border-[#27272A] p-5 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Simulate Traffic & Actions</h5>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 block">Payload to Write</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 flex-1"
                  placeholder="Data v2"
                />
                <button
                  id="btn-cap-write"
                  onClick={handleWrite}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition-all flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" /> Write
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                id="btn-cap-read"
                onClick={handleRead}
                className="bg-zinc-800 hover:bg-zinc-700 border border-[#27272A] text-gray-200 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
              >
                <Activity className="w-3.5 h-3.5 text-blue-400" /> Read Replica
              </button>
              
              <button
                id="btn-cap-partition-toggle"
                onClick={togglePartition}
                className={`text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 border ${
                  partitionActive 
                    ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                }`}
              >
                {partitionActive ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                <span>{partitionActive ? 'Heal Partition' : 'Split Node C'}</span>
              </button>
            </div>
          </div>

          {/* Theoretical info card based on selected configuration */}
          <div className="bg-[#0A0A0B] border border-[#27272A] rounded-xl p-3.5 space-y-2">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1 font-mono">
              <Info className="w-3 h-3 text-orange-500" /> Model Tradeoffs
            </span>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              {mode === 'CP' && 'CP Systems (e.g., ZooKeeper, Raft databases) reject operations if a network split prevents safe replication consensus. Writes fail in minority partitions, maintaining perfect data uniformity.'}
              {mode === 'AP' && 'AP Systems (e.g., Cassandra, DynamoDB) continue accepting writes/reads everywhere. Replicas temporarily diverge during partitions and rely on eventual consistency mechanisms once healed.'}
              {mode === 'CA' && 'CA represents a theoretical system that assumes the physical network never fails. If a real network partition splits a CA system, it completely breaks down, resulting in fatal corruption or total downtime.'}
            </p>
          </div>

          {/* Quick stats board */}
          <div className="pt-4 border-t border-[#1F1F22] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Total Simulated Ingress:</span>
              <span className="font-mono font-bold text-white">{stats.total}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Successful Responses:</span>
              <span className="font-mono font-bold text-emerald-400">{stats.success}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Blocked / Failed:</span>
              <span className="font-mono font-bold text-red-400">{stats.failed}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Stale Reads Served (AP):</span>
              <span className={`font-mono font-bold ${stats.staleReads > 0 ? 'text-amber-400 animate-pulse' : 'text-gray-500'}`}>{stats.staleReads}</span>
            </div>
            <button 
              onClick={resetStats} 
              className="w-full text-center text-[10px] text-gray-500 hover:text-gray-300 font-mono pt-1"
            >
              [ Reset Simulation Counters ]
            </button>
          </div>
        </div>

        {/* Right Sandbox Visualization Canvas */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Dynamic Map Layer visualizing communication */}
          <div className="bg-[#111113] border border-[#27272A] p-6 rounded-2xl relative min-h-[300px] flex flex-col justify-between">
            {partitionActive && mode === 'CA' && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 p-3.5 rounded-xl text-xs font-bold animate-pulse mb-4 flex items-center gap-2 z-20">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <span className="uppercase tracking-wider">CAP Theorem Violation: Deadlock System!</span>
                  <p className="text-[10px] text-red-400 font-normal mt-0.5">A network partition (P) is active, but you attempted to enforce CA (Consistency + Availability). In a partitioned network, you MUST choose to drop either consistency (AP) or availability (CP). Keeping both is mathematically impossible and halts the cluster!</p>
                </div>
              </div>
            )}

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-mono">Consensus State:</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${partitionActive ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {partitionActive ? 'PARTITIONED SPLIT' : 'UNIFIED ACTIVE'}
              </span>
            </div>

            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Replica Cluster Map</div>

            {/* Nodes Container */}
            <div className="grid grid-cols-3 gap-4 py-8 items-center justify-items-center relative">
              {/* Communication Links under nodes */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 flex justify-around pointer-events-none px-12">
                {/* Link Node A to B */}
                <div className="w-1/3 h-0.5 bg-orange-500 relative flex justify-center">
                  <div className="absolute -top-3 text-[9px] font-mono text-orange-400">Active Link</div>
                </div>
                {/* Link Node B to C */}
                <div className={`w-1/3 h-0.5 relative flex justify-center ${partitionActive ? 'border-t border-dashed border-red-500' : 'bg-orange-500'}`}>
                  <span className={`absolute -top-3 text-[9px] font-mono font-bold uppercase ${partitionActive ? 'text-red-400' : 'text-orange-400'}`}>
                    {partitionActive ? 'Severed Connection' : 'Active Link'}
                  </span>
                </div>
              </div>

              {/* Node cards */}
              {nodes.map(node => {
                const isIsolated = node.id === 'node_c' && partitionActive;
                return (
                  <div 
                    key={node.id} 
                    className={`z-10 bg-[#0A0A0B] border p-4 rounded-xl flex flex-col items-center w-40 text-center transition-all ${
                      isIsolated 
                        ? 'border-red-500/50 shadow-lg shadow-red-500/5' 
                        : 'border-[#27272A]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                      isIsolated ? 'bg-red-950/40 text-red-400' : 'bg-orange-950/40 text-orange-400'
                    }`}>
                      <Server className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white">{node.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono mt-1 mt-1 bg-[#111113] px-2 py-0.5 rounded border border-[#1F1F22]">
                      {node.value}
                    </span>
                    <span className="text-[9px] text-gray-500 font-mono mt-1">
                      v{node.version}
                    </span>
                    <span className={`text-[8px] font-bold uppercase tracking-wider font-mono px-1.5 py-0.5 rounded mt-2.5 ${
                      isIsolated ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {node.status}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Clients Gateway visualization */}
            <div className="border-t border-[#1F1F22] pt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono block mb-1">Incoming Client Writes</span>
                <p className="text-[11px] text-gray-400">Routes to any replica. Commits require consensus matching the model rules.</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono block mb-1">Incoming Client Reads</span>
                <p className="text-[11px] text-gray-400">AP replies instantly with any local data. CP guarantees latest data or blocks.</p>
              </div>
            </div>
          </div>

          {/* Dual Logs layout: Traffic Trace & Simulation events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Traffic trace log */}
            <div className="bg-[#111113] border border-[#27272A] p-4 rounded-xl flex flex-col justify-between h-48">
              <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" /> Client Request Trace
              </h5>
              <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[9px] space-y-1.5 text-gray-400">
                {requests.length === 0 ? (
                  <div className="text-gray-600 text-center py-8 font-sans">No request actions captured yet.</div>
                ) : (
                  requests.map((req, i) => (
                    <div key={req.id} className="flex justify-between items-start border-b border-[#1F1F22] pb-1">
                      <div>
                        <span className={`font-bold ${req.type === 'WRITE' ? 'text-orange-400' : 'text-blue-400'}`}>[{req.type}]</span>
                        <span className="text-gray-300 ml-1.5">{req.id}</span>
                        <p className="text-gray-500 text-[8px]">{req.details}</p>
                      </div>
                      <span className={`text-[8px] font-bold px-1 py-0.2 rounded ${req.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {req.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit log trail */}
            <div className="bg-[#111113] border border-[#27272A] p-4 rounded-xl flex flex-col justify-between h-48">
              <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-400" /> Cluster Audit Log
              </h5>
              <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[9px] text-gray-400 space-y-1">
                {simulationLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed border-b border-[#1F1F22] pb-1">
                    {log}
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
