import React, { useState, useEffect, memo, useCallback } from 'react';
import { Question, UserAnswer, QuestionType, ExamMode } from '../types';
import { Clock, ArrowRight, ArrowLeft, CheckCircle, HelpCircle, XCircle, Flag, Grid, List, Zap, Eye, Cpu, Activity, AlertTriangle } from 'lucide-react';

const ExamTimer = memo(({
    minutes,
    onTimeUp
}: {
    minutes: number,
    onTimeUp: () => void
}) => {
    const [timeLeft, setTimeLeft] = useState(minutes * 60);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [minutes, onTimeUp]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className={`
            flex items-center gap-3 px-4 py-2 rounded-lg border backdrop-blur-md transition-all
            ${timeLeft < 300
                ? 'border-red-500/50 bg-red-500/10 text-red-400 animate-pulse-slow shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                : 'border-primary/20 bg-black/40 text-primary shadow-[0_0_10px_rgba(6,182,212,0.1)]'}
        `}>
            <Clock className="w-4 h-4" />
            <span className="font-mono text-lg font-bold tracking-widest">{formatTime(timeLeft)}</span>
        </div>
    );
});

interface ExamInterfaceProps {
    questions: Question[];
    onComplete: (answers: UserAnswer[]) => void;
    isAnalyzing: boolean;
    timeLimitMinutes: number;
    timeLimitPerQuestionSeconds?: number;
    mode?: ExamMode;
    previousAnswers?: UserAnswer[];
}

const ExamInterface: React.FC<ExamInterfaceProps> = ({
    questions,
    onComplete,
    isAnalyzing,
    timeLimitMinutes,
    timeLimitPerQuestionSeconds,
    mode = ExamMode.PRACTICE,
    previousAnswers
}) => {
    const isReviewMode = mode === ExamMode.REVIEW;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<UserAnswer[]>(previousAnswers || []);
    const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
    const [showPalette, setShowPalette] = useState(false);
    const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(timeLimitPerQuestionSeconds || null);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
    const [textInput, setTextInput] = useState('');
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);

    // Safety check for empty questions
    const currentQuestion = questions[currentIndex];

    useEffect(() => {
        if (!currentQuestion) return;
        const existing = answers.find(a => a.questionId === currentQuestion.id);
        if (isReviewMode && existing) {
            setIsAnswerChecked(true);
            setTextInput(existing.textAnswer || '');
        }
    }, [currentIndex, isReviewMode, currentQuestion]);

    const existingAnswer = currentQuestion ? answers.find(a => a.questionId === currentQuestion.id) : undefined;

    useEffect(() => {
        if (isReviewMode) return;
        let interval: ReturnType<typeof setInterval>;
        if (timeLimitPerQuestionSeconds && !isAnswerChecked) {
            setQuestionTimeLeft(timeLimitPerQuestionSeconds);
            setIsTimeUp(false);
            interval = setInterval(() => {
                setQuestionTimeLeft(prev => {
                    if (prev === null) return null;
                    if (prev <= 1) {
                        clearInterval(interval);
                        setIsTimeUp(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [currentIndex, timeLimitPerQuestionSeconds, isAnswerChecked, isReviewMode]);

    useEffect(() => {
        if (isTimeUp && !isReviewMode) {
            handleAutoAdvance();
        }
    }, [isTimeUp]);

    useEffect(() => {
        setQuestionStartTime(Date.now());
        setIsTimeUp(false);
        if (!isReviewMode) setIsAnswerChecked(false);
        if (existingAnswer?.textAnswer) setTextInput(existingAnswer.textAnswer);
        else setTextInput('');
    }, [currentIndex, currentQuestion?.id]);

    // Handle final submission (either from button or time up)
    const performSubmission = (currentAns: UserAnswer[]) => {
        onComplete(currentAns);
    };

    const handleSubmitExam = () => {
        if (isReviewMode) {
            onComplete(answers);
            return;
        }
        if (!currentQuestion) return;

        if (!isAnswerChecked && currentQuestion.type !== QuestionType.MCQ && !isTimeUp) {
            const timeSpent = (Date.now() - questionStartTime) / 1000;
            const finalAns = {
                questionId: currentQuestion.id,
                textAnswer: textInput,
                timeSpentSeconds: timeSpent + (existingAnswer ? existingAnswer.timeSpentSeconds : 0)
            };
            const finalAnswers = answers.filter(a => a.questionId !== currentQuestion.id);
            finalAnswers.push(finalAns);
            performSubmission(finalAnswers);
        } else {
            performSubmission(answers);
        }
    };

    const handleForceSubmit = useCallback(() => {
        alert("Session Terminated: Time Limit Exceeded.");
        document.dispatchEvent(new CustomEvent('exam-time-up'));
    }, []);

    // Listen for the custom event to trigger submission with fresh state
    useEffect(() => {
        const handler = () => {
            // Logic to submit with current 'answers' state
            if (!isReviewMode) {
                onComplete(answers);
            }
        };
        document.addEventListener('exam-time-up', handler);
        return () => document.removeEventListener('exam-time-up', handler);
    }, [answers, isReviewMode, onComplete]);

    const handleAutoAdvance = () => {
        if (!currentQuestion) return;
        const timeSpent = (Date.now() - questionStartTime) / 1000;
        const newAnswer: UserAnswer = {
            questionId: currentQuestion.id,
            selectedOptionIndex: existingAnswer?.selectedOptionIndex,
            textAnswer: textInput,
            timeSpentSeconds: timeLimitPerQuestionSeconds || timeSpent
        };
        const updatedAnswers = answers.filter(a => a.questionId !== currentQuestion.id);
        updatedAnswers.push(newAnswer);
        setAnswers(updatedAnswers);
        if (currentIndex < questions.length - 1) {
            setTimeout(() => setCurrentIndex(prev => prev + 1), 500);
        } else {
            onComplete(updatedAnswers);
        }
    };

    const saveCurrentAnswer = (selectedIdx?: number, textVal?: string) => {
        if (isAnswerChecked || isTimeUp || isReviewMode || !currentQuestion) return;
        const timeSpent = (Date.now() - questionStartTime) / 1000;
        setAnswers(prev => {
            const filtered = prev.filter(a => a.questionId !== currentQuestion.id);
            return [...filtered, {
                questionId: currentQuestion.id,
                selectedOptionIndex: selectedIdx,
                textAnswer: textVal,
                timeSpentSeconds: timeSpent + (existingAnswer ? existingAnswer.timeSpentSeconds : 0)
            }];
        });
    };

    const toggleReviewMark = () => {
        if (!currentQuestion) return;
        setMarkedForReview(prev => {
            const newSet = new Set(prev);
            if (newSet.has(currentQuestion.id)) newSet.delete(currentQuestion.id);
            else newSet.add(currentQuestion.id);
            return newSet;
        });
    };

    const handleCheckAnswer = () => {
        if (isReviewMode || !currentQuestion) return;
        if (currentQuestion.type === QuestionType.MCQ && existingAnswer?.selectedOptionIndex === undefined) return;
        if (currentQuestion.type !== QuestionType.MCQ && !textInput.trim()) return;
        if (currentQuestion.type !== QuestionType.MCQ) saveCurrentAnswer(undefined, textInput);
        setIsAnswerChecked(true);
    };

    const navigateTo = (index: number) => {
        if (isTimeUp && !isReviewMode) return;
        if (!isAnswerChecked && currentQuestion?.type !== QuestionType.MCQ && !isReviewMode) {
            saveCurrentAnswer(undefined, textInput);
        }
        setCurrentIndex(index);
        setShowPalette(false);
    };

    if (!currentQuestion) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-background fade-in">
                <div className="p-8 glass-panel rounded-xl text-center border-red-500/30 border">
                    <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Questions Available</h3>
                    <p className="text-text-secondary">Please return to dashboard and generate a new exam.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden fade-in relative bg-background">

            {/* Tech Header */}
            <div className="h-20 border-b border-primary/20 bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20 relative">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setShowPalette(!showPalette)}
                        className={`p-2.5 rounded-lg transition-all active:scale-95 duration-200 border ${showPalette ? 'bg-primary/20 border-primary text-primary' : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/30'}`}
                    >
                        {showPalette ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                    </button>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Question</span>
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                        </div>
                        <div className="flex items-baseline gap-1 text-white">
                            <span className="text-2xl font-bold font-mono">{String(currentIndex + 1).padStart(2, '0')}</span>
                            <span className="text-sm text-text-tertiary font-mono">/ {String(questions.length).padStart(2, '0')}</span>
                        </div>
                    </div>

                    {isReviewMode && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/30 rounded text-xs font-bold text-secondary uppercase tracking-wider">
                            <Eye className="w-4 h-4" />
                            Read Only
                        </div>
                    )}
                </div>

                {!isReviewMode && (
                    <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <ExamTimer minutes={timeLimitMinutes} onTimeUp={handleForceSubmit} />
                    </div>
                )}

                <button
                    onClick={toggleReviewMark}
                    className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all active:scale-95 duration-200
                ${markedForReview.has(currentQuestion.id)
                            ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                            : 'text-text-secondary border border-white/10 hover:bg-white/5 hover:border-white/20'}
            `}
                >
                    <Flag className="w-4 h-4" />
                    <span className="hidden md:inline font-mono">{markedForReview.has(currentQuestion.id) ? 'FLAGGED' : 'FLAG'}</span>
                </button>
            </div>

            {/* Timer Bar */}
            {!isReviewMode && questionTimeLeft !== null && timeLimitPerQuestionSeconds && (
                <div className="w-full h-1 bg-surface relative shrink-0">
                    <div
                        className={`h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_currentColor] ${questionTimeLeft < 10 ? 'bg-red-500' : 'bg-primary'}`}
                        style={{ width: `${(questionTimeLeft / timeLimitPerQuestionSeconds) * 100}%` }}
                    />
                </div>
            )}

            {/* Info Genius Palette */}
            {showPalette && (
                <div className="absolute top-20 left-0 w-full md:w-80 h-[calc(100vh-144px)] glass-panel border-r border-primary/20 z-30 overflow-y-auto p-4 animate-in slide-in-from-left duration-200">
                    <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 font-mono border-b border-primary/20 pb-2">Question Palette</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {questions.map((q, idx) => {
                            const isAnswered = answers.some(a => a.questionId === q.id);
                            const isCurrent = idx === currentIndex;
                            const isMarked = markedForReview.has(q.id);

                            let baseClass = "h-10 rounded flex items-center justify-center text-xs font-mono font-bold border transition-all relative active:scale-95 duration-150";
                            if (isCurrent) baseClass += " border-primary bg-primary/20 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]";
                            else if (isMarked) baseClass += " border-yellow-500/50 bg-yellow-500/10 text-yellow-500";
                            else if (isAnswered) baseClass += " border-emerald-500/50 bg-emerald-500/10 text-emerald-500";
                            else baseClass += " border-white/5 bg-surface text-text-tertiary hover:border-white/20";

                            return (
                                <button key={q.id} onClick={() => navigateTo(idx)} className={baseClass}>
                                    {idx + 1}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden relative">

                {/* Left: Document View - Compact */}
                <div className="lg:w-1/2 p-5 md:p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/5 bg-black/40 custom-scrollbar scroll-smooth">
                    <div className="max-w-3xl mx-auto lg:mx-0">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex gap-2">
                                <span className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-text-secondary font-mono">
                                    {currentQuestion.type}
                                </span>
                                <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border font-mono
                            ${currentQuestion.difficulty === 'Hard' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-text-secondary'}
                        `}>
                                    {currentQuestion.difficulty}
                                </span>
                            </div>
                        </div>

                        <div className="prose prose-invert prose-base max-w-none">
                            <h1 className="text-lg md:text-xl font-medium text-white leading-relaxed font-sans">
                                {currentQuestion.text}
                            </h1>
                        </div>

                        {isReviewMode && (
                            <div className="mt-6 p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                    <Activity className="w-3.5 h-3.5" />
                                    <h3 className="text-[10px] font-bold uppercase font-mono tracking-wider">Correct Solution</h3>
                                </div>
                                {currentQuestion.type === QuestionType.MCQ ? (
                                    <p className="text-sm text-white">
                                        Correct: <span className="font-bold text-emerald-300 ml-2 border-b border-emerald-500/50">{currentQuestion.options?.[currentQuestion.correctAnswerIndex || 0]}</span>
                                    </p>
                                ) : (
                                    <div>
                                        <p className="text-[10px] text-text-secondary mb-1 font-mono">Model Answer:</p>
                                        <p className="text-sm text-emerald-200 italic leading-relaxed">{currentQuestion.modelAnswer}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Interaction Panel - Compact */}
                <div className="lg:w-1/2 p-5 md:p-6 overflow-y-auto bg-surface/30 custom-scrollbar scroll-smooth">
                    <div className="max-w-3xl mx-auto lg:mx-0">

                        {/* Options/Input */}
                        <div className={`space-y-3 ${isTimeUp && !isReviewMode ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                            {currentQuestion.type === QuestionType.MCQ && currentQuestion.options ? (
                                currentQuestion.options.map((option, idx) => {
                                    const isSelected = existingAnswer?.selectedOptionIndex === idx;
                                    let optionClass = "bg-surface/50 border-white/5 hover:border-primary/50 hover:bg-surface";
                                    let markerClass = "border-white/20 text-transparent";

                                    if (isAnswerChecked || isReviewMode) {
                                        if (idx === currentQuestion.correctAnswerIndex) {
                                            optionClass = "bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
                                            markerClass = "border-emerald-500 bg-emerald-500 text-black";
                                        } else if (isSelected) {
                                            optionClass = "bg-red-500/10 border-red-500";
                                            markerClass = "border-red-500 bg-red-500 text-black";
                                        }
                                    } else if (isSelected) {
                                        optionClass = "bg-primary/10 border-primary shadow-[0_0_15px_rgba(6,182,212,0.15)]";
                                        markerClass = "border-primary bg-primary text-black";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => saveCurrentAnswer(idx)}
                                            disabled={isAnswerChecked || isTimeUp || isReviewMode}
                                            className={`
                                        w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 group relative active:scale-[0.99] duration-150
                                        ${optionClass}
                                    `}
                                        >
                                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all font-bold text-[10px] ${markerClass}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={`text-sm leading-relaxed ${isSelected || ((isAnswerChecked || isReviewMode) && idx === currentQuestion.correctAnswerIndex) ? 'text-white font-medium' : 'text-text-secondary'}`}>
                                                {option}
                                            </span>
                                        </button>
                                    )
                                })
                            ) : (
                                <div className="relative group">
                                    <textarea
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        disabled={isAnswerChecked || isTimeUp || isReviewMode}
                                        placeholder="Write your answer here..."
                                        className={`
                                    w-full min-h-[200px] bg-black/30 border rounded-xl p-5 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none leading-relaxed font-mono text-sm transition-all
                                    ${(isAnswerChecked || isReviewMode) ? 'border-white/10 opacity-70' : 'border-white/10 hover:border-white/20'}
                                `}
                                        spellCheck={false}
                                    />
                                </div>
                            )}
                        </div>

                        {isTimeUp && !isReviewMode && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-medium flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span className="font-mono">Time Limit Reached</span>
                            </div>
                        )}

                        {(isAnswerChecked || isReviewMode) && (
                            <div className="mt-6 p-5 rounded-xl bg-secondary/5 border border-secondary/20 animate-in slide-in-from-bottom-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-secondary to-transparent"></div>
                                <div className="flex items-center gap-2 mb-2 text-secondary">
                                    <HelpCircle className="w-4 h-4" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest font-mono">Explanation</h3>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    {currentQuestion.explanation}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="h-16 border-t border-white/5 bg-background/90 backdrop-blur-md shrink-0 flex items-center justify-center px-4 z-20">
                <div className="w-full max-w-5xl flex justify-between items-center">

                    <button
                        onClick={() => navigateTo(currentIndex - 1)}
                        disabled={currentIndex === 0 || isAnalyzing || (isTimeUp && !isReviewMode)}
                        className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 rounded-lg transition-all active:scale-95 duration-200 disabled:opacity-30 disabled:active:scale-100 font-mono text-xs"
                    >
                        <ArrowLeft className="w-3.5 h-3" />
                        <span className="hidden md:inline">PREV</span>
                    </button>

                    <div className="flex gap-3">
                        {!isReviewMode && (
                            <button
                                onClick={handleCheckAnswer}
                                disabled={isAnswerChecked || isAnalyzing || isTimeUp}
                                className="hidden md:block px-5 py-2 text-white font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-lg transition-all active:scale-95 duration-200 disabled:opacity-50 text-xs uppercase tracking-wider"
                            >
                                Check
                            </button>
                        )}

                        {currentIndex === questions.length - 1 ? (
                            <button
                                onClick={handleSubmitExam}
                                disabled={isAnalyzing}
                                className="px-8 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primaryHover hover:to-blue-700 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95 duration-200 flex items-center gap-2"
                            >
                                {isReviewMode ? "Exit Review" : (isAnalyzing ? "Processing..." : "Finish Exam")}
                                {!isAnalyzing && <Cpu className="w-4 h-4" />}
                            </button>
                        ) : (
                            <button
                                onClick={() => navigateTo(currentIndex + 1)}
                                disabled={isAnalyzing || (isTimeUp && !isReviewMode)}
                                className="px-8 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primaryHover hover:to-blue-700 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95 duration-200 flex items-center gap-2"
                            >
                                NEXT
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamInterface;