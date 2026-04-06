
import React, { useState } from 'react';
import { Sparkles, User, GraduationCap, AlertTriangle, Linkedin, Mail, Target, ChevronRight } from 'lucide-react';
import { ExamPersona, ExamType, StudyLevel } from '../types';
import { EXAM_CATEGORIES, EXAM_GROUPS, getExamCategory } from '../config/examPresets';

interface OnboardingProps {
  onComplete: (name: string, exam: string, persona: ExamPersona, examType: ExamType, studyLevel: StudyLevel, examDate?: string, examCategoryId?: string, personaId?: string, toneId?: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const selectedCategory = selectedCategoryId ? getExamCategory(selectedCategoryId) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedCategoryId || !selectedCategory) return;

    // Map category to legacy persona/examType system
    let persona = ExamPersona.UNIFIED;
    let examType = ExamType.OTHER;
    let studyLevel = StudyLevel.INTERMEDIATE;

    // Persona mapping
    if (['iit_jee', 'nit', 'gate'].includes(selectedCategoryId)) {
      persona = ExamPersona.JEE_NEET;
    } else if (['neet'].includes(selectedCategoryId)) {
      persona = ExamPersona.JEE_NEET;
    } else if (['ca', 'cfa'].includes(selectedCategoryId)) {
      persona = ExamPersona.CA_CFA;
    } else if (['cat'].includes(selectedCategoryId)) {
      persona = ExamPersona.SAT_CAT;
    } else if (['upsc'].includes(selectedCategoryId)) {
      persona = ExamPersona.UPSC;
    }

    // ExamType mapping
    if (selectedCategoryId === 'iit_jee') examType = ExamType.JEE_MAINS;
    else if (selectedCategoryId === 'neet') examType = ExamType.NEET;
    else if (selectedCategoryId === 'cat') examType = ExamType.CAT;
    else if (selectedCategoryId === 'gate') examType = ExamType.GATE;
    else if (selectedCategoryId === 'upsc') examType = ExamType.UPSC;
    else if (selectedCategoryId === 'nit') examType = ExamType.JEE_MAINS;
    else if (selectedCategoryId.startsWith('class_10')) examType = ExamType.SCHOOL_CBSE;
    else if (selectedCategoryId.startsWith('class_11') || selectedCategoryId.startsWith('class_12')) examType = ExamType.SCHOOL_CBSE;
    else if (selectedCategoryId.startsWith('uni_')) examType = ExamType.UNIVERSITY;
    else if (selectedCategoryId === 'ca' || selectedCategoryId === 'cfa') examType = ExamType.OTHER;

    // StudyLevel based on group
    if (selectedCategory.group === 'School') studyLevel = StudyLevel.INTERMEDIATE;
    else if (selectedCategory.group === 'University') studyLevel = StudyLevel.INTERMEDIATE;
    else if (selectedCategory.group === 'Competitive') studyLevel = StudyLevel.ADVANCED;
    else if (selectedCategory.group === 'Professional') studyLevel = StudyLevel.ADVANCED;

    onComplete(
      name,
      selectedCategory.label,
      persona,
      examType,
      studyLevel,
      undefined,
      selectedCategoryId,
      selectedCategory.defaultPersona,
      selectedCategory.defaultTone
    );
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
              📋 <strong className="text-white">PDF Summariser:</strong> Instant study notes from PDFs<br />
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
                <label className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">What are you preparing for?</label>
              </div>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-primary/50 focus:bg-primary/5 outline-none transition-all font-bold cursor-pointer"
                required
              >
                <option value="">Select your exam / course</option>
                {EXAM_GROUPS.map((group) => (
                  <optgroup key={group} label={`── ${group} ──`} className="bg-gray-900">
                    {EXAM_CATEGORIES.filter(c => c.group === group).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {selectedCategory && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 animate-fade-in">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{selectedCategory.icon}</span>
                    <span className="text-xs font-bold text-white">{selectedCategory.label}</span>
                  </div>
                  <p className="text-[10px] text-text-secondary">{selectedCategory.description}</p>
                  {selectedCategory.subStreams && selectedCategory.subStreams.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedCategory.subStreams.map(ss => (
                        <span key={ss.id} className="text-[8px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-text-tertiary font-bold">
                          {ss.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <p className="text-[9px] text-text-tertiary opacity-60 ml-1">This customizes question style, difficulty, and AI teaching persona</p>
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
            disabled={!name || !selectedCategoryId}
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
