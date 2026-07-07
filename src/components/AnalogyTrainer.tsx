import React, { useState } from 'react';
import { 
  SYSTEM_DESIGN_ANALOGIES, 
  SystemDesignAnalogy 
} from '../data/analogies';
import { 
  Layers, Cpu, Zap, Database, Activity, Shield, Network, AlertTriangle, 
  HelpCircle, CheckCircle2, ChevronRight, ChevronDown, Coffee, Sparkles, 
  BookOpen, Info, ArrowRight, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Mapping analogy icon names to React Components
const ANALOGY_ICONS: Record<string, any> = {
  Layers: Layers,
  Cpu: Cpu,
  Zap: Zap,
  Database: Database,
  Activity: Activity,
  Shield: Shield,
  Network: Network,
  AlertTriangle: AlertTriangle
};

const THEME_CLASSES: Record<string, { border: string; bg: string; text: string; glow: string; accent: string }> = {
  indigo: {
    border: "border-indigo-500/20 hover:border-indigo-500/40",
    bg: "bg-indigo-500/5",
    text: "text-indigo-400",
    glow: "shadow-indigo-500/10",
    accent: "bg-indigo-500/10 text-indigo-400"
  },
  blue: {
    border: "border-blue-500/20 hover:border-blue-500/40",
    bg: "bg-blue-500/5",
    text: "text-blue-400",
    glow: "shadow-blue-500/10",
    accent: "bg-blue-500/10 text-blue-400"
  },
  amber: {
    border: "border-amber-500/20 hover:border-amber-500/40",
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    glow: "shadow-amber-500/10",
    accent: "bg-amber-500/10 text-amber-400"
  },
  emerald: {
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/10",
    accent: "bg-emerald-500/10 text-emerald-400"
  },
  rose: {
    border: "border-rose-500/20 hover:border-rose-500/40",
    bg: "bg-rose-500/5",
    text: "text-rose-400",
    glow: "shadow-rose-500/10",
    accent: "bg-rose-500/10 text-rose-400"
  },
  cyan: {
    border: "border-cyan-500/20 hover:border-cyan-500/40",
    bg: "bg-cyan-500/5",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/10",
    accent: "bg-cyan-500/10 text-cyan-400"
  },
  purple: {
    border: "border-purple-500/20 hover:border-purple-500/40",
    bg: "bg-purple-500/5",
    text: "text-purple-400",
    glow: "shadow-purple-500/10",
    accent: "bg-purple-500/10 text-purple-400"
  },
  orange: {
    border: "border-orange-500/20 hover:border-orange-500/40",
    bg: "bg-orange-500/5",
    text: "text-orange-400",
    glow: "shadow-orange-500/10",
    accent: "bg-orange-500/10 text-orange-400"
  }
};

export default function AnalogyTrainer() {
  const [expandedId, setExpandedId] = useState<string | null>("an-1");
  const [masteredList, setMasteredList] = useState<Record<string, boolean>>({});

  const toggleMastery = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredList(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-[#0A0A0B]">
      {/* Introduction Banner */}
      <div className="relative bg-gradient-to-r from-indigo-950/20 to-purple-950/10 border border-[#1F1F22] rounded-2xl p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Coffee className="w-48 h-48 text-indigo-400" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Common-Sense Explanations
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">System Design in Plain English</h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            System design can sound incredibly intimidating because of the heavy jargon. But if we strip away the fancy vocabulary, most of these concepts are just common-sense solutions that we use in everyday life.
          </p>
        </div>
      </div>

      {/* Progress Metric bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111113] border border-[#1F1F22] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Analogy Concept Mastery</h4>
            <p className="text-xs text-gray-500">Track your understanding of the core system components.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-gray-400 font-medium">Progress: </span>
            <span className="text-sm font-mono font-bold text-indigo-400">
              {Object.values(masteredList).filter(Boolean).length} / {SYSTEM_DESIGN_ANALOGIES.length} Mastered
            </span>
          </div>
          <div className="w-24 bg-zinc-800 h-2.5 rounded-full overflow-hidden border border-zinc-700">
            <div 
              className="bg-indigo-500 h-full transition-all duration-500"
              style={{ width: `${(Object.values(masteredList).filter(Boolean).length / SYSTEM_DESIGN_ANALOGIES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Analogies List */}
      <div className="space-y-4">
        {SYSTEM_DESIGN_ANALOGIES.map((item) => {
          const isExpanded = expandedId === item.id;
          const isMastered = !!masteredList[item.id];
          const theme = THEME_CLASSES[item.themeColor] || THEME_CLASSES.indigo;
          const IconComponent = ANALOGY_ICONS[item.iconName] || HelpCircle;

          return (
            <div 
              key={item.id}
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className={`bg-[#111113] border rounded-xl transition-all duration-300 overflow-hidden cursor-pointer select-none ${
                isExpanded 
                  ? 'border-indigo-500/40 shadow-xl shadow-indigo-950/5' 
                  : 'border-[#1F1F22] hover:border-zinc-700 hover:bg-[#141417]'
              }`}
            >
              {/* Card Header Row */}
              <div className="p-5 flex items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border ${theme.border} ${theme.bg}`}>
                    <IconComponent className={`w-5 h-5 ${theme.text}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.text}`}>
                        Analogical Concept
                      </span>
                      {isMastered && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Mastered
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-100 text-sm md:text-base leading-snug hover:text-white transition-colors truncate">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Mark as Mastered Checkbox Button */}
                  <button
                    onClick={(e) => toggleMastery(item.id, e)}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isMastered 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-zinc-800/40 border-zinc-700/50 text-gray-500 hover:text-gray-300'
                    }`}
                    title="Toggle concept mastery"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden md:inline">Mastered</span>
                  </button>

                  <div className="text-zinc-500 hover:text-white">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Card Content Panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-[#1F1F22] bg-[#0C0C0E]"
                  >
                    <div className="p-6 space-y-6">
                      {/* Interview Question Callout */}
                      <div className="bg-[#121215] border-l-4 border-indigo-500 rounded-r-xl p-4 flex gap-3.5">
                        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">The Interview Question</h5>
                          <p className="text-gray-200 text-sm font-medium italic">"{item.question}"</p>
                        </div>
                      </div>

                      {/* General Analogy Explanation */}
                      {item.generalAnalogy && (
                        <div className="space-y-3 bg-[#111114]/50 border border-zinc-800/50 rounded-xl p-5">
                          <div className="flex items-center gap-2">
                            <Coffee className="w-4 h-4 text-amber-500" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                              The Analogy: {item.generalAnalogy.analogy}
                            </h4>
                          </div>
                          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line font-sans">
                            {item.generalAnalogy.explanation.split('\n\n').map((para, idx) => {
                              if (para.startsWith('* ')) {
                                return (
                                  <ul key={idx} className="list-disc pl-5 space-y-1.5 my-2">
                                    {para.split('\n').map((li, lIdx) => (
                                      <li key={lIdx} className="text-gray-300 text-xs md:text-sm">
                                        {li.replace(/^[\s-*]+/, '')}
                                      </li>
                                    ))}
                                  </ul>
                                );
                              }
                              return (
                                <p key={idx} className="mb-2" dangerouslySetInnerHTML={{
                                  __html: para
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                                    .replace(/`(.*?)`/g, '<code class="bg-[#1C1C20] px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs">$1</code>')
                                }} />
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Concepts Side-by-Side Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Concept 1 */}
                        <div className="bg-[#111113] border border-zinc-800 rounded-xl p-5 space-y-4 hover:border-zinc-700 transition-all">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                              Concept A
                            </span>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-extrabold text-white">{item.concept1.name}</h4>
                              <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full font-semibold font-mono">
                                💡 {item.concept1.analogy}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-400 leading-relaxed">
                            {item.concept1.description}
                          </p>

                          {/* Pros & Cons */}
                          {(item.concept1.pros || item.concept1.cons) && (
                            <div className="pt-3 border-t border-zinc-800/50 space-y-2.5 text-xs">
                              {item.concept1.pros && (
                                <div className="space-y-1">
                                  <span className="font-bold text-emerald-400 uppercase tracking-wider font-mono">
                                    ✓ Real-World Pros
                                  </span>
                                  <p className="text-gray-300 leading-relaxed">{item.concept1.pros}</p>
                                </div>
                              )}
                              {item.concept1.cons && (
                                <div className="space-y-1">
                                  <span className="font-bold text-rose-400 uppercase tracking-wider font-mono">
                                    ✗ Real-World Cons
                                  </span>
                                  <p className="text-gray-300 leading-relaxed">{item.concept1.cons}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Concept 2 */}
                        {item.concept2 && (
                          <div className="bg-[#111113] border border-zinc-800 rounded-xl p-5 space-y-4 hover:border-zinc-700 transition-all">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                                Concept B
                              </span>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-extrabold text-white">{item.concept2.name}</h4>
                                <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full font-semibold font-mono">
                                  💡 {item.concept2.analogy}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-400 leading-relaxed">
                              {item.concept2.description}
                            </p>

                            {/* Pros & Cons */}
                            {(item.concept2.pros || item.concept2.cons) && (
                              <div className="pt-3 border-t border-zinc-800/50 space-y-2.5 text-xs">
                                {item.concept2.pros && (
                                  <div className="space-y-1">
                                    <span className="font-bold text-emerald-400 uppercase tracking-wider font-mono">
                                      ✓ Real-World Pros
                                    </span>
                                    <p className="text-gray-300 leading-relaxed">{item.concept2.pros}</p>
                                  </div>
                                )}
                                {item.concept2.cons && (
                                  <div className="space-y-1">
                                    <span className="font-bold text-rose-400 uppercase tracking-wider font-mono">
                                      ✗ Real-World Cons
                                    </span>
                                    <p className="text-gray-300 leading-relaxed">{item.concept2.cons}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions / Mastery Stamp */}
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                        <span className="text-xs text-gray-500 italic">
                          Perfect for framing your response when recruiters ask for non-technical breakdowns.
                        </span>
                        <button
                          onClick={(e) => toggleMastery(item.id, e)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                            isMastered 
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg' 
                              : 'bg-[#161619] text-gray-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          {isMastered ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              Mastery Confirmed
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4" />
                              Mark as Mastered
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
