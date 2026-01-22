
import React, { useState, Suspense, useEffect } from 'react';
import { 
  AppView, 
  Topic, 
  Question, 
  UserAnswer, 
  ExamResult, 
  RevisionPlan as RevisionPlanType,
  SubjectAnalysis,
  SubjectContext,
  ExamConfig as ConfigType,
  UserProfile,
  ExamMode,
  FullExamRecord
} from './types';
import * as GeminiService from './services/geminiService';
import * as StorageService from './services/storageService';
import LoadingScreen from './components/LoadingScreen';
import { Layers, Star, Menu, X, Home, PlusCircle, RotateCcw, BookOpen, User, LogOut, ChevronRight, Cpu } from 'lucide-react';

// Lazy Load Components
const FileUpload = React.lazy(() => import('./components/FileUpload'));
const SubjectVerifier = React.lazy(() => import('./components/SubjectVerifier'));
const ExamConfig = React.lazy(() => import('./components/ExamConfig'));
const ExamInterface = React.lazy(() => import('./components/ExamInterface'));
const ResultsDashboard = React.lazy(() => import('./components/ResultsDashboard'));
const RevisionPlan = React.lazy(() => import('./components/RevisionPlan'));
const SyllabusMap = React.lazy(() => import('./components/SyllabusMap'));
const Onboarding = React.lazy(() => import('./components/Onboarding'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const SummaryView = React.lazy(() => import('./components/SummaryView'));
const NotesFormatter = React.lazy(() => import('./components/NotesFormatter'));
const NeuralTour = React.lazy(() => import('./components/NeuralTour'));
const ExamExportView = React.lazy(() => import('./components/ExamExportView'));

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.ONBOARDING); 
  const [loadingState, setLoadingState] = useState<{msg: string, sub?: string} | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // User State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Data State
  const [uploadedContent, setUploadedContent] = useState<string>("");
  const [subjectAnalysis, setSubjectAnalysis] = useState<SubjectAnalysis | null>(null);
  const [confirmedContext, setConfirmedContext] = useState<SubjectContext | null>(null);
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]); 
  const [examConfig, setExamConfig] = useState<ConfigType | null>(null); 
  
  const [result, setResult] = useState<ExamResult | null>(null);
  const [plan, setPlan] = useState<RevisionPlanType | null>(null);
  const [summaryMarkdown, setSummaryMarkdown] = useState<string>("");

  // Exam Mode State (Practice or Review)
  const [examMode, setExamMode] = useState<ExamMode>(ExamMode.PRACTICE);

  // Persistent Revision State
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [revisionProgress, setRevisionProgress] = useState<string[]>([]);

  // Init: Check Storage
  useEffect(() => {
    const profile = StorageService.loadUserProfile();
    if (profile) {
        setUserProfile(profile);
        setView(AppView.DASHBOARD);
        if (profile.hasSeenTour === false) {
           setShowTour(true);
        }
    } else {
        setView(AppView.ONBOARDING);
    }
  }, []);

  const handleOnboardingComplete = (name: string, exam: string) => {
      const newProfile = StorageService.createUserProfile(name, exam);
      setUserProfile(newProfile);
      setView(AppView.DASHBOARD);
      setShowTour(true);
  };

  const handleTourComplete = () => {
     setShowTour(false);
     const updated = StorageService.setHasSeenTour(true);
     if (updated) setUserProfile(updated);
  };

  const handleUpload = async (content: string) => {
    setUploadedContent(content);
    setLoadingState({ msg: "Analyzing Data Stream", sub: "Parsing content structure and context..." });
    try {
        const analysis = await GeminiService.identifySubject(content);
        setSubjectAnalysis(analysis);
        setView(AppView.VERIFY_SUBJECT); 
    } catch (e) {
        console.error(e);
        alert("Error analyzing content.");
    } finally {
        setLoadingState(null);
    }
  };

  const handleSubjectConfirmed = async (context: SubjectContext) => {
    setConfirmedContext(context);
    setLoadingState({ msg: "Mapping Knowledge Graph", sub: "Constructing syllabus topology for " + context.subjectName + "..." });
    try {
        const syllabus = await GeminiService.generateSyllabus(uploadedContent, context);
        setTopics(syllabus);
        setView(AppView.SYLLABUS);
    } catch (e) {
        console.error(e);
        alert("Error generating syllabus.");
    } finally {
        setLoadingState(null);
    }
  };

  const handleSyllabusConfirm = () => {
      setView(AppView.CONFIG);
  };

  const handleStartExam = async (config: ConfigType) => {
    if (!confirmedContext) return;
    setExamConfig(config);
    setExamMode(ExamMode.PRACTICE);
    setLoadingState({ msg: "Synthesizing Assessment", sub: "Generating question matrix..." });
    try {
        const generatedQuestions = await GeminiService.generateExamQuestions(uploadedContent, topics, config, confirmedContext);
        if (!generatedQuestions || generatedQuestions.length === 0) {
            alert("The AI could not generate valid questions from the content.");
            setLoadingState(null);
            return;
        }
        setQuestions(generatedQuestions);
        setView(AppView.EXAM);
    } catch (e) {
        console.error(e);
        alert("Error generating exam.");
    } finally {
        setLoadingState(null);
    }
  };

  const handleRetakeExam = (filterIncorrect: boolean = false) => {
      setResult(null);
      setPlan(null);
      setExamMode(ExamMode.PRACTICE);
      setActiveRecordId(null);
      
      if (filterIncorrect && userAnswers.length > 0) {
          const wrongQuestionIds = questions.filter((q) => {
             const ans = userAnswers.find(a => a.questionId === q.id);
             if (q.type === 'MCQ') {
                 return ans?.selectedOptionIndex !== q.correctAnswerIndex;
             }
             return true; 
          }).map(q => q.id);

          const subsetQuestions = questions.filter(q => wrongQuestionIds.includes(q.id));
          
          if (subsetQuestions.length === 0) {
              setQuestions([...questions]); 
          } else {
              setQuestions(subsetQuestions);
          }
      } else {
          setQuestions([...questions]);
      }
      
      setView(AppView.EXAM);
  };

  const handleReviewHistory = (id: string) => {
      const record = StorageService.getFullExamRecord(id);
      if (record) {
          setQuestions(record.questions);
          setUserAnswers(record.userAnswers);
          setExamMode(ExamMode.REVIEW);
          setExamConfig(record.config);
          setView(AppView.EXAM);
      } else {
          alert("Could not load exam record.");
      }
  };

  const handleViewResultHistory = (id: string) => {
      const record = StorageService.getFullExamRecord(id);
      if (record && record.result) {
          setResult(record.result);
          setPlan(record.plan || null);
          setQuestions(record.questions); 
          setExamConfig(record.config);
          setConfirmedContext({ subjectName: record.subjectName, examType: record.examType });
          
          setActiveRecordId(record.id);
          setRevisionProgress(record.revisionProgress || []);
          
          setView(AppView.RESULTS);
      } else {
          alert("Could not load full result details.");
      }
  };

  const handleViewPlanHistory = (id: string) => {
      const record = StorageService.getFullExamRecord(id);
      if (record && record.plan) {
          setPlan(record.plan);
          setActiveRecordId(record.id);
          setConfirmedContext({ subjectName: record.subjectName, examType: record.examType });
          setRevisionProgress(record.revisionProgress || []);
          setView(AppView.REVISION);
      } else {
          alert("No revision plan found for this exam.");
      }
  };

  const handleRevisionProgressUpdate = (taskId: string, isChecked: boolean) => {
      if (!activeRecordId) return;
      
      let newProgress = [...revisionProgress];
      if (isChecked) {
          if (!newProgress.includes(taskId)) newProgress.push(taskId);
      } else {
          newProgress = newProgress.filter(id => id !== taskId);
      }
      
      setRevisionProgress(newProgress);
      StorageService.updateExamRevisionProgress(activeRecordId, newProgress);
  };

  const handleRetakeHistory = (id: string) => {
      const record = StorageService.getFullExamRecord(id);
      if (record) {
          setQuestions(record.questions);
          setUserAnswers([]); 
          setExamMode(ExamMode.PRACTICE);
          setExamConfig(record.config);
          setConfirmedContext({ subjectName: record.subjectName, examType: record.examType });
          setActiveRecordId(null);
          setView(AppView.EXAM);
      } else {
          alert("Could not load exam record.");
      }
  };

  const handleDeleteExam = (id: string) => {
      const updatedProfile = StorageService.deleteExamRecord(id);
      if (updatedProfile) {
          setUserProfile(updatedProfile);
          if (activeRecordId === id) {
              setResult(null);
              setPlan(null);
              setActiveRecordId(null);
          }
      }
  };

  const handleExamComplete = async (answers: UserAnswer[]) => {
    if (examMode === ExamMode.REVIEW) {
        setView(AppView.DASHBOARD);
        return;
    }

    setUserAnswers(answers);
    setLoadingState({ msg: "Evaluating Performance", sub: "Calculating accuracy and identifying gaps..." });
    try {
        const { result: examResult, plan: revisionPlan } = await GeminiService.analyzePerformance(questions, answers);
        
        if (!examResult || !examResult.score && examResult.score !== 0) {
             throw new Error("Invalid analysis result");
        }

        const historyId = Date.now().toString();

        if (confirmedContext && userProfile && examConfig) {
            const historyItem = {
                id: historyId,
                date: new Date().toISOString(),
                subjectName: confirmedContext.subjectName,
                score: examResult.score || 0,
                totalQuestions: examResult.totalQuestions || questions.length
            };
            
            const fullRecord: FullExamRecord = {
                ...historyItem,
                examType: confirmedContext.examType,
                questions: questions,
                userAnswers: answers,
                result: examResult,
                config: examConfig,
                plan: revisionPlan,
                revisionProgress: []
            };

            const updatedProfile = StorageService.addXpAndHistory(examResult.xpEarned || 0, historyItem, fullRecord);
            setUserProfile(updatedProfile);
        }

        setResult(examResult);
        setPlan(revisionPlan);
        setActiveRecordId(historyId); 
        setRevisionProgress([]);
        setView(AppView.RESULTS);
    } catch (e) {
        console.error(e);
        alert("Error analyzing results. Please try again.");
    } finally {
        setLoadingState(null);
    }
  };

  const handleGenerateCustomPlan = async (days: number) => {
      if (!result || !confirmedContext || !activeRecordId) return;
      
      setLoadingState({ msg: `Designing ${days}-Day Schedule`, sub: "Tailoring tasks to your timeline..." });
      try {
          const newPlan = await GeminiService.regenerateRevisionPlan(
              result.weakTopics, 
              result.conceptGaps, 
              days, 
              confirmedContext
          );
          
          setPlan(newPlan);
          
          const record = StorageService.getFullExamRecord(activeRecordId);
          if (record) {
              record.plan = newPlan;
              record.revisionProgress = [];
              StorageService.saveFullExamRecord(record);
              setRevisionProgress([]);
          }
          
          setView(AppView.REVISION);
      } catch (e) {
          console.error(e);
          alert("Failed to regenerate plan.");
      } finally {
          setLoadingState(null);
      }
  };

  const handleGenerateSummary = async () => {
    if (!confirmedContext) return;
    setLoadingState({ msg: "Generating Intelligence Brief", sub: "Compressing key data points..." });
    try {
        const summary = await GeminiService.generateSmartSummary(uploadedContent, confirmedContext);
        setSummaryMarkdown(summary);
        setView(AppView.SUMMARY);
    } catch (e) {
        console.error(e);
        alert("Failed to generate summary.");
    } finally {
        setLoadingState(null);
    }
  };

  const handleNavigateToDashboard = () => {
      setView(AppView.DASHBOARD);
      setIsMenuOpen(false);
  };

  const handleSummaryBack = () => {
      if (result) {
          setView(AppView.RESULTS);
      } else {
          setView(AppView.DASHBOARD);
      }
  };

  const handleSmartResume = () => {
      setIsMenuOpen(false);
      if (result) {
          setView(AppView.RESULTS);
      } else if (questions.length > 0) {
          setView(AppView.EXAM);
      } else if (topics.length > 0) {
          setView(AppView.SYLLABUS);
      } else if (confirmedContext) {
          setView(AppView.CONFIG);
      } else if (subjectAnalysis) {
          setView(AppView.VERIFY_SUBJECT);
      } else {
          setView(AppView.UPLOAD);
      }
  };

  const handleNewSession = () => {
      if (view !== AppView.DASHBOARD && confirmedContext) {
        if (!window.confirm("Start new session? Current progress will be lost.")) {
            return;
        }
      }
      handleEndSession(false); 
      setIsMenuOpen(false);
  };

  const handleEndSession = (confirm = true) => {
      if (confirm && !window.confirm("End current session? All data will be cleared.")) {
          return;
      }
      setUploadedContent("");
      setSubjectAnalysis(null);
      setConfirmedContext(null);
      setTopics([]);
      setQuestions([]);
      setResult(null);
      setPlan(null);
      setActiveRecordId(null);
      setRevisionProgress([]);
      setView(AppView.UPLOAD);
      setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen font-sans bg-background text-text-primary selection:bg-primary/30 selection:text-cyan-200">
        
        {loadingState && <LoadingScreen message={loadingState.msg} subMessage={loadingState.sub} />}
        {showTour && userProfile && <NeuralTour userName={userProfile.name} onComplete={handleTourComplete} />}

        <header className="h-16 glass-header sticky top-0 z-40 transition-all duration-300 border-b border-primary/20 no-print">
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform group" onClick={handleNavigateToDashboard}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-shadow">
                        <Cpu className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg tracking-tight text-white leading-none uppercase">ExamWarp</span>
                        <span className="text-[10px] text-primary font-mono tracking-widest leading-none">AI CORE</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {userProfile && (
                        <>
                             {confirmedContext && view !== AppView.DASHBOARD && view !== AppView.SUMMARY && view !== AppView.NOTES_FORMATTER && (
                                <div className="hidden md:flex items-center gap-3 text-sm border-r border-white/10 pr-4">
                                    <span className="font-medium text-text-secondary">{confirmedContext.subjectName}</span>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        Active
                                    </div>
                                </div>
                             )}
                             
                             <div 
                                className="hidden md:flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-md cursor-pointer hover:border-primary/50 transition-all active:scale-95 group shadow-sm"
                                onClick={handleNavigateToDashboard}
                             >
                                <Star className="w-3.5 h-3.5 text-primary fill-current group-hover:rotate-12 transition-transform" />
                                <span className="text-xs font-bold text-white font-mono">{userProfile.xp} XP</span>
                             </div>

                             <button 
                                onClick={() => setIsMenuOpen(true)}
                                className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors active:scale-90"
                             >
                                 <Menu className="w-6 h-6" />
                             </button>
                        </>
                    )}
                </div>
            </div>
        </header>

        {isMenuOpen && (
            <div className="fixed inset-0 z-50 flex justify-end">
                <div 
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setIsMenuOpen(false)}
                />
                
                <div className="relative w-full max-w-sm glass-panel h-full border-l border-primary/20 animate-in slide-in-from-right duration-300 flex flex-col shadow-2xl">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
                        <span className="font-bold text-lg text-white font-mono tracking-wide">SYSTEM MENU</span>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90">
                            <X className="w-5 h-5 text-text-secondary" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {userProfile && (
                            <div className="bg-gradient-to-br from-surface to-black border border-border rounded-xl p-5 flex items-center gap-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
                                <div className="w-12 h-12 rounded-lg bg-surface border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-white text-lg">{userProfile.name}</h3>
                                    <p className="text-xs text-text-secondary mb-1">{userProfile.targetExam}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 font-mono">
                                            LVL {userProfile.level}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-3 px-2 font-mono">Navigation</h4>
                            
                            <button onClick={handleNavigateToDashboard} className="w-full flex items-center gap-3 p-3.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all active:scale-95 text-left group">
                                <Home className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                                <span className="text-text-primary group-hover:text-white font-medium transition-colors">Dashboard</span>
                                <ChevronRight className="w-4 h-4 text-text-tertiary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>

                            {confirmedContext && (
                                <button onClick={handleSmartResume} className="w-full flex items-center gap-3 p-3.5 rounded-lg bg-primary/10 hover:bg-primary/15 border border-primary/30 transition-all active:scale-95 text-left group shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    <div>
                                        <span className="text-primary font-bold block text-sm">Resume Session</span>
                                        <span className="text-[10px] text-primary/70 uppercase tracking-wide">{confirmedContext.subjectName}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-primary ml-auto" />
                                </button>
                            )}

                            <button onClick={handleNewSession} className="w-full flex items-center gap-3 p-3.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all active:scale-95 text-left group">
                                <PlusCircle className="w-5 h-5 text-text-secondary group-hover:text-emerald-400 transition-colors" />
                                <span className="text-text-primary group-hover:text-white font-medium transition-colors">New Session</span>
                            </button>
                            
                             <button onClick={handleNavigateToDashboard} className="w-full flex items-center gap-3 p-3.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all active:scale-95 text-left group">
                                <RotateCcw className="w-5 h-5 text-text-secondary group-hover:text-secondary transition-colors" />
                                <span className="text-text-primary group-hover:text-white font-medium transition-colors">Exam History</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 bg-black/40">
                        {confirmedContext ? (
                             <button onClick={() => handleEndSession(true)} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all active:scale-95 font-medium text-sm">
                                <LogOut className="w-4 h-4" />
                                End Current Session
                            </button>
                        ) : (
                            <p className="text-center text-[10px] text-text-tertiary font-mono">ExamWarp Intelligence Core • v3.0</p>
                        )}
                    </div>
                </div>
            </div>
        )}

        <main className="w-full pb-10">
            <Suspense fallback={<LoadingScreen message="Initializing Subsystems..." />}>
                
                {view === AppView.ONBOARDING && (
                    <Onboarding onComplete={handleOnboardingComplete} />
                )}

                {view === AppView.DASHBOARD && userProfile && (
                    <Dashboard 
                        user={userProfile} 
                        onNewSession={() => setView(AppView.UPLOAD)} 
                        activeContext={confirmedContext}
                        onResumeSession={handleSmartResume}
                        onReviewExam={handleReviewHistory}
                        onViewResult={handleViewResultHistory}
                        onRetakeExam={handleRetakeHistory}
                        onViewPlan={handleViewPlanHistory}
                        onOpenNotesFormatter={() => setView(AppView.NOTES_FORMATTER)}
                        onDeleteExam={handleDeleteExam}
                    />
                )}

                {view === AppView.UPLOAD && <FileUpload onUpload={handleUpload} isLoading={!!loadingState} />}
                
                {view === AppView.VERIFY_SUBJECT && subjectAnalysis && (
                    <SubjectVerifier 
                        initialAnalysis={subjectAnalysis}
                        onConfirm={handleSubjectConfirmed}
                    />
                )}

                {view === AppView.SYLLABUS && confirmedContext && (
                    <SyllabusMap 
                        topics={topics} 
                        onStartExam={handleSyllabusConfirm} 
                        isGenerating={false} 
                    />
                )}

                {view === AppView.CONFIG && confirmedContext && (
                    <ExamConfig 
                        analysis={confirmedContext} 
                        topics={topics} 
                        onStart={handleStartExam} 
                    />
                )}

                {view === AppView.EXAM && examConfig && (
                    <ExamInterface 
                        questions={questions} 
                        onComplete={handleExamComplete} 
                        isAnalyzing={!!loadingState}
                        timeLimitMinutes={examConfig.timeLimitMinutes}
                        timeLimitPerQuestionSeconds={examConfig.timeLimitPerQuestionSeconds}
                        mode={examMode}
                        previousAnswers={userAnswers}
                    />
                )}

                {view === AppView.RESULTS && result && (
                    <ResultsDashboard 
                        result={result} 
                        onViewPlan={handleGenerateCustomPlan}
                        onSummarize={handleGenerateSummary}
                        onRetake={() => handleRetakeExam(false)}
                        onReattemptIncorrect={() => handleRetakeExam(true)}
                        onExportExam={() => setView(AppView.EXAM_EXPORT)}
                        isSummarizing={!!loadingState}
                    />
                )}

                {view === AppView.REVISION && plan && (
                    <RevisionPlan 
                        plan={plan} 
                        onReset={handleNavigateToDashboard} 
                        context={confirmedContext}
                        completedTasks={revisionProgress}
                        onToggleTask={handleRevisionProgressUpdate}
                    />
                )}

                {view === AppView.SUMMARY && (
                    <SummaryView 
                        summaryMarkdown={summaryMarkdown} 
                        onBack={handleSummaryBack} 
                    />
                )}
                
                {view === AppView.NOTES_FORMATTER && (
                    <NotesFormatter onBack={handleNavigateToDashboard} />
                )}

                {view === AppView.EXAM_EXPORT && confirmedContext && (
                    <ExamExportView 
                      questions={questions} 
                      onBack={() => setView(AppView.RESULTS)} 
                      subjectName={confirmedContext.subjectName}
                    />
                )}

            </Suspense>
        </main>
    </div>
  );
};

export default App;
