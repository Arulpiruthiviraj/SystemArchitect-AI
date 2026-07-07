import React, { useState, useMemo } from 'react';
import { 
  X, Sliders, Database, HardDrive, Cpu, ShieldAlert, 
  HelpCircle, Sparkles, Check, Info, TrendingUp, RefreshCw 
} from 'lucide-react';

interface RequirementsScratchpadProps {
  onClose: () => void;
  isOpen: boolean;
}

export default function RequirementsScratchpad({ onClose, isOpen }: RequirementsScratchpadProps) {
  const [dauIndex, setDauIndex] = useState<number>(3); // Default to 10M
  const [readRatio, setReadRatio] = useState<number>(90); // 90% reads, 10% writes
  const [writePayloadSizeKB, setWritePayloadSizeKB] = useState<number>(2); // 2 KB default
  const [peakFactor, setPeakFactor] = useState<number>(2); // 2x default

  // Preset DAU values to make the slider extremely intuitive
  const dauPresets = useMemo(() => [
    { label: '10K', value: 10000, description: 'Tiny startup / Internal utility' },
    { label: '100K', value: 100000, description: 'Growing niche application' },
    { label: '1M', value: 1000000, description: 'Medium scale SaaS platform' },
    { label: '10M', value: 10000000, description: 'Large consumer app / Reddit scale' },
    { label: '50M', value: 50000000, description: 'High scale global platform' },
    { label: '100M', value: 100000000, description: 'Massive scale / Twitter/X scale' },
    { label: '500M', value: 500000000, description: 'Hyper-scale service' },
    { label: '1B', value: 1000000000, description: 'Meta / Google scale' },
  ], []);

  const selectedDau = dauPresets[dauIndex];

  // Helper values
  const writeRatio = 100 - readRatio;

  // Real-world assumption: On average, an active user makes 20 actions (queries) per day.
  const actionsPerUserPerDay = 20;
  const totalDailyRequests = selectedDau.value * actionsPerUserPerDay;

  const dailyReads = totalDailyRequests * (readRatio / 100);
  const dailyWrites = totalDailyRequests * (writeRatio / 100);

  // QPS Calculations (Queries Per Second)
  // 1 day = 86,400 seconds
  const secondsInDay = 86400;
  const avgReadsQps = Math.round(dailyReads / secondsInDay);
  const avgWritesQps = Math.round(dailyWrites / secondsInDay);
  const totalAvgQps = avgReadsQps + avgWritesQps;

  const peakReadsQps = avgReadsQps * peakFactor;
  const peakWritesQps = avgWritesQps * peakFactor;
  const totalPeakQps = peakReadsQps + peakWritesQps;

  // Storage Calculations (only writes ingest persistent data)
  // Assume metadata overhead of 20%
  const dataMultiplier = 1.2; 
  const dailyStorageBytes = dailyWrites * (writePayloadSizeKB * 1024) * dataMultiplier;

  const formatStorage = (bytes: number) => {
    if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const formatQps = (qps: number) => {
    if (qps >= 1000000) return `${(qps / 1000000).toFixed(1)}M QPS`;
    if (qps >= 1000) return `${(qps / 1000).toFixed(1)}K QPS`;
    return `${qps} QPS`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Recommendations and design architecture guidelines based on calculated metrics
  const designRecommendations = useMemo(() => {
    const list = [];
    
    // QPS scaling decisions
    if (totalPeakQps > 50000) {
      list.push({
        type: 'CRITICAL',
        title: 'Microsecond Caching Tier Mandatory',
        desc: 'Your peak throughput exceeds 50K QPS. Direct database queries will crash typical primary engines. Integrate a highly distributed Redis/Memcached cluster with cache-aside policies.',
        badge: 'Red'
      });
    } else if (totalPeakQps > 5000) {
      list.push({
        type: 'RECOMMENDED',
        title: 'Read Replicas & Cache Layer',
        desc: 'At over 5K QPS, consider standard master-slave replication topologies (e.g., PostgreSQL with 2+ read replicas) to offload read strain.',
        badge: 'Blue'
      });
    } else {
      list.push({
        type: 'INFO',
        title: 'Single Node Database Feasible',
        desc: 'Your throughput fits comfortably within a single robust SQL database node (up to 3K-5K QPS with optimal indexing). Avoid over-architecting.',
        badge: 'Green'
      });
    }

    // Write scaling decisions
    if (peakWritesQps > 10000) {
      list.push({
        type: 'CRITICAL',
        title: 'Asynchronous Ingestion (Message Broker)',
        desc: 'Peak write QPS is above 10K. Use a resilient message queue like Apache Kafka or RabbitMQ to decouple ingestion from persistence and perform write buffering.',
        badge: 'Red'
      });
    }

    // Storage scale decisions
    const yearlyStorageGb = (dailyStorageBytes * 365) / 1e9;
    if (yearlyStorageGb > 10000) { // > 10 TB
      list.push({
        type: 'CRITICAL',
        title: 'Distributed Columnar NoSQL or Sharding',
        desc: `Ingesting ${formatStorage(dailyStorageBytes * 365)} of data annually. Relational storage will face acute query limits. Transition to Cassandra, DynamoDB, or shard your MySQL/Postgres cluster by tenant/user ID.`,
        badge: 'Red'
      });
    } else if (yearlyStorageGb > 1000) { // > 1 TB
      list.push({
        type: 'RECOMMENDED',
        title: 'Database Partitioning & Cold Archival',
        desc: `Yearly data footprint reaches ${formatStorage(dailyStorageBytes * 365)}. Implement database partitioning on time series columns and periodically archive old logs into low-cost Object Storage (S3/GCS).`,
        badge: 'Yellow'
      });
    }

    return list;
  }, [totalPeakQps, peakWritesQps, dailyStorageBytes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-[#0A0A0B]/98 border-l border-[#27272A] z-50 flex flex-col shadow-2xl backdrop-blur-xl animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-5 border-b border-[#1F1F22] flex items-center justify-between bg-[#111113]">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-orange-500" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Estimation Scratchpad</h3>
            <p className="text-[10px] text-gray-400">Perform quick back-of-the-envelope calculations for your system design interview.</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#1C1C1F] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        
        {/* Step 1: Input Parameters */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-[#1F1F22] pb-1">1. Configure Scale Variables</h4>
          
          {/* Daily Active Users (DAU) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-300 flex items-center gap-1">Daily Active Users (DAU)</span>
              <span className="font-mono text-orange-400 font-bold bg-orange-500/10 px-2.5 py-0.5 rounded border border-orange-500/20">{selectedDau.label}</span>
            </div>
            <input 
              type="range"
              min="0"
              max={dauPresets.length - 1}
              value={dauIndex}
              onChange={(e) => setDauIndex(parseInt(e.target.value))}
              className="w-full accent-orange-500 h-1.5 bg-[#1C1C1F] rounded-full appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-gray-500 italic">{selectedDau.description}</p>
          </div>

          {/* Read/Write Ratio */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-300">Read / Write Ratio (%)</span>
              <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {readRatio}:{writeRatio}
              </span>
            </div>
            <input 
              type="range"
              min="10"
              max="99"
              value={readRatio}
              onChange={(e) => setReadRatio(parseInt(e.target.value))}
              className="w-full accent-blue-500 h-1.5 bg-[#1C1C1F] rounded-full appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>99% Read Heavy (Feed, Search)</span>
              <span>10% Read / 90% Write (IoT, Metrics Ingest)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Average Write Payload Size */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 block">Write Payload Size</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="0.1" 
                  step="0.5"
                  value={writePayloadSizeKB} 
                  onChange={(e) => setWritePayloadSizeKB(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full bg-[#111113] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
                <span className="text-xs text-gray-400 font-mono">KB</span>
              </div>
              <span className="text-[9px] text-gray-500 block">Avg JSON, text, metadata size.</span>
            </div>

            {/* Peak Traffic Spike Factor */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 block">Peak Factor (Multiplier)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="1" 
                  max="50"
                  value={peakFactor} 
                  onChange={(e) => setPeakFactor(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#111113] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
                <span className="text-xs text-gray-400 font-mono">x</span>
              </div>
              <span className="text-[9px] text-gray-500 block">To account for peak hour surges.</span>
            </div>
          </div>

        </div>

        {/* Step 2: Real-time Estimates Display */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-[#1F1F22] pb-1">2. Estimated Throughput (QPS)</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111113] border border-[#27272A] p-3.5 rounded-xl text-center space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Average Throughput</span>
              <div className="text-lg font-bold text-white font-mono">{formatQps(totalAvgQps)}</div>
              <div className="text-[9px] text-gray-500 flex justify-between px-2">
                <span>R: {formatQps(avgReadsQps)}</span>
                <span>W: {formatQps(avgWritesQps)}</span>
              </div>
            </div>
            
            <div className="bg-[#111113] border border-[#27272A] p-3.5 rounded-xl text-center space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono flex items-center justify-center gap-1 text-orange-400">
                <TrendingUp className="w-3.5 h-3.5" /> Peak Capacity Required
              </span>
              <div className="text-lg font-bold text-orange-400 font-mono">{formatQps(totalPeakQps)}</div>
              <div className="text-[9px] text-gray-500 flex justify-between px-2">
                <span>R: {formatQps(peakReadsQps)}</span>
                <span>W: {formatQps(peakWritesQps)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Storage Requirements */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-[#1F1F22] pb-1">3. Storage & DB Size Requirements</h4>
          
          <div className="bg-[#111113] border border-[#27272A] p-4 rounded-xl space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-mono">Daily Write Volume</span>
                <span className="text-sm font-bold text-white font-mono">{formatNumber(dailyWrites)} writes / day</span>
              </div>
            </div>

            {/* Dynamic disk volume visualization bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono border-t border-[#1F1F22] pt-3">
                <span className="text-gray-400">Daily Ingestion Rate:</span>
                <span className="text-white font-bold">{formatStorage(dailyStorageBytes)}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">1 Month Footprint:</span>
                <span className="text-white font-bold">{formatStorage(dailyStorageBytes * 30)}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">1 Year Requirement:</span>
                <span className="text-orange-400 font-bold">{formatStorage(dailyStorageBytes * 365)}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">5 Year Lifecycle Storage:</span>
                <span className="text-red-400 font-bold">{formatStorage(dailyStorageBytes * 365 * 5)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: System Architecture Design Advisory */}
        <div className="space-y-3.5">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-[#1F1F22] pb-1">4. Interview Advisory Notes</h4>
          
          <div className="space-y-3">
            {designRecommendations.map((rec, i) => (
              <div 
                key={i} 
                className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                  rec.badge === 'Red' 
                    ? 'bg-red-500/5 border-red-500/25 text-red-200' 
                    : rec.badge === 'Yellow'
                    ? 'bg-amber-500/5 border-amber-500/25 text-amber-200'
                    : rec.badge === 'Blue'
                    ? 'bg-blue-500/5 border-blue-500/25 text-blue-200'
                    : 'bg-emerald-500/5 border-emerald-500/25 text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-[10px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    rec.badge === 'Red' ? 'bg-red-500 animate-pulse' : rec.badge === 'Yellow' ? 'bg-amber-500' : rec.badge === 'Blue' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`} />
                  <span>{rec.title}</span>
                </div>
                <p className="text-gray-400 text-[11px]">{rec.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-4 bg-[#111113] border-t border-[#1F1F22] text-center text-[10px] text-gray-500 font-mono">
        Back-of-the-envelope calculations based on 20% metadata expansion multipliers.
      </div>
    </div>
  );
}
