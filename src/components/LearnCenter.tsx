import React, { useState, useEffect } from 'react';
import { Play, Lock, CheckCircle2 } from 'lucide-react';
import { lessons } from '../data/lessons';
import LessonViewer from './LessonViewer';

const LEVELS = [
  { id: 1, title: 'Level 1: Software Developer', description: 'Master the fundamentals of moving from a single server to a distributed architecture.' },
  { id: 2, title: 'Level 2: System Designer', description: 'Learn how to scale databases, decouple systems, and distribute content globally.' },
  { id: 3, title: 'Level 3: Distributed Systems Engineer', description: 'Tackle the hard problems: consistency, partitions, and real-time streaming.' },
  { id: 4, title: 'Level 4: Senior Architect', description: 'Master complex architecture patterns like Saga, CQRS, and Event Sourcing.' },
  { id: 5, title: 'Level 5: Principal Architect', description: 'Design massive real-world production systems (Uber, Netflix, Trading).' },
];

export default function LearnCenter({ onContextChange }: { onContextChange?: (ctx: any) => void }) {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  const onContextChangeRef = React.useRef(onContextChange);
  React.useEffect(() => {
    onContextChangeRef.current = onContextChange;
  }, [onContextChange]);

  useEffect(() => {
    if (!activeLessonId) {
      try {
        const completed = JSON.parse(localStorage.getItem('completed_lessons') || '[]');
        setCompletedLessonIds(completed);
      } catch (e) {
        console.error("Error reading completed lessons", e);
      }
    }
  }, [activeLessonId]);

  useEffect(() => {
    if (activeLessonId) {
      const activeLesson = lessons.find(l => l.id === activeLessonId);
      onContextChangeRef.current?.({
        topic: 'Curriculum',
        lesson: activeLesson?.title,
      });
    } else {
      onContextChangeRef.current?.({ topic: 'Curriculum Dashboard' });
    }
  }, [activeLessonId]);
  
  if (!activeLessonId) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#0A0A0B]">
        <div className="max-w-4xl mx-auto space-y-12 mt-4 pb-16">
          <header className="space-y-4">
            <h1 className="text-4xl font-bold text-white tracking-tight">Engineering Progression</h1>
            <p className="text-gray-400 text-lg">Master distributed systems from fundamentals to principal architect level through interactive simulations.</p>
          </header>
          
          <div className="space-y-12">
            {LEVELS.map(level => {
              const levelLessons = lessons.filter(l => l.level === level.id);
              if (levelLessons.length === 0) return null;
              return (
                <div key={level.id} className="space-y-6">
                  <div className="border-b border-[#27272A] pb-4">
                    <h2 className="text-2xl font-bold text-gray-200">{level.title}</h2>
                    <p className="text-gray-500 mt-1">{level.description}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {levelLessons.map((lesson) => {
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      return (
                        <div 
                          key={lesson.id} 
                          onClick={() => setActiveLessonId(lesson.id)}
                          className={`bg-[#111113] border ${isCompleted ? 'border-emerald-500/30 bg-emerald-500/[0.01]' : 'border-[#1F1F22]'} rounded-xl p-6 hover:border-indigo-500/50 hover:bg-[#1A1A1D] transition-all cursor-pointer group flex items-start gap-4`}
                        >
                          <div className={`w-12 h-12 ${isCompleted ? 'bg-emerald-500/10' : 'bg-indigo-500/10'} rounded-lg flex items-center justify-center shrink-0`}>
                             {isCompleted ? (
                               <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                             ) : (
                               <Play className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" fill="currentColor" />
                             )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
                              <h3 className={`text-xl font-semibold ${isCompleted ? 'text-emerald-200' : 'text-white'} group-hover:text-indigo-400 transition-colors`}>
                                {lesson.title}
                              </h3>
                              {isCompleted && (
                                <span className="text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider leading-none">
                                  COMPLETED
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">{lesson.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const activeLesson = lessons.find(l => l.id === activeLessonId)!;
  return <LessonViewer lesson={activeLesson} onExit={() => setActiveLessonId(null)} onContextChange={onContextChange} />;
}
