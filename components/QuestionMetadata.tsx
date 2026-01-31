import React from 'react';
import { Question } from '../types';
import { BookOpen, Tag, FileText, MapPin } from 'lucide-react';

interface QuestionMetadataProps {
  question: Question;
  compact?: boolean;
}

const QuestionMetadata: React.FC<QuestionMetadataProps> = ({ question, compact = false }) => {
  const hasMetadata = question.pageNumber || question.conceptTag || question.subtopicName || question.sourceCitation;
  
  if (!hasMetadata) return null;
  
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {question.pageNumber && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <BookOpen className="w-3 h-3 text-blue-400" />
            <span className="text-xs font-bold text-blue-300">Page {question.pageNumber}</span>
          </div>
        )}
        
        {question.conceptTag && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Tag className="w-3 h-3 text-purple-400" />
            <span className="text-xs font-bold text-purple-300">{question.conceptTag}</span>
          </div>
        )}
        
        {question.subtopicName && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">{question.subtopicName}</span>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
          Question Metadata
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.pageNumber && (
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-blue-400 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-blue-300 mb-0.5">Source Page</div>
              <div className="text-sm text-white">Page {question.pageNumber}</div>
            </div>
          </div>
        )}
        
        {question.conceptTag && (
          <div className="flex items-start gap-2">
            <Tag className="w-4 h-4 text-purple-400 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-purple-300 mb-0.5">Concept</div>
              <div className="text-sm text-white">{question.conceptTag}</div>
            </div>
          </div>
        )}
        
        {question.subtopicName && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-emerald-300 mb-0.5">Subtopic</div>
              <div className="text-sm text-white">{question.subtopicName}</div>
            </div>
          </div>
        )}
        
        {question.topicName && (
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-cyan-400 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-cyan-300 mb-0.5">Topic</div>
              <div className="text-sm text-white">{question.topicName}</div>
            </div>
          </div>
        )}
      </div>
      
      {question.sourceCitation && (
        <div className="pt-3 border-t border-white/10">
          <div className="text-xs font-bold text-text-tertiary mb-1">Source Citation:</div>
          <div className="text-xs text-text-secondary italic leading-relaxed">
            "{question.sourceCitation}"
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionMetadata;
