import React, { useState } from 'react';
import { Sparkles, ArrowRight, User, GraduationCap } from 'lucide-react';

interface OnboardingProps {
  onComplete: (name: string, exam: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [exam, setExam] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && exam) {
      onComplete(name, exam);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-fade-in relative">

      {/* Significantly cleaner, smaller card */}
      <div className="max-w-sm w-full glass-card p-8 relative overflow-hidden shadow-2xl">

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 border border-primary/20">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">
            ExamWarp
          </h1>
          <p className="text-center text-text-tertiary text-xs font-medium max-w-[200px]">
            Personal AI Study Partner
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 ml-1">
              <User className="w-3 h-3 text-primary" />
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Name</label>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aryan"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-primary/50 outline-none transition-all placeholder-white/20 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 ml-1">
              <GraduationCap className="w-3 h-3 text-primary" />
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Target Exam</label>
            </div>
            <input
              type="text"
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              placeholder="e.g. JEE Mains"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-primary/50 outline-none transition-all placeholder-white/20 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={!name || !exam}
            className="w-full mt-2 btn-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest shadow-lg"
          >
            Start Journey
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
