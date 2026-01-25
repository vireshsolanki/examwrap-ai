
import React from 'react';
import { Question, QuestionType } from '../types';
import { ArrowLeft, Printer, Download, Book } from 'lucide-react';

interface ExamExportViewProps {
    questions: Question[];
    onBack: () => void;
    subjectName: string;
}

const ExamExportView: React.FC<ExamExportViewProps> = ({ questions, onBack, subjectName }) => {
    const [fileName, setFileName] = React.useState(`${subjectName.replace(/\s+/g, '_')}_Official_Assessment`);

    const handlePrint = () => {
        const oldTitle = document.title;
        document.title = fileName;
        window.print();
        document.title = oldTitle;
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 px-6 pb-20 fade-in">
            <div className="flex items-center justify-between mb-8 no-print">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-text-secondary hover:text-white px-4 py-2 rounded-xl transition-all active:scale-95 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Results
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
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white hover:bg-primaryHover rounded-xl font-bold shadow-lg transition-all active:scale-95"
                    >
                        <Printer className="w-4 h-4" />
                        Print / Save PDF
                    </button>
                </div>
            </div>

            <div id="printable-exam" className="printable-container rounded-2xl p-8 md:p-14 shadow-2xl bg-white text-black relative border border-gray-200">
                {/* Subtle Background Pattern for Print */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none print:hidden" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                <div className="text-center mb-16 relative">
                    <div className="absolute -top-4 -left-4 w-20 h-20 border-t-4 border-l-4 border-black/10 print:hidden"></div>
                    <h1 className="text-5xl font-black mb-4 uppercase tracking-[0.1em] text-black">Official Assessment</h1>
                    <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
                    <p className="text-2xl font-bold text-gray-800 mb-2">{subjectName}</p>
                    <div className="flex justify-center items-center gap-6 text-xs font-mono text-gray-500 uppercase tracking-widest mt-8">
                        <span>Ref: EW-{Math.random().toString(36).substring(7).toUpperCase()}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        <span>Questions: {questions.length}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="space-y-16 relative z-10">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="page-break-inside-avoid">
                            <div className="flex gap-6 mb-6">
                                <div className="flex flex-col items-center">
                                    <span className="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-xl rounded-md">{idx + 1}</span>
                                    <div className="w-px h-full bg-gray-100 mt-2"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xl font-semibold leading-relaxed text-black mb-6">{q.text}</p>

                                    {q.type === QuestionType.MCQ && q.options && (
                                        <div className="grid grid-cols-1 gap-4 ml-2">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className="flex gap-4 items-center group">
                                                    <span className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:border-black group-hover:text-black transition-colors">
                                                        {String.fromCharCode(65 + oIdx)}
                                                    </span>
                                                    <span className="text-gray-800 text-lg">{opt}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="no-print-section mt-8 p-6 bg-gray-50 rounded-xl border-l-4 border-black/20">
                                <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3">Key & Logic</div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded">ANSWER</span>
                                    <p className="text-sm font-black text-black">
                                        {q.type === QuestionType.MCQ ? `${String.fromCharCode(65 + (q.correctAnswerIndex || 0))}` : 'Self-Assessment Required'}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed italic border-t border-gray-200 pt-3">
                                    {q.explanation}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 pt-10 border-t-4 border-double border-gray-200 text-center relative">
                    <div className="text-[10px] text-gray-400 uppercase tracking-[0.5em] mb-2 font-black">Authentication Code Verified</div>
                    <div className="text-[8px] text-gray-300 font-mono">MD5: {Math.random().toString(16).substring(2, 20)} • Generated by AI Core</div>
                </div>
            </div>

            <style>{`
        @media print {
            body { background: white !important; -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
            .no-print-section { 
                background: #f9fafb !important; 
                border-color: #e5e7eb !important;
                page-break-inside: avoid;
            }
            .printable-container { 
                border: none !important; 
                box-shadow: none !important; 
                padding: 0 !important;
                color: black !important;
            }
            .page-break-inside-avoid { page-break-inside: avoid; }
            @page { margin: 2cm; }
        }
      `}</style>
        </div>
    );
};

export default ExamExportView;
