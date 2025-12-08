import React, { useState, useEffect, useRef, memo } from 'react';
import { Question, UserAnswer, Difficulty, QuestionType, ExamMode } from '../types';
import { Clock, ArrowRight, ArrowLeft, CheckCircle, HelpCircle, XCircle, Flag, Grid, List, Zap, Eye } from 'lucide-react';

// Memoized Timer Component to prevent parent re-renders
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
            flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-lg transition-colors
            ${timeLeft < 300 
                ? 'border-red-500/30 bg-red-500/10 text-red-400 animate-pulse' 
                : 'border-white/10 bg-black/40 text-text-secondary'}
        `}>
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm font-bold">{formatTime(timeLeft)}</span>
        </div>
    );
});

interface ExamInterfaceProps {
  questions: Question[];
  onComplete: (answers: UserAnswer[]) => void;
  isAnalyzing: boolean;
  timeLimitMinutes: number;
  timeLimitPerQuestionSeconds?: number;
  mode?: ExamMode; // Default is PRACTICE
  previousAnswers?: UserAnswer[]; // For Review Mode
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
  
  // Per Question Timer State
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(timeLimitPerQuestionSeconds || null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  // Question Metadata State
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [textInput, setTextInput] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  const currentQuestion = questions[currentIndex];
  const existingAnswer = answers.find(a => a.questionId === currentQuestion.id);

  // Initialize view for review mode
  useEffect(() => {
      if (isReviewMode && existingAnswer) {
          setIsAnswerChecked(true);
          setTextInput(existingAnswer.textAnswer || '');
      }
  }, [currentIndex, isReviewMode]);

  // Per Question Timer Logic
  useEffect(() => {
    if (isReviewMode) return;

    let interval: NodeJS.Timeout;

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

    return () => {
        if (interval) clearInterval(interval);
    };
  }, [currentIndex, timeLimitPerQuestionSeconds, isAnswerChecked, isReviewMode]);

  // Handle Auto-Advance when Time is Up
  useEffect(() => {
      if (isTimeUp && !isReviewMode) {
          handleAutoAdvance();
      }
  }, [isTimeUp]);

  // Question Transition Effect
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setIsTimeUp(false);
    
    // In practice mode, reset checked state unless already answered (allows returning)
    if (!isReviewMode) {
         setIsAnswerChecked(false);
    }
    
    if (existingAnswer?.textAnswer) {
      setTextInput(existingAnswer.textAnswer);
    } else {
      setTextInput('');
    }
  }, [currentIndex, currentQuestion.id]);

  const handleForceSubmit = () => {
      alert("Total exam time is up! Submitting your exam.");
      handleSubmitExam();
  };

  const handleAutoAdvance = () => {
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
    if (isAnswerChecked || isTimeUp || isReviewMode) return; 

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
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) newSet.delete(currentQuestion.id);
      else newSet.add(currentQuestion.id);
      return newSet;
    });
  };

  const handleCheckAnswer = () => {
    if (isReviewMode) return;

    if (currentQuestion.type === QuestionType.MCQ && existingAnswer?.selectedOptionIndex === undefined) {
      alert("Please select an option first.");
      return;
    }
    if (currentQuestion.type !== QuestionType.MCQ && !textInput.trim()) {
      alert("Please type an answer first.");
      return;
    }
    
    if (currentQuestion.type !== QuestionType.MCQ) {
        saveCurrentAnswer(undefined, textInput);
    }

    setIsAnswerChecked(true);
  };

  const navigateTo = (index: number) => {
     if (isTimeUp && !isReviewMode) return; 

     if (!isAnswerChecked && currentQuestion.type !== QuestionType.MCQ && !isReviewMode) {
         saveCurrentAnswer(undefined, textInput);
     }
     setCurrentIndex(index);
     setShowPalette(false);
  };

  const handleSubmitExam = () => {
     if (isReviewMode) {
         onComplete(answers); // Just close
         return;
     }

     if (!isAnswerChecked && currentQuestion.type !== QuestionType.MCQ && !isTimeUp) {
        const timeSpent = (Date.now() - questionStartTime) / 1000;
        const finalAns = {
            questionId: currentQuestion.id,
            textAnswer: textInput,
            timeSpentSeconds: timeSpent + (existingAnswer ? existingAnswer.timeSpentSeconds : 0)
        };
        const finalAnswers = answers.filter(a => a.questionId !== currentQuestion.id);
        finalAnswers.push(finalAns);
        onComplete(finalAnswers);
     } else {
        onComplete(answers);
     }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden fade-in relative">
      
      {/* Header Bar */}
      <div className="h-16 border-b border-white/5 bg-surface/30 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 shrink-0 z-20 relative shadow-sm">
        <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowPalette(!showPalette)}
                className={`p-2 rounded-xl transition-all active:scale-95 duration-200 ${showPalette ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
                title="Question Palette"
             >
                 {showPalette ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
             </button>
             <div className="h-6 w-px bg-white/10 mx-2 hidden md:block"></div>
             <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                 <span className="text-sm font-medium text-white">Question {currentIndex + 1}</span>
                 <span className="text-xs text-text-tertiary hidden md:inline">of {questions.length}</span>
             </div>
             {isReviewMode && (
                 <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded-full uppercase border border-yellow-500/20 tracking-wider">
                     Review Mode
                 </span>
             )}
        </div>

        {/* Total Timer (Hidden in Review) */}
        {!isReviewMode && (
            <ExamTimer minutes={timeLimitMinutes} onTimeUp={handleForceSubmit} />
        )}

        <button
            onClick={toggleReviewMark}
            className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95 duration-200
                ${markedForReview.has(currentQuestion.id) ? 'text-yellow-500 bg-yellow-500/10 border border-yellow-500/30' : 'text-text-secondary hover:text-white hover:bg-white/5 border border-transparent'}
            `}
        >
            <Flag className={`w-4 h-4 ${markedForReview.has(currentQuestion.id) ? 'fill-current' : ''}`} />
            <span className="hidden md:inline">{markedForReview.has(currentQuestion.id) ? 'Marked' : 'Mark'}</span>
        </button>
      </div>

      {/* Per Question Progress Bar */}
      {!isReviewMode && questionTimeLeft !== null && timeLimitPerQuestionSeconds && (
        <div className="w-full h-1 bg-black/50 relative shrink-0">
            <div 
                className={`h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_currentColor] ${questionTimeLeft < 10 ? 'bg-red-500' : 'bg-violet-500'}`}
                style={{ width: `${(questionTimeLeft / timeLimitPerQuestionSeconds) * 100}%` }}
            />
        </div>
      )}

      {/* Palette Overlay */}
      {showPalette && (
          <div className="absolute top-16 left-0 w-full md:w-80 h-[calc(100vh-128px)] glass-panel border-r border-white/10 z-30 overflow-y-auto p-4 shadow-2xl animate-in slide-in-from-left duration-200">
              <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-4 px-1">Question Navigator</h3>
              <div className="grid grid-cols-4 gap-2">
                  {questions.map((q, idx) => {
                      const isAnswered = answers.some(a => a.questionId === q.id);
                      const isCurrent = idx === currentIndex;
                      const isMarked = markedForReview.has(q.id);
                      
                      let baseClass = "h-10 rounded-lg flex items-center justify-center text-xs font-medium border transition-all relative active:scale-95 duration-150";
                      if (isCurrent) baseClass += " border-violet-500 text-white ring-2 ring-violet-500/20 bg-violet-600/20 font-bold";
                      else if (isMarked) baseClass += " border-yellow-500/50 bg-yellow-500/10 text-yellow-500";
                      else if (isAnswered) baseClass += " border-emerald-500/50 bg-emerald-500/10 text-emerald-500";
                      else baseClass += " border-white/5 bg-white/5 text-text-secondary hover:border-white/20 hover:bg-white/10";

                      return (
                          <button key={q.id} onClick={() => navigateTo(idx)} className={baseClass}>
                              {idx + 1}
                              {isMarked && <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]" />}
                          </button>
                      )
                  })}
              </div>
          </div>
      )}

      {/* Split Screen Layout */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Panel: Question Text (Scrollable) */}
        <div className="lg:w-1/2 p-6 md:p-10 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/5 bg-black/20 custom-scrollbar scroll-smooth will-change-transform">
             <div className="max-w-2xl mx-auto lg:mx-0">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2">
                        <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-text-secondary">
                            {currentQuestion.type}
                        </span>
                        <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-text-secondary">
                            {currentQuestion.difficulty}
                        </span>
                    </div>
                    {!isReviewMode && questionTimeLeft !== null && (
                        <div className={`flex items-center gap-1.5 text-xs font-mono font-medium ${questionTimeLeft < 10 ? 'text-red-400' : 'text-text-tertiary'}`}>
                            <Zap className="w-3.5 h-3.5" />
                            {isTimeUp ? "TIME UP" : `${questionTimeLeft}s`}
                        </div>
                    )}
                </div>

                <h1 className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-6 font-serif">
                    {currentQuestion.text}
                </h1>
                
                {isReviewMode && (
                    <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                            <Eye className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase">Answer Key</h3>
                        </div>
                        {currentQuestion.type === QuestionType.MCQ ? (
                            <p className="text-sm text-white">
                                Correct Option: <span className="font-semibold text-emerald-300">{currentQuestion.options?.[currentQuestion.correctAnswerIndex || 0]}</span>
                            </p>
                        ) : (
                            <div>
                                <p className="text-xs text-text-secondary mb-1">Model Answer:</p>
                                <p className="text-sm text-emerald-200 italic">{currentQuestion.modelAnswer}</p>
                            </div>
                        )}
                    </div>
                )}
             </div>
        </div>

        {/* Right Panel: Inputs & Explanation (Scrollable) */}
        <div className="lg:w-1/2 p-6 md:p-10 overflow-y-auto bg-surface/30 custom-scrollbar scroll-smooth will-change-transform">
            <div className="max-w-2xl mx-auto lg:mx-0">
                
                {/* Inputs */}
                <div className={`space-y-4 ${isTimeUp && !isReviewMode ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    {currentQuestion.type === QuestionType.MCQ && currentQuestion.options ? (
                        currentQuestion.options.map((option, idx) => {
                            const isSelected = existingAnswer?.selectedOptionIndex === idx;
                            let optionClass = "bg-white/5 border-white/10 hover:border-violet-500/50 hover:bg-white/10";
                            let iconClass = "border-text-tertiary";
                            
                            if (isAnswerChecked || isReviewMode) {
                                if (idx === currentQuestion.correctAnswerIndex) {
                                    optionClass = "bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                                    iconClass = "border-emerald-500 bg-emerald-500 text-white";
                                } else if (isSelected) {
                                    optionClass = "bg-red-500/20 border-red-500";
                                    iconClass = "border-red-500 bg-red-500 text-white";
                                }
                            } else if (isSelected) {
                                optionClass = "bg-violet-600/20 border-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.2)]";
                                iconClass = "border-violet-500 bg-violet-600 text-white";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => saveCurrentAnswer(idx)}
                                    disabled={isAnswerChecked || isTimeUp || isReviewMode}
                                    className={`
                                        w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 group relative active:scale-[0.99] duration-150
                                        ${optionClass}
                                    `}
                                >
                                    <div className={`
                                        w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors
                                        ${iconClass}
                                    `}>
                                        {(isAnswerChecked || isReviewMode) && idx === currentQuestion.correctAnswerIndex ? (
                                            <CheckCircle className="w-3.5 h-3.5" />
                                        ) : (isAnswerChecked || isReviewMode) && isSelected && idx !== currentQuestion.correctAnswerIndex ? (
                                            <XCircle className="w-3.5 h-3.5" />
                                        ) : (
                                            isSelected && <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-200" />
                                        )}
                                    </div>
                                    <span className={`text-base leading-relaxed ${isSelected || ((isAnswerChecked || isReviewMode) && idx === currentQuestion.correctAnswerIndex) ? 'text-white' : 'text-text-secondary'}`}>
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
                                placeholder="Type your answer here..."
                                className={`
                                    w-full min-h-[240px] bg-white/5 border rounded-2xl p-6 text-white focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none resize-none leading-relaxed font-mono text-sm transition-all
                                    ${(isAnswerChecked || isReviewMode) ? 'border-white/10 opacity-70' : 'border-white/10 hover:border-white/20'}
                                `}
                                spellCheck={false}
                            />
                        </div>
                    )}
                </div>

                {isTimeUp && !isReviewMode && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
                        <Clock className="w-4 h-4" />
                        Time's up! Moving to next question...
                    </div>
                )}

                {/* Explanation Panel */}
                {(isAnswerChecked || isReviewMode) && (
                    <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 animate-in slide-in-from-bottom-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-3 text-violet-400">
                            <HelpCircle className="w-5 h-5" />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Explanation</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                            {currentQuestion.explanation}
                        </p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="h-20 border-t border-white/10 bg-surface/90 backdrop-blur-md shrink-0 flex items-center justify-center px-6 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
        <div className="w-full max-w-6xl flex justify-between items-center">
             
             <button
                onClick={() => navigateTo(currentIndex - 1)}
                disabled={currentIndex === 0 || isAnalyzing || (isTimeUp && !isReviewMode)}
                className="flex items-center gap-2 px-6 py-2.5 text-text-secondary hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl transition-all active:scale-95 duration-200 disabled:opacity-30 disabled:active:scale-100 font-medium"
             >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Previous</span>
             </button>

             <div className="flex gap-4">
                 {!isReviewMode && (
                    <button
                        onClick={handleCheckAnswer}
                        disabled={isAnswerChecked || isAnalyzing || isTimeUp}
                        className="hidden md:block px-6 py-2.5 text-text-primary font-medium bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl transition-all active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        Check Answer
                    </button>
                 )}

                 {currentIndex === questions.length - 1 ? (
                     <button
                        onClick={handleSubmitExam}
                        disabled={isAnalyzing}
                        className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/25 transition-all active:scale-95 duration-200 flex items-center gap-2"
                    >
                        {isReviewMode ? "Close Review" : (isAnalyzing ? "Submitting..." : "Finish Exam")}
                        {!isAnalyzing && <CheckCircle className="w-4 h-4" />}
                    </button>
                 ) : (
                    <button
                        onClick={() => navigateTo(currentIndex + 1)}
                        disabled={isAnalyzing || (isTimeUp && !isReviewMode)}
                        className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/25 transition-all active:scale-95 duration-200 flex items-center gap-2"
                    >
                        Next
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