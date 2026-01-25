import React from 'react';
import { ArrowLeft, Book, Download, Printer } from 'lucide-react';

interface SummaryViewProps {
  summaryMarkdown: string;
  onBack: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ summaryMarkdown, onBack }) => {
  const [fileName, setFileName] = React.useState(`ExamWarp_Brief_${new Date().toISOString().split('T')[0]}`);

  const handleDownload = () => {
    // Update document title temporarily for print filename
    const oldTitle = document.title;
    document.title = fileName;
    window.print();
    document.title = oldTitle;
  };

  // Reuse Simple Renderer logic or similar for consistent look
  const SimpleRenderer = ({ content }: { content: string }) => {
    if (!content) return null;
    return (
      <div>
        {content.split('\n').map((line, idx) => {
          if (line.startsWith('# ')) return <h1 key={idx} className="text-3xl font-black text-black mb-6 mt-8 border-b pb-4">{line.replace('# ', '')}</h1>;
          if (line.startsWith('## ')) return <h2 key={idx} className="text-2xl font-bold text-gray-900 mb-4 mt-8">{line.replace('## ', '')}</h2>;
          if (line.startsWith('### ')) return <h3 key={idx} className="text-xl font-bold text-gray-800 mb-3 mt-6">{line.replace('### ', '')}</h3>;
          if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            const text = line.replace(/^[\*\-]\s/, '');
            const parts = text.split(/(\*\*.*?\*\*)/g);
            return <li key={idx} className="ml-6 list-disc text-gray-700 mb-2 pl-2 marker:text-violet-500">{
              parts.map((part, pIdx) => part.startsWith('**') ? <strong key={pIdx} className="text-violet-700 font-bold">{part.slice(2, -2)}</strong> : part)
            }</li>
          }
          if (line.trim() === '---') return <hr key={idx} className="my-8 border-gray-200" />;
          if (line.trim().length > 0) {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return <p key={idx} className="mb-4 text-gray-700 leading-relaxed text-lg">{
              parts.map((part, pIdx) => part.startsWith('**') ? <strong key={pIdx} className="text-violet-700 font-bold">{part.slice(2, -2)}</strong> : part)
            }</p>
          }
          return <div key={idx} className="h-4"></div>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-6 pb-20 fade-in">
      <div className="flex items-center justify-between mb-8 no-print">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all active:scale-95 duration-200 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary w-64"
            placeholder="Filename..."
          />
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-slate-200 rounded-xl font-bold shadow-lg transition-all active:scale-95 duration-200"
            title="Download Summary PDF"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div id="printable-summary" className="printable-summary-container rounded-3xl p-8 md:p-16 shadow-2xl relative overflow-hidden bg-white text-black border border-gray-100">
        {/* Decorative Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full -mr-32 -mt-32 print:hidden"></div>

        {/* Print Only Header */}
        <div className="hidden print:block text-center mb-12 border-b-4 border-double border-violet-200 pb-8">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-violet-400 mb-2">Study Intelligence Report</div>
          <h1 className="text-4xl font-extrabold text-black uppercase tracking-tight italic">ExamWarp Brief</h1>
          <div className="flex justify-center gap-4 mt-4 text-[10px] font-mono text-gray-400">
            <span>ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
            <span>•</span>
            <span>TYPE: CONCEPT SUMMARY</span>
            <span>•</span>
            <span>DATE: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-5 mb-12 pb-8 border-b border-gray-100 no-print">
          <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/30 rotate-3">
            <Book className="w-8 h-8 text-white -rotate-3" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">Smart Summary</h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Neural Synthesis of Study Material</p>
          </div>
        </div>

        <article className="prose prose-slate max-w-none 
            prose-headings:text-black prose-headings:font-black prose-headings:tracking-tight
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-lg
            prose-strong:text-violet-700 prose-strong:font-bold
            prose-ul:list-disc prose-li:text-gray-700
            prose-blockquote:border-l-4 prose-blockquote:border-violet-500 prose-blockquote:bg-violet-50 prose-blockquote:italic
            print:prose-p:text-sm print:prose-li:text-sm">
          <div className="whitespace-pre-wrap font-sans leading-relaxed">
            <SimpleRenderer content={summaryMarkdown} />
          </div>
        </article>

        {/* Print Footer */}
        <div className="hidden print:block mt-16 pt-6 border-t border-gray-100 text-center text-[8px] text-gray-300 uppercase tracking-[0.3em]">
          This document was autonomously generated by ExamWarp AI • End of Report
        </div>
      </div>

      <style>{`
        @media print {
            body { background: white !important; -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
            .printable-summary-container { 
                border: none !important; 
                box-shadow: none !important; 
                padding: 0 !important;
                background: white !important;
            }
            .prose { color: black !important; max-width: none !important; }
            @page { margin: 2.5cm; }
        }
      `}</style>
    </div>
  );
};

export default SummaryView;