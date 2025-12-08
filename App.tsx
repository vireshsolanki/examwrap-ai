
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
import { Layers, Star, Menu, X, Home, PlusCircle, RotateCcw, BookOpen, User, LogOut, ChevronRight } from 'lucide-react';

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

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.ONBOARDING); 
  const [loadingState, setLoadingState] = useState<{msg: string, sub?: string} | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Init: Check Storage
  useEffect(() => {
    const profile = StorageService.loadUserProfile();
    if (profile) {
        setUserProfile(profile);
        setView(AppView.DASHBOARD);
    } else {
        setView(AppView.ONBOARDING);
    }
  }, []);

  const handleOnboardingComplete = (name: string, exam: string) => {
      const newProfile = StorageService.createUserProfile(name, exam);
      setUserProfile(newProfile);
      setView(AppView.DASHBOARD);
  };

  const handleUpload = async (content: string) => {
    setUploadedContent(content);
    setLoadingState({ msg: "Analyzing Document", sub: "Detecting subject matter and context..." });
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
    setLoadingState({ msg: "Constructing Syllabus", sub: "Mapping core concepts for " + context.subjectName + "..." });
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
    setLoadingState({ msg: "Generating Assessment", sub: "Synthesizing questions based on probability..." });
    try {
        const generatedQuestions = await GeminiService.generateExamQuestions(uploadedContent, topics, config, confirmedContext);
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
      
      if (filterIncorrect && userAnswers.length > 0) {
          const wrongQuestionIds = questions.filter((q, idx) => {
             const ans = userAnswers.find(a => a.questionId === q.id);
             if (q.type === 'MCQ') {
                 return ans?.selectedOptionIndex !== q.correctAnswerIndex;
             }
             return true; 
          }).map(q => q.id);

          const subsetQuestions = questions.filter(q => wrongQuestionIds.includes(q.id));
          
          if (subsetQuestions.length === 0) {
              alert("Great job! You got all MCQs correct. Starting a full retake instead.");
              setQuestions([...questions]); 
          } else {
              setQuestions(subsetQuestions);
          }
      } else {
          setQuestions([...questions]);
      }
      
      setView(AppView.EXAM);
  };

  // Logic to Review a Past Exam
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

  // Logic to Retake a Past Exam
  const handleRetakeHistory = (id: string) => {
      const record = StorageService.getFullExamRecord(id);
      if (record) {
          setQuestions(record.questions);
          setUserAnswers([]); // Clear answers for retake
          setExamMode(ExamMode.PRACTICE);
          setExamConfig(record.config);
          setView(AppView.EXAM);
      } else {
          alert("Could not load exam record.");
      }
  };

  const handleExamComplete = async (answers: UserAnswer[]) => {
    if (examMode === ExamMode.REVIEW) {
        setView(AppView.DASHBOARD);
        return;
    }

    setUserAnswers(answers);
    setLoadingState({ msg: "Evaluating Performance", sub: "Detecting patterns and gaps..." });
    try {
        const { result: examResult, plan: revisionPlan } = await GeminiService.analyzePerformance(questions, answers);
        
        if (confirmedContext && userProfile && examConfig) {
            const historyItem = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                subjectName: confirmedContext.subjectName,
                score: examResult.score,
                totalQuestions: examResult.totalQuestions
            };
            
            const fullRecord: FullExamRecord = {
                ...historyItem,
                examType: confirmedContext.examType,
                questions: questions,
                userAnswers: answers,
                result: examResult,
                config: examConfig
            };

            const updatedProfile = StorageService.addXpAndHistory(examResult.xpEarned, historyItem, fullRecord);
            setUserProfile(updatedProfile);
        }

        setResult(examResult);
        setPlan(revisionPlan);
        setView(AppView.RESULTS);
    } catch (e) {
        console.error(e);
        alert("Error analyzing results.");
    } finally {
        setLoadingState(null);
    }
  };

  const handleGenerateSummary = async () => {
    if (!confirmedContext) return;
    setLoadingState({ msg: "Summarizing Material", sub: "Compressing knowledge into key insights..." });
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

  const handleSmartResume = () => {
      setIsMenuOpen(false);
      // Smart Navigation Logic
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
          // Fallback if session data is missing but context exists
          setView(AppView.UPLOAD);
      }
  };

  const handleNewSession = () => {
      if (view !== AppView.DASHBOARD && confirmedContext) {
        if (!window.confirm("Start a new session? Your current progress will be lost.")) {
            return;
        }
      }
      handleEndSession(false); // Clean reset
      setIsMenuOpen(false);
  };

  const handleEndSession = (confirm = true) => {
      if (confirm && !window.confirm("Are you sure you want to end this session? All syllabus and question data will be cleared.")) {
          return;
      }
      setUploadedContent("");
      setSubjectAnalysis(null);
      setConfirmedContext(null);
      setTopics([]);
      setQuestions([]);
      setResult(null);
      setPlan(null);
      setView(AppView.UPLOAD);
      setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen font-sans bg-background text-text-primary">
        
        {loadingState && <LoadingScreen message={loadingState.msg} subMessage={loadingState.sub} />}

        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={handleNavigateToDashboard}>
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                        <Layers className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-lg tracking-tight">ExamWarp</span>
                </div>
                
                <div className="flex items-center gap-4">
                    {userProfile && (
                        <>
                             {/* Desktop Status */}
                             {confirmedContext && view !== AppView.DASHBOARD && view !== AppView.SUMMARY && (
                                <div className="hidden md:flex items-center gap-2 text-sm text-text-secondary border-r border-border pr-4">
                                    <span className="font-medium text-text-primary">{confirmedContext.subjectName}</span>
                                    <span className="text-xs bg-surface border border-border px-2 py-0.5 rounded">Active Session</span>
                                </div>
                             )}
                             
                             {/* XP Badge */}
                             <div 
                                className="hidden md:flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-full cursor-pointer hover:bg-background transition-colors"
                                onClick={handleNavigateToDashboard}
                             >
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                <span className="text-xs font-bold text-text-primary">{userProfile.xp} XP</span>
                             </div>

                             {/* Hamburger Menu Trigger */}
                             <button 
                                onClick={() => setIsMenuOpen(true)}
                                className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-colors"
                             >
                                 <Menu className="w-6 h-6" />
                             </button>
                        </>
                    )}
                </div>
            </div>
        </header>

        {/* Slide-out Menu Overlay */}
        {isMenuOpen && (
            <div className="fixed inset-0 z-50 flex justify-end">
                {/* Backdrop */}
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsMenuOpen(false)}
                />
                
                {/* Menu Drawer */}
                <div className="relative w-full max-w-sm bg-surface h-full shadow-2xl border-l border-border animate-in slide-in-from-right duration-300 flex flex-col">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <span className="font-semibold text-lg">Menu</span>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-background rounded-full transition-colors">
                            <X className="w-5 h-5 text-text-secondary" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* User Snapshot */}
                        {userProfile && (
                            <div className="bg-background border border-border rounded-xl p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-text-primary">{userProfile.name}</h3>
                                    <p className="text-xs text-text-secondary">{userProfile.targetExam}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" />
                                            {userProfile.xp} XP
                                        </span>
                                        <span className="text-xs text-text-tertiary">• Lvl {userProfile.level}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Links */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Navigation</h4>
                            
                            <button onClick={handleNavigateToDashboard} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors text-left group">
                                <Home className="w-5 h-5 text-text-secondary group-hover:text-primary" />
                                <span className="text-text-primary group-hover:text-primary font-medium">Dashboard</span>
                                <ChevronRight className="w-4 h-4 text-text-tertiary ml-auto" />
                            </button>

                            {confirmedContext && (
                                <button onClick={handleSmartResume} className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors text-left group">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    <div>
                                        <span className="text-primary font-medium block">Resume Session</span>
                                        <span className="text-xs text-text-secondary">{confirmedContext.subjectName}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-primary ml-auto" />
                                </button>
                            )}

                            <button onClick={handleNewSession} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors text-left group">
                                <PlusCircle className="w-5 h-5 text-text-secondary group-hover:text-emerald-500" />
                                <span className="text-text-primary group-hover:text-emerald-500 font-medium">New Session</span>
                            </button>
                            
                             <button onClick={handleNavigateToDashboard} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors text-left group">
                                <RotateCcw className="w-5 h-5 text-text-secondary group-hover:text-blue-500" />
                                <span className="text-text-primary group-hover:text-blue-500 font-medium">Exam History</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-6 border-t border-border bg-background/50">
                        {confirmedContext ? (
                             <button onClick={() => handleEndSession(true)} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-red-900/30 text-red-400 hover:bg-red-900/10 transition-colors">
                                <LogOut className="w-4 h-4" />
                                End Current Session
                            </button>
                        ) : (
                            <p className="text-center text-xs text-text-tertiary">ExamWarp AI v1.2</p>
                        )}
                    </div>
                </div>
            </div>
        )}

        <main className="w-full">
            <Suspense fallback={<LoadingScreen message="Initializing Module..." />}>
                
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
                        onRetakeExam={handleRetakeHistory}
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
                        onViewPlan={() => setView(AppView.REVISION)}
                        onSummarize={handleGenerateSummary}
                        onRetake={() => handleRetakeExam(false)}
                        onReattemptIncorrect={() => handleRetakeExam(true)}
                        isSummarizing={!!loadingState}
                    />
                )}

                {view === AppView.REVISION && plan && (
                    <RevisionPlan 
                        plan={plan} 
                        onReset={handleNavigateToDashboard} 
                    />
                )}

                {view === AppView.SUMMARY && (
                    <SummaryView 
                        summaryMarkdown={summaryMarkdown} 
                        onBack={handleNavigateToDashboard} 
                    />
                )}

            </Suspense>
        </main>
    </div>
  );
};

export default App;
