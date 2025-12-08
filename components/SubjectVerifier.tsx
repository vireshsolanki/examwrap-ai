
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
    <div className="max-w-2xl mx-auto mt-16 px-6 fade-in">
      <div className="bg-surface border border-border rounded-xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-text-primary mb-2">Verify Exam Context</h1>
            <p className="text-text-secondary text-sm">
                We analyzed your document. Please confirm the exam details below to tailor the question bank.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="bg-background/50 p-4 rounded-lg border border-border group focus-within:border-primary transition-colors">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2 flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        Subject / Course Name
                    </label>
                    <input 
                        type="text"
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-lg font-medium text-text-primary focus:ring-0 placeholder-text-tertiary"
                        placeholder="e.g. Advanced Calculus"
                    />
                </div>

                <div className="bg-background/50 p-4 rounded-lg border border-border group focus-within:border-primary transition-colors">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2 flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Exam Goal / Target
                    </label>
                    <input 
                        type="text"
                        value={examType}
                        onChange={(e) => setExamType(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-lg font-medium text-text-primary focus:ring-0 placeholder-text-tertiary"
                        placeholder="e.g. Final Semester Exam"
                    />
                </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-xs text-primary/80 leading-relaxed">
                    <strong>AI Insight:</strong> {initialAnalysis.summary}
                </p>
            </div>

            <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primaryHover hover:to-blue-700 text-white font-bold text-base rounded-lg transition-all active:scale-[0.98] duration-200 flex items-center justify-center gap-2 shadow-xl shadow-primary/25"
            >
                Confirm & Generate Syllabus
                <ArrowRight className="w-4 h-4" />
            </button>
        </form>
      </div>
    </div>
  );
};

export default SubjectVerifier;
