
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, ChevronLeft, X, Sparkles, Target, Zap, Cpu, Wand2 } from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  icon: any;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface NeuralTourProps {
  onComplete: () => void;
  userName: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'welcome',
    title: 'Welcome to ExamWarp',
    description: 'I am your AI study architect. Let me show you how to navigate this intelligence hub.',
    icon: Sparkles,
    position: 'center'
  },
  {
    targetId: 'tour-new-exam',
    title: 'Generate Assessment',
    description: 'Upload your PDFs or notes here. My neural engine will map the syllabus and build custom exams for you.',
    icon: Target,
    position: 'bottom'
  },
  {
    targetId: 'tour-tabs',
    title: 'Navigation Nodes',
    description: 'Switch between your active Revision Paths and full Exam History here.',
    icon: Zap,
    position: 'bottom'
  },
  {
    targetId: 'tour-notes',
    title: 'Notes Architect',
    description: 'Use this tool to clean up messy lecture notes into structured study assets.',
    icon: Wand2,
    position: 'bottom'
  },
  {
    targetId: 'tour-stats',
    title: 'Evolution Tracking',
    description: 'Monitor your Synaptic Rank and XP progress as you complete assessment challenges.',
    icon: Cpu,
    position: 'top'
  }
];

const NeuralTour: React.FC<NeuralTourProps> = ({ onComplete, userName }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [visible, setVisible] = useState(false);
  const requestRef = useRef<number>();
  
  const activeStep = TOUR_STEPS[currentStep];
  const Icon = activeStep.icon;

  const updateCoords = useCallback(() => {
    if (activeStep.position === 'center') {
      setCoords({ top: 0, left: 0, width: 0, height: 0 });
      return;
    }

    const el = document.getElementById(activeStep.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    }
  }, [activeStep.targetId, activeStep.position]);

  // Handle high-performance tracking
  useEffect(() => {
    const animate = () => {
      updateCoords();
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateCoords]);

  // Initial Step Transition Logic
  useEffect(() => {
    setVisible(false);
    
    // Only scroll into view once per step change
    const el = document.getElementById(activeStep.targetId);
    if (el && activeStep.position !== 'center') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, 400); // Wait for scroll to stabilize
    
    return () => clearTimeout(timer);
  }, [currentStep, activeStep.targetId, activeStep.position]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setVisible(false);
      setTimeout(() => setCurrentStep(prev => prev + 1), 200);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setVisible(false);
      setTimeout(() => setCurrentStep(prev => prev - 1), 200);
    }
  };

  const getTooltipStyle = () => {
    if (activeStep.position === 'center') {
      return { 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        position: 'fixed' as const
      };
    }

    const padding = 20;
    const tooltipHeight = 250; // Approx
    const viewportHeight = window.innerHeight;
    
    // Auto-flip logic if bottom would overflow
    let finalPos = activeStep.position;
    if (finalPos === 'bottom' && coords.top + coords.height + tooltipHeight > viewportHeight) {
      finalPos = 'top';
    }

    if (finalPos === 'bottom') {
      return {
        top: `${coords.top + coords.height + padding}px`,
        left: `${coords.left + coords.width / 2}px`,
        transform: 'translateX(-50%)',
        position: 'fixed' as const
      };
    }
    
    return {
      top: `${coords.top - padding}px`,
      left: `${coords.left + coords.width / 2}px`,
      transform: 'translate(-50%, -100%)',
      position: 'fixed' as const
    };
  };

  // Hole creation logic using polygon
  const clipPath = activeStep.position === 'center' 
    ? 'none' 
    : `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Dark Overlay with Hole */}
      <div 
        className="absolute inset-0 bg-black/90 transition-all duration-300 pointer-events-auto"
        style={{ clipPath, backdropFilter: 'blur(2px)' }}
      />

      {/* Spotlight Border */}
      {activeStep.position !== 'center' && (
        <div 
          className="absolute border-2 border-primary/80 rounded-2xl transition-all duration-75 shadow-[0_0_50px_rgba(6,182,212,0.3)] pointer-events-none"
          style={{
            top: coords.top - 6,
            left: coords.left - 6,
            width: coords.width + 12,
            height: coords.height + 12,
            opacity: visible ? 1 : 0,
          }}
        >
          {/* Animated corner accents */}
          <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-white animate-pulse"></div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-white animate-pulse"></div>
        </div>
      )}

      {/* Tooltip Content */}
      <div 
        className={`absolute w-[360px] glass-panel rounded-[2rem] p-10 border border-primary/20 shadow-2xl transition-all duration-500 pointer-events-auto ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
        style={getTooltipStyle()}
      >
        <div className="relative z-10">
          <button 
            onClick={onComplete}
            className="absolute -top-4 -right-4 p-2 text-text-tertiary hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mb-6">
             <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <Icon className="w-6 h-6 text-primary" />
             </div>
             <div>
                <div className="text-[10px] font-mono text-primary font-black uppercase tracking-widest mb-0.5">
                   Node {currentStep + 1}
                </div>
                <div className="text-[10px] text-text-tertiary font-bold font-mono">NEURAL ONBOARDING</div>
             </div>
          </div>

          <h3 className="text-2xl font-black text-white mb-3 tracking-tight leading-tight">
            {activeStep.targetId === 'welcome' ? `Greetings, ${userName}` : activeStep.title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-10 font-medium border-l-2 border-primary/20 pl-4">
            {activeStep.description}
          </p>

          <div className="flex items-center justify-between gap-4">
            <button 
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center gap-2 text-xs font-black text-text-tertiary hover:text-white disabled:opacity-0 transition-all uppercase tracking-widest font-mono"
            >
                <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button 
                onClick={handleNext}
                className="px-8 py-3 bg-primary text-white text-xs font-black rounded-xl hover:bg-primaryHover transition-all flex items-center gap-3 shadow-xl shadow-primary/30 active:scale-95 uppercase tracking-widest font-mono"
            >
                {currentStep === TOUR_STEPS.length - 1 ? 'Unlock Hub' : 'Next Insight'}
                <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralTour;
