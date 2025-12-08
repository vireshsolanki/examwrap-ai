
import React, { useState } from 'react';
import { UserProfile, SubjectContext, ExamHistoryItem } from '../types';
import { Play, TrendingUp, Trophy, History, BookOpen, Star, FastForward, Activity, Eye, RotateCcw } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  onNewSession: () => void;
  activeContext?: SubjectContext | null;
  onResumeSession?: () => void;
  onReviewExam?: (id: string) => void;
  onRetakeExam?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNewSession, activeContext, onResumeSession, onReviewExam, onRetakeExam }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  return (
    <div className="max-w-6xl mx-auto mt-8 px-6 pb-12 fade-in">
      {/* Welcome Hero */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome back, {user.name}
            </h1>
            <p className="text-text-secondary">
            You are preparing for <span className="text-primary font-medium">{user.targetExam}</span>.
            </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-tertiary bg-surface border border-border px-3 py-1.5 rounded-full">
            <Activity className="w-4 h-4" />
            <span>Status: </span>
            <span className="text-emerald-500 font-medium">Active Learner</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'overview' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Overview
            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Exam History
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
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
                    <div className="bg-gradient-to-br from-emerald-900/20 to-surface border border-emerald-500/30 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FastForward className="w-24 h-24" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide">Session Active</span>
                            </div>
                            <h2 className="text-lg font-semibold text-text-primary mb-1 truncate">{activeContext.subjectName}</h2>
                            <p className="text-xs text-text-secondary mb-4">{activeContext.examType}</p>
                        </div>
                        <button
                            onClick={onResumeSession}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-medium shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Resume Session
                        </button>
                    </div>
                ) : (
                    <div className="hidden md:block bg-surface border border-border rounded-xl p-6 opacity-50 flex items-center justify-center text-center">
                        <p className="text-sm text-text-tertiary">No active session.</p>
                    </div>
                )}

                {/* New Session Card */}
                <div className="bg-gradient-to-br from-primary/10 to-surface border border-primary/30 rounded-xl p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary mb-1">New Study Material</h2>
                        <p className="text-xs text-text-secondary mb-4">Upload PDF, generate syllabus, and start fresh.</p>
                    </div>
                    <button
                    onClick={onNewSession}
                    className="bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-lg font-medium shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    >
                    <BookOpen className="w-4 h-4" />
                    Import & Start
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface border border-border p-5 rounded-lg hover:border-text-tertiary transition-colors">
                    <div className="flex items-center gap-2 text-text-tertiary mb-2 text-xs font-bold uppercase tracking-wider">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Total XP
                    </div>
                    <div className="text-2xl font-bold text-text-primary">{user.xp.toLocaleString()}</div>
                </div>
                <div className="bg-surface border border-border p-5 rounded-lg hover:border-text-tertiary transition-colors">
                    <div className="flex items-center gap-2 text-text-tertiary mb-2 text-xs font-bold uppercase tracking-wider">
                    <Trophy className="w-4 h-4 text-emerald-500" />
                    Current Level
                    </div>
                    <div className="text-2xl font-bold text-text-primary">Lvl {user.level}</div>
                </div>
                <div className="bg-surface border border-border p-5 rounded-lg hover:border-text-tertiary transition-colors">
                    <div className="flex items-center gap-2 text-text-tertiary mb-2 text-xs font-bold uppercase tracking-wider">
                    <History className="w-4 h-4 text-blue-500" />
                    Tests Taken
                    </div>
                    <div className="text-2xl font-bold text-text-primary">{user.history.length}</div>
                </div>
            </div>

            </div>

            {/* Right Column: Motivation/Tip */}
            <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-lg p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-primary">
                    <BookOpen className="w-5 h-5" />
                    <h3 className="font-semibold">Study Tip</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-6 flex-grow">
                    "Spaced repetition is key. Don't just cram. Use the 'Revision Plan' feature after each exam to target your weak spots effectively."
                </p>
                
                <div className="pt-6 border-t border-border mt-auto">
                    <h4 className="text-xs font-bold text-text-tertiary uppercase mb-3">Level Progress</h4>
                    <div className="flex justify-between text-xs text-text-secondary mb-1">
                    <span>Level {user.level}</span>
                    <span>Level {user.level + 1}</span>
                    </div>
                    <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary" 
                        style={{ width: `${(user.xp % 1000) / 10}%` }}
                    />
                    </div>
                    <p className="text-xs text-text-tertiary mt-2 text-right">
                    {1000 - (user.xp % 1000)} XP to next level
                    </p>
                </div>
            </div>
            </div>
        </div>
      ) : (
        /* HISTORY TAB */
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-background/50 border-b border-border text-xs uppercase text-text-tertiary tracking-wider font-semibold">
                        <th className="p-4">Date</th>
                        <th className="p-4">Subject</th>
                        <th className="p-4 text-center">Score</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {user.history.map((item) => (
                        <tr key={item.id} className="hover:bg-background/30 transition-colors group">
                            <td className="p-4 text-sm text-text-secondary font-mono">
                                {new Date(item.date).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-sm text-text-primary font-medium">
                                {item.subjectName}
                            </td>
                            <td className="p-4 text-center">
                                <span className={`
                                    inline-block px-2 py-0.5 rounded text-xs font-bold 
                                    ${item.score / item.totalQuestions >= 0.7 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}
                                `}>
                                    {Math.round((item.score / item.totalQuestions) * 100)}%
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => onReviewExam && onReviewExam(item.id)}
                                        className="p-1.5 hover:bg-background rounded text-text-secondary hover:text-primary transition-colors" title="Review"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onRetakeExam && onRetakeExam(item.id)}
                                        className="p-1.5 hover:bg-background rounded text-text-secondary hover:text-primary transition-colors" title="Retake"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {user.history.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-text-tertiary text-sm">
                                No exam history available. Start a new session to build your record.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
