import React from 'react';
import * as HoverCard from '@radix-ui/react-hover-card';
import { ComponentDefinition } from '../data/components';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Lightbulb, Link as LinkIcon, Info, MessageSquare } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface ComponentHoverCardProps {
  component: ComponentDefinition;
  children: React.ReactNode;
}

export default function ComponentHoverCard({ component, children }: ComponentHoverCardProps) {
  const Icon = (LucideIcons as any)[component.iconName] || LucideIcons.Box;

  return (
    <HoverCard.Root openDelay={300} closeDelay={100}>
      <HoverCard.Trigger asChild>
        {children}
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content 
          side="right" 
          align="start" 
          sideOffset={16}
          className="z-[100] w-[450px] bg-[#111113] border border-[#27272A] rounded-xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className={`p-4 border-b border-[#27272A] flex items-start gap-3`}>
            <div className={`w-10 h-10 ${component.color} rounded-lg flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                {component.label}
                <span className="text-[10px] uppercase tracking-wider font-bold bg-[#1A1A1D] text-gray-400 px-2 py-0.5 rounded border border-[#27272A]">
                  {component.type}
                </span>
              </h3>
              <p className="text-sm text-gray-400 mt-1">{component.description}</p>
            </div>
          </div>

          <div className="overflow-y-auto p-5 space-y-6 custom-scrollbar text-sm">
            {/* Beginner Explanation */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
                <Info className="w-4 h-4" /> Beginner Explanation
              </div>
              <p className="text-indigo-200/80 leading-relaxed">"{component.beginnerExplanation}"</p>
            </div>

            {/* Animation Preview (Placeholder for now, we can customize per category later) */}
            <div className="bg-[#0A0A0B] rounded-lg border border-[#27272A] p-4 flex flex-col items-center justify-center min-h-[120px] relative overflow-hidden">
              <ComponentAnimation type={component.type} />
            </div>

            {/* Why It Exists */}
            <div>
              <h4 className="text-gray-300 font-semibold mb-1">Why does it exist?</h4>
              <p className="text-gray-400 leading-relaxed">{component.whyItExists}</p>
            </div>

            {/* How It Works */}
            <div>
              <h4 className="text-gray-300 font-semibold mb-1">How does it work?</h4>
              <p className="text-gray-400 leading-relaxed">{component.howItWorks}</p>
            </div>

            {/* Benefits & Trade-offs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-emerald-400 font-semibold mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Benefits
                </h4>
                <ul className="space-y-1">
                  {component.advantages.map((adv, i) => (
                    <li key={i} className="text-gray-400 text-xs flex items-start gap-1.5">
                      <span className="w-1 h-1 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Trade-offs
                </h4>
                <ul className="space-y-1">
                  {component.disadvantages.map((dis, i) => (
                    <li key={i} className="text-gray-400 text-xs flex items-start gap-1.5">
                      <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 shrink-0" />
                      <span>{dis}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Common Mistakes */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
              <h4 className="text-amber-400 font-semibold mb-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Common Mistakes
              </h4>
              <ul className="space-y-1">
                {component.commonMistakes.map((mistake, i) => (
                  <li key={i} className="text-amber-200/70 text-xs flex items-start gap-1.5">
                    <span className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Related Components */}
            <div>
              <h4 className="text-gray-300 font-semibold mb-2 flex items-center gap-1">
                <LinkIcon className="w-4 h-4" /> Related Components
              </h4>
              <div className="flex flex-wrap gap-2">
                {component.relatedComponents.map((rel, i) => (
                  <span key={i} className="bg-[#1A1A1D] border border-[#27272A] text-gray-400 text-xs px-2 py-1 rounded-md">
                    {rel}
                  </span>
                ))}
              </div>
            </div>

            {/* Interview Tip */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
               <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
                <MessageSquare className="w-4 h-4" /> Interview Tip
              </div>
              <p className="text-blue-200/80 leading-relaxed italic text-sm">"{component.interviewTips}"</p>
            </div>
          </div>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}

function ComponentAnimation({ type }: { type: string }) {
  // Simple custom animations based on type.
  if (type === 'Load Balancer') {
    return (
      <div className="flex flex-col items-center gap-4 w-full h-full justify-center">
        <div className="flex gap-2 mb-2">
          {[1,2,3].map(i => (
             <motion.div 
               key={i} 
               initial={{ y: -20, opacity: 0 }} 
               animate={{ y: 20, opacity: 1 }} 
               transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.4 }} 
               className="w-2 h-2 rounded-full bg-blue-400"
             />
          ))}
        </div>
        <div className="w-16 h-8 bg-sky-500/20 border border-sky-500 rounded-md flex items-center justify-center text-xs text-sky-400 z-10">LB</div>
        <div className="flex gap-4 mt-2">
           {[1,2,3].map(i => (
             <div key={i} className="relative">
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: [0, 1, 0] }}
                 transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.4 + 0.5 }}
                 className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-4 bg-emerald-400"
               />
               <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500 rounded-md" />
             </div>
           ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-2 absolute bottom-2">Distributing traffic across healthy instances</p>
      </div>
    );
  }

  if (type === 'Cache' || type === 'Redis / Memcached') {
    return (
      <div className="flex items-center gap-6 w-full h-full justify-center">
        <div className="w-8 h-8 bg-blue-500/20 border border-blue-500 rounded-md flex items-center justify-center text-[10px] text-blue-400">App</div>
        
        <div className="relative flex flex-col gap-4">
           <div className="w-16 h-10 bg-rose-500/20 border border-rose-500 rounded-md flex flex-col items-center justify-center z-10">
             <span className="text-[10px] text-rose-400 font-bold">Cache</span>
           </div>
           
           <motion.div 
             initial={{ x: -20, opacity: 0 }}
             animate={{ x: 20, opacity: [0,1,0] }}
             transition={{ repeat: Infinity, duration: 2 }}
             className="absolute top-4 -left-4 w-2 h-2 rounded-full bg-blue-400"
           />
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: [0,1,1,0] }}
             transition={{ repeat: Infinity, duration: 2, times: [0, 0.4, 0.6, 1] }}
             className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-emerald-400 font-bold whitespace-nowrap"
           >
             Hit! ⚡
           </motion.div>

           <div className="w-16 h-10 bg-orange-500/20 border border-orange-500 rounded-md flex items-center justify-center opacity-40">
             <span className="text-[10px] text-orange-400">DB</span>
           </div>
        </div>
        <p className="text-[10px] text-gray-500 mt-2 absolute bottom-2">Serving frequent queries from memory</p>
      </div>
    );
  }

  if (type === 'Event Stream' || type === 'Message Queue') {
    return (
      <div className="flex items-center justify-between w-full max-w-[200px] h-full">
         <div className="w-8 h-8 bg-blue-500/20 border border-blue-500 rounded-md" />
         
         <div className="w-24 h-8 bg-zinc-700/50 border border-zinc-600 rounded-full flex items-center px-1 overflow-hidden relative">
            <motion.div
               initial={{ x: -20 }}
               animate={{ x: 100 }}
               transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
               className="flex gap-2 absolute"
            >
               <div className="w-4 h-4 bg-yellow-400 rounded-sm" />
               <div className="w-4 h-4 bg-yellow-400 rounded-sm" />
               <div className="w-4 h-4 bg-yellow-400 rounded-sm" />
            </motion.div>
         </div>

         <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500 rounded-md" />
         <p className="text-[10px] text-gray-500 mt-2 absolute bottom-2">Decoupling producers and consumers</p>
      </div>
    );
  }

  // Generic animation
  return (
    <div className="flex flex-col items-center justify-center opacity-50">
      <motion.div 
         animate={{ rotate: 360 }} 
         transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      >
        <Lightbulb className="w-8 h-8 text-gray-400" />
      </motion.div>
      <span className="text-xs text-gray-500 mt-2">Interactive Preview</span>
    </div>
  );
}
