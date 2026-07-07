import React, { useState, useMemo } from 'react';
import { 
  SYSTEM_DESIGN_SCENARIOS, 
  SystemDesignScenario, 
  ComponentOption 
} from '../data/scenarios';
import { 
  Target, AlertTriangle, Shield, HardDrive, Database, Server, Cpu, 
  Box, Cloud, Lock, Network, HelpCircle, CheckCircle, User, BookOpen, 
  Clock, Activity, Zap, Play, Sparkles, ChevronDown, ChevronRight, 
  ThumbsUp, RefreshCw, AlertCircle, Lightbulb, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Help map categories to custom icons
const COMPONENT_ICONS: Record<string, any> = {
  "Routing": Network,
  "Caching": HardDrive,
  "Database": Database,
  "Protocol": Zap,
  "Resiliency": Cpu,
  "Security": Shield,
  "Messaging": Activity
};

const DIFFICULTY_COLORS = {
  "Medium": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Hard": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Expert": "text-rose-400 bg-rose-500/10 border-rose-500/20"
};

export default function ScenarioTrainer() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SYSTEM_DESIGN_SCENARIOS[0].id);
  const [selectedComponents, setSelectedComponents] = useState<Record<string, boolean>>({});
  const [showCheatsheet, setShowCheatsheet] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'WORKBENCH' | 'BLUEPRINT'>('WORKBENCH');

  const currentScenario = useMemo(() => {
    return SYSTEM_DESIGN_SCENARIOS.find(s => s.id === selectedScenarioId) || SYSTEM_DESIGN_SCENARIOS[0];
  }, [selectedScenarioId]);

  // Handle resetting state when switching scenarios
  const handleScenarioChange = (id: string) => {
    setSelectedScenarioId(id);
    setSelectedComponents({});
    setShowCheatsheet(false);
    setActiveTab('WORKBENCH');
  };

  const toggleComponent = (optionId: string) => {
    setSelectedComponents(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  // Calculate user progress
  const recommendedOptions = useMemo(() => {
    return currentScenario.options.filter(o => o.status === 'recommended');
  }, [currentScenario]);

  const progress = useMemo(() => {
    const selectedRecommended = recommendedOptions.filter(o => selectedComponents[o.id]);
    const isCompleted = selectedRecommended.length === recommendedOptions.length;
    return {
      total: recommendedOptions.length,
      current: selectedRecommended.length,
      isCompleted
    };
  }, [recommendedOptions, selectedComponents]);

  // Dynamic positioning for the selected scenario's diagram
  const nodeLayout = useMemo(() => {
    const visual = currentScenario.diagram;
    const count = visual.nodes.length;
    return visual.nodes.map((node, index) => {
      let x = 50;
      let y = 50;
      
      if (visual.type === 'flow') {
        x = 5 + (index / (count - 1 || 1)) * 90; // Spread horizontally (percentages)
        y = index % 2 === 0 ? 25 : 65; // Alternate heights for spacing
      } else if (visual.type === 'layers') {
        x = 50; // Centered
        y = 10 + (index / (count - 1 || 1)) * 75; // Stack vertically
      } else if (visual.type === 'comparison') {
        x = index % 2 === 0 ? 25 : 75; // Left vs Right splits
        y = index < 2 ? 25 : 75;
      } else {
        const cols = Math.ceil(Math.sqrt(count));
        const col = index % cols;
        const row = Math.floor(index / cols);
        x = 15 + (col / (cols - 1 || 1)) * 70;
        y = 15 + (row / (Math.ceil(count / cols) - 1 || 1)) * 70;
      }
      
      return { ...node, x, y };
    });
  }, [currentScenario]);

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0A0A0B] text-gray-200">
      {/* Sidebar: Scenario list (Left) */}
      <aside className="w-80 border-r border-[#1F1F22] bg-[#111113]/50 flex flex-col hidden lg:flex shrink-0">
        <div className="p-6 border-b border-[#1F1F22]">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Scenario Prep</h3>
          </div>
          <p className="text-xs text-gray-500">Practice justifying component choices against hard scenario constraints.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {SYSTEM_DESIGN_SCENARIOS.map((scenario) => {
            const isSelected = scenario.id === selectedScenarioId;
            return (
              <button
                key={scenario.id}
                onClick={() => handleScenarioChange(scenario.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all text-xs flex flex-col gap-2 ${
                  isSelected 
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-white shadow-lg' 
                    : 'bg-[#111113]/50 hover:bg-[#151518] border-[#1F1F22] text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${DIFFICULTY_COLORS[scenario.difficulty]}`}>
                    {scenario.difficulty}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">
                    {scenario.metrics.find(m => m.label === "Writes / Sec" || m.label === "Active Users" || m.label === "IoT Devices")?.value || ""}
                  </span>
                </div>
                <h4 className="font-bold text-sm leading-snug line-clamp-2">
                  {scenario.title.replace(/^Scenario \d+: /, '')}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span className="truncate">{scenario.testing}</span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Dynamic Workspace (Right) */}
      <section className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Scenario Selector (Horizontal) */}
        <div className="lg:hidden p-4 border-b border-[#1F1F22] bg-[#111113]/30 overflow-x-auto flex gap-2.5 no-scrollbar">
          {SYSTEM_DESIGN_SCENARIOS.map((scenario) => {
            const isSelected = scenario.id === selectedScenarioId;
            return (
              <button
                key={scenario.id}
                onClick={() => handleScenarioChange(scenario.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-all ${
                  isSelected 
                    ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40' 
                    : 'bg-[#111113] text-gray-400 border-[#1F1F22]'
                }`}
              >
                {scenario.title.split(':')[0]}
              </button>
            );
          })}
        </div>

        {/* Workspace Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Header Bento Box */}
          <div className="bg-[#111113] border border-[#1F1F22] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> SYSTEM ARCHITECTURE SCENARIO
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  {currentScenario.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${DIFFICULTY_COLORS[currentScenario.difficulty]}`}>
                  {currentScenario.difficulty} Difficulty
                </span>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-y border-[#1F1F22] py-4 my-4">
              {currentScenario.metrics.map((metric, idx) => (
                <div key={idx} className="bg-[#141416] border border-[#1E1E22] rounded-xl p-3 flex flex-col justify-center">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">{metric.label}</span>
                  <span className="text-sm font-bold text-white mt-1 font-mono">{metric.value}</span>
                </div>
              ))}
            </div>

            {/* Problem Statement */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">The Problem & Scale Constraints:</h4>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed bg-[#161619] border border-[#1E1E22] rounded-xl p-4 font-sans italic">
                "{currentScenario.problem}"
              </p>
            </div>
          </div>

          {/* Hidden Traps & Failures Alert Panel */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h4 className="font-bold text-amber-400 text-sm uppercase tracking-wider">Hidden Interview Traps to Avoid</h4>
            </div>
            <ul className="space-y-2 text-xs md:text-sm text-gray-300">
              {currentScenario.traps.map((trap, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span>{trap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tab Selector for Interactive Composition */}
          <div className="flex border-b border-[#1F1F22] items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('WORKBENCH')}
                className={`px-4 py-3 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'WORKBENCH' 
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Cpu className="w-4 h-4" /> Component Workbench
              </button>
              <button
                onClick={() => setActiveTab('BLUEPRINT')}
                className={`px-4 py-3 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'BLUEPRINT' 
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Network className="w-4 h-4" /> Asynchronous Blueprint Flow
              </button>
            </div>
            
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="font-bold text-gray-400">Justification Progress:</span>
              <span className={`px-2 py-0.5 rounded-full font-mono text-xs font-bold ${
                progress.isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#1C1C20] text-gray-400'
              }`}>
                {progress.current} / {progress.total} Completed
              </span>
            </div>
          </div>

          {/* Tab Content Panels */}
          <AnimatePresence mode="wait">
            {activeTab === 'WORKBENCH' ? (
              <motion.div
                key="workbench"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-bold text-white text-base">Select & Justify Your Component Elements</h3>
                  <p className="text-xs text-gray-500">Click to evaluate each component's justification in this context.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {currentScenario.options.map((option) => {
                    const isSelected = !!selectedComponents[option.id];
                    const CategoryIcon = COMPONENT_ICONS[option.category] || Box;
                    
                    return (
                      <div 
                        key={option.id}
                        className={`border rounded-2xl transition-all overflow-hidden ${
                          isSelected 
                            ? option.status === 'recommended' 
                              ? 'border-emerald-500/40 bg-[#0E1511]' 
                              : option.status === 'suboptimal'
                              ? 'border-amber-500/40 bg-[#16120E]'
                              : 'border-rose-500/40 bg-[#170E0F]'
                            : 'border-[#1F1F22] bg-[#111113] hover:bg-[#141417] hover:border-gray-700'
                        }`}
                      >
                        {/* Option Header */}
                        <div 
                          onClick={() => toggleComponent(option.id)}
                          className="p-5 flex items-start justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-2.5 rounded-xl border ${
                              isSelected 
                                ? option.status === 'recommended'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : option.status === 'suboptimal'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : 'bg-[#18181B] text-gray-400 border-[#1F1F22]'
                            }`}>
                              <CategoryIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{option.category}</span>
                                {isSelected && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                                    option.status === 'recommended'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : option.status === 'suboptimal'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  }`}>
                                    {option.status === 'recommended' ? 'Highly Justified' : option.status}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-gray-100 text-sm md:text-base mt-0.5">
                                {option.name}
                              </h4>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                              isSelected 
                                ? option.status === 'recommended'
                                  ? 'bg-emerald-500 border-emerald-400 text-black'
                                  : option.status === 'suboptimal'
                                  ? 'bg-amber-500 border-amber-400 text-black'
                                  : 'bg-rose-500 border-rose-400 text-white'
                                : 'border-[#2D2D33]'
                            }`}>
                              {isSelected && (
                                <span className="text-[10px] font-extrabold">
                                  {option.status === 'recommended' ? '✓' : option.status === 'suboptimal' ? '!' : '✕'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Evaluation details */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="border-t border-[#1F1F22] bg-black/40 px-5 py-4 space-y-3.5 text-xs md:text-sm"
                            >
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">THE WHY (WHY IT IS RELEVANT):</span>
                                <p className="text-gray-300 leading-relaxed font-sans">
                                  {option.justification}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">THE WHY NOT (LIMITATION / SUBOPTIMAL CASE):</span>
                                <p className="text-gray-400 leading-relaxed font-sans italic">
                                  {option.whyNot}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="blueprint"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-bold text-white text-base">Interactive Redesigned Flow Simulation</h3>
                  <p className="text-xs text-gray-500">Visualizing how traffic bypasses the bottlenecks when using recommended components.</p>
                </div>

                {/* Simulated Canvas Box */}
                <div className="relative w-full h-[320px] bg-[#070709] border border-[#1F1F22] rounded-2xl overflow-hidden p-4">
                  <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
                  
                  {/* Connection vectors */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#3f3f46" />
                      </marker>
                      <marker id="arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
                      </marker>
                    </defs>

                    {currentScenario.diagram.connections.map((conn, idx) => {
                      const fromNode = nodeLayout.find(n => n.id === conn.from);
                      const toNode = nodeLayout.find(n => n.id === conn.to);
                      if (!fromNode || !toNode) return null;
                      
                      const x1 = `${fromNode.x}%`;
                      const y1 = `${fromNode.y}%`;
                      const x2 = `${toNode.x}%`;
                      const y2 = `${toNode.y}%`;
                      
                      // Animate if selected, or if default is animated
                      const isActive = conn.animated || progress.isCompleted;

                      return (
                        <g key={idx}>
                          <line 
                            x1={x1} 
                            y1={y1} 
                            x2={x2} 
                            y2={y2} 
                            stroke={isActive ? "#6366f1" : "#27272a"} 
                            strokeWidth={isActive ? "2" : "1"}
                            markerEnd={`url(#${isActive ? 'arrow-active' : 'arrow'})`}
                            strokeDasharray={isActive ? "none" : "4 4"}
                          />
                          {conn.label && (
                            <text 
                              x={`${(fromNode.x + toNode.x) / 2}%`} 
                              y={`${(fromNode.y + toNode.y) / 2 - 2.5}%`} 
                              fill={isActive ? "#a5b4fc" : "#71717a"} 
                              fontSize="9" 
                              className="font-bold select-none"
                              textAnchor="middle"
                            >
                              {conn.label}
                            </text>
                          )}
                          
                          {/* Pulse Animation */}
                          {isActive && (
                            <circle r="4.5" fill="#818cf8" filter="drop-shadow(0 0 4px #818cf8)">
                              <animate attributeName="cx" values={`${fromNode.x}%; ${toNode.x}%`} dur="2.5s" repeatCount="indefinite" />
                              <animate attributeName="cy" values={`${fromNode.y}%; ${toNode.y}%`} dur="2.5s" repeatCount="indefinite" />
                            </circle>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Nodes rendering */}
                  {nodeLayout.map((node) => {
                    const nodeTypeColor = 
                      node.type === 'client' ? 'border-sky-500/30 bg-sky-500/10 text-sky-400' :
                      node.type === 'gateway' ? 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400' :
                      node.type === 'cache' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' :
                      node.type === 'db' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                      node.type === 'queue' ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' :
                      'border-indigo-500/30 bg-indigo-500/10 text-indigo-400';

                    const NodeIcon = 
                      node.type === 'client' ? User :
                      node.type === 'gateway' ? Network :
                      node.type === 'cache' ? HardDrive :
                      node.type === 'db' ? Database :
                      node.type === 'queue' ? Activity :
                      Server;

                    return (
                      <div
                        key={node.id}
                        style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                        className={`absolute z-20 px-3 py-2 rounded-xl border flex flex-col items-center justify-center min-w-[120px] max-w-[140px] text-center shadow-lg transition-all ${nodeTypeColor}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <NodeIcon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold tracking-tight truncate max-w-[100px]">{node.label}</span>
                        </div>
                        {node.role && (
                          <span className="text-[8px] opacity-75 leading-none block font-mono font-medium">{node.role}</span>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Incomplete Prompt Overlaid */}
                  {!progress.isCompleted && (
                    <div className="absolute inset-0 bg-[#070709]/75 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-6 z-30">
                      <Lock className="w-8 h-8 text-indigo-500/60 mb-3" />
                      <h4 className="text-white font-bold text-sm mb-1">System Blueprint Locked</h4>
                      <p className="text-gray-500 text-xs max-w-sm">
                        Justify and select all recommended components in the "Component Workbench" tab to light up the dynamic flow simulation.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Banner */}
          {progress.isCompleted && (
            <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <ThumbsUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-400 text-sm md:text-base">Redesign Highly Justified!</h4>
                  <p className="text-xs text-gray-400 mt-0.5">You successfully validated every correct component against the scale constraints.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCheatsheet(prev => !prev)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
                {showCheatsheet ? "Hide Interview Script" : "Show Interview Script"}
              </button>
            </div>
          )}

          {/* Dynamic Interview Script & Cheat Sheet */}
          <AnimatePresence>
            {(showCheatsheet || (!progress.isCompleted && false)) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-[#121216] border border-[#1F1F22] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-[#1F1F22] pb-3 mb-2">
                    <Lightbulb className="w-5 h-5 text-indigo-400 animate-pulse" />
                    <h4 className="font-bold text-white text-sm uppercase tracking-wider">How to Pitch This Redesign to Your Interviewer</h4>
                  </div>
                  
                  <div className="space-y-4 text-xs md:text-sm">
                    {currentScenario.cheatsheet.map((script, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="font-mono text-xs text-indigo-400 font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed font-sans">
                          {script}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#181820] rounded-xl p-4 flex items-start gap-3 mt-4 border border-[#23232C]">
                    <Clock className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                    <p className="text-xs text-gray-400 leading-relaxed font-sans">
                      <strong>Pro tip:</strong> In interviews, never suggest a solution without immediately mentioning its operational tradeoffs. It shows maturity to admit that your design choice sacrifices something (e.g., eventual consistency) to gain system scale and resiliency.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
