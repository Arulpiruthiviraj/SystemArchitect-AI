import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Sparkles, Code, BookOpen, Layers } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  selector?: string; // For highlighting, though we'll keep it simple for now
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to SystemArchitect",
    description: "Your all-in-one platform for mastering large-scale system design. Let's take a quick tour of your new workspace.",
    icon: <Sparkles className="w-8 h-8 text-indigo-400" />
  },
  {
    title: "The Curriculum",
    description: "Start here to learn core concepts like Caching, Load Balancing, and Sharding through interactive lessons and AI-guided explanations.",
    icon: <BookOpen className="w-8 h-8 text-emerald-400" />
  },
  {
    title: "Reference Architectures",
    description: "Explore industry-standard designs like WhatsApp, Netflix, and TinyURL. Dive deep into their components and data flows.",
    icon: <Layers className="w-8 h-8 text-indigo-400" />
  },
  {
    title: "Design Lab",
    description: "This is your canvas. Drag and drop components, connect them, and use our AI to validate and simulate your designs in real-time.",
    icon: <Code className="w-8 h-8 text-fuchsia-400" />
  }
];

export default function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleTrigger = () => {
      localStorage.removeItem('system-architect-onboarding-seen');
      setCurrentStep(0);
      setIsVisible(true);
    };
    
    window.addEventListener('trigger-onboarding-tour', handleTrigger);
    
    const hasSeen = localStorage.getItem('system-architect-onboarding-seen');
    if (!hasSeen) {
      setIsVisible(true);
    } else {
      onComplete();
    }

    return () => window.removeEventListener('trigger-onboarding-tour', handleTrigger);
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('system-architect-onboarding-seen', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="bg-[#111113] border border-[#27272A] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
              {TOUR_STEPS[currentStep].icon}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
              {TOUR_STEPS[currentStep].title}
            </h2>
            
            <p className="text-gray-400 leading-relaxed mb-8">
              {TOUR_STEPS[currentStep].description}
            </p>

            <div className="flex items-center gap-2 mb-8">
              {TOUR_STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'w-8 bg-indigo-500' : 'w-1.5 bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3 w-full">
              {currentStep > 0 ? (
                <button 
                  onClick={handleBack}
                  className="flex-1 py-3 bg-[#1A1A1D] border border-[#27272A] text-gray-300 hover:text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <button 
                  onClick={handleComplete}
                  className="flex-1 py-3 bg-[#1A1A1D] border border-[#27272A] text-gray-500 hover:text-gray-300 rounded-xl font-bold text-sm transition-all"
                >
                  Skip
                </button>
              )}
              
              <button 
                onClick={handleNext}
                className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button 
            onClick={handleComplete}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
