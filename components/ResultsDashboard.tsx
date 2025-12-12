import React, { useState, useEffect } from 'react';
import { ExamResult } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ArrowRight, AlertCircle, TrendingUp, Clock, Star, FileText, RotateCcw, AlertTriangle, Calendar, Sliders } from 'lucide-react';

interface ResultsDashboardProps {
  result: ExamResult;
  onViewPlan: (days: number) => void;
  onSummarize: () => void;
  onRetake: () => void;
  onReattemptIncorrect: () => void;
  isSummarizing: boolean;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onViewPlan, onSummarize, onRetake, onReattemptIncorrect, isSummarizing }) => {
  const [selectedDays, setSelectedDays] = useState(result.recommendedDuration || 7);

  // Update local state if recommended duration changes
  useEffect(() => {
    if (result.recommendedDuration) {
        setSelectedDays(result.recommendedDuration);
    }
  }, [result.recommendedDuration]);

  const scorePercentage = Math.round((result.score / result.totalQuestions) * 100);
  
  const accuracyData = [
    { name: 'Correct', value: result.score, color: '#10b981' }, 
    { name: 'Incorrect', value: result.totalQuestions - result.score, color: '#ef4444' } 
  ];

  const handleViewPlan = () => {
    onViewPlan(selectedDays);
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 px-6 pb-20 fade-in">
      
      {/* Celebration Header */}
      <div className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-bold text-white flex items-center gap-3">
             Exam Results
             {scorePercentage > 80 && <span className="text-2xl animate-bounce">🎉</span>}
           </h1>
           <p className="text-text-secondary text-sm mt-1">Here is how you performed against your target.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center glass-panel rounded-xl p-1.5 mr-2 shadow-lg">
                 <button
                    onClick={onRetake}
                    className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-white text-sm font-medium transition-all active:scale-95 duration-200 hover:bg-white/10 rounded-lg"
                 >
                     <RotateCcw className="w-3.5 h-3.5" />
                     Full Retake
                 </button>
                 <div className="w-px h-5 bg-white/10 mx-1"></div>
                 <button
                    onClick={onReattemptIncorrect}
                    className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-red-400 text-sm font-medium transition-all active:scale-95 duration-200 hover:bg-white/10 rounded-lg"
                 >
                     <AlertTriangle className="w-3.5 h-3.5" />
                     Retry Incorrect
                 </button>
             </div>

             <button
                onClick={onSummarize}
                disabled={isSummarizing}
                className="flex items-center gap-2 px-5 py-3 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white text-sm font-medium rounded-xl transition-all active:scale-95 duration-200 disabled:opacity-50 shadow-sm backdrop-blur-sm"
            >
                {isSummarizing ? "Generating..." : "Summary"}
                <FileText className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* XP Banner */}
      {result.xpEarned > 0 && (
          <div className="mb-8 bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-xl p-4 flex items-center gap-4 animate-in slide-in-from-top-2">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                  <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                  <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wide">Level Up!</h3>
                  <p className="text-text-secondary text-sm">You earned <strong className="text-white">+{result.xpEarned} XP</strong> from this session!</p>
              </div>
          </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-6 rounded-2xl">
            <div className="text-xs text-text-tertiary uppercase font-bold tracking-wider mb-2">Final Score</div>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{scorePercentage}%</span>
                <span className="text-sm text-text-secondary">({result.score}/{result.totalQuestions})</span>
            </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
            <div className="text-xs text-text-tertiary uppercase font-bold tracking-wider mb-2">Best Topic</div>
            <div className="text-lg font-bold text-emerald-400 truncate" title={result.strongTopics[0]}>
                {result.strongTopics[0] || 'N/A'}
            </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
            <div className="text-xs text-text-tertiary uppercase font-bold tracking-wider mb-2">Needs Improvement</div>
            <div className="text-lg font-bold text-red-400 truncate" title={result.weakTopics[0]}>
                {result.weakTopics[0] || 'None'}
            </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
            <div className="text-xs text-text-tertiary uppercase font-bold tracking-wider mb-2">Time Efficiency</div>
            <div className="text-lg font-bold text-violet-400">
                {result.timeManagementAnalysis?.toLowerCase().includes("fast") ? "Fast ⚡" : "Balanced ⚖️"}
            </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Analysis */}
        <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-violet-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">AI Feedback</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line border-l-2 border-violet-500/30 pl-4">
                    {result.feedback}
                </p>
                
                <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-text-tertiary" />
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wide">Time Management</h4>
                    </div>
                    <p className="text-xs text-text-tertiary">{result.timeManagementAnalysis}</p>
                </div>
            </div>

            {/* Revision Plan Configurator */}
            <div className="bg-gradient-to-r from-violet-900/20 to-indigo-900/20 border border-violet-500/20 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row gap-6 relative z-10">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                             <Calendar className="w-5 h-5 text-violet-400" />
                             Plan Your Revision
                        </h3>
                        <p className="text-sm text-slate-400 mb-6">
                            Based on your gaps, AI recommends <span className="font-bold text-violet-300">{result.recommendedDuration || 7} days</span> of study. 
                            Adjust the slider to fit your timeline.
                        </p>
                        
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold uppercase text-text-tertiary flex items-center gap-2">
                                    <Sliders className="w-3.5 h-3.5" />
                                    Revision Duration
                                </label>
                                <span className="text-sm font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30 px-3 py-1 rounded-md font-bold">
                                    {selectedDays} Days
                                </span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="14" 
                                value={selectedDays} 
                                onChange={(e) => setSelectedDays(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                            />
                            <div className="flex justify-between mt-2 text-[10px] text-text-tertiary font-mono">
                                <span>1 Day (Cram)</span>
                                <span>7 Days (Balanced)</span>
                                <span>14 Days (Deep)</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end">
                         <button
                            onClick={handleViewPlan}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-base font-bold rounded-xl shadow-lg shadow-violet-600/25 transition-all active:scale-95 duration-200"
                        >
                            Generate {selectedDays}-Day Plan
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-red-500/50">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        Concept Gaps
                    </h3>
                    {result.conceptGaps?.length > 0 ? (
                        <ul className="space-y-3">
                            {result.conceptGaps.slice(0, 5).map((gap, i) => (
                                <li key={i} className="text-xs text-slate-400 flex items-start gap-2 bg-white/5 p-2 rounded-lg">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                    {gap}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-text-tertiary italic">No specific gaps identified.</p>
                    )}
                </div>

                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-yellow-500/50">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        Careless Errors
                    </h3>
                    {result.carelessMistakes?.length > 0 ? (
                        <ul className="space-y-3">
                            {result.carelessMistakes.slice(0, 5).map((mistake, i) => (
                                <li key={i} className="text-xs text-slate-400 flex items-start gap-2 bg-white/5 p-2 rounded-lg">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                                    {mistake}
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-xs text-text-tertiary italic">No careless errors identified.</p>
                    )}
                </div>
            </div>
        </div>

        {/* Right Col: Charts */}
        <div className="lg:col-span-1">
            <div className="glass-panel p-6 rounded-2xl h-full flex flex-col justify-center items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                 <div className="w-56 h-56 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={accuracyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                            >
                            {accuracyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', backdropFilter: 'blur(8px)' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-white">{scorePercentage}%</span>
                        <span className="text-xs text-text-tertiary uppercase tracking-widest">Accuracy</span>
                    </div>
                 </div>
                 
                 <div className="mt-8 flex gap-8 text-xs relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-text-secondary font-medium">Correct</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                        <span className="text-text-secondary font-medium">Incorrect</span>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ResultsDashboard;