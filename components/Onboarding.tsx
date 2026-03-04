
import React, { useState } from 'react';
import { Sparkles, User, GraduationCap, AlertTriangle, Linkedin, Mail, Target, TrendingUp } from 'lucide-react';
import { ExamPersona, ExamType, StudyLevel } from '../types';

interface OnboardingProps {
  onComplete: (name: string, exam: string, persona: ExamPersona, examType: ExamType, studyLevel: StudyLevel, examDate?: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [classLevel, setClassLevel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && classLevel) {
      // Simple mapping for backward compatibility
      let persona = ExamPersona.UNIFIED;
      let examType = ExamType.OTHER;
      let studyLevel = StudyLevel.INTERMEDIATE;

      // Auto-detect from class level
      if (classLevel.includes('JEE') || classLevel.includes('NEET')) {
        persona = ExamPersona.JEE_NEET;
        if (classLevel.includes('JEE')) examType = ExamType.JEE_MAINS;
        if (classLevel.includes('NEET')) examType = ExamType.NEET;
      } else if (classLevel.includes('CAT')) {
        persona = ExamPersona.SAT_CAT;
        examType = ExamType.CAT;
      } else if (classLevel.includes('Class')) {
        examType = ExamType.SCHOOL_CBSE;
      } else if (classLevel.includes('University')) {
        examType = ExamType.UNIVERSITY;
      }

      onComplete(name, classLevel, persona, examType, studyLevel, undefined);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-3 sm:p-4 animate-fade-in relative">

      <div className="max-w-md w-full glass-card p-6 sm:p-10 relative overflow-hidden shadow-2xl border-white/5">
        <div className="flex flex-col items-center mb-10 relative z-10">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 shadow-inner">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-center text-white mb-2 tracking-tight uppercase">
            ExamWarp
          </h1>
          <p className="text-center text-text-tertiary text-[10px] font-bold uppercase tracking-[0.2em] max-w-[280px] opacity-60">
            Your Personal Question Paper Generator
          </p>
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-text-secondary leading-relaxed">
              📱 <strong className="text-white">Quick Revision:</strong> Practice MCQs online<br />
              📄 <strong className="text-white">Exam Practice:</strong> Download question papers<br />
              <span className="text-primary font-semibold">From your own textbook, in 30 seconds.</span>
            </p>
          </div>
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
                <label className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">Class/Exam</label>
              </div>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-primary/50 focus:bg-primary/5 outline-none transition-all font-bold cursor-pointer"
                required
              >
                <option value="">Select your class or exam</option>
                <optgroup label="School" className="bg-gray-900">
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10 CBSE">Class 10 CBSE</option>
                  <option value="Class 10 ICSE">Class 10 ICSE</option>
                  <option value="Class 11 Science">Class 11 Science</option>
                  <option value="Class 11 Commerce">Class 11 Commerce</option>
                  <option value="Class 12 Science">Class 12 Science</option>
                  <option value="Class 12 Commerce">Class 12 Commerce</option>
                </optgroup>
                <optgroup label="Competitive Exams" className="bg-gray-900">
                  <option value="JEE Preparation">JEE Preparation</option>
                  <option value="NEET Preparation">NEET Preparation</option>
                  <option value="CAT Preparation">CAT Preparation</option>
                  <option value="GATE Preparation">GATE Preparation</option>
                </optgroup>
                <optgroup label="Other" className="bg-gray-900">
                  <option value="University Student">University Student</option>
                  <option value="Other">Other</option>
                </optgroup>
              </select>
              <p className="text-[9px] text-text-tertiary opacity-60 ml-1">This helps us create better questions for you</p>
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
            disabled={!name || !classLevel}
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
              href="mailto:vireshsolanki58@gmail.com"
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
