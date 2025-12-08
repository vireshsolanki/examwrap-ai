
import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

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
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 fade-in">
      <div className="max-w-md w-full bg-surface border border-border rounded-xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-text-primary mb-2">Welcome to ExamWarp</h1>
        <p className="text-center text-text-secondary mb-8 text-sm">
          Your AI-powered study companion. Let's set up your profile to personalize your experience.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase text-text-tertiary mb-2">
              What should we call you?
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-text-tertiary mb-2">
              What is your primary goal?
            </label>
            <input 
              type="text" 
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              placeholder="e.g. Medical Entrance, Semester Finals"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={!name || !exam}
            className="w-full mt-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primaryHover hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 duration-200 shadow-lg shadow-primary/20"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
