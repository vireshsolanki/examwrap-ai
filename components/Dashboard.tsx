import React, { useState } from 'react';
import { UserProfile, SubjectContext, ExamHistoryItem } from '../types';
import { Play, TrendingUp, Trophy, History, BookOpen, Star, Activity, Eye, RotateCcw, X, Lock, Unlock, BarChart, Calendar, Cpu, Zap } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  onNewSession: () => void;
  activeContext?: SubjectContext | null;
  onResumeSession?: () => void;
  onReviewExam?: (id: string) => void;
  onRetakeExam?: (id: string) => void;
  onViewResult?: (id: string) => void;
  onViewPlan?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNewSession, activeContext, onResumeSession, onReviewExam, onRetakeExam, onViewResult, onViewPlan }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [showXpModal, setShowXpModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);

  const nextLevelXp = user.level * 1000;
  const currentLevelXp = (user.level - 1) * 1000;
  const progress = ((user.xp - currentLevelXp) / 1000) * 100;

  return (
    <div className="max-w-6xl mx-auto mt-8 px-6 pb-12 fade-in relative">
      
      {/* Tech Hero */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-xs font-mono text-primary uppercase tracking-widest">ExamWarp AI</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
             Welcome, {user.name}
            </h1>
            <p className="text-text-secondary text-lg">
             Target Exam: <span className="text-primary font-semibold border-b border-primary/30">{user.targetExam}</span>
            </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
            <Activity className="w-5 h-5 text-emerald-400" />
            <div className="flex flex-col text-right">
                <span className="text-[10px] text-text-tertiary uppercase font-bold">Status</span>
                <span className="text-emerald-400 font-mono text-sm leading-none">READY</span>
            </div>
        </div>
      </div>

      {/* Info Genius Tabs */}
      <div className="flex items-center gap-8 border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-medium transition-all duration-300 relative px-2 tracking-wide ${activeTab === 'overview' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            OVERVIEW
            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-medium transition-all duration-300 relative px-2 tracking-wide ${activeTab === 'history' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            EXAM HISTORY
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
          </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
            
            {/* Main Action Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeContext && onResumeSession ? (
                    <div className="glass-panel rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent"></div>
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                <span className="text-xs font-mono text-primary uppercase tracking-widest">Current Session</span>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1 truncate">{activeContext.subjectName}</h2>
                            <p className="text-xs text-text-secondary mb-6 font-mono">{activeContext.examType}</p>
                        </div>
                        <button
                            onClick={onResumeSession}
                            className="bg-primary/10 hover:bg-primary/20 border border-primary/50 text-primary hover:text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95 duration-200 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            RESUME EXAM
                        </button>
                    </div>
                ) : (
                    <div className="hidden md:flex glass-panel rounded-xl p-6 opacity-50 items-center justify-center text-center border-dashed border-2 border-border">
                        <p className="text-xs font-mono text-text-tertiary">NO ACTIVE EXAM</p>
                    </div>
                )}

                <div className="glass-panel rounded-xl p-6 flex flex-col justify-between group hover:border-secondary/50 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-transparent"></div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Upload Material</h2>
                        <p className="text-xs text-text-secondary mb-6 font-mono">Start a new exam from PDF/Text.</p>
                    </div>
                    <button
                        onClick={onNewSession}
                        className="bg-gradient-to-r from-secondary to-indigo-600 hover:from-secondary hover:to-indigo-500 text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95 duration-200 shadow-lg shadow-secondary/20"
                    >
                        <BookOpen className="w-4 h-4" />
                        UPLOAD PDF
                    </button>
                </div>
            </div>

            {/* Data Stats Modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                    onClick={() => setShowXpModal(true)}
                    className="glass-panel p-5 rounded-xl hover:border-primary/50 transition-all duration-300 text-left group active:scale-95 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Cpu className="w-12 h-12 text-primary" />
                    </div>
                    <div className="flex items-center gap-2 text-primary mb-2 text-xs font-mono font-bold uppercase tracking-widest">
                        Total XP
                    </div>
                    <div className="text-3xl font-mono font-bold text-white group-hover:text-primary transition-colors tracking-tight">{user.xp.toLocaleString()}</div>
                    <div className="w-full h-1 bg-white/10 mt-3 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                    </div>
                </button>

                <button 
                    onClick={() => setShowLevelModal(true)}
                    className="glass-panel p-5 rounded-xl hover:border-emerald-500/50 transition-all duration-300 text-left group active:scale-95 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy className="w-12 h-12 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500 mb-2 text-xs font-mono font-bold uppercase tracking-widest">
                        Rank
                    </div>
                    <div className="text-3xl font-mono font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight">LVL {user.level}</div>
                    <div className="text-[10px] text-text-tertiary mt-2 font-mono">NEXT: {(user.level + 1) * 1000} XP</div>
                </button>

                <button 
                    onClick={() => setActiveTab('history')}
                    className="glass-panel p-5 rounded-xl hover:border-secondary/50 transition-all duration-300 text-left group active:scale-95 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <History className="w-12 h-12 text-secondary" />
                    </div>
                    <div className="flex items-center gap-2 text-secondary mb-2 text-xs font-mono font-bold uppercase tracking-widest">
                        Exams Taken
                    </div>
                    <div className="text-3xl font-mono font-bold text-white group-hover:text-secondary transition-colors tracking-tight">{user.history.length}</div>
                    <div className="text-[10px] text-text-tertiary mt-2 font-mono">VIEW HISTORY -></div>
                </button>
            </div>

            </div>

            {/* Right Column: AI Insight */}
            <div className="lg:col-span-1">
            <div className="glass-panel rounded-xl p-6 h-full flex flex-col relative overflow-hidden border-t-2 border-t-secondary/50">
                <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none"></div>
                
                <div className="flex items-center gap-2 mb-4 text-secondary relative z-10">
                    <Zap className="w-5 h-5" />
                    <h3 className="font-bold font-mono text-sm tracking-wider">MENTOR NOTES</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-8 flex-grow relative z-10 font-sans">
                    "Consistent practice is key. Based on your activity, I recommend reviewing your recent exam feedback and tackling the suggested revision tasks."
                </p>
                
                <div className="pt-6 border-t border-white/10 mt-auto relative z-10">
                    <h4 className="text-[10px] font-bold text-text-tertiary uppercase mb-3 font-mono tracking-widest">NEXT LEVEL PROGRESS</h4>
                    <div className="flex justify-between text-xs text-text-secondary mb-2 font-mono">
                        <span>L {user.level}</span>
                        <span>L {user.level + 1}</span>
                    </div>
                    <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className="h-full bg-gradient-to-r from-secondary to-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(139,92,246,0.5)]" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
            </div>
        </div>
      ) : (
        /* HISTORY TAB */
        <div className="glass-panel rounded-xl overflow-hidden animate-slide-up border-t border-primary/20">
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

      {/* Modals remain mostly same but with updated styles if needed */}
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
      
      {/* Level Modal - Similar update */}
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