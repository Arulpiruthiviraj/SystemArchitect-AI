import React, { useState, useEffect } from 'react';
import { Target, LayoutTemplate, Activity, Settings as SettingsIcon, BookOpen, Code, Trophy, Layers, Menu, X, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SystemDesignLab from './components/SystemDesignLab';
import LearnCenter from './components/LearnCenter';
import Settings from './components/Settings';
import ContextualAIMentor from './components/ContextualAIMentor';
import ArchitectureGallery from './components/ArchitectureGallery';
import ChallengeBank from './components/ChallengeBank';
import OnboardingTour from './components/OnboardingTour';
import InterviewQAPrep from './components/InterviewQAPrep';

export type AppView = 'LEARN' | 'LAB' | 'GALLERY' | 'CHALLENGES' | 'INTERVIEW_QA' | 'SETTINGS';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('LEARN');
  
  // Track context for the AI
  const [aiContext, setAiContext] = useState<any>({ view: 'LEARN', topic: 'general' });

  // Mode and data states for the Lab
  const [labMode, setLabMode] = useState<'FREE' | 'REVIEW' | 'CHALLENGE' | 'INTERVIEW'>('FREE');
  const [labData, setLabData] = useState<any>(null);
  const [isTourActive, setIsTourActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLabContextChange = React.useCallback((ctx: any) => {
    setAiContext((prev: any) => ({ view: 'LAB', ...ctx }));
  }, []);

  const handleLearnContextChange = React.useCallback((ctx: any) => {
    setAiContext((prev: any) => ({ view: 'LEARN', ...ctx }));
  }, []);

  const handleGalleryContextChange = React.useCallback((ctx: any) => {
    setAiContext((prev: any) => ({ view: 'GALLERY', ...ctx }));
  }, []);

  const handleChallengesContextChange = React.useCallback((ctx: any) => {
    setAiContext((prev: any) => ({ view: 'CHALLENGES', ...ctx }));
  }, []);

  const openArchitecture = (arch: any) => {
    setLabMode('REVIEW');
    setLabData(arch);
    setCurrentView('LAB');
  };

  const openChallenge = (challenge: any) => {
    setLabMode('CHALLENGE');
    setLabData(challenge);
    setCurrentView('LAB');
  };

  const openFreeLab = () => {
    setLabMode('FREE');
    setLabData(null);
    setCurrentView('LAB');
    setAiContext({ view: 'LAB', topic: 'Free Design' });
  };

  return (
    <div className="h-screen bg-[#0A0A0B] text-gray-200 font-sans flex overflow-hidden">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-14 bg-[#111113] border-b border-[#1F1F22] z-[60] flex items-center justify-between px-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-500/10 rounded-lg flex items-center justify-center">
              <LayoutTemplate className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-semibold text-gray-100 text-xs tracking-tight">SystemArchitect</span>
          </div>

          <div className="w-10 flex justify-end">
            {currentView === 'LAB' && (
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('trigger-catalog-toggle'))}
                className="p-2 text-indigo-400 hover:text-white bg-indigo-500/10 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(isSidebarOpen || !isMobile) && (
          <>
            {isMobile && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
              />
            )}
            <motion.aside 
              initial={isMobile ? { x: -300 } : false}
              animate={{ x: 0 }}
              exit={isMobile ? { x: -300 } : undefined}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed lg:relative z-[80] w-64 h-full bg-[#111113] border-r border-[#1F1F22] flex flex-col shrink-0 shadow-2xl lg:shadow-none`}
            >
              <div className="p-6 border-b border-[#1F1F22] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                    <LayoutTemplate className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-gray-100 text-base tracking-tight">SystemArchitect</h1>
                  </div>
                </div>
                {isMobile && (
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-500 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <nav className="flex-1 p-4 flex flex-col gap-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1 mt-2">Core Journey</p>
                <NavButton 
                  active={currentView === 'LEARN'} 
                  onClick={() => { setCurrentView('LEARN'); setAiContext({ view: 'LEARN', topic: 'Curriculum' }); setIsSidebarOpen(false); }} 
                  icon={<BookOpen className="w-4 h-4" />}
                  label="Curriculum" 
                />
                <NavButton 
                  active={currentView === 'LAB' && labMode === 'FREE'} 
                  onClick={() => { openFreeLab(); setIsSidebarOpen(false); }} 
                  icon={<Code className="w-4 h-4" />}
                  label="Design Lab" 
                />
                
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1 mt-4">Library</p>
                <NavButton 
                  active={currentView === 'GALLERY' || (currentView === 'LAB' && labMode === 'REVIEW')} 
                  onClick={() => { setCurrentView('GALLERY'); setIsSidebarOpen(false); }} 
                  icon={<Layers className="w-4 h-4" />}
                  label="Reference Architectures" 
                />
                <NavButton 
                  active={currentView === 'CHALLENGES' || (currentView === 'LAB' && labMode === 'CHALLENGE')} 
                  onClick={() => { setCurrentView('CHALLENGES'); setIsSidebarOpen(false); }} 
                  icon={<Target className="w-4 h-4" />}
                  label="Challenges" 
                />
                <NavButton 
                  active={currentView === 'LAB' && labMode === 'INTERVIEW'} 
                  onClick={() => {
                    setLabMode('INTERVIEW');
                    setLabData(null);
                    setCurrentView('LAB');
                    setAiContext({ view: 'LAB', topic: 'Mock Interview' });
                    setIsSidebarOpen(false);
                  }} 
                  icon={<Trophy className="w-4 h-4" />}
                  label="Mock Interviews" 
                />
                <NavButton 
                  active={currentView === 'INTERVIEW_QA'} 
                  onClick={() => {
                    setCurrentView('INTERVIEW_QA');
                    setAiContext({ view: 'INTERVIEW_QA', topic: 'Interview Q&A Library' });
                    setIsSidebarOpen(false);
                  }} 
                  icon={<Brain className="w-4 h-4" />}
                  label="Q&A Library" 
                />
              </nav>

              <div className="p-4 border-t border-[#1F1F22]">
                <NavButton 
                  active={currentView === 'SETTINGS'} 
                  onClick={() => { setCurrentView('SETTINGS'); setIsSidebarOpen(false); }} 
                  icon={<SettingsIcon className="w-4 h-4" />}
                  label="Settings" 
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={`flex-1 relative flex flex-col min-w-0 overflow-hidden ${isMobile ? 'pt-14' : ''}`}>
        {currentView === 'LEARN' && <LearnCenter onContextChange={handleLearnContextChange} />}
        
        {currentView === 'LAB' && (
           <SystemDesignLab 
              key={`${labMode}-${labData?.id || 'empty'}`}
              mode={labMode}
              initialNodes={labMode === 'REVIEW' && labData ? labData.design?.nodes : []}
              initialEdges={labMode === 'REVIEW' && labData ? labData.design?.edges : []}
              title={labData?.title || 'System Design Lab'}
              description={labData?.description || 'Drag and drop components to build your architecture.'}
              explanations={labMode === 'REVIEW' ? labData?.explanations : undefined}
              challengeData={labMode === 'CHALLENGE' ? labData : undefined}
              architectureData={labData}
              onSelectArchitecture={openArchitecture}
              onContextChange={handleLabContextChange}
              onExit={labMode !== 'FREE' ? () => setCurrentView(labMode === 'REVIEW' ? 'GALLERY' : 'CHALLENGES') : undefined}
           />
        )}

        {currentView === 'GALLERY' && <ArchitectureGallery onSelectArchitecture={openArchitecture} onContextChange={handleGalleryContextChange} />}
        {currentView === 'CHALLENGES' && <ChallengeBank onSelectChallenge={openChallenge} onContextChange={handleChallengesContextChange} />}
        {currentView === 'INTERVIEW_QA' && <InterviewQAPrep onContextChange={setAiContext} />}
        
        {currentView === 'SETTINGS' && (
          <div className="p-8 max-w-4xl mx-auto w-full overflow-y-auto h-full custom-scrollbar">
            <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
            <Settings />
          </div>
        )}
      </main>

      {/* Contextual AI Mentor */}
      <ContextualAIMentor context={aiContext} />

      {/* Onboarding Tour */}
      <OnboardingTour onComplete={() => setIsTourActive(false)} />
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-indigo-500/10 text-indigo-400' 
          : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1A1D]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
