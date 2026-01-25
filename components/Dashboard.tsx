import React, { useState, useMemo } from 'react';
import { UserProfile, SubjectContext } from '../types';
import { Play, Trophy, History, Activity, Eye, RotateCcw, X, BarChart, Calendar, Cpu, Wand2, Trash2, ArrowRight, PlusCircle, BrainCircuit } from 'lucide-react';
import { getFullExamRecord } from '../services/storageService';

interface DashboardProps {
    user: UserProfile;
    onNewSession: () => void;
    activeContext?: SubjectContext | null;
    onResumeSession?: () => void;
    onReviewExam?: (id: string) => void;
    onRetakeExam?: (id: string) => void;
    onViewResult?: (id: string) => void;
    onViewPlan?: (id: string) => void;
    onOpenNotesFormatter: () => void;
    onDeleteExam: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    user,
    onNewSession,
    activeContext,
    onResumeSession,
    onReviewExam,
    onRetakeExam,
    onViewResult,
    onViewPlan,
    onOpenNotesFormatter,
    onDeleteExam
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'history'>('overview');
    const [showXpModal, setShowXpModal] = useState(false);

    const currentLevelXp = (user.level - 1) * 1000;
    const progress = Math.min(((user.xp - currentLevelXp) / 1000) * 100, 100);

    const examsWithPlans = useMemo(() => {
        if (activeTab !== 'plans') return [];
        return user.history.filter(item => {
            const record = getFullExamRecord(item.id);
            return record && record.plan;
        });
    }, [user.history, activeTab]);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Delete this record permanently?")) {
            onDeleteExam(id);
        }
    }

    return (
        <div className="max-w-5xl mx-auto mt-6 px-4 pb-12 animate-fade-in">

            {/* Compact Header */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 pb-4 border-b border-white/5">
                <div className="text-center md:text-left">
                    <h1 className="text-2xl font-extrabold text-white tracking-tight mb-0.5">
                        <span className="text-primary">{user.name}</span>
                    </h1>
                    <p className="text-text-secondary text-xs font-medium">
                        Target: <span className="text-text-primary">{user.targetExam}</span>
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/5 px-3 py-1.5 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft"></div>
                    <span className="text-[10px] font-bold text-emerald-400 tracking-wide uppercase">Online</span>
                </div>
            </div>

            {/* Clean Tabs */}
            <nav id="tour-tabs" className="flex items-center gap-6 mb-6 border-b border-white/5 no-scrollbar justify-center md:justify-start">
                {['overview', 'plans', 'history'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`
                            pb-2 text-xs font-bold transition-all duration-200 relative px-2 tracking-wide capitalize
                            ${activeTab === tab ? 'text-white' : 'text-text-tertiary hover:text-text-primary'}
                        `}
                    >
                        {tab === 'plans' ? 'Schedule' : tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                        )}
                    </button>
                ))}
            </nav>

            {activeTab === 'overview' && (
                <div className="space-y-6">

                    {/* Compact Grid: Reduced Height & Spacing */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* 1. Resume / Start Module */}
                        <div className="h-[180px]">
                            {activeContext && onResumeSession ? (
                                <button
                                    onClick={onResumeSession}
                                    className="w-full h-full text-left glass-card p-5 group flex flex-col justify-between hover:bg-white/[0.1] transition-colors"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Play className="w-4 h-4 fill-current" />
                                            </div>
                                            <span className="text-[9px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">Resume</span>
                                        </div>
                                        <h3 className="text-base font-bold text-white leading-tight mb-1">Continue Session</h3>
                                        <p className="text-xs text-text-secondary line-clamp-1 truncate">{activeContext.subjectName}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-widest opacity-80 group-hover:opacity-100">
                                        Enter <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </button>
                            ) : (
                                <button
                                    onClick={onNewSession}
                                    className="w-full h-full glass-card p-5 border-dashed border-white/20 flex flex-col items-center justify-center text-center group hover:bg-white/[0.05] transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-white/5">
                                        <PlusCircle className="w-5 h-5 text-text-tertiary group-hover:text-primary transition-colors" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-0.5">New Session</h3>
                                    <p className="text-[10px] text-text-tertiary max-w-[120px]">Create a new study module</p>
                                </button>
                            )}
                        </div>

                        {/* 2. Mock Test */}
                        <button
                            id="tour-new-exam"
                            onClick={onNewSession}
                            className="h-[180px] text-left glass-card p-5 group flex flex-col justify-between hover:bg-white/[0.1] transition-colors"
                        >
                            <div>
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                    <PlusCircle className="w-4 h-4" />
                                </div>
                                <h3 className="text-base font-bold text-white mb-1">Mock Test</h3>
                                <p className="text-xs text-text-secondary leading-tight">Generate practice questions.</p>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-purple-400 uppercase tracking-widest opacity-80 group-hover:opacity-100">
                                Create <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </button>

                        {/* 3. Study Guides */}
                        <button
                            id="tour-notes"
                            onClick={onOpenNotesFormatter}
                            className="h-[180px] text-left glass-card p-5 group flex flex-col justify-between hover:bg-white/[0.1] transition-colors"
                        >
                            <div>
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <Wand2 className="w-4 h-4" />
                                </div>
                                <h3 className="text-base font-bold text-white mb-1">Smart Notes</h3>
                                <p className="text-xs text-text-secondary leading-tight">Format and organize notes.</p>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-400 uppercase tracking-widest opacity-80 group-hover:opacity-100">
                                Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </button>
                    </div>

                    {/* Compact Stats Row */}
                    <div id="tour-stats" className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card p-5 flex flex-col justify-between h-32 group hover:border-primary/40">
                            <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Score</span>
                            <div>
                                <div className="text-2xl font-black text-white mb-2">{user.xp.toLocaleString()}</div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-5 flex flex-col justify-between h-32 hover:border-secondary/40">
                            <span className="text-[9px] font-bold text-secondary uppercase tracking-wider">Level</span>
                            <div>
                                <div className="text-2xl font-black text-white mb-1">LVL {user.level}</div>
                                <p className="text-[8px] text-text-tertiary uppercase font-bold tracking-wide">{1000 - (user.xp % 1000)} XP to go</p>
                            </div>
                        </div>

                        <div
                            onClick={() => setActiveTab('history')}
                            className="glass-card p-5 flex flex-col justify-between h-32 cursor-pointer group hover:bg-white/[0.1]"
                        >
                            <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider">Tests</span>
                            <div>
                                <div className="text-2xl font-black text-white mb-1">{user.history.length}</div>
                                <div className="flex items-center gap-1 text-[8px] font-bold text-text-secondary group-hover:text-white transition-colors uppercase tracking-wide">
                                    View All <ArrowRight className="w-2.5 h-2.5" />
                                </div>
                            </div>
                        </div>

                        {/* Coach - Hidden on small mobile to save space, visible on larger */}
                        <div className="hidden md:flex glass-card p-4 border-primary/20 bg-primary/5 flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                <BrainCircuit className="w-3.5 h-3.5 text-primary" />
                                <h3 className="font-bold text-[9px] tracking-widest uppercase text-white">Coach</h3>
                            </div>
                            <p className="text-[10px] text-text-secondary leading-snug italic border-l border-primary/30 pl-3">
                                "{progress > 70 ? "Ready for a mock exam? Retention is optimal." : "Focused practice will boost your level."}"
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Section */}
            {activeTab === 'plans' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                    {examsWithPlans.length > 0 ? (
                        examsWithPlans.map(item => (
                            <div key={item.id} className="glass-card p-8 flex flex-col justify-between h-[220px]">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                            <Calendar className="w-4 h-4 text-primary" />
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(item.id, e)}
                                            className="text-text-tertiary hover:text-rose-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1 truncate">{item.subjectName}</h3>
                                    <p className="text-[10px] text-text-tertiary font-bold uppercase">{
                                        (() => {
                                            const d = new Date(item.date);
                                            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                                        })()
                                    }</p>
                                </div>

                                <button
                                    onClick={() => onViewPlan && onViewPlan(item.id)}
                                    className="w-full py-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold text-[10px] rounded-lg transition-all uppercase tracking-widest"
                                >
                                    Open Schedule
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-32 glass-card flex flex-col items-center justify-center opacity-40 border-dashed border-white/5">
                            <Calendar className="w-12 h-12 mb-4 text-text-tertiary" />
                            <p className="font-bold text-white tracking-widest uppercase text-[10px]">No Revision Plans</p>
                        </div>
                    )}
                </div>
            )}

            {/* Compact History */}
            {activeTab === 'history' && (
                <div className="glass-card overflow-hidden animate-slide-up">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-[9px] font-bold uppercase text-primary tracking-widest bg-white/[0.01]">
                                    <th className="p-6">Date</th>
                                    <th className="p-6">Subject</th>
                                    <th className="p-6 text-center">Score</th>
                                    <th className="p-6 text-right pr-8">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {user.history.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6 text-xs text-text-tertiary">
                                            {(() => {
                                                const d = new Date(item.date);
                                                return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                                            })()}
                                        </td>
                                        <td className="p-6 text-sm text-white font-bold">
                                            {item.subjectName}
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`
                                                px-3 py-1 rounded-full text-[9px] font-bold tracking-widest border
                                                ${item.score / item.totalQuestions >= 0.7 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-rose-400 bg-rose-400/10 border-rose-400/20'}
                                            `}>
                                                {Math.round((item.score / item.totalQuestions) * 100)}%
                                            </span>
                                        </td>
                                        <td className="p-6 text-right pr-8">
                                            <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                                {[
                                                    { icon: Calendar, onClick: () => onViewPlan && onViewPlan(item.id), color: 'hover:text-primary', title: "View Revision Plan" },
                                                    { icon: BarChart, onClick: () => onViewResult && onViewResult(item.id), color: 'hover:text-secondary', title: "View Analysis" },
                                                    { icon: Eye, onClick: () => onReviewExam && onReviewExam(item.id), color: 'hover:text-white', title: "Review Questions" },
                                                    { icon: RotateCcw, onClick: () => onRetakeExam && onRetakeExam(item.id), color: 'hover:text-emerald-400', title: "Retake Exam" }
                                                ].map((act, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={act.onClick}
                                                        title={act.title}
                                                        className={`p-2 glass-card rounded-lg transition-all active:scale-90 ${act.color}`}
                                                    >
                                                        <act.icon className="w-3.5 h-3.5" />
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;