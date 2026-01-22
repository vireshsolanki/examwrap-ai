import React, { useState, useMemo } from 'react';
import { UserProfile, SubjectContext, ExamHistoryItem } from '../types';
import { Play, TrendingUp, Trophy, History, BookOpen, Star, Activity, Eye, RotateCcw, X, Lock, Unlock, BarChart, Calendar, Cpu, Zap, Wand2, Trash2, ArrowRight, PlusCircle, Sparkles, BrainCircuit, FileSpreadsheet } from 'lucide-react';
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
  const [showLevelModal, setShowLevelModal] = useState(false);

  const nextLevelXp = user.level * 1000;
  const currentLevelXp = (user.level - 1) * 1000;
  const progress = ((user.xp - currentLevelXp) / 1000) * 100;

  const examsWithPlans = useMemo(() => {
      if (activeTab !== 'plans') return [];
      return user.history.filter(item => {
          const record = getFullExamRecord(item.id);
          return record && record.plan;
      });
  }, [user.history, activeTab]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm("Are you sure you want to delete this exam record? This cannot be undone.")) {
          onDeleteExam(id);
      }
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 px-6 pb-20 fade-in">
      
      {/* Dynamic Header Section */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8 border-b border-white/5 relative">
        <div className="relative z-10" id="welcome">
            <div className="flex items-center gap-3 mb-3">
                <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary font-bold tracking-widest uppercase">
                    Neural Hub
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight leading-tight mb-2">
                Greetings, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">{user.name}</span>
            </h1>
            <p className="text-text-secondary text-lg font-medium">
                Focus: <span className="text-text-primary underline decoration-primary/40 underline-offset-4">{user.targetExam}</span>
            </p>
        </div>
        
        <div className="flex items-center gap-4 bg-surface border border-white/10 p-5 rounded-2xl shadow-2xl backdrop-blur-xl relative z-10 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest font-mono">Cognitive Load</span>
                <span className="text-xl font-mono text-white">OPTIMIZED</span>
            </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-10 mb-12 border-b border-white/5 overflow-x-auto no-scrollbar pb-1" id="tour-tabs">
          {['overview', 'plans', 'history'].map((tab) => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`
                    pb-4 text-xs font-bold transition-all duration-300 relative px-2 tracking-[0.2em] uppercase whitespace-nowrap
                    ${activeTab === tab ? 'text-primary' : 'text-text-tertiary hover:text-text-primary'}
                `}
            >
                {tab === 'plans' ? 'Revision Path' : tab}
                {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
                )}
            </button>
          ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-12">
            
            {/* Primary Navigation Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Active Assessment Card */}
                <div className="lg:col-span-1 h-full">
                    {activeContext && onResumeSession ? (
                        <button 
                            onClick={onResumeSession}
                            className="w-full h-full text-left glass-panel rounded-3xl p-8 border border-primary/30 group relative overflow-hidden flex flex-col justify-between transition-all hover:border-primary/60 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] active:scale-[0.98]"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700"></div>
                            
                            <div className="relative z-10 flex justify-between items-start mb-12">
                                <div className="p-4 rounded-2xl bg-primary/20 text-primary border border-primary/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    <Play className="w-8 h-8 fill-current" />
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">In Progress</span>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-white mb-2 line-clamp-2 leading-tight">
                                    {activeContext.subjectName}
                                </h3>
                                <p className="text-sm text-text-secondary font-medium opacity-80 mb-6 truncate">
                                    {activeContext.examType}
                                </p>
                                <div className="flex items-center gap-3 text-xs font-bold text-primary group-hover:gap-4 transition-all">
                                    CONTINUE SESSION <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </button>
                    ) : (
                        <div className="w-full h-full glass-panel rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center text-center opacity-60 group relative overflow-hidden border-dashed">
                            <Activity className="w-12 h-12 text-text-tertiary mb-4 opacity-40 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-bold text-text-secondary mb-1">No Active Flow</h3>
                            <p className="text-xs text-text-tertiary">Start a new exam to unlock tracking.</p>
                        </div>
                    )}
                </div>

                {/* 2. Upload / New Session Card */}
                <button 
                    id="tour-new-exam"
                    onClick={onNewSession}
                    className="w-full h-full text-left glass-panel rounded-3xl p-8 border border-secondary/30 group relative overflow-hidden flex flex-col justify-between transition-all hover:border-secondary/60 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] active:scale-[0.98]"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-secondary/20 transition-all duration-700"></div>
                    
                    <div className="relative z-10 flex justify-between items-start mb-12">
                        <div className="p-4 rounded-2xl bg-secondary/20 text-secondary border border-secondary/30 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                            <PlusCircle className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                            Generate Exam
                        </h3>
                        <p className="text-sm text-text-secondary font-medium opacity-80 mb-6 line-clamp-2">
                            Synthesize questions from PDFs, notes, or textbooks using advanced neural patterns.
                        </p>
                        <div className="flex items-center gap-3 text-xs font-bold text-secondary group-hover:gap-4 transition-all">
                            LAUNCH CREATOR <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </button>

                {/* 3. Smart Tools Card */}
                <button 
                    id="tour-notes"
                    onClick={onOpenNotesFormatter}
                    className="w-full h-full text-left glass-panel rounded-3xl p-8 border border-pink-500/30 group relative overflow-hidden flex flex-col justify-between transition-all hover:border-pink-500/60 hover:shadow-[0_0_40px_rgba(236,72,153,0.15)] active:scale-[0.98]"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-pink-500/20 transition-all duration-700"></div>
                    
                    <div className="relative z-10 flex justify-between items-start mb-12">
                        <div className="p-4 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30 shadow-inner group-hover:-rotate-12 transition-transform duration-500">
                            <Wand2 className="w-8 h-8" />
                        </div>
                        <span className="px-2 py-1 rounded bg-pink-500/20 border border-pink-500/30 text-[9px] font-black text-pink-300 uppercase tracking-widest">Enhanced</span>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                            Notes Architect
                        </h3>
                        <p className="text-sm text-text-secondary font-medium opacity-80 mb-6 line-clamp-2">
                            Transform messy lecture rough-notes into structured, professional knowledge assets.
                        </p>
                        <div className="flex items-center gap-3 text-xs font-bold text-pink-400 group-hover:gap-4 transition-all">
                            OPEN ARCHITECT <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </button>

            </div>

            {/* Metrics & Intelligence Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="tour-stats">
                
                {/* Detailed Stats Column */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <button 
                        onClick={() => setShowXpModal(true)}
                        className="group glass-panel rounded-2xl p-6 border border-white/5 hover:border-primary/40 transition-all text-left flex flex-col justify-between h-40 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-125 duration-500">
                            <Cpu className="w-20 h-20 text-primary" />
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 font-mono">Experience Engine</span>
                        <div className="relative z-10">
                             <div className="text-4xl font-black text-white group-hover:translate-x-1 transition-transform">{user.xp.toLocaleString()}</div>
                             <div className="w-full h-1.5 bg-white/5 mt-4 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-primary shadow-[0_0_10px_#06b6d4]" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={() => setShowLevelModal(true)}
                        className="group glass-panel rounded-2xl p-6 border border-white/5 hover:border-emerald-500/40 transition-all text-left flex flex-col justify-between h-40 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-125 duration-500">
                            <Trophy className="w-20 h-20 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 font-mono">Synaptic Rank</span>
                        <div className="relative z-10">
                             <div className="text-4xl font-black text-white group-hover:translate-x-1 transition-transform">LVL {user.level}</div>
                             <div className="text-[10px] text-text-tertiary mt-3 font-mono font-bold">REACH {(user.level + 1) * 1000} XP FOR NEXT RANK</div>
                        </div>
                    </button>

                    <button 
                        onClick={() => setActiveTab('history')}
                        className="group glass-panel rounded-2xl p-6 border border-white/5 hover:border-secondary/40 transition-all text-left flex flex-col justify-between h-40 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-125 duration-500">
                            <History className="w-20 h-20 text-secondary" />
                        </div>
                        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4 font-mono">Task History</span>
                        <div className="relative z-10">
                             <div className="text-4xl font-black text-white group-hover:translate-x-1 transition-transform">{user.history.length}</div>
                             <div className="text-[10px] text-text-tertiary mt-3 font-mono font-bold group-hover:text-white transition-colors flex items-center gap-1">
                                VIEW ALL LOGS <ArrowRight className="w-3 h-3" />
                             </div>
                        </div>
                    </button>
                </div>

                {/* AI Personal Mentor Widget */}
                <div className="lg:col-span-1 glass-panel rounded-2xl p-8 border border-white/5 flex flex-col justify-between bg-gradient-to-br from-surface to-background relative group">
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-yellow-500/20 transition-all duration-1000"></div>
                    
                    <div>
                        <div className="flex items-center gap-3 mb-6 text-white">
                            <div className="w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                                <BrainCircuit className="w-5 h-5 text-yellow-400" />
                            </div>
                            <h3 className="font-bold text-xs tracking-widest uppercase font-mono">AI Feedback</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed italic relative pl-4 border-l-2 border-yellow-400/40">
                            "Concentrated study sessions are yielding high retention. Aim for a 90% accuracy in your next session to trigger a critical level-up reward."
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                         <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest font-mono">Intelligence Matrix</span>
                         <span className="text-[10px] font-bold text-emerald-400 font-mono">OPTIMAL</span>
                    </div>
                </div>

            </div>
        </div>
      )}

      {activeTab === 'plans' && (
          <div className="animate-slide-up grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {examsWithPlans.length > 0 ? (
                  examsWithPlans.map(item => (
                      <div key={item.id} className="glass-panel rounded-3xl p-8 group hover:border-cyan-500/50 transition-all relative overflow-hidden flex flex-col justify-between h-72">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full"></div>
                          <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-xl bg-cyan-900/20 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                                    <Calendar className="w-6 h-6 text-cyan-400" />
                                </div>
                                <button 
                                    onClick={(e) => handleDelete(item.id, e)}
                                    className="text-text-tertiary hover:text-red-400 p-2 rounded-xl hover:bg-white/5 transition-all active:scale-90"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <h3 className="text-xl font-black text-white mb-1 truncate">{item.subjectName}</h3>
                            <p className="text-xs text-text-tertiary mb-6 font-mono font-bold uppercase tracking-widest">
                                Assigned: {new Date(item.date).toLocaleDateString()}
                            </p>
                            
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border font-mono tracking-widest bg-white/5 border-white/10 text-text-secondary">
                                EFFICIENCY: {Math.round((item.score/item.totalQuestions) * 100)}%
                            </div>
                          </div>

                          <button 
                            onClick={() => onViewPlan && onViewPlan(item.id)}
                            className="w-full py-4 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-cyan-400 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                          >
                              Access Path <ArrowRight className="w-4 h-4" />
                          </button>
                      </div>
                  ))
              ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-32 text-text-tertiary border-2 border-dashed border-white/5 rounded-[40px] bg-white/5">
                      <Calendar className="w-16 h-16 mb-6 opacity-20" />
                      <p className="mb-2 font-bold text-white tracking-widest uppercase text-xs">Path Empty</p>
                      <p className="text-xs max-w-xs text-center leading-relaxed">Complete an assessment and generate a revision schedule to see it here.</p>
                  </div>
              )}
          </div>
      )}

      {activeTab === 'history' && (
        <div className="glass-panel rounded-3xl overflow-hidden animate-slide-up border border-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase text-primary tracking-[0.2em] font-mono font-bold">
                            <th className="p-6">Timestamp</th>
                            <th className="p-6">Module Name</th>
                            <th className="p-6 text-center">Outcome</th>
                            <th className="p-6 text-right pr-10">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {user.history.map((item) => (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-6 text-[11px] text-text-tertiary font-mono">
                                    {new Date(item.date).toLocaleDateString()}
                                </td>
                                <td className="p-6 text-sm text-white font-bold tracking-tight">
                                    {item.subjectName}
                                </td>
                                <td className="p-6 text-center">
                                    <span className={`
                                        inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black font-mono tracking-widest border
                                        ${item.score / item.totalQuestions >= 0.7 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' : 'text-rose-400 bg-rose-400/10 border-rose-400/30'}
                                    `}>
                                        {Math.round((item.score / item.totalQuestions) * 100)}%
                                    </span>
                                </td>
                                <td className="p-6 text-right pr-10">
                                    <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                        {[
                                            { icon: Calendar, onClick: () => onViewPlan && onViewPlan(item.id), color: 'hover:text-primary', label: 'Path' },
                                            { icon: BarChart, onClick: () => onViewResult && onViewResult(item.id), color: 'hover:text-secondary', label: 'Stats' },
                                            { icon: Eye, onClick: () => onReviewExam && onReviewExam(item.id), color: 'hover:text-white', label: 'Inspect' },
                                            { icon: RotateCcw, onClick: () => onRetakeExam && onRetakeExam(item.id), color: 'hover:text-emerald-400', label: 'Retry' }
                                        ].map((act, i) => (
                                            <button 
                                                key={i}
                                                onClick={act.onClick}
                                                className={`p-2.5 bg-white/5 border border-transparent hover:border-white/10 rounded-xl transition-all active:scale-90 ${act.color}`}
                                                title={act.label}
                                            >
                                                <act.icon className="w-4 h-4" />
                                            </button>
                                        ))}
                                        <div className="w-px h-6 bg-white/10 mx-2"></div>
                                        <button 
                                            onClick={(e) => handleDelete(item.id, e)}
                                            className="p-2.5 bg-white/5 border border-transparent hover:bg-rose-500/10 hover:border-rose-500/20 rounded-xl text-text-tertiary hover:text-rose-400 transition-all active:scale-90" 
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {user.history.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-text-tertiary text-xs font-mono font-bold tracking-[0.3em] uppercase opacity-40">
                                    [ No records found in static memory ]
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Modals remain same logic but slightly refined styles */}
      {showXpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setShowXpModal(false)} />
            <div className="relative glass-panel w-full max-w-md rounded-[40px] p-12 animate-slide-up border border-primary/30 shadow-[0_0_100px_rgba(6,182,212,0.2)]">
                <button onClick={() => setShowXpModal(false)} className="absolute top-8 right-8 text-text-tertiary hover:text-white transition-all active:scale-90"><X className="w-6 h-6"/></button>
                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-8 border border-primary/40 shadow-[0_0_40px_rgba(6,182,212,0.4)]">
                        <Cpu className="w-12 h-12 text-primary" />
                    </div>
                    <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-4 font-mono">Experience Matrix</h2>
                    <div className="text-5xl font-black text-white mb-8 tracking-tighter">{user.xp.toLocaleString()} <span className="text-xl text-primary/40 font-mono">XP</span></div>
                    
                    <div className="w-full bg-surface border border-white/5 rounded-3xl p-6 mb-8 text-left">
                        <div className="flex justify-between items-center text-xs mb-4 font-mono font-bold uppercase tracking-widest">
                            <span className="text-text-secondary">Path to Evolution</span>
                            <span className="text-primary">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-primary to-blue-500 shadow-[0_0_15px_#06b6d4]" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
      
       {showLevelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setShowLevelModal(false)} />
            <div className="relative glass-panel w-full max-w-md rounded-[40px] p-12 animate-slide-up border border-emerald-500/30 shadow-[0_0_100px_rgba(16,185,129,0.2)]">
                <button onClick={() => setShowLevelModal(false)} className="absolute top-8 right-8 text-text-tertiary hover:text-white transition-all active:scale-90"><X className="w-6 h-6"/></button>
                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mb-8 border border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                        <Trophy className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.4em] mb-8 font-mono">Rank Progress</h2>
                    
                     <div className="w-full space-y-4">
                        <div className="flex items-center gap-6 p-5 bg-emerald-500/10 border border-emerald-500/40 rounded-3xl group transition-all">
                            <div className="font-black text-emerald-400 text-2xl font-mono">L{user.level}</div>
                            <div className="text-left">
                                <div className="text-white font-black text-xs uppercase tracking-widest font-mono">Current Status</div>
                                <div className="text-emerald-400/80 text-[10px] font-bold font-mono">ACTIVE OPERATIVE</div>
                            </div>
                            <Unlock className="w-5 h-5 text-emerald-400 ml-auto group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex items-center gap-6 p-5 bg-white/5 border border-white/10 rounded-3xl opacity-40 grayscale group transition-all">
                            <div className="font-black text-text-tertiary text-2xl font-mono">L{user.level + 1}</div>
                            <div className="text-left">
                                <div className="text-text-secondary font-black text-xs uppercase tracking-widest font-mono">Next Evolution</div>
                                <div className="text-text-tertiary text-[10px] font-bold font-mono">REQ: {nextLevelXp} XP</div>
                            </div>
                            <Lock className="w-5 h-5 text-text-tertiary ml-auto" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;