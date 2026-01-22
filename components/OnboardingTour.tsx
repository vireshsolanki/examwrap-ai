
import React, { useState } from 'react';
import { ChevronRight, Sparkles, X, Layout, Upload, Settings, History } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
  userName: string;
}

const TOUR_STEPS = [
  {
    title: "Welcome to ExamWarp",
    description: "I'm your AI study assistant. Let me show you how to master any subject with adaptive simulations.",
    icon: Sparkles,
    color: "text-primary"
  },
  {
    title: "Upload Study Material",
    description: "Start by dropping a PDF, textbook, or notes. I'll analyze the content and map out the entire syllabus automatically.",
    icon: Upload,
    color: "text-secondary"
  },
  {
    title: "Configure Your Exam",
    description: "Tailor the assessment to your needs. Set time limits per question, choose difficulty, and focus on specific topics.",
    icon: Settings,
    color: "text-pink-400"
  },
  {
    title: "Track Your Evolution",
    description: "Every session earns you XP. Review your history to see concept gaps closing and watch your Synaptic Rank grow.",
    icon: History,
    color: "text-emerald-400"
  }
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, userName }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/90 backdrop-blur-xl animate-fade-in">
      <div className="relative glass-panel w-full max-w-lg rounded-[40px] p-12 border border-primary/20 shadow-[0_0_100px_rgba(6,182,212,0.1)] overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <button 
          onClick={onComplete}
          className="absolute top-8 right-8 text-text-tertiary hover:text-white transition-all active:scale-90"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-24 h-24 bg-surface rounded-[2rem] flex items-center justify-center mb-8 border border-white/5 shadow-2xl ${step.color}`}>
            <Icon className="w-12 h-12" />
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-4 font-mono">
              Intelligence Briefing {currentStep + 1}/{TOUR_STEPS.length}
            </h2>
            <h1 className="text-3xl font-black text-white mb-4 leading-tight">
              {currentStep === 0 ? `Welcome, ${userName}` : step.title}
            </h1>
            <p className="text-text-secondary leading-relaxed font-medium">
              {step.description}
            </p>
          </div>

          <div className="flex flex-col w-full gap-4">
            <button 
              onClick={handleNext}
              className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primaryHover hover:to-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {currentStep === TOUR_STEPS.length - 1 ? "Begin Evolution" : "Analyze Next Feature"}
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <div className="flex justify-center gap-2">
              {TOUR_STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-primary shadow-[0_0_10px_#06b6d4]' : 'w-2 bg-white/10'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
