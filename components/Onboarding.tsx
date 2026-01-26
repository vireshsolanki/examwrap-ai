
import React, { useState } from 'react';
import { Sparkles, User, GraduationCap, AlertTriangle, Linkedin, Mail } from 'lucide-react';
import { ExamPersona } from '../types';

interface OnboardingProps {
  onComplete: (name: string, exam: string, persona: ExamPersona) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [exam, setExam] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && exam) {
      onComplete(name, exam, ExamPersona.UNIFIED);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 animate-fade-in relative">

      <div className="max-w-md w-full glass-card p-10 relative overflow-hidden shadow-2xl border-white/5">
        <div className="flex flex-col items-center mb-10 relative z-10">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 shadow-inner">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-center text-white mb-2 tracking-tight uppercase">
            ExamWarp
          </h1>
          <p className="text-center text-text-tertiary text-[10px] font-bold uppercase tracking-[0.2em] max-w-[200px] opacity-60">
            The Intelligence Layer for Students
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 ml-1">
                <User className="w-3 h-3 text-primary opacity-50" />
                <label className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">Student Name</label>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aryan"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-primary/50 focus:bg-primary/5 outline-none transition-all placeholder-white/10 font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 ml-1">
                <GraduationCap className="w-3 h-3 text-primary opacity-50" />
                <label className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">Primary Ambition</label>
              </div>
              <input
                type="text"
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                placeholder="e.g. JEE Advanced 2026"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-primary/50 focus:bg-primary/5 outline-none transition-all placeholder-white/10 font-bold"
                required
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-200/80 leading-relaxed font-medium">
                This is a mock model for testing purposes. Data is stored locally in your browser.
                <span className="block mt-1 text-amber-400 font-bold">Clearing browser cookies/storage will result in data loss.</span>
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name || !exam}
            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primaryHover hover:to-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-20 disabled:grayscale text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
          >
            Launch Intelligence
            <Sparkles className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
          <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest text-center opacity-60">Want this for yourself?</p>
          <div className="flex justify-center gap-6">
            <a
              href="https://linkedin.com/in/viresh-solanki"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors group"
            >
              <Linkedin className="w-4 h-4 group-hover:text-blue-400" />
              <span className="text-[10px] font-bold">LinkedIn</span>
            </a>
            <a
              href="mailto:viresh@example.com"
              className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors group"
            >
              <Mail className="w-4 h-4 group-hover:text-primary" />
              <span className="text-[10px] font-bold">Email</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Onboarding;
