import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Target, Shield, Activity, TrendingUp, Zap, 
  AlertTriangle, Lock, DollarSign, BarChart, Info, 
  ChevronRight, ExternalLink, HelpCircle, Lightbulb,
  CheckCircle, Globe, Layers, Database
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Architecture } from '../types';

interface DocumentationPanelProps {
  architecture: Architecture;
  onHighlightComponent: (nodeId: string | null) => void;
  activeComponentId: string | null;
  onLinkClick?: (type: string, targetId: string) => void;
}

export default function DocumentationPanel({ architecture, onHighlightComponent, activeComponentId, onLinkClick }: DocumentationPanelProps) {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const details = architecture?.explanations?.detailed;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const nodeId = entry.target.getAttribute('data-node-id');
            const section = entry.target.getAttribute('data-section');
            if (nodeId) onHighlightComponent(nodeId);
            if (section) setActiveSection(section);
          }
        });
      },
      { root: scrollContainerRef.current, threshold: 0.5 }
    );

    const targets = scrollContainerRef.current?.querySelectorAll('[data-highlight-target]');
    targets?.forEach((t) => observer.observe(t));

    return () => observer.disconnect();
  }, [architecture, onHighlightComponent]);

  if (!details || !architecture.explanations) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center bg-[#0A0A0B] border-l border-[#1F1F22] w-full lg:w-[450px] shrink-0">
        <Info className="w-12 h-12 mb-4 opacity-20" />
        <p>Detailed documentation for this architecture is not available yet.</p>
      </div>
    );
  }

  const sections = [
    { id: 'overview', label: 'Architecture', icon: BookOpen },
    { id: 'walkthrough', label: 'Explanation', icon: Globe },
    { id: 'dataflow', label: 'Data Flow', icon: Activity },
    { id: 'events', label: 'Event Flow', icon: Zap },
    { id: 'components', label: 'Services', icon: Layers },
    { id: 'kafka', label: 'Kafka', icon: Layers },
    { id: 'capacity', label: 'Databases', icon: Database },
    { id: 'scaling', label: 'Scalability', icon: TrendingUp },
    { id: 'failures', label: 'Failures', icon: AlertTriangle },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0A0B] border-l border-[#1F1F22] w-full lg:w-[450px] shrink-0 overflow-hidden">
      {/* Navigation Tabs */}
      <div className="flex border-b border-[#1F1F22] bg-[#111113] overflow-x-auto no-scrollbar shrink-0">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              const element = document.getElementById(`doc-section-${section.id}`);
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
              activeSection === section.id 
                ? 'text-indigo-400 border-indigo-500 bg-indigo-500/5' 
                : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <section.icon className="w-3.5 h-3.5" />
            {section.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-10 pb-20"
      >
        {/* Overview Section */}
        <section id="doc-section-overview" className="scroll-mt-6" data-highlight-target data-section="overview">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" /> Overview
          </h2>
          <div className="prose prose-invert prose-sm">
            <p className="text-gray-300 leading-relaxed italic border-l-2 border-indigo-500/30 pl-4 bg-indigo-500/5 py-2 rounded-r-lg">
              {details.overview}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {architecture.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] uppercase font-bold rounded">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
             <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Globe className="w-3 h-3" /> Real-World Usage
             </h4>
             <p className="text-sm text-gray-300 leading-relaxed">
                {details.realWorldUsage}
             </p>
          </div>
        </section>

        {/* Requirements Section */}
        <section id="doc-section-requirements" className="scroll-mt-6" data-highlight-target data-section="requirements">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" /> Requirements
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Functional Requirements</h3>
              <ul className="space-y-3">
                {details.functionalRequirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Non-Functional Requirements</h3>
              <ul className="space-y-3">
                {details.nonFunctionalRequirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Databases Section */}
        <section id="doc-section-capacity" className="scroll-mt-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" /> Database Sharding & Strategy
          </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#111113] border border-[#1F1F22] p-4 rounded-xl">
                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">DAU</div>
                <div className="text-lg font-mono text-white">{details.capacityEstimation.dau}</div>
              </div>
              <div className="bg-[#111113] border border-[#1F1F22] p-4 rounded-xl">
                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Requests / Sec</div>
                <div className="text-lg font-mono text-white">{details.capacityEstimation.rps}</div>
              </div>
              <div className="bg-[#111113] border border-[#1F1F22] p-4 rounded-xl">
                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Storage</div>
                <div className="text-lg font-mono text-white">{details.capacityEstimation.storage}</div>
              </div>
              <div className="bg-[#111113] border border-[#1F1F22] p-4 rounded-xl">
                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Bandwidth</div>
                <div className="text-lg font-mono text-white">{details.capacityEstimation.bandwidth}</div>
              </div>
            </div>

            {details.capacityEstimation.calculations && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <BarChart className="w-4 h-4" /> The Math
                </h4>
                <ul className="space-y-2">
                  {details.capacityEstimation.calculations.map((calc, i) => (
                    <li key={i} className="text-xs text-amber-200/70 font-mono flex gap-2">
                      <span className="text-amber-500/50">[{i+1}]</span> {calc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

        {/* Walkthrough Section */}
        <section id="doc-section-walkthrough" className="scroll-mt-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400" /> Architecture Walkthrough
          </h2>
          <div className="space-y-4">
            {details.architectureWalkthrough.map((step, i) => (
              <div key={i} className="relative pl-10 border-l border-zinc-800 pb-6 last:pb-0">
                 <div className="absolute left-[-13px] top-0 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-gray-400">
                    {i + 1}
                 </div>
                 <p className="text-sm text-gray-300 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Core Data Flows Section */}
        <section id="doc-section-dataflow" className="scroll-mt-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-fuchsia-400" /> Core Data Flows
          </h2>
          <div className="space-y-4">
            {details.dataFlow.map((flow, i) => (
              <div key={i} className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4">
                 <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Flow Path {i+1}</span>
                 </div>
                 <p className="text-sm text-gray-300 font-mono bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                    {flow}
                 </p>
              </div>
            ))}
          </div>
        </section>

        {/* Event Flow Section */}
        <section id="doc-section-events" className="scroll-mt-6">
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Event Lifecycle
           </h2>
           <div className="bg-[#111113] border border-[#1F1F22] rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                    <Zap className="w-6 h-6 text-yellow-500" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">OrderCreated Event</h4>
                    <p className="text-xs text-gray-500">Payload: order_id, customer_id, total, items[]</p>
                 </div>
              </div>
              <div className="space-y-3">
                 {[
                   '1. Produced by Order Service after DB commit',
                   '2. Written to Kafka "orders" topic (3 partitions)',
                   '3. Consumed by Inventory Service (Reserve Stock)',
                   '4. Consumed by Payment Service (Initiate Tx)',
                   '5. Consumed by Analytics Service (Real-time dashboard)'
                 ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                       <ChevronRight className="w-3.5 h-3.5 text-yellow-500/50" />
                       {s}
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Kafka Section */}
        <section id="doc-section-kafka" className="scroll-mt-6">
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" /> Message Bus (Kafka)
           </h2>
           <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#111113] border border-[#1F1F22] p-4 rounded-xl">
                 <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Topics</div>
                 <div className="text-lg font-mono text-white">12</div>
              </div>
              <div className="bg-[#111113] border border-[#1F1F22] p-4 rounded-xl">
                 <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Throughput</div>
                 <div className="text-lg font-mono text-white">50k msg/s</div>
              </div>
           </div>
           <p className="text-sm text-gray-400 leading-relaxed">
              Kafka acts as the central nervous system. We use a 3-broker cluster with a replication factor of 3 to ensure zero data loss (acks=all).
           </p>
        </section>

        {/* Component Deep Dive Section */}
        <section id="doc-section-components" className="scroll-mt-6">
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" /> Component Deep Dive
           </h2>
           <div className="space-y-4">
              {architecture.explanations.components && Object.entries(architecture.explanations.components).map(([nodeId, explanation]) => {
                const node = architecture.design.nodes.find(n => n.id === nodeId);
                return (
                  <div 
                    key={nodeId} 
                    data-highlight-target
                    data-node-id={nodeId}
                    data-section="components"
                    className={`bg-[#111113] border rounded-xl p-4 transition-all cursor-pointer ${
                      activeComponentId === nodeId 
                        ? 'border-indigo-500 ring-1 ring-indigo-500/50 bg-indigo-500/5' 
                        : 'border-[#1F1F22] hover:border-zinc-700'
                    }`}
                    onMouseEnter={() => onHighlightComponent(nodeId)}
                    onMouseLeave={() => onHighlightComponent(null)}
                  >
                     <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                           <div className={`w-8 h-8 rounded-lg ${node?.data.color || 'bg-zinc-700'} flex items-center justify-center`}>
                              <Box className="w-4 h-4 text-white" />
                           </div>
                           <h4 className="font-bold text-gray-200">{node?.data.label || nodeId}</h4>
                        </div>
                        {activeComponentId === nodeId && <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Selected</span>}
                     </div>
                     <p className="text-sm text-gray-400 leading-relaxed">{explanation}</p>
                  </div>
                );
              })}
           </div>
        </section>

        {/* Design Decisions Section */}
        <section id="doc-section-decisions" className="scroll-mt-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" /> Design Decisions
          </h2>
          <div className="space-y-4">
            {details.designDecisions.map((decision, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <h4 className="text-sm font-bold text-white mb-2 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  {decision.question}
                </h4>
                <p className="text-sm text-gray-400 leading-relaxed pl-6 border-l border-zinc-700 ml-2 mt-2">
                  {decision.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Caching Section */}
        <section id="doc-section-caching" className="scroll-mt-6">
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" /> Global Caching Strategy
           </h2>
           <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5">
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                 Multi-layer caching is used to handle massive read traffic and reduce database load.
              </p>
              <div className="grid grid-cols-1 gap-3">
                 {[
                   { l: 'CDN Layer', v: 'Cache static assets, images, and common JSON responses at the edge.' },
                   { l: 'Redis Cluster', v: 'High-speed key-value store for session data, shopping carts, and inventory counts.' },
                   { l: 'Local In-Memory', v: 'Hot configs and small dictionaries cached directly within microservice instances.' }
                 ].map((c, i) => (
                    <div key={i} className="flex flex-col gap-1 p-3 bg-black/30 rounded-lg border border-emerald-500/20">
                       <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{c.l}</span>
                       <span className="text-xs text-gray-400">{c.v}</span>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Scalability Section */}
        <section id="doc-section-scaling" className="scroll-mt-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Scalability & Growth
          </h2>
          <div className="space-y-4">
            {details.scalingStrategy.map((strat, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-sm text-gray-300 leading-relaxed pt-1">{strat}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Failure Scenarios Section */}
        <section id="doc-section-failures" className="scroll-mt-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" /> Failure Scenarios
          </h2>
          <div className="space-y-4">
            {details.failureScenarios.map((failure, i) => (
              <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
                <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                   <AlertTriangle className="w-4 h-4" /> {failure.scenario}
                </h4>
                <div className="bg-black/30 rounded-lg p-3 border border-red-500/10">
                   <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Recovery Mechanism</div>
                   <p className="text-xs text-red-200/70 leading-relaxed">{failure.recovery}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security Section */}
        <section id="doc-section-security" className="scroll-mt-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" /> Security
          </h2>
          <div className="grid grid-cols-1 gap-3">
             {details.security.map((sec, i) => (
               <div key={i} className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 text-sm text-emerald-200/70">
                  <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                  {sec}
               </div>
             ))}
          </div>
        </section>

        {/* Interview Perspective Section */}
        <section id="doc-section-interview" className="scroll-mt-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" /> Interview Perspective
          </h2>
          
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-5 mb-6">
             <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">How to Explain This</h4>
             <p className="text-sm text-gray-300 leading-relaxed italic">
                "{details.interviewPerspective.howToExplain}"
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Follow-up Questions</h4>
                <ul className="space-y-2">
                   {details.interviewPerspective.followUps.map((q, i) => (
                     <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-indigo-500 mt-0.5 shrink-0" />
                        {q}
                     </li>
                   ))}
                </ul>
             </div>
             <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                <h4 className="text-[10px] font-bold text-red-400/50 uppercase tracking-widest mb-3">Common Mistakes</h4>
                <ul className="space-y-2">
                   {details.interviewPerspective.commonMistakes.map((m, i) => (
                     <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                        {m}
                     </li>
                   ))}
                </ul>
             </div>
          </div>
        </section>

        {/* Key Takeaways Section */}
        <section id="doc-section-takeaways" className="scroll-mt-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" /> Key Takeaways
          </h2>
          <div className="space-y-3">
             {details.keyTakeaways.map((takeaway, i) => (
               <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4 text-sm text-gray-300 flex gap-3">
                  <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                     {i+1}
                  </div>
                  {takeaway}
               </div>
             ))}
          </div>
        </section>

        {/* Interactive Links Section */}
        {details.interactiveLinks && details.interactiveLinks.length > 0 && (
          <section id="doc-section-links" className="scroll-mt-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-indigo-400" /> Explore Further
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {details.interactiveLinks.map((link, i) => (
                <button 
                  key={i}
                  onClick={() => onLinkClick?.(link.type, link.targetId)}
                  className="flex items-center justify-between p-3 bg-[#111113] border border-[#1F1F22] hover:border-indigo-500/50 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#1A1A1D] p-2 rounded-lg text-gray-500 group-hover:text-indigo-400 transition-colors">
                      {link.type === 'LESSON' && <BookOpen className="w-4 h-4" />}
                      {link.type === 'ARCHITECTURE' && <Layers className="w-4 h-4" />}
                      {link.type === 'COMPONENT' && <Box className="w-4 h-4" />}
                      {link.type === 'INTERVIEW' && <HelpCircle className="w-4 h-4" />}
                      {link.type === 'LAB' && <Activity className="w-4 h-4" />}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{link.type}</div>
                      <div className="text-sm text-gray-300 font-medium">{link.label}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-all" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Box(props: any) {
   return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
   )
}
