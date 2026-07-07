import React, { useState, useMemo } from 'react';
import { 
  INTERVIEW_QUESTIONS, 
  InterviewQuestion, 
  VisualNode, 
  VisualConnection 
} from '../data/interview-questions';
import { 
  Layers, Search, Brain, ChevronRight, ChevronDown, Check, 
  AlertTriangle, Shield, HardDrive, Database, Server, Cpu, 
  Box, Cloud, Lock, Target, Network, HelpCircle, CheckCircle, 
  User, Bot, BookOpen, Clock, Activity, Zap, Play, Sparkles, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ScenarioTrainer from './ScenarioTrainer';
import AnalogyTrainer from './AnalogyTrainer';

// Map categories to beautiful lucide icons
const CATEGORY_ICONS: Record<string, any> = {
  "System Fundamentals & Networking": Network,
  "Core Distributed Systems Theory": Brain,
  "Data Storage & Databases": Database,
  "Caching Strategies": HardDrive,
  "Communication Paradigms & APIs": Zap,
  "Asynchronous Processing & Streaming": Activity,
  "Microservices & Architecture Patterns": Layers,
  "Resiliency, Fault Tolerance, & Scaling": Cpu,
  "Security & Identity": Lock,
  "Observability & Operations": Shield,
  "Pragmatic Interview Execution": Target,
  "Classic Archetypes": Box,
  // New System Design Archetype Categories
  "Social & Communication": Network,
  "E-Commerce & Marketplaces": Layers,
  "Media & Content Delivery": Zap,
  "Infrastructure & Core Components": Cpu,
  "Data, Search & Analytics": Database,
  "Productivity & Collaboration": Brain,
  "Finance & Payments": Lock,
  "Gaming & Real-Time Interaction": Activity,
  "IoT, Location & Specialized Operations": Target,
  "Advanced Engineering & Automation": Shield,
  // Java Interview Categories
  "Java Core Concepts": Cpu,
  "Java OOP Concepts": Brain,
  "Java Design Patterns": Layers
};

const CATEGORY_COLORS: Record<string, string> = {
  "System Fundamentals & Networking": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Core Distributed Systems Theory": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Data Storage & Databases": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Caching Strategies": "text-rose-400 bg-rose-500/10 border-rose-500/20",
  "Communication Paradigms & APIs": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Asynchronous Processing & Streaming": "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  "Microservices & Architecture Patterns": "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  "Resiliency, Fault Tolerance, & Scaling": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "Security & Identity": "text-teal-400 bg-teal-500/10 border-teal-500/20",
  "Observability & Operations": "text-lime-400 bg-lime-500/10 border-lime-500/20",
  "Pragmatic Interview Execution": "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20",
  "Classic Archetypes": "text-pink-400 bg-pink-500/10 border-pink-500/20",
  // New colors for the new categories
  "Social & Communication": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "E-Commerce & Marketplaces": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Media & Content Delivery": "text-rose-400 bg-rose-500/10 border-rose-500/20",
  "Infrastructure & Core Components": "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  "Data, Search & Analytics": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Productivity & Collaboration": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Finance & Payments": "text-teal-400 bg-teal-500/10 border-teal-500/20",
  "Gaming & Real-Time Interaction": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "IoT, Location & Specialized Operations": "text-lime-400 bg-lime-500/10 border-lime-500/20",
  "Advanced Engineering & Automation": "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20",
  // Java Interview Categories
  "Java Core Concepts": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Java OOP Concepts": "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  "Java Design Patterns": "text-purple-400 bg-purple-500/10 border-purple-500/20"
};

export default function InterviewQAPrep({ onContextChange }: { onContextChange?: (ctx: any) => void }) {
  const [subView, setSubView] = useState<'LIBRARY' | 'SCENARIOS' | 'ANALOGIES'>('SCENARIOS');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTabMap, setActiveTabMap] = useState<Record<string, 'TEXT' | 'VISUAL'>>({});

  const categories = useMemo(() => {
    const list = new Set(INTERVIEW_QUESTIONS.map(q => q.category));
    return Array.from(list);
  }, []);

  const filteredQuestions = useMemo(() => {
    return INTERVIEW_QUESTIONS.filter(q => {
      const matchesCategory = !selectedCategory || q.category === selectedCategory;
      const matchesQuery = !searchQuery || 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  React.useEffect(() => {
    onContextChange?.({ 
      topic: subView === 'LIBRARY' 
        ? 'Interview Q&A Prep' 
        : subView === 'ANALOGIES' 
        ? 'System Design Analogies' 
        : 'Scenario-Based Architecture Trainer', 
      category: subView === 'LIBRARY' 
        ? selectedCategory 
        : subView === 'ANALOGIES' 
        ? 'Plain English Analogies' 
        : 'Real-World Scenarios' 
    });
  }, [selectedCategory, subView, onContextChange]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
    if (!activeTabMap[id]) {
      setActiveTabMap(prev => ({ ...prev, [id]: 'TEXT' }));
    }
  };

  const setTab = (id: string, tab: 'TEXT' | 'VISUAL') => {
    setActiveTabMap(prev => ({ ...prev, [id]: tab }));
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#0A0A0B]">
      {/* Top Header Navigation */}
      <div className="px-6 py-4 border-b border-[#1F1F22] bg-[#111113] flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Brain className="text-indigo-400 w-5 h-5 animate-pulse" />
          <div>
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">System Interview Prep</h3>
            <p className="text-[10px] text-gray-500 font-medium">Equipping you with rigorous distributed architecture concepts & justification skills.</p>
          </div>
        </div>
        
        {/* Toggle Controls */}
        <div className="flex bg-[#161619] p-1 rounded-xl border border-[#232329] shadow-inner">
          <button
            onClick={() => setSubView('SCENARIOS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              subView === 'SCENARIOS'
                ? 'bg-[#1C1C22] text-indigo-400 shadow-md border border-indigo-500/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Target className="w-4 h-4" />
            Scenario Trainer
          </button>
          <button
            onClick={() => setSubView('ANALOGIES')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              subView === 'ANALOGIES'
                ? 'bg-[#1C1C22] text-indigo-400 shadow-md border border-indigo-500/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Simple Analogies
          </button>
          <button
            onClick={() => setSubView('LIBRARY')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              subView === 'LIBRARY'
                ? 'bg-[#1C1C22] text-indigo-400 shadow-md border border-indigo-500/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Q&A Library ({INTERVIEW_QUESTIONS.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {subView === 'SCENARIOS' ? (
          <ScenarioTrainer />
        ) : subView === 'ANALOGIES' ? (
          <AnalogyTrainer />
        ) : (
          <div className="flex-1 overflow-hidden flex">
            {/* Category List Sidebar (Left) */}
            <aside className="w-80 border-r border-[#1F1F22] bg-[#111113]/50 flex flex-col hidden lg:flex shrink-0">
              <div className="p-6 border-b border-[#1F1F22]">
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">Interview Master</h3>
                </div>
                <p className="text-xs text-gray-500">100+ system design questions sorted by core operational domains.</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedCategory === null 
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1A1D] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4" />
                    <span>All Core Topics</span>
                  </div>
                  <span className="text-[10px] bg-zinc-800 text-gray-400 px-1.5 py-0.5 rounded-full">{INTERVIEW_QUESTIONS.length}</span>
                </button>
                
                <div className="h-px bg-[#1F1F22] my-4" />
                
                {categories.map(cat => {
                  const Icon = CATEGORY_ICONS[cat] || HelpCircle;
                  const count = INTERVIEW_QUESTIONS.filter(q => q.category === cat).length;
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all leading-tight ${
                        isSelected 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1A1D] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-gray-500'}`} />
                        <span className="truncate">{cat}</span>
                      </div>
                      <span className="text-[10px] bg-[#1E1E22] text-gray-400 px-1.5 py-0.5 rounded-full ml-2 shrink-0">{count}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Questions Content Pane (Right) */}
            <section className="flex-1 flex flex-col overflow-hidden">
              {/* Search & Mobile Filter Bar */}
              <div className="p-6 border-b border-[#1F1F22] flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111113]/20">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 100+ system design questions..."
                    className="w-full bg-[#111113] border border-[#1F1F22] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                
                {/* Mobile Category Select */}
                <div className="lg:hidden w-full flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
                      selectedCategory === null 
                        ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' 
                        : 'bg-[#111113] text-gray-400 border-[#1F1F22]'
                    }`}
                  >
                    All Topics
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
                        selectedCategory === cat 
                          ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' 
                          : 'bg-[#111113] text-gray-400 border-[#1F1F22]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>Showing {filteredQuestions.length} Questions</span>
                </div>
              </div>

              {/* List of Questions */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {filteredQuestions.length === 0 ? (
                  <div className="h-96 flex flex-col items-center justify-center text-center p-8">
                    <HelpCircle className="w-12 h-12 text-gray-600 mb-4 animate-bounce" />
                    <h3 className="text-lg font-bold text-white mb-2">No results matched your search</h3>
                    <p className="text-gray-500 text-sm max-w-md">Try searching for keywords like "sharding", "consistency", "caching", "Saga", or "Snowflake".</p>
                  </div>
                ) : (
                  filteredQuestions.map((q) => {
                    const isExpanded = expandedId === q.id;
                    const activeTab = activeTabMap[q.id] || 'TEXT';
                    const Icon = CATEGORY_ICONS[q.category] || HelpCircle;
                    const themeColor = CATEGORY_COLORS[q.category] || "text-gray-400 bg-gray-500/10";
                    
                    return (
                      <div 
                        key={q.id} 
                        id={q.id}
                        className={`bg-[#111113] border transition-all rounded-xl overflow-hidden ${
                          isExpanded 
                            ? 'border-indigo-500/40 shadow-xl shadow-indigo-950/10' 
                            : 'border-[#1F1F22] hover:border-gray-700 hover:bg-[#151518]'
                        }`}
                      >
                        {/* Header Row */}
                        <div 
                          onClick={() => toggleExpand(q.id)}
                          className="p-5 flex items-start gap-4 cursor-pointer select-none"
                        >
                          <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${themeColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                {q.category}
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-100 text-sm md:text-base leading-snug group-hover:text-white transition-colors">
                              {q.question}
                            </h4>
                          </div>
                          <button className="text-gray-500 hover:text-white shrink-0 mt-1">
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </button>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-[#1F1F22] bg-[#0E0E10]"
                            >
                              {/* Selector Tabs */}
                              <div className="flex border-b border-[#1F1F22] px-5 py-2 items-center justify-between">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setTab(q.id, 'TEXT')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
                                      activeTab === 'TEXT' 
                                        ? 'bg-indigo-500/10 text-indigo-400' 
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                  >
                                    <BookOpen className="w-3.5 h-3.5" /> Text Explanation
                                  </button>
                                  {q.visual && (
                                    <button
                                      onClick={() => setTab(q.id, 'VISUAL')}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
                                        activeTab === 'VISUAL' 
                                          ? 'bg-indigo-500/10 text-indigo-400' 
                                          : 'text-gray-500 hover:text-gray-300'
                                      }`}
                                    >
                                      <Layers className="w-3.5 h-3.5" /> Interactive Blueprint
                                    </button>
                                  )}
                                </div>
                                
                                <div className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Core Concept
                                </div>
                              </div>

                              {/* Panel Body */}
                              <div className="p-6">
                                {activeTab === 'TEXT' ? (
                                  <div className="space-y-4 text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none">
                                    {/* Simple paragraph formatting */}
                                    {q.answer.split('\n\n').map((para, pIdx) => {
                                      if (para.startsWith('- ') || para.startsWith('* ')) {
                                        return (
                                          <ul key={pIdx} className="list-disc pl-5 space-y-2 my-2">
                                            {para.split('\n').map((li, lIdx) => (
                                              <li key={lIdx} className="text-gray-300">
                                                {li.replace(/^[\s-*]+/, '')}
                                              </li>
                                            ))}
                                          </ul>
                                        );
                                      }
                                      return <p key={pIdx} className="text-gray-300 font-sans" dangerouslySetInnerHTML={{ 
                                        __html: para
                                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                                          .replace(/`(.*?)`/g, '<code class="bg-[#1C1C20] px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs">$1</code>')
                                      }} />;
                                    })}
                                  </div>
                                ) : (
                                  q.visual && <BlueprintVisualizer visual={q.visual} />
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom visual renderer for system designs
function BlueprintVisualizer({ visual }: { visual: NonNullable<InterviewQuestion['visual']> }) {
  // Simple reactive positioning to represent layout cleanly
  const nodeLayout = useMemo(() => {
    const count = visual.nodes.length;
    return visual.nodes.map((node, index) => {
      let x = 50;
      let y = 50;
      
      if (visual.type === 'flow') {
        x = 5 + (index / (count - 1 || 1)) * 90; // Spread horizontally (percentages)
        y = index % 2 === 0 ? 30 : 65; // Alternate heights for spacing
      } else if (visual.type === 'layers') {
        x = 50; // Centered
        y = 10 + (index / (count - 1 || 1)) * 75; // Stack vertically
      } else if (visual.type === 'comparison') {
        x = index % 2 === 0 ? 25 : 75; // Left vs Right splits
        y = index < 2 ? 25 : 75;
      } else if (visual.type === 'cycle') {
        const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
        x = 50 + 35 * Math.cos(angle);
        y = 50 + 35 * Math.sin(angle);
      } else {
        // Grid or fallback
        const cols = Math.ceil(Math.sqrt(count));
        const col = index % cols;
        const row = Math.floor(index / cols);
        x = 15 + (col / (cols - 1 || 1)) * 70;
        y = 15 + (row / (Math.ceil(count / cols) - 1 || 1)) * 70;
      }
      
      return { ...node, x, y };
    });
  }, [visual]);

  return (
    <div className="relative w-full h-[320px] bg-[#070709] border border-[#1F1F22] rounded-xl overflow-hidden p-4">
      {/* Absolute backdrop patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      {/* SVG connections & animation pipelines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#3f3f46" />
          </marker>
          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
          </marker>
        </defs>
        
        {visual.connections.map((conn, idx) => {
          const fromNode = nodeLayout.find(n => n.id === conn.from);
          const toNode = nodeLayout.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;
          
          const x1 = `${fromNode.x}%`;
          const y1 = `${fromNode.y}%`;
          const x2 = `${toNode.x}%`;
          const y2 = `${toNode.y}%`;
          
          const isActive = conn.animated;
          
          return (
            <g key={idx}>
              {/* Core connection track line */}
              <line 
                x1={x1} 
                y1={y1} 
                x2={x2} 
                y2={y2} 
                stroke={isActive ? "#4f46e5" : "#27272a"} 
                strokeWidth={isActive ? "2" : "1"}
                markerEnd={`url(#${isActive ? 'arrow-active' : 'arrow'})`}
                strokeDasharray={isActive ? "none" : "4 4"}
              />
              
              {/* Flow label */}
              {conn.label && (
                <text 
                  x={`${(fromNode.x + toNode.x) / 2}%`} 
                  y={`${(fromNode.y + toNode.y) / 2 - 2}%`} 
                  fill={isActive ? "#a5b4fc" : "#71717a"} 
                  fontSize="10" 
                  className="font-semibold select-none bg-black"
                  textAnchor="middle"
                >
                  {conn.label}
                </text>
              )}
              
              {/* Pulsing signal packet */}
              {isActive && (
                <circle r="4" fill="#818cf8" filter="drop-shadow(0 0 4px #818cf8)">
                  <animate 
                    attributeName="cx" 
                    values={`${fromNode.x}%; ${toNode.x}%`} 
                    dur="3s" 
                    repeatCount="indefinite" 
                  />
                  <animate 
                    attributeName="cy" 
                    values={`${fromNode.y}%; ${toNode.y}%`} 
                    dur="3s" 
                    repeatCount="indefinite" 
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Render Nodes as absolutely positioned visually polished cards */}
      {nodeLayout.map((node) => {
        const colorClasses = 
          node.type === 'client' ? 'border-sky-500/30 bg-sky-500/10 text-sky-400' :
          node.type === 'proxy' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
          node.type === 'server' ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' :
          node.type === 'db' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
          node.type === 'cache' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' :
          node.type === 'queue' ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' :
          node.type === 'alert' ? 'border-red-500/30 bg-red-500/10 text-red-400 font-bold' :
          node.type === 'security' ? 'border-teal-500/30 bg-teal-500/10 text-teal-400' :
          node.type === 'gateway' ? 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400' :
          'border-zinc-800 bg-zinc-900/60 text-zinc-300';
          
        const NodeIcon = 
          node.type === 'client' ? User :
          node.type === 'proxy' ? Activity :
          node.type === 'server' ? Server :
          node.type === 'db' ? Database :
          node.type === 'cache' ? HardDrive :
          node.type === 'queue' ? Play :
          node.type === 'alert' ? AlertTriangle :
          node.type === 'security' ? Shield :
          node.type === 'gateway' ? Layers :
          Box;

        return (
          <div
            key={node.id}
            style={{ 
              left: `${node.x}%`, 
              top: `${node.y}%`, 
              transform: 'translate(-50%, -50%)' 
            }}
            className={`absolute z-20 px-3 py-2 rounded-xl border flex flex-col items-center justify-center min-w-[120px] max-w-[150px] text-center shadow-lg transition-transform hover:scale-105 select-none ${colorClasses}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <NodeIcon className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold tracking-tight truncate max-w-[110px]">
                {node.label}
              </span>
            </div>
            {node.role && (
              <span className="text-[8px] opacity-80 leading-none block font-mono">
                {node.role}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
