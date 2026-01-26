
import React, { useState, useEffect } from 'react';
import { ExamResult } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ArrowRight, AlertCircle, TrendingUp, Clock, Star, FileText, RotateCcw, AlertTriangle, Calendar, Sliders, Printer, Quote } from 'lucide-react';

interface ResultsDashboardProps {
    result: ExamResult;
    onViewPlan: (days: number) => void;
    onSummarize: () => void;
    onRetake: () => void;
    onReattemptIncorrect: () => void;
    onExportExam: () => void;
    isSummarizing: boolean;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
    result,
    onViewPlan,
    onSummarize,
    onRetake,
    onReattemptIncorrect,
    onExportExam,
    isSummarizing
}) => {
    const [selectedDays, setSelectedDays] = useState(result.recommendedDuration || 7);

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
        <div className="max-w-5xl mx-auto mt-6 px-4 pb-12 fade-in">
            <div className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        Assessment Analysis
                        {scorePercentage > 80 && <span className="text-xl animate-bounce">🎉</span>}
                    </h1>
                    <p className="text-text-secondary text-xs mt-0.5">Intelligence report on your recent simulation.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center glass-panel rounded-lg p-1 shadow-lg">
                        <button
                            onClick={onRetake}
                            className="flex items-center gap-2 px-3 py-1.5 text-text-secondary hover:text-white text-xs font-medium transition-all active:scale-95 duration-200 hover:bg-white/10 rounded-md"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Full Retake
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button
                            onClick={onReattemptIncorrect}
                            className="flex items-center gap-2 px-3 py-1.5 text-text-secondary hover:text-red-400 text-xs font-medium transition-all active:scale-95 duration-200 hover:bg-white/10 rounded-md"
                        >
                            <AlertTriangle className="w-3 h-3" />
                            Retry Gaps
                        </button>
                    </div>

                    <button
                        onClick={onExportExam}
                        className="flex items-center gap-2 px-4 py-2 border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-all active:scale-95"
                    >
                        Export
                        <Printer className="w-3.5 h-3.5" />
                    </button>

                    <button
                        onClick={onSummarize}
                        disabled={isSummarizing}
                        className="flex items-center gap-2 px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white text-xs font-medium rounded-lg transition-all active:scale-95 duration-200 disabled:opacity-50 shadow-sm backdrop-blur-sm"
                    >
                        {isSummarizing ? "Synthesizing..." : "View Brief"}
                        <FileText className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {result.xpEarned > 0 && (
                <div className="mb-6 bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-xl p-3 flex items-center gap-3 animate-in slide-in-from-top-2">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                        <Star className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-wide">Neural Reward</h3>
                        <p className="text-text-secondary text-xs">Synchronized <strong className="text-white">+{result.xpEarned} XP</strong> to your profile.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                <div className="glass-panel p-4 rounded-xl">
                    <div className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest mb-1 font-mono">Accuracy</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{scorePercentage}%</span>
                        <span className="text-xs text-text-secondary font-mono">({result.score}/{result.totalQuestions})</span>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <div className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest mb-1 font-mono">Dominant Hub</div>
                    <div className="text-base font-bold text-emerald-400 truncate" title={result.strongTopics[0]}>
                        {result.strongTopics[0] || 'N/A'}
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <div className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest mb-1 font-mono">Critical Weakness</div>
                    <div className="text-base font-bold text-red-400 truncate" title={result.weakTopics[0]}>
                        {result.weakTopics[0] || 'None'}
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <div className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest mb-1 font-mono">Performance Flow</div>
                    <div className="text-base font-bold text-violet-400">
                        {result.timeManagementAnalysis?.toLowerCase().includes("fast") ? "Fluid ⚡" : "Measured ⚖️"}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl"></div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-violet-500/20 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-violet-400" />
                            </div>
                            <h3 className="text-base font-bold text-white">AI Mentor Feedback</h3>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line border-l-2 border-violet-500/30 pl-3">
                            {result.feedback}
                        </p>

                        <div className="mt-6 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-3.5 h-3.5 text-text-tertiary" />
                                <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono">Temporal Analysis</h4>
                            </div>
                            <p className="text-[10px] text-text-tertiary">{result.timeManagementAnalysis}</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-violet-900/20 to-indigo-900/20 border border-violet-500/20 p-6 rounded-xl backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                        <div className="flex flex-col md:flex-row gap-6 relative z-10">
                            <div className="flex-1">
                                <h3 className="text-lg font-black text-white mb-1 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-violet-400" />
                                    Review Path
                                </h3>
                                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                                    Recommended duration: <span className="font-bold text-violet-300">{result.recommendedDuration || 7} days</span>.
                                </p>

                                <div className="bg-black/30 p-4 rounded-xl border border-white/5 shadow-inner">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-[9px] font-black uppercase text-text-tertiary flex items-center gap-2 tracking-[0.2em] font-mono">
                                            <Sliders className="w-3 h-3" />
                                            Timeline
                                        </label>
                                        <span className="text-xs font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30 px-3 py-0.5 rounded-full font-bold">
                                            {selectedDays} Days
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="14"
                                        value={selectedDays}
                                        onChange={(e) => setSelectedDays(Number(e.target.value))}
                                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500 mb-2"
                                    />
                                    <div className="flex justify-between text-[8px] text-text-tertiary font-mono uppercase tracking-widest">
                                        <span>Fast</span>
                                        <span>Balanced</span>
                                        <span>Deep</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={handleViewPlan}
                                    className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-xl shadow-violet-600/25 transition-all active:scale-95"
                                >
                                    Generate
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass-panel p-4 rounded-xl border-l-4 border-l-red-500/50">
                            <h3 className="text-[10px] font-black text-white mb-3 flex items-center gap-2 uppercase tracking-widest font-mono">
                                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                                Neural Gaps
                            </h3>
                            {result.conceptGaps?.length > 0 ? (
                                <ul className="space-y-3">
                                    {result.conceptGaps.slice(0, 3).map((gap, i) => (
                                        <li key={i} className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/5 group/gap transition-all hover:bg-white/10">
                                            <div className="flex items-start gap-2">
                                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 shadow-[0_0_8px_#ef4444]" />
                                                <span className="text-[10px] text-slate-300 font-bold">{gap}</span>
                                            </div>
                                            {result.referenceSnippets && result.referenceSnippets[i] && (
                                                <div className="mt-1 p-2 bg-red-500/5 rounded-lg border border-red-500/10 text-[9px] text-slate-400 italic leading-relaxed flex gap-2">
                                                    <Quote className="w-3 h-3 text-red-400/50 shrink-0" />
                                                    <span>"{result.referenceSnippets[i]}"</span>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-[10px] text-text-tertiary italic">System identifies no specific gaps.</p>
                            )}
                        </div>

                        <div className="glass-panel p-4 rounded-xl border-l-4 border-l-yellow-500/50">
                            <h3 className="text-[10px] font-black text-white mb-3 flex items-center gap-2 uppercase tracking-widest font-mono">
                                <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                                Operational Errors
                            </h3>
                            {result.carelessMistakes?.length > 0 ? (
                                <ul className="space-y-2">
                                    {result.carelessMistakes.slice(0, 3).map((mistake, i) => (
                                        <li key={i} className="text-[10px] text-slate-400 flex items-start gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                                            <span className="mt-1 w-1 h-1 rounded-full bg-yellow-400 shrink-0 shadow-[0_0_8px_#eab308]" />
                                            {mistake}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-[10px] text-text-tertiary italic">No operational errors.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="glass-panel p-6 rounded-xl h-full flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-b from-surface to-background min-h-[300px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[80px]"></div>
                        <div className="w-48 h-48 relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={accuracyData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={6}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {accuracyData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', backdropFilter: 'blur(12px)', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#f8fafc' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-white tracking-tighter">{scorePercentage}%</span>
                                <span className="text-[8px] text-text-tertiary uppercase tracking-[0.3em] font-mono mt-1">Accuracy</span>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3 w-full px-2 relative z-10">
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-[10px] text-text-secondary font-bold font-mono">CORRECT</span>
                                </div>
                                <span className="text-[10px] font-bold text-white font-mono">{result.score}</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                    <span className="text-[10px] text-text-secondary font-bold font-mono">INCORRECT</span>
                                </div>
                                <span className="text-[10px] font-bold text-white font-mono">{result.totalQuestions - result.score}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsDashboard;
