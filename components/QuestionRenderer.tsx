import React from 'react';
import { Question, QuestionType } from '../types';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface QuestionRendererProps {
  question: Question;
  selectedAnswer?: number | number[] | string;
  onAnswerSelect: (answer: number | number[] | string) => void;
  showResult?: boolean;
  isReviewMode?: boolean;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  showResult = false,
  isReviewMode = false
}) => {
  
  // Standard MCQ
  if (question.type === QuestionType.MCQ) {
    return (
      <div className="space-y-4">
        <div className="text-white text-lg leading-relaxed">{question.text}</div>
        
        <div className="space-y-3">
          {question.options?.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = question.correctAnswerIndex === index;
            const showCorrect = showResult && isCorrect;
            const showWrong = showResult && isSelected && !isCorrect;
            
            return (
              <button
                key={index}
                onClick={() => !isReviewMode && onAnswerSelect(index)}
                disabled={isReviewMode}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  showCorrect
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100'
                    : showWrong
                    ? 'bg-rose-500/20 border-rose-500 text-rose-100'
                    : isSelected
                    ? 'bg-primary/20 border-primary text-white'
                    : 'bg-white/5 border-white/10 text-text-primary hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm opacity-60">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="flex-1">{option}</span>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {showWrong && <XCircle className="w-5 h-5 text-rose-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  
  // NUMERICAL type (JEE Mains)
  if (question.type === QuestionType.NUMERICAL) {
    return (
      <div className="space-y-4">
        <div className="text-white text-lg leading-relaxed">{question.text}</div>
        
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Numerical Answer Type
            </span>
          </div>
          <p className="text-xs text-amber-200/80">
            Enter your answer as an integer (0-9999)
          </p>
        </div>
        
        <div className="relative">
          <input
            type="number"
            min="0"
            max="9999"
            value={selectedAnswer as string || ''}
            onChange={(e) => onAnswerSelect(e.target.value)}
            disabled={isReviewMode}
            placeholder="Enter your answer"
            className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-6 py-4 text-white text-2xl font-bold text-center focus:border-primary/50 focus:bg-primary/5 outline-none transition-all disabled:opacity-50"
          />
        </div>
        
        {showResult && question.numericalAnswer !== undefined && (
          <div className={`p-4 rounded-xl border-2 ${
            Number(selectedAnswer) === question.numericalAnswer
              ? 'bg-emerald-500/20 border-emerald-500'
              : 'bg-rose-500/20 border-rose-500'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {Number(selectedAnswer) === question.numericalAnswer ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
              <span className="font-bold text-sm">
                Correct Answer: {question.numericalAnswer}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // ASSERTION_REASONING type (NEET)
  if (question.type === QuestionType.ASSERTION_REASONING) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
              Assertion-Reasoning Question
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="text-xs font-bold text-blue-300 mb-1">Statement I (Assertion):</div>
              <div className="text-white">{question.assertionStatement}</div>
            </div>
            
            <div>
              <div className="text-xs font-bold text-blue-300 mb-1">Statement II (Reason):</div>
              <div className="text-white">{question.reasoningStatement}</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {question.options?.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = question.correctAnswerIndex === index;
            const showCorrect = showResult && isCorrect;
            const showWrong = showResult && isSelected && !isCorrect;
            
            return (
              <button
                key={index}
                onClick={() => !isReviewMode && onAnswerSelect(index)}
                disabled={isReviewMode}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  showCorrect
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100'
                    : showWrong
                    ? 'bg-rose-500/20 border-rose-500 text-rose-100'
                    : isSelected
                    ? 'bg-primary/20 border-primary text-white'
                    : 'bg-white/5 border-white/10 text-text-primary hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex-1 text-sm">{option}</span>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {showWrong && <XCircle className="w-5 h-5 text-rose-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  
  // MULTI_CORRECT type (JEE Advanced)
  if (question.type === QuestionType.MULTI_CORRECT) {
    const selectedIndices = (selectedAnswer as number[]) || [];
    
    return (
      <div className="space-y-4">
        <div className="text-white text-lg leading-relaxed">{question.text}</div>
        
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              Multiple Correct Answers
            </span>
          </div>
          <p className="text-xs text-purple-200/80">
            Select all correct options. Partial marking may apply.
          </p>
        </div>
        
        <div className="space-y-3">
          {question.options?.map((option, index) => {
            const isSelected = selectedIndices.includes(index);
            const isCorrect = question.correctAnswerIndices?.includes(index);
            const showCorrect = showResult && isCorrect;
            const showWrong = showResult && isSelected && !isCorrect;
            
            return (
              <button
                key={index}
                onClick={() => {
                  if (isReviewMode) return;
                  const newSelection = isSelected
                    ? selectedIndices.filter(i => i !== index)
                    : [...selectedIndices, index];
                  onAnswerSelect(newSelection);
                }}
                disabled={isReviewMode}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  showCorrect
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100'
                    : showWrong
                    ? 'bg-rose-500/20 border-rose-500 text-rose-100'
                    : isSelected
                    ? 'bg-primary/20 border-primary text-white'
                    : 'bg-white/5 border-white/10 text-text-primary hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'bg-primary border-primary' : 'border-white/30'
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  <span className="font-bold text-sm opacity-60">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="flex-1">{option}</span>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {showWrong && <XCircle className="w-5 h-5 text-rose-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  
  // Fallback for other types
  return (
    <div className="space-y-4">
      <div className="text-white text-lg leading-relaxed">{question.text}</div>
      <div className="text-text-tertiary text-sm">
        Question type: {question.type}
      </div>
    </div>
  );
};

export default QuestionRenderer;
