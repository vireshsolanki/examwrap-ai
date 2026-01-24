
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
    description: 'I am your personal AI study partner. I\'ll help you organize your prep and ace your exams.',
    icon: Sparkles,
    position: 'center'
  },
  {
    targetId: 'tour-new-exam',
    title: 'Start Practice',
    description: 'Use this to create a new mock test. Upload your syllabus or notes, and I\'ll generate questions for you.',
    icon: Target,
    position: 'bottom'
  },
  {
    targetId: 'tour-tabs',
    title: 'Your Dashboard',
    description: 'Switch between your Schedules, History, and Overview here to track everything.',
    icon: Zap,
    position: 'bottom'
  },
  {
    targetId: 'tour-notes',
    title: 'Smart Notes',
    description: 'Turn your messy rough notes into clean, organized study guides instantly.',
    icon: Wand2,
    position: 'bottom'
  },
  {
    targetId: 'tour-stats',
    title: 'Track Progress',
    description: 'See your learning level and XP grow as you complete more tests.',
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
    const tooltipHeight = 220; // Approx reduced height
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
        className="absolute inset-0 bg-black/80 transition-all duration-300 pointer-events-auto"
        style={{ clipPath, backdropFilter: 'blur(4px)' }}
      />

      {/* Spotlight Border */}
      {activeStep.position !== 'center' && (
        <div
          className="absolute border-2 border-primary/80 rounded-2xl transition-all duration-75 shadow-[0_0_50px_rgba(129,140,248,0.5)] pointer-events-none"
          style={{
            top: coords.top - 6,
            left: coords.left - 6,
            width: coords.width + 12,
            height: coords.height + 12,
            opacity: visible ? 1 : 0,
          }}
        >
          {/* Animated corner accents */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white animate-pulse"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white animate-pulse"></div>
        </div>
      )}

      {/* Tooltip Content */}
      <div
        className={`absolute w-[320px] glass-card rounded-2xl p-6 border border-white/20 shadow-2xl transition-all duration-500 pointer-events-auto ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        style={getTooltipStyle()}
      >
        <div className="relative z-10">
          <button
            onClick={onComplete}
            className="absolute -top-2 -right-2 p-2 text-text-tertiary hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40 shadow-lg shadow-primary/20">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">
                Step {currentStep + 1} of 5
              </div>
              <div className="text-[10px] text-text-tertiary font-bold uppercase tracking-wide">Quick Guide</div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 tracking-tight leading-tight">
            {activeStep.targetId === 'welcome' ? `Hello, ${userName}` : activeStep.title}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed mb-6 font-medium">
            {activeStep.description}
          </p>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-1 text-[10px] font-bold text-text-tertiary hover:text-white disabled:opacity-0 transition-all uppercase tracking-widest"
            >
              <ChevronLeft className="w-3 h-3" /> Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/30 active:scale-95 uppercase tracking-widest"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Start Studying' : 'Next'}
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralTour;
