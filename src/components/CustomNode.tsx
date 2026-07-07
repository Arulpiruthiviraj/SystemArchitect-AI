import React from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Globe, Smartphone, Laptop, Route, Shield, Search, Database, HardDrive, 
  Server, Cpu, Box, Cloud, Activity, Lock, Mail, MessageSquare, Brain, 
  Key, FileText, Layers, Network, Wifi, CloudRain, ShieldAlert,
  StretchHorizontal, Archive, Skull, RotateCcw, Fingerprint, Wind,
  TrendingDown, Hash
} from 'lucide-react';

const ICONS: Record<string, any> = {
  Globe, Smartphone, Laptop, Route, Shield, Search, Database, HardDrive,
  Server, Cpu, Box, Cloud, Activity, Lock, Mail, MessageSquare, Brain,
  Key, FileText, Layers, Network, Wifi, CloudRain, ShieldAlert,
  StretchHorizontal, Archive, Skull, RotateCcw, Fingerprint, Wind
};

interface CustomNodeProps {
  data: {
    label: string;
    iconName: string;
    color: string;
    cpu?: number;
    mem?: number;
    lag?: number;
    offset?: number;
    status?: 'HEALTHY' | 'ERROR' | 'LAGGING' | 'REBALANCING';
  };
  selected: boolean;
}

export default function CustomNode({ data, selected }: CustomNodeProps) {
  const Icon = ICONS[data.iconName] || Box;
  
  const statusColors = {
    HEALTHY: 'bg-emerald-500',
    ERROR: 'bg-red-500',
    LAGGING: 'bg-amber-500',
    REBALANCING: 'bg-indigo-500'
  };

  return (
    <div className={`
      relative group
      min-w-[140px] p-4 rounded-xl 
      bg-[#111113]/90 backdrop-blur-md border border-[#27272A]
      shadow-xl transition-all duration-200
      ${selected ? 'ring-2 ring-indigo-500 border-indigo-500/50 shadow-indigo-500/20' : 'hover:border-[#3F3F46] hover:shadow-2xl'}
    `}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-500 border-2 border-[#111113]" />
      
      <div className="flex flex-col items-center gap-3">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center 
          ${data.color} bg-opacity-20 transition-transform group-hover:scale-110
        `}>
          <Icon className={`w-6 h-6 ${data.color.replace('bg-', 'text-')}`} />
        </div>
        <div className="text-center w-full">
           <div className="text-sm font-semibold text-gray-200 truncate">{data.label}</div>
           
           {data.status && (
             <div className="flex items-center justify-center gap-1.5 mt-1">
               <div className={`w-1.5 h-1.5 rounded-full ${statusColors[data.status]} animate-pulse`} />
               <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">{data.status}</span>
             </div>
           )}

           {(data.cpu !== undefined || data.mem !== undefined || data.lag !== undefined || data.offset !== undefined) && (
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 pt-2 border-t border-[#27272A] w-full">
                 {data.cpu !== undefined && (
                   <div className="flex items-center gap-1">
                     <Cpu className="w-3 h-3 text-emerald-400" />
                     <span className="text-[10px] text-gray-400">{data.cpu}%</span>
                   </div>
                 )}
                 {data.mem !== undefined && (
                   <div className="flex items-center gap-1">
                     <Database className="w-3 h-3 text-indigo-400" />
                     <span className="text-[10px] text-gray-400">{data.mem}%</span>
                   </div>
                 )}
                 {data.lag !== undefined && (
                   <div className="flex items-center gap-1">
                     <TrendingDown className="w-3 h-3 text-amber-400" />
                     <span className="text-[10px] text-gray-400">{data.lag}</span>
                   </div>
                 )}
                 {data.offset !== undefined && (
                   <div className="flex items-center gap-1">
                     <Hash className="w-3 h-3 text-gray-500" />
                     <span className="text-[10px] text-gray-400">{data.offset}</span>
                   </div>
                 )}
              </div>
           )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500 border-2 border-[#111113]" />
      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 bg-indigo-500 border-2 border-[#111113]" />
      <Handle type="target" position={Position.Left} id="left" className="w-3 h-3 bg-indigo-500 border-2 border-[#111113]" />
    </div>
  );
}
