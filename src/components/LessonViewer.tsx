import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Play, Pause, RotateCcw, CheckCircle2, CheckSquare, Gamepad2, BookOpen } from 'lucide-react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import { Lesson } from '../data/lessons';
import Markdown from 'react-markdown';
import CachePlayground from './CachePlayground';
import KafkaPlayground from './KafkaPlayground';
import ShardingPlayground from './ShardingPlayground';
import FailurePlayground from './FailurePlayground';
import KnowledgeCheckQuiz from './KnowledgeCheckQuiz';

const nodeTypes = {
  custom: CustomNode,
};

export default function LessonViewer({ lesson, onExit, onContextChange }: { lesson: Lesson; onExit: () => void; onContextChange?: (ctx: any) => void }) {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [activeTab, setActiveTab] = useState<'LEARN' | 'PLAYGROUND'>('LEARN');
  const [showKnowledgeCheck, setShowKnowledgeCheck] = useState(false);

  const scene = lesson.scenes[currentSceneIdx];

  const onContextChangeRef = useRef(onContextChange);
  useEffect(() => {
    onContextChangeRef.current = onContextChange;
  }, [onContextChange]);

  useEffect(() => {
    if (!showKnowledgeCheck) {
      onContextChangeRef.current?.({
        topic: 'Lesson: ' + lesson.title,
        scene: scene.title
      });
    } else {
      onContextChangeRef.current?.({
        topic: 'Quiz: ' + lesson.title,
        scene: 'Knowledge Check'
      });
    }
  }, [lesson.title, scene.title, showKnowledgeCheck]);

  useEffect(() => {
    setSelectedAnswer(null); // Reset quiz when scene changes
    setActiveTab('LEARN');
  }, [currentSceneIdx]);

  // Handle lesson change
  useEffect(() => {
    setCurrentSceneIdx(0);
    setShowKnowledgeCheck(false);
  }, [lesson.id]);

  const handleNext = () => {
    if (currentSceneIdx < lesson.scenes.length - 1) {
      setCurrentSceneIdx(prev => prev + 1);
    } else {
      setShowKnowledgeCheck(true);
    }
  };

  const handlePrev = () => {
    if (currentSceneIdx > 0) {
      setCurrentSceneIdx(prev => prev - 1);
    }
  };
  
  // Create edges honoring the paused state
  const edges = scene.edges.map(e => ({
     ...e,
     animated: isAnimating ? e.animated : false
  }));

  if (showKnowledgeCheck) {
    return (
      <KnowledgeCheckQuiz
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        onComplete={(score, total) => {
          // Save completion status to localStorage
          try {
            const completed = JSON.parse(localStorage.getItem('completed_lessons') || '[]');
            if (!completed.includes(lesson.id)) {
              completed.push(lesson.id);
              localStorage.setItem('completed_lessons', JSON.stringify(completed));
            }
          } catch (e) {
            console.error("Error saving completed lesson state", e);
          }
          onExit();
        }}
        onCancel={() => {
          setShowKnowledgeCheck(false);
        }}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0A0B]">
      {/* Top Bar */}
      <div className="h-14 border-b border-[#1F1F22] bg-[#111113] flex items-center justify-between px-6 shrink-0">
         <button onClick={onExit} className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back to Curriculum
         </button>
         <div className="flex items-center gap-2">
            {lesson.scenes.map((s, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSceneIdx ? 'w-8 bg-indigo-500' : i < currentSceneIdx ? 'w-4 bg-indigo-500/40' : 'w-4 bg-[#27272A]'}`} />
            ))}
         </div>
         <div className="text-sm font-medium text-gray-300">
            {lesson.title}
         </div>
      </div>

      {/* Main Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Interactive Canvas */}
        <div className="flex-1 border-r border-[#1F1F22] relative bg-[#0A0A0B]">
           <ReactFlow 
             nodes={scene.nodes}
             edges={edges}
             nodeTypes={nodeTypes}
             fitView
             fitViewOptions={{ padding: 0.5 }}
             minZoom={0.5}
             maxZoom={1.5}
             proOptions={{ hideAttribution: true }}
           >
             <Background color="#27272A" gap={16} size={1} />
             <Controls className="bg-[#1A1A1D] border-none fill-gray-300 stroke-gray-300" />
           </ReactFlow>

           {/* Animation Controls Overlay */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1A1D]/80 backdrop-blur-md border border-[#27272A] rounded-full p-2 flex items-center gap-2 shadow-2xl z-10">
              <button 
                onClick={() => setIsAnimating(!isAnimating)}
                className="w-10 h-10 rounded-full bg-[#111113] border border-[#27272A] flex items-center justify-center text-gray-300 hover:text-indigo-400 transition-colors"
                title={isAnimating ? "Pause Animation" : "Play Animation"}
              >
                 {isAnimating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </button>
              <button 
                onClick={() => { setIsAnimating(false); setTimeout(() => setIsAnimating(true), 50); }}
                className="w-10 h-10 rounded-full bg-[#111113] border border-[#27272A] flex items-center justify-center text-gray-300 hover:text-indigo-400 transition-colors"
                title="Restart Scene"
              >
                 <RotateCcw className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Right: Explanation & Controls */}
        <div className="w-[450px] bg-[#111113] flex flex-col shrink-0">
           {scene.playground && (
             <div className="flex border-b border-[#27272A] p-2 gap-2 bg-[#0A0A0B]">
               <button 
                 onClick={() => setActiveTab('LEARN')}
                 className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'LEARN' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1D]'}`}
               >
                 <BookOpen className="w-3.5 h-3.5" /> Explanation
               </button>
               <button 
                 onClick={() => setActiveTab('PLAYGROUND')}
                 className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'PLAYGROUND' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1D]'}`}
               >
                 <Gamepad2 className="w-3.5 h-3.5" /> Mini-Simulator
               </button>
             </div>
           )}

           <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              {activeTab === 'LEARN' ? (
                <>
                  <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Scene {currentSceneIdx + 1}</div>
                  <h2 className="text-2xl font-bold text-white mb-6">{scene.title}</h2>
                  
                  <div className="prose prose-invert prose-indigo max-w-none mb-8 text-gray-300 text-sm leading-relaxed">
                     <Markdown>{scene.explanation}</Markdown>
                  </div>

                  {scene.quiz && (
                     <div className="mt-8 bg-[#1A1A1D] border border-[#27272A] rounded-xl p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                           <CheckSquare className="w-4 h-4 text-indigo-400" /> Knowledge Check
                        </div>
                        <p className="text-gray-200 text-sm mb-4">{scene.quiz.question}</p>
                        <div className="space-y-2">
                           {scene.quiz.options.map((opt, i) => {
                              const isSelected = selectedAnswer === i;
                              const isCorrect = i === scene.quiz!.answerIndex;
                              const showResult = selectedAnswer !== null;

                              let bgClass = "bg-[#111113] border-[#27272A] hover:border-indigo-500/50";
                              if (showResult) {
                                 if (isCorrect) bgClass = "bg-emerald-500/10 border-emerald-500/50 text-emerald-300";
                                 else if (isSelected && !isCorrect) bgClass = "bg-red-500/10 border-red-500/50 text-red-300";
                                 else bgClass = "bg-[#111113] border-[#27272A] opacity-50";
                              }

                              return (
                                <button
                                   key={i}
                                   disabled={showResult}
                                   onClick={() => setSelectedAnswer(i)}
                                   className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${bgClass} text-gray-300`}
                                >
                                   {opt}
                                </button>
                              );
                           })}
                        </div>
                        {selectedAnswer !== null && (
                           <div className={`mt-4 p-3 rounded-lg text-sm border ${selectedAnswer === scene.quiz.answerIndex ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : 'bg-amber-500/10 border-amber-500/20 text-amber-200'}`}>
                              <strong className="block mb-1">{selectedAnswer === scene.quiz.answerIndex ? 'Correct!' : 'Not quite.'}</strong>
                              <Markdown>{scene.quiz.explanation}</Markdown>
                           </div>
                        )}
                     </div>
                  )}
                </>
              ) : (
                <div className="h-full">
                  {scene.playground === 'cache' && <CachePlayground />}
                  {scene.playground === 'kafka' && <KafkaPlayground />}
                  {scene.playground === 'sharding' && <ShardingPlayground />}
                  {scene.playground === 'chaos' && <FailurePlayground />}
                </div>
              )}
           </div>

           {/* Navigation Footer */}
           <div className="p-6 bg-[#0A0A0B] border-t border-[#1F1F22] flex items-center gap-4">
              <button 
                onClick={handlePrev}
                disabled={currentSceneIdx === 0}
                className="flex-1 bg-[#1A1A1D] hover:bg-[#27272A] disabled:opacity-50 border border-[#27272A] text-white py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                 <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button 
                onClick={handleNext}
                disabled={scene.quiz ? selectedAnswer === null : false}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                 {currentSceneIdx === lesson.scenes.length - 1 ? (
                   <>Complete <CheckCircle2 className="w-4 h-4" /></>
                 ) : (
                   <>Next Scene <ChevronRight className="w-4 h-4" /></>
                 )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
