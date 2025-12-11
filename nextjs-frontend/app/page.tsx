"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { uploadPDF, generateExam, analyzeResults } from '@/lib/api';

// Dynamic imports for Client Components
const FileUpload = dynamic(() => import('@/components/FileUpload'), { ssr: false });
const ExamInterface = dynamic(() => import('@/components/ExamInterface'), { ssr: false });
const ResultsDashboard = dynamic(() => import('@/components/ResultsDashboard'), { ssr: false });

export default function Home() {
  const [view, setView] = useState('UPLOAD');
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState(null);

  const handleUpload = async (file: File) => {
    try {
      const text = await uploadPDF(file);
      setContent(text);
      setView('CONFIG'); // Navigate to Config (simplified)
    } catch (e) {
      alert("Backend Upload Error. Is Rust server running?");
    }
  };

  const handleStartExam = async (config: any) => {
    // In a real app, you'd get context from a previous step
    const context = { subjectName: "General", examType: "Practice" };
    const qs = await generateExam(content, config, context);
    setQuestions(qs);
    setView('EXAM');
  };

  const handleComplete = async (answers: any[]) => {
    const res = await analyzeResults(questions, answers);
    setResults(res);
    setView('RESULTS');
  };

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100">
       <header className="p-6 border-b border-white/10 flex justify-between">
          <h1 className="text-xl font-bold text-cyan-400 font-mono">EXAMWARP // NEXT+RUST</h1>
       </header>

       <div className="container mx-auto p-4">
          {view === 'UPLOAD' && (
            // Note: FileUpload component needs to be updated to pass File object, not string
            <div className="p-10 border border-white/10 rounded-xl bg-slate-900/50">
                <h2 className="text-2xl font-bold mb-4">Upload PDF</h2>
                <input 
                    type="file" 
                    onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
                    className="text-slate-400"
                />
            </div>
          )}

          {view === 'EXAM' && (
             <ExamInterface 
                questions={questions} 
                onComplete={handleComplete} 
                isAnalyzing={false}
                timeLimitMinutes={30}
             />
          )}

          {view === 'RESULTS' && results && (
             <ResultsDashboard 
                result={results}
                onViewPlan={() => {}} 
                onSummarize={() => {}}
                onRetake={() => setView('UPLOAD')}
                onReattemptIncorrect={() => {}}
                isSummarizing={false}
             />
          )}
       </div>
    </main>
  );
}
