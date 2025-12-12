import React, { useState, useMemo } from 'react';
import { UserProfile, SubjectContext, ExamHistoryItem } from '../types';
import { Play, TrendingUp, Trophy, History, BookOpen, Star, Activity, Eye, RotateCcw, X, Lock, Unlock, BarChart, Calendar, Cpu, Zap, Wand2, Trash2, ArrowRight, PlusCircle, Sparkles, BrainCircuit } from 'lucide-react';
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

  // Filter exams that have a plan available
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
    <div className="max-w-6xl mx-auto mt-8 px-6 pb-12 fade-in relative">
      
      {/* Hero Section */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-xs font-mono text-primary uppercase tracking-widest">ExamWarp AI</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
             Welcome back, {user.name}
            </h1>
            <p className="text-text-secondary text-lg">
             Target: <span className="text-primary font-semibold border-b border-primary/30">{user.targetExam}</span>
            </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
            <Activity className="w-5 h-5 text-emerald-400" />
            <div className="flex flex-col text-right">
                <span className="text-[10px] text-text-tertiary uppercase font-bold">System Status</span>
                <span className="text-emerald-400 font-mono text-sm leading-none">ONLINE</span>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-border mb-10 overflow-x-auto">
          {['overview', 'plans', 'history'].map((tab) => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-3 text-sm font-medium transition-all duration-300 relative px-2 tracking-wide uppercase ${activeTab === tab ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
            </button>
          ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-10">
            
            {/* 1. Primary Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Active Session Card */}
                {activeContext && onResumeSession ? (
                    <div 
                        onClick={onResumeSession}
                        className="group relative overflow-hidden rounded-2xl bg-surface border border-primary/30 p-6 cursor-pointer transition-all hover:border-primary/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col justify-between h-64"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                        
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="p-3 rounded-xl bg-primary/20 text-primary border border-primary/20">
                                <Play className="w-8 h-8 fill-current" />
                            </div>
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                        </div>

                        <div className="relative z-10 mt-auto">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">Active Session</span>
                            <h3 className="text-xl font-bold text-white mb-1 truncate" title={activeContext.subjectName}>{activeContext.subjectName}</h3>
                            <p className="text-sm text-text-secondary truncate">{activeContext.examType}</p>
                            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-primary group-hover:translate-x-1 transition-transform">
                                Resume Now <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    </div>
                ) : (
                   <div 
                        onClick={onNewSession}
                        className="group relative overflow-hidden rounded-2xl bg-surface border border-white/10 p-6 cursor-pointer transition-all hover:border-white/20 hover:bg-white/5 flex flex-col justify-center items-center text-center h-64 border-dashed"
                    >
                        <div className="p-4 rounded-full bg-white/5 text-text-tertiary mb-4 group-hover:scale-110 transition-transform">
                            <Activity className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-text-secondary">No Active Session</h3>
                        <p className="text-xs text-text-tertiary mt-2">Start a new exam to see progress here.</p>
                    </div> 
                )}

                {/* New Session Card */}
                <div 
                    onClick={onNewSession}
                    className="group relative overflow-hidden rounded-2xl bg-surface border border-secondary/30 p-6 cursor-pointer transition-all hover:border-secondary/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] flex flex-col justify-between h-64"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="p-3 rounded-xl bg-secondary/20 text-secondary border border-secondary/20">
                            <PlusCircle className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="relative z-10 mt-auto">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider mb-1 block">New Assessment</span>
                        <h3 className="text-xl font-bold text-white mb-1">Upload Material</h3>
                        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                            Generate adaptive exams from your PDFs, textbooks, or notes using AI.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-secondary group-hover:translate-x-1 transition-transform">
                            Start Upload <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>
                </div>

                {/* Smart Tools Card */}
                <div 
                    onClick={onOpenNotesFormatter}
                    className="group relative overflow-hidden rounded-2xl bg-surface border border-pink-500/30 p-6 cursor-pointer transition-all hover:border-pink-500/60 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] flex flex-col justify-between h-64"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/20">
                            <Wand2 className="w-8 h-8" />
                        </div>
                        <div className="px-2 py-1 rounded-md bg-pink-500/20 border border-pink-500/30 text-[10px] font-bold text-pink-300 uppercase">
                            Beta
                        </div>
                    </div>

                    <div className="relative z-10 mt-auto">
                        <span className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-1 block">Smart Tools</span>
                        <h3 className="text-xl font-bold text-white mb-1">Notes Formatter</h3>
                        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                            Transform rough scribbles and bullet points into structured study guides.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-pink-400 group-hover:translate-x-1 transition-transform">
                            Open Tool <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>
                </div>

            </div>

            {/* 2. Stats & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Stats Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <button 
                        onClick={() => setShowXpModal(true)}
                        className="glass-panel p-5 rounded-xl border border-white/5 hover:border-primary/40 transition-all text-left group relative overflow-hidden flex flex-col justify-between h-32"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12">
                            <Cpu className="w-16 h-16 text-primary" />
                        </div>
                        <div className="relative z-10 text-xs font-bold text-primary uppercase tracking-widest mb-2">Total XP</div>
                        <div className="relative z-10">
                             <div className="text-2xl font-black text-white group-hover:text-primary transition-colors">{user.xp.toLocaleString()}</div>
                             <div className="w-full h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={() => setShowLevelModal(true)}
                        className="glass-panel p-5 rounded-xl border border-white/5 hover:border-emerald-500/40 transition-all text-left group relative overflow-hidden flex flex-col justify-between h-32"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12">
                            <Trophy className="w-16 h-16 text-emerald-500" />
                        </div>
                        <div className="relative z-10 text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Current Rank</div>
                        <div className="relative z-10">
                             <div className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">LVL {user.level}</div>
                             <div className="text-[10px] text-text-tertiary mt-1 font-mono">NEXT: {(user.level + 1) * 1000} XP</div>
                        </div>
                    </button>

                    <button 
                        onClick={() => setActiveTab('history')}
                        className="glass-panel p-5 rounded-xl border border-white/5 hover:border-secondary/40 transition-all text-left group relative overflow-hidden flex flex-col justify-between h-32"
                    >
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12">
                            <History className="w-16 h-16 text-secondary" />
                        </div>
                        <div className="relative z-10 text-xs font-bold text-secondary uppercase tracking-widest mb-2">Exams Taken</div>
                        <div className="relative z-10">
                             <div className="text-2xl font-black text-white group-hover:text-secondary transition-colors">{user.history.length}</div>
                             <div className="text-[10px] text-text-tertiary mt-1 font-mono group-hover:text-white transition-colors">View History &rarr;</div>
                        </div>
                    </button>
                </div>

                {/* Insight Card */}
                <div className="lg:col-span-1 glass-panel rounded-xl p-6 border border-white/10 flex flex-col justify-between h-full bg-gradient-to-b from-white/5 to-transparent">
                     <div>
                        <div className="flex items-center gap-2 mb-4 text-white">
                            <BrainCircuit className="w-5 h-5 text-yellow-400" />
                            <h3 className="font-bold text-sm tracking-wide">AI INSIGHT</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed italic relative pl-4 border-l-2 border-yellow-400/50">
                            "Consistency is your greatest asset. Based on your recent activity, try to focus on closing small concept gaps in your next session to boost your XP multiplier."
                        </p>
                     </div>
                     <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center text-xs font-mono text-text-tertiary">
                             <span>Engagement</span>
                             <span className="text-emerald-400">High</span>
                        </div>
                     </div>
                </div>

            </div>
        </div>
      )}

      {/* Plans Tab Content */}
      {activeTab === 'plans' && (
          <div className="animate-slide-up">
              {examsWithPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {examsWithPlans.map(item => (
                          <div key={item.id} className="glass-panel rounded-xl p-6 group hover:border-cyan-500/50 transition-all relative overflow-hidden flex flex-col justify-between h-full min-h-[220px]">
                              <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-900/20 flex items-center justify-center border border-cyan-500/30">
                                        <Calendar className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <button 
                                        onClick={(e) => handleDelete(item.id, e)}
                                        className="text-text-tertiary hover:text-red-400 p-2 rounded-full hover:bg-white/5 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 truncate">{item.subjectName}</h3>
                                <p className="text-xs text-text-secondary mb-4">Created: {new Date(item.date).toLocaleDateString()}</p>
                                
                                <div className="flex items-center gap-2 mb-6">
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.score/item.totalQuestions > 0.7 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                        {Math.round((item.score/item.totalQuestions) * 100)}% SCORE
                                    </div>
                                </div>
                              </div>

                              <button 
                                onClick={() => onViewPlan && onViewPlan(item.id)}
                                className="w-full py-3 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-cyan-400 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2"
                              >
                                  Open Revision Plan <ArrowRight className="w-3 h-3" />
                              </button>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-text-tertiary border-2 border-dashed border-white/5 rounded-2xl bg-white/5">
                      <Calendar className="w-12 h-12 mb-4 opacity-50" />
                      <p className="mb-2 font-medium">No active revision plans found.</p>
                      <p className="text-xs max-w-xs text-center">Complete an exam and generate a plan to see it here.</p>
                  </div>
              )}
          </div>
      )}

      {/* History Tab Content */}
      {activeTab === 'history' && (
        <div className="glass-panel rounded-xl overflow-hidden animate-slide-up border border-primary/20">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase text-primary tracking-widest font-mono font-bold">
                        <th className="p-5">Date</th>
                        <th className="p-5">Exam Name</th>
                        <th className="p-5 text-center">Score</th>
                        <th className="p-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {user.history.map((item) => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-5 text-sm text-text-tertiary font-mono">
                                {new Date(item.date).toLocaleDateString()}
                            </td>
                            <td className="p-5 text-sm text-white font-bold">
                                {item.subjectName}
                            </td>
                            <td className="p-5 text-center">
                                <span className={`
                                    inline-flex items-center px-2 py-1 rounded text-xs font-bold font-mono
                                    ${item.score / item.totalQuestions >= 0.7 ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' : 'text-red-400 bg-red-400/10 border border-red-400/20'}
                                `}>
                                    {Math.round((item.score / item.totalQuestions) * 100)}%
                                </span>
                            </td>
                            <td className="p-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => onViewPlan && onViewPlan(item.id)}
                                        className="p-2 hover:bg-primary/10 border border-transparent hover:border-primary/30 rounded text-text-secondary hover:text-primary transition-all" 
                                        title="View Plan"
                                    >
                                        <Calendar className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onViewResult && onViewResult(item.id)}
                                        className="p-2 hover:bg-secondary/10 border border-transparent hover:border-secondary/30 rounded text-text-secondary hover:text-secondary transition-all" 
                                        title="Analytics"
                                    >
                                        <BarChart className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onReviewExam && onReviewExam(item.id)}
                                        className="p-2 hover:bg-white/10 border border-transparent hover:border-white/20 rounded text-text-secondary hover:text-white transition-all" 
                                        title="Review"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onRetakeExam && onRetakeExam(item.id)}
                                        className="p-2 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 rounded text-text-secondary hover:text-emerald-400 transition-all" 
                                        title="Retake"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                                    <button 
                                        onClick={(e) => handleDelete(item.id, e)}
                                        className="p-2 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded text-text-tertiary hover:text-red-400 transition-all" 
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
                            <td colSpan={4} className="p-12 text-center text-text-tertiary text-sm font-mono">
                                [NO EXAM HISTORY FOUND]
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      )}

      {/* Modals */}
      {showXpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowXpModal(false)} />
            <div className="relative glass-panel w-full max-w-md rounded-2xl p-8 animate-slide-up border border-primary/30">
                <button onClick={() => setShowXpModal(false)} className="absolute top-4 right-4 text-text-tertiary hover:text-white"><X className="w-5 h-5"/></button>
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                        <Cpu className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-mono">TOTAL EXPERIENCE</h2>
                    <div className="text-4xl font-black text-primary mb-6">{user.xp.toLocaleString()} <span className="text-lg text-primary/50 font-medium">XP</span></div>
                    
                    <div className="w-full bg-black/50 rounded-lg p-4 border border-white/10 mb-6 text-left">
                        <div className="flex justify-between text-sm mb-2 font-mono">
                            <span className="text-text-secondary">NEXT LEVEL</span>
                            <span className="text-primary">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
      
       {showLevelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowLevelModal(false)} />
            <div className="relative glass-panel w-full max-w-md rounded-2xl p-8 animate-slide-up border border-emerald-500/30">
                <button onClick={() => setShowLevelModal(false)} className="absolute top-4 right-4 text-text-tertiary hover:text-white"><X className="w-5 h-5"/></button>
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                        <Trophy className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-6 font-mono">RANK PROGRESS</h2>
                    
                     <div className="w-full space-y-3 font-mono">
                        <div className="flex items-center gap-4 p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-lg">
                            <div className="font-bold text-emerald-400 w-8">L{user.level}</div>
                            <div className="text-left text-sm">
                                <div className="text-white font-medium">CURRENT</div>
                            </div>
                            <Unlock className="w-4 h-4 text-emerald-400 ml-auto" />
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-lg opacity-60">
                            <div className="font-bold text-text-tertiary w-8">L{user.level + 1}</div>
                            <div className="text-left text-sm">
                                <div className="text-text-secondary font-medium">NEXT RANK</div>
                                <div className="text-text-tertiary text-xs">Req: {nextLevelXp} XP</div>
                            </div>
                            <Lock className="w-4 h-4 text-text-tertiary ml-auto" />
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