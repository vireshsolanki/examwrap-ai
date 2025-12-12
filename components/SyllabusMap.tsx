import React from 'react';
import { Topic } from '../types';
import { ChevronRight, Play } from 'lucide-react';

interface SyllabusMapProps {
  topics: Topic[];
  onStartExam: () => void;
  isGenerating: boolean;
}

const SyllabusMap: React.FC<SyllabusMapProps> = ({ topics, onStartExam, isGenerating }) => {
  return (
    <div className="max-w-5xl mx-auto mt-8 px-6 fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary">Syllabus Map</h2>
          <p className="text-text-secondary text-sm mt-1">
            Identified {topics.length} core topics from the source material.
          </p>
        </div>
        <button
          onClick={onStartExam}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primaryHover hover:to-blue-700 text-white text-sm font-bold rounded-lg transition-all active:scale-95 duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
           {isGenerating ? "Initializing Exam..." : "Start Assessment"}
           {!isGenerating && <Play className="w-3.5 h-3.5 fill-current" />}
        </button>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border bg-background/50 text-xs font-medium text-text-secondary uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Topic Name</div>
            <div className="col-span-6">Subtopics / Key Concepts</div>
        </div>
        
        <div className="divide-y divide-border">
            {topics.map((topic, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-background/50 transition-colors group">
                    <div className="col-span-1 text-text-tertiary font-mono text-sm">{String(idx + 1).padStart(2, '0')}</div>
                    <div className="col-span-5">
                        <h3 className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">{topic.name}</h3>
                    </div>
                    <div className="col-span-6">
                        <div className="flex flex-wrap gap-2">
                            {topic.subtopics.slice(0, 4).map((sub, sIdx) => (
                                <span key={sIdx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-background border border-border text-text-secondary">
                                    {sub.name}
                                </span>
                            ))}
                            {topic.subtopics.length > 4 && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs text-text-tertiary">
                                    +{topic.subtopics.length - 4} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <p className="text-xs text-text-tertiary">
            Generated via AI Analysis • Verified structural integrity
        </p>
      </div>
    </div>
  );
};

export default SyllabusMap;