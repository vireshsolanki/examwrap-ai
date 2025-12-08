
import React from 'react';
import { ArrowLeft, Book, Download } from 'lucide-react';

interface SummaryViewProps {
  summaryMarkdown: string;
  onBack: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ summaryMarkdown, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto mt-8 px-6 pb-20 fade-in">
      <div className="flex items-center justify-between mb-8">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
        >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
            <button className="p-2 text-text-secondary hover:text-primary transition-colors" title="Download Summary">
                <Download className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-8 md:p-12 shadow-sm">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Book className="w-5 h-5 text-primary" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Smart Summary</h1>
                <p className="text-text-secondary text-sm">AI-generated comprehensive review of your material.</p>
            </div>
        </div>

        <article className="prose prose-invert prose-sm max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary prose-li:text-text-secondary">
            <div className="whitespace-pre-wrap font-sans leading-relaxed">
                {summaryMarkdown}
            </div>
        </article>
      </div>
    </div>
  );
};

export default SummaryView;
