
import React, { useState, Suspense, useEffect, useRef, useCallback } from 'react';
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
    FullExamRecord,
    ExamPersona,
    ExamType,
    StudyLevel
} from './types';
import * as GeminiService from './services/geminiService';
import * as StorageService from './services/storageService';
import LoadingScreen from './components/LoadingScreen';
import { Layers, Star, Menu, X, Home, PlusCircle, RotateCcw, BookOpen, User, LogOut, ChevronRight, Cpu, ArrowLeft, Mail, ExternalLink, Heart } from 'lucide-react';

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
const BetaWarningModal = React.lazy(() => import('./components/BetaWarningModal'));
const PdfSummariser = React.lazy(() => import('./components/PdfSummariser'));

const App: React.FC = () => {
    const [view, setView] = useState<AppView>(AppView.ONBOARDING);
    const [loadingState, setLoadingState] = useState<{ msg: string, sub?: string } | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showTour, setShowTour] = useState(false);
    const [headerVisible, setHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);

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

    // Auto-hide header on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;
            if (currentY < 60) {
                setHeaderVisible(true);
            } else if (currentY > lastScrollY.current + 5) {
                setHeaderVisible(false);
            } else if (currentY < lastScrollY.current - 5) {
                setHeaderVisible(true);
            }
            lastScrollY.current = currentY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleOnboardingComplete = (name: string, exam: string, persona: ExamPersona, examType: ExamType, studyLevel: StudyLevel, examDate?: string, examCategoryId?: string, personaId?: string, toneId?: string) => {
        const newProfile = StorageService.createUserProfile(name, exam, persona, examType, studyLevel, examDate);
        // Store config fields
        if (examCategoryId || personaId || toneId) {
            newProfile.examCategoryId = examCategoryId;
            newProfile.personaId = personaId;
            newProfile.toneId = toneId;
            StorageService.saveUserProfile(newProfile);
        }
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
        // Inject user persona and exam context
        const contextWithPersona = {
            ...context,
            persona: userProfile?.persona || ExamPersona.UNIFIED,
            userExamType: userProfile?.examType,
            studyLevel: userProfile?.studyLevel
        };
        setConfirmedContext(contextWithPersona);
        setLoadingState({ msg: "Mapping Knowledge Graph", sub: "Constructing syllabus topology for " + context.subjectName + "..." });
        try {
            const syllabus = await GeminiService.generateSyllabus(uploadedContent, contextWithPersona);
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
            setConfirmedContext({
                subjectName: record.subjectName,
                examType: record.examType,
                persona: userProfile?.persona || ExamPersona.UNIFIED
            });

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
            setConfirmedContext({
                subjectName: record.subjectName,
                examType: record.examType,
                persona: userProfile?.persona || ExamPersona.UNIFIED
            });
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
            setConfirmedContext({
                subjectName: record.subjectName,
                examType: record.examType,
                persona: userProfile?.persona || ExamPersona.UNIFIED
            });
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
            if (!confirmedContext) throw new Error("No context available");
            const { result: examResult, plan: revisionPlan } = await GeminiService.analyzePerformance(questions, answers, confirmedContext);

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
        <div
            className="min-h-screen font-sans bg-background text-text-primary selection:bg-primary/30 selection:text-cyan-200 transition-colors duration-500"
            data-theme={userProfile?.persona?.toLowerCase() || 'unified'}
        >

            {loadingState && <LoadingScreen message={loadingState.msg} subMessage={loadingState.sub} />}
            {showTour && userProfile && <NeuralTour userName={userProfile.name} onComplete={handleTourComplete} />}
            <Suspense fallback={null}>
                <BetaWarningModal />
            </Suspense>

            {view !== AppView.ONBOARDING && (
                <>
                    <header className={`h-14 sm:h-16 glass-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 no-print ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {view !== AppView.DASHBOARD && (
                                    <button
                                        onClick={handleNavigateToDashboard}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-all border border-white/5 hover:border-white/20"
                                        title="Back to Dashboard"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                )}
                                <div className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform group" onClick={handleNavigateToDashboard}>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-shadow">
                                        <Cpu className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-base tracking-tight text-white leading-none uppercase">ExamWarp</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {userProfile && (
                                    <>
                                        {confirmedContext && view !== AppView.DASHBOARD && view !== AppView.SUMMARY && view !== AppView.NOTES_FORMATTER && view !== AppView.PDF_SUMMARISER && (
                                            <div className="hidden md:flex items-center gap-3 text-xs border-r border-white/10 pr-4">
                                                <span className="font-medium text-text-secondary">{confirmedContext.subjectName}</span>
                                            </div>
                                        )}

                                        <div
                                            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition-all active:scale-95 group"
                                            onClick={handleNavigateToDashboard}
                                        >
                                            <Star className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-bold text-white leading-none tracking-tight">{userProfile.xp.toLocaleString()} XP</span>
                                        </div>

                                        <button
                                            onClick={() => setIsMenuOpen(true)}
                                            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-text-secondary hover:text-white transition-all active:scale-90"
                                        >
                                            <Menu className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </header>
                    {/* Spacer for fixed header */}
                    <div className="h-14 sm:h-16 no-print" />
                </>
            )}

            {isMenuOpen && (
                <div className="fixed inset-0 z-[200] flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    <div className="relative w-full max-w-[320px] sm:max-w-xs bg-[#0d0d10] h-full border-l border-white/5 flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                <span className="font-bold text-[11px] text-white uppercase tracking-[0.15em]">Menu</span>
                            </div>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all active:scale-90">
                                <X className="w-5 h-5 text-text-tertiary hover:text-white" />
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto">
                            {/* User Profile */}
                            {userProfile && (
                                <div className="px-5 py-5 border-b border-white/5">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-[15px] text-white tracking-tight truncate">{userProfile.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-wider">
                                                    Lvl {userProfile.level}
                                                </span>
                                                <span className="text-[10px] text-text-tertiary font-medium">
                                                    {userProfile.xp.toLocaleString()} XP
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="px-4 py-4">
                                <h4 className="text-[9px] font-bold text-text-tertiary uppercase tracking-[0.2em] mb-3 px-1">Navigation</h4>

                                <nav className="space-y-1">
                                    <button onClick={() => { handleNavigateToDashboard(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all active:scale-[0.98] text-left group">
                                        <div className="p-2 rounded-lg bg-white/5 text-text-tertiary group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                            <Home className="w-4 h-4" />
                                        </div>
                                        <span className="text-[13px] text-text-secondary group-hover:text-white font-semibold transition-colors">Dashboard</span>
                                        <ChevronRight className="w-3.5 h-3.5 text-text-tertiary ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                                    </button>

                                    {confirmedContext && (
                                        <button onClick={() => { handleSmartResume(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/5 border border-primary/15 transition-all active:scale-[0.98] text-left group">
                                            <div className="p-2 rounded-lg bg-primary/15 text-primary">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[13px] text-primary font-semibold block">Resume Study</span>
                                                <span className="text-[10px] text-primary/50 font-medium truncate block">{confirmedContext.subjectName}</span>
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                                        </button>
                                    )}

                                    <button onClick={() => { handleNewSession(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all active:scale-[0.98] text-left group">
                                        <div className="p-2 rounded-lg bg-white/5 text-text-tertiary group-hover:text-emerald-400 group-hover:bg-emerald-400/10 transition-all">
                                            <PlusCircle className="w-4 h-4" />
                                        </div>
                                        <span className="text-[13px] text-text-secondary group-hover:text-white font-semibold transition-colors">New Practice Exam</span>
                                    </button>

                                    <button onClick={() => { setActiveRecordId(null); setView(AppView.DASHBOARD); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all active:scale-[0.98] text-left group">
                                        <div className="p-2 rounded-lg bg-white/5 text-text-tertiary group-hover:text-violet-400 group-hover:bg-violet-400/10 transition-all">
                                            <RotateCcw className="w-4 h-4" />
                                        </div>
                                        <span className="text-[13px] text-text-secondary group-hover:text-white font-semibold transition-colors">Exam History</span>
                                    </button>
                                </nav>
                            </div>

                            {/* Contact / Feedback */}
                            <div className="px-4 py-4 border-t border-white/5">
                                <h4 className="text-[9px] font-bold text-text-tertiary uppercase tracking-[0.2em] mb-3 px-1">Feedback & Support</h4>
                                <a
                                    href="mailto:vireshsolanki58@gmail.com"
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all active:scale-[0.98] text-left group"
                                >
                                    <div className="p-2 rounded-lg bg-white/5 text-text-tertiary group-hover:text-amber-400 group-hover:bg-amber-400/10 transition-all">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[13px] text-text-secondary group-hover:text-white font-semibold block">Send Feedback</span>
                                        <span className="text-[10px] text-text-tertiary truncate block">vireshsolanki58@gmail.com</span>
                                    </div>
                                    <ExternalLink className="w-3 h-3 text-text-tertiary opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                                </a>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-white/5 bg-white/[0.01] shrink-0 space-y-3">
                            {confirmedContext ? (
                                <button onClick={() => handleEndSession(true)} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all active:scale-95 font-bold text-xs">
                                    <LogOut className="w-4 h-4" />
                                    End Session
                                </button>
                            ) : null}
                            <div className="flex items-center justify-center gap-1.5 py-1">
                                <span className="text-[9px] text-text-tertiary font-medium tracking-wider">Made with</span>
                                <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                                <span className="text-[9px] text-text-tertiary font-medium tracking-wider">by Viresh</span>
                                <span className="text-[9px] text-text-tertiary font-medium">·</span>
                                <span className="text-[9px] text-primary font-bold tracking-wider">v1.0-beta</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="w-full pb-10">
                <Suspense fallback={<LoadingScreen message="Loading Prep Space..." />}>

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
                            onOpenPdfSummariser={() => setView(AppView.PDF_SUMMARISER)}
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

                    {view === AppView.PDF_SUMMARISER && (
                        <PdfSummariser
                            onBack={handleNavigateToDashboard}
                            examLabel={userProfile?.targetExam || 'General'}
                            defaultPersonaId={userProfile?.personaId || 'university_professor'}
                            defaultToneId={userProfile?.toneId || 'supportive'}
                        />
                    )}

                </Suspense>
            </main>
        </div>
    );
};

export default App;
