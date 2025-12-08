
import React, { useState } from 'react';
import { UserProfile, SubjectContext, ExamHistoryItem } from '../types';
import { Play, TrendingUp, Trophy, History, BookOpen, Star, FastForward, Activity, Eye, RotateCcw, X, Lock, Unlock, BarChart, Calendar } from 'lucide-react';

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
  
  // Modals
  const [showXpModal, setShowXpModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);

  const nextLevelXp = user.level * 1000;
  const currentLevelXp = (user.level - 1) * 1000;
  const progress = ((user.xp - currentLevelXp) / 1000) * 100;

  return (
    <div className="max-w-6xl mx-auto mt-8 px-6 pb-12 fade-in relative">
      
      {/* Welcome Hero */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2 tracking-tight">
             Hello, {user.name}
            </h1>
            <p className="text-text-secondary text-lg">
             Ready to conquer <span className="text-primary font-semibold text-violet-400">{user.targetExam}</span>?
            </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-tertiary glass-panel px-4 py-2 rounded-full shadow-lg">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Status: </span>
            <span className="text-emerald-400 font-medium">Active Learner</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-medium transition-all duration-300 relative px-1 ${activeTab === 'overview' ? 'text-violet-400' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Overview
            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-full shadow-[0_-2px_10px_rgba(139,92,246,0.5)]" />}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-medium transition-all duration-300 relative px-1 ${activeTab === 'history' ? 'text-violet-400' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Exam History
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-t-full shadow-[0_-2px_10px_rgba(139,92,246,0.5)]" />}
          </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Stats & Action */}
            <div className="lg:col-span-2 space-y-6">
            
            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Resume Card (Conditional) */}
                {activeContext && onResumeSession ? (
                    <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20">
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Session Active</span>
                            </div>
                            <h2 className="text-xl font-bold text-text-primary mb-1 truncate">{activeContext.subjectName}</h2>
                            <p className="text-xs text-text-secondary mb-6">{activeContext.examType}</p>
                        </div>
                        <button
                            onClick={onResumeSession}
                            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-4 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 duration-200"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Resume Session
                        </button>
                    </div>
                ) : (
                    <div className="hidden md:flex glass-panel rounded-2xl p-6 opacity-60 items-center justify-center text-center border-dashed border-2 border-border">
                        <p className="text-sm text-text-tertiary">No active session.</p>
                    </div>
                )}

                {/* New Session Card */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between group hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-900/20 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-colors"></div>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-1">New Study Material</h2>
                        <p className="text-xs text-text-secondary mb-6">Upload PDF, generate syllabus, and start fresh.</p>
                    </div>
                    <button
                    onClick={onNewSession}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-3.5 rounded-xl font-bold shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 duration-200"
                    >
                    <BookOpen className="w-4 h-4" />
                    Import & Start
                    </button>
                </div>
            </div>

            {/* Stats Grid - Clickable */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* XP Card */}
                <button 
                    onClick={() => setShowXpModal(true)}
                    className="glass-panel p-5 rounded-2xl hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all duration-300 text-left group active:scale-95"
                >
                    <div className="flex items-center gap-2 text-text-tertiary mb-2 text-xs font-bold uppercase tracking-wider group-hover:text-yellow-500">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Total XP
                    </div>
                    <div className="text-3xl font-bold text-text-primary group-hover:text-white transition-colors">{user.xp.toLocaleString()}</div>
                    <div className="text-xs text-text-tertiary mt-1">Tap for details</div>
                </button>

                {/* Level Card */}
                <button 
                    onClick={() => setShowLevelModal(true)}
                    className="glass-panel p-5 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 text-left group active:scale-95"
                >
                    <div className="flex items-center gap-2 text-text-tertiary mb-2 text-xs font-bold uppercase tracking-wider group-hover:text-emerald-500">
                        <Trophy className="w-4 h-4 text-emerald-500" />
                        Current Level
                    </div>
                    <div className="text-3xl font-bold text-text-primary group-hover:text-white transition-colors">Lvl {user.level}</div>
                    <div className="text-xs text-text-tertiary mt-1">Next: {(user.level + 1) * 1000} XP</div>
                </button>

                {/* History Card */}
                <button 
                    onClick={() => setActiveTab('history')}
                    className="glass-panel p-5 rounded-2xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 text-left group active:scale-95"
                >
                    <div className="flex items-center gap-2 text-text-tertiary mb-2 text-xs font-bold uppercase tracking-wider group-hover:text-blue-500">
                        <History className="w-4 h-4 text-blue-500" />
                        Tests Taken
                    </div>
                    <div className="text-3xl font-bold text-text-primary group-hover:text-white transition-colors">{user.history.length}</div>
                    <div className="text-xs text-text-tertiary mt-1">View Full History</div>
                </button>
            </div>

            </div>

            {/* Right Column: Motivation/Tip */}
            <div className="lg:col-span-1">
            <div className="glass-panel rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                
                <div className="flex items-center gap-2 mb-4 text-violet-400 relative z-10">
                    <BookOpen className="w-5 h-5" />
                    <h3 className="font-semibold">Study Tip</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-8 flex-grow relative z-10">
                    "Spaced repetition is key. Don't just cram. Use the 'Revision Plan' feature after each exam to target your weak spots effectively."
                </p>
                
                <div className="pt-6 border-t border-white/10 mt-auto relative z-10">
                    <h4 className="text-xs font-bold text-text-tertiary uppercase mb-3">Level Progress</h4>
                    <div className="flex justify-between text-xs text-text-secondary mb-2">
                    <span>Lvl {user.level}</span>
                    <span>Lvl {user.level + 1}</span>
                    </div>
                    <div className="w-full h-2.5 bg-background rounded-full overflow-hidden border border-white/5">
                        <div 
                            className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(124,58,237,0.5)]" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-violet-400 mt-2 text-right font-medium">
                    {1000 - (user.xp % 1000)} XP to next level
                    </p>
                </div>
            </div>
            </div>
        </div>
      ) : (
        /* HISTORY TAB */
        <div className="glass-panel rounded-2xl overflow-hidden animate-slide-up">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-text-tertiary tracking-wider font-semibold">
                        <th className="p-5">Date</th>
                        <th className="p-5">Subject</th>
                        <th className="p-5 text-center">Score</th>
                        <th className="p-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {user.history.map((item) => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-5 text-sm text-text-secondary font-mono">
                                {new Date(item.date).toLocaleDateString()}
                            </td>
                            <td className="p-5 text-sm text-text-primary font-medium">
                                {item.subjectName}
                            </td>
                            <td className="p-5 text-center">
                                <span className={`
                                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold 
                                    ${item.score / item.totalQuestions >= 0.7 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}
                                `}>
                                    {Math.round((item.score / item.totalQuestions) * 100)}%
                                </span>
                            </td>
                            <td className="p-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => onViewPlan && onViewPlan(item.id)}
                                        className="p-2 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-500/50 rounded-lg text-text-secondary hover:text-cyan-400 transition-all active:scale-90" 
                                        title="View Revision Plan"
                                    >
                                        <Calendar className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onViewResult && onViewResult(item.id)}
                                        className="p-2 hover:bg-violet-500/20 border border-transparent hover:border-violet-500/50 rounded-lg text-text-secondary hover:text-violet-400 transition-all active:scale-90" 
                                        title="View Analysis"
                                    >
                                        <BarChart className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onReviewExam && onReviewExam(item.id)}
                                        className="p-2 hover:bg-blue-500/20 border border-transparent hover:border-blue-500/50 rounded-lg text-text-secondary hover:text-blue-400 transition-all active:scale-90" 
                                        title="Review Questions"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onRetakeExam && onRetakeExam(item.id)}
                                        className="p-2 hover:bg-emerald-500/20 border border-transparent hover:border-emerald-500/50 rounded-lg text-text-secondary hover:text-emerald-400 transition-all active:scale-90" 
                                        title="Retake Exam"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {user.history.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-12 text-center text-text-tertiary text-sm">
                                <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                No exam history available. Start a new session to build your record.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      )}

      {/* XP Modal */}
      {showXpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowXpModal(false)} />
            <div className="relative glass-panel w-full max-w-md rounded-2xl p-8 animate-slide-up border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                <button onClick={() => setShowXpModal(false)} className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary"><X className="w-5 h-5"/></button>
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                        <Star className="w-10 h-10 text-yellow-500 fill-current" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Total Experience</h2>
                    <div className="text-4xl font-black text-yellow-400 mb-6">{user.xp.toLocaleString()} <span className="text-lg text-yellow-500/70 font-medium">XP</span></div>
                    
                    <div className="w-full bg-surface rounded-lg p-4 border border-white/10 mb-6 text-left">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-text-secondary">Next Level Progress</span>
                            <span className="text-text-primary font-mono">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-text-tertiary mt-2">Earn XP by completing exams with high accuracy.</p>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Level Modal */}
      {showLevelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLevelModal(false)} />
            <div className="relative glass-panel w-full max-w-md rounded-2xl p-8 animate-slide-up border border-emerald-500/30">
                <button onClick={() => setShowLevelModal(false)} className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary"><X className="w-5 h-5"/></button>
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-emerald-500/50">
                        <Trophy className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-6">Level Guide</h2>
                    
                    <div className="w-full space-y-3">
                        <div className="flex items-center gap-4 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg">
                            <div className="font-bold text-emerald-400 w-8">Lvl {user.level}</div>
                            <div className="text-left text-sm">
                                <div className="text-white font-medium">Current Status</div>
                                <div className="text-emerald-300/70 text-xs">Active Learner</div>
                            </div>
                            <Unlock className="w-4 h-4 text-emerald-400 ml-auto" />
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-lg opacity-60">
                            <div className="font-bold text-text-tertiary w-8">Lvl {user.level + 1}</div>
                            <div className="text-left text-sm">
                                <div className="text-text-secondary font-medium">Scholar</div>
                                <div className="text-text-tertiary text-xs">Unlocks at {nextLevelXp} XP</div>
                            </div>
                            <Lock className="w-4 h-4 text-text-tertiary ml-auto" />
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-lg opacity-40">
                            <div className="font-bold text-text-tertiary w-8">Lvl {user.level + 5}</div>
                            <div className="text-left text-sm">
                                <div className="text-text-secondary font-medium">Master</div>
                                <div className="text-text-tertiary text-xs">Unlocks at {(user.level + 5) * 1000} XP</div>
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
