import React, { useState } from 'react';
import { ArrowLeft, Wand2, Download, Copy, Check, FileText } from 'lucide-react';
import * as GeminiService from '../services/geminiService';

interface NotesFormatterProps {
    onBack: () => void;
}

const NotesFormatter: React.FC<NotesFormatterProps> = ({ onBack }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleFormat = async () => {
        if (!input.trim()) return;
        setIsProcessing(true);
        try {
            const formatted = await GeminiService.formatStudyNotes(input);
            setOutput(formatted);
        } catch (e) {
            console.error(e);
            alert("Failed to format notes. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([output], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Formatted_Notes_${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-5xl mx-auto mt-6 px-4 pb-12 fade-in h-[calc(100vh-80px)] flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-text-secondary hover:text-white mb-1 transition-colors text-xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-secondary" />
                        Smart Notes Formatter
                    </h1>
                </div>

                {output && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-medium transition-all"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? "Copied" : "Copy"}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download .MD
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
                {/* Input Side */}
                <div className="flex flex-col h-full bg-surface border border-border rounded-xl overflow-hidden shadow-lg">
                    <div className="p-3 border-b border-border bg-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Rough Input</span>
                        <span className="text-[10px] text-text-tertiary">{input.length} chars</span>
                    </div>
                    <textarea
                        className="flex-1 bg-transparent p-4 resize-none focus:outline-none text-xs leading-relaxed font-mono placeholder-white/10"
                        placeholder="Paste your messy lecture notes, rough thoughts, or bullet points here..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isProcessing}
                    />
                    <div className="p-3 border-t border-border bg-black/20 flex justify-end">
                        <button
                            onClick={handleFormat}
                            disabled={!input.trim() || isProcessing}
                            className="flex items-center gap-2 px-5 py-2 bg-secondary hover:bg-violet-600 text-white font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-secondary/20 text-xs uppercase tracking-wide"
                        >
                            {isProcessing ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    Format Notes <Wand2 className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Side */}
                <div className="flex flex-col h-full bg-black/40 border border-border rounded-xl overflow-hidden relative shadow-lg">
                    <div className="p-3 border-b border-border bg-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Formatted Output</span>
                        {output && <span className="text-[10px] text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Ready</span>}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                        {output ? (
                            <article className="prose prose-invert prose-sm max-w-none">
                                <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">{output}</div>
                            </article>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-text-tertiary opacity-50">
                                <FileText className="w-10 h-10 mb-3" />
                                <p className="text-xs">Formatted notes will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesFormatter;