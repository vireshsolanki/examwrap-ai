
import React from 'react';
import { ExamResult } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ArrowRight, AlertCircle, TrendingUp, Clock, Star, FileText, RotateCcw, AlertTriangle } from 'lucide-react';

interface ResultsDashboardProps {
  result: ExamResult;
  onViewPlan: () => void;
  onSummarize: () => void;
  onRetake: () => void;
  onReattemptIncorrect: () => void;
  isSummarizing: boolean;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onViewPlan, onSummarize, onRetake, onReattemptIncorrect, isSummarizing }) => {
  const scorePercentage = Math.round((result.score / result.totalQuestions) * 100);
  
  const accuracyData = [
    { name: 'Correct', value: result.score, color: '#10b981' }, 
    { name: 'Incorrect', value: result.totalQuestions - result.score, color: '#ef4444' } 
  ];

  return (
    <div className="max-w-6xl mx-auto mt-8 px-6 pb-20 fade-in">
      
      {/* Celebration Header */}
      <div className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-3">
             Assessment Complete
             {scorePercentage > 80 && <span className="text-xl">🎉</span>}
           </h1>
           <p className="text-text-secondary text-sm mt-1">Here is how you performed against your target.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center bg-surface border border-border rounded-md p-1 mr-2">
                 <button
                    onClick={onRetake}
                    className="flex items-center gap-2 px-3 py-1.5 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors hover:bg-background rounded"
                 >
                     <RotateCcw className="w-3.5 h-3.5" />
                     Full Retake
                 </button>
                 <div className="w-px h-4 bg-border mx-1"></div>
                 <button
                    onClick={onReattemptIncorrect}
                    className="flex items-center gap-2 px-3 py-1.5 text-text-secondary hover:text-red-400 text-sm font-medium transition-colors hover:bg-background rounded"
                 >
                     <AlertTriangle className="w-3.5 h-3.5" />
                     Retry Incorrect
                 </button>
             </div>

             <button
                onClick={onSummarize}
                disabled={isSummarizing}
                className="flex items-center gap-2 px-4 py-2 border border-border bg-surface hover:bg-background text-text-primary text-sm font-medium rounded-md transition-colors disabled:opacity-50"
            >
                {isSummarizing ? "Generating..." : "Summarize Material"}
                <FileText className="w-4 h-4" />
            </button>
            <button
                onClick={onViewPlan}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primaryHover text-white text-sm font-medium rounded-md transition-colors"
            >
                View Revision Strategy
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* XP Banner */}
      {result.xpEarned > 0 && (
          <div className="mb-8 bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-lg p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                  <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wide">Level Up Progress</h3>
                  <p className="text-text-secondary text-sm">You earned <strong className="text-text-primary">+{result.xpEarned} XP</strong> from this session!</p>
              </div>
          </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-lg border border-border bg-surface">
            <div className="text-xs text-text-tertiary uppercase font-medium mb-1">Overall Score</div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-primary">{scorePercentage}%</span>
                <span className="text-sm text-text-secondary">({result.score}/{result.totalQuestions})</span>
            </div>
        </div>
        <div className="p-5 rounded-lg border border-border bg-surface">
            <div className="text-xs text-text-tertiary uppercase font-medium mb-1">Strongest Domain</div>
            <div className="text-lg font-medium text-text-primary truncate" title={result.strongTopics[0]}>
                {result.strongTopics[0] || 'N/A'}
            </div>
        </div>
        <div className="p-5 rounded-lg border border-border bg-surface">
            <div className="text-xs text-text-tertiary uppercase font-medium mb-1">Critical Weakness</div>
            <div className="text-lg font-medium text-text-primary truncate text-red-400" title={result.weakTopics[0]}>
                {result.weakTopics[0] || 'None'}
            </div>
        </div>
        <div className="p-5 rounded-lg border border-border bg-surface">
            <div className="text-xs text-text-tertiary uppercase font-medium mb-1">Pacing Efficiency</div>
            <div className="text-lg font-medium text-text-primary">
                {result.timeManagementAnalysis?.includes("fast") ? "Fast" : "Balanced"}
            </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Analysis */}
        <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-lg border border-border bg-surface">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-medium text-text-primary">AI Evaluation</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                    {result.feedback}
                </p>
                
                <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-text-tertiary" />
                        <h4 className="text-xs font-medium text-text-primary uppercase">Time Management</h4>
                    </div>
                    <p className="text-xs text-text-secondary">{result.timeManagementAnalysis}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg border border-border bg-surface">
                    <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        Concept Gaps
                    </h3>
                    {result.conceptGaps?.length > 0 ? (
                        <ul className="space-y-2">
                            {result.conceptGaps.slice(0, 5).map((gap, i) => (
                                <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                                    <span className="mt-1 w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                    {gap}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-text-tertiary italic">No specific gaps identified.</p>
                    )}
                </div>

                <div className="p-6 rounded-lg border border-border bg-surface">
                    <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        Careless Errors
                    </h3>
                    {result.carelessMistakes?.length > 0 ? (
                        <ul className="space-y-2">
                            {result.carelessMistakes.slice(0, 5).map((mistake, i) => (
                                <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                                    <span className="mt-1 w-1 h-1 rounded-full bg-yellow-400 shrink-0" />
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
            <div className="p-6 rounded-lg border border-border bg-surface h-full flex flex-col justify-center items-center">
                 <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={accuracyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                            {accuracyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '6px', fontSize: '12px' }}
                                itemStyle={{ color: '#f4f4f5' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-6 flex gap-6 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-text-secondary">Correct</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-text-secondary">Incorrect</span>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ResultsDashboard;
