
import React, { useState } from 'react';
import { SubjectAnalysis, SubjectContext } from '../types';
import { Check, Edit2, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

interface SubjectVerifierProps {
  initialAnalysis: SubjectAnalysis;
  onConfirm: (context: SubjectContext) => void;
}

const SubjectVerifier: React.FC<SubjectVerifierProps> = ({ initialAnalysis, onConfirm }) => {
  const [subjectName, setSubjectName] = useState(initialAnalysis.subjectName);
  const [examType, setExamType] = useState(initialAnalysis.examType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subjectName && examType) {
      onConfirm({ subjectName, examType });
    } else {
      alert("Please ensure both fields are filled out.");
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 fade-in">
      <div className="max-w-lg w-full bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="mb-8 text-center relative z-10">
          <h1 className="text-xl font-bold text-white mb-2">Verify Exam Details</h1>
          <p className="text-text-secondary text-xs">
            Confirm your document context to tailor the question bank.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-4">
            <div className="bg-black/20 p-4 rounded-xl border border-white/5 group focus-within:border-primary/50 transition-colors">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1.5 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                Subject / Course
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full bg-transparent border-none p-0 text-sm font-bold text-white focus:ring-0 placeholder-white/20"
                placeholder="e.g. Advanced Calculus"
              />
            </div>

            <div className="bg-black/20 p-4 rounded-xl border border-white/5 group focus-within:border-primary/50 transition-colors">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1.5 flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5" />
                Target Exam
              </label>
              <input
                type="text"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full bg-transparent border-none p-0 text-sm font-bold text-white focus:ring-0 placeholder-white/20"
                placeholder="e.g. Final Semester"
              />
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <p className="text-[10px] text-primary/80 leading-relaxed font-medium">
              <strong className="text-primary block mb-1 uppercase tracking-wider">AI Insight</strong>
              {initialAnalysis.summary}
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primaryHover hover:to-blue-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
          >
            Confirm & Generate
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubjectVerifier;
