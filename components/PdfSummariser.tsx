import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Upload, FileText, Wand2, Download, Copy, Check, AlertCircle, Loader2, BookOpen, Highlighter, X, Settings2 } from 'lucide-react';
import * as GeminiService from '../services/geminiService';
import { extractTextFromPDF } from '../services/pdfService';
import { SummaryLengthMode } from '../types';
import { PDF_SUMMARISER_CONFIG } from '../config/examPresets';

interface PdfSummariserProps {
    onBack: () => void;
    examLabel: string;
    defaultPersonaId?: string;
    defaultToneId?: string;
}

/* ── Markdown renderer ──────────────────────────────────────────────────── */

const Markdown: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    return (
        <div>
            {text.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-gray-900 mb-3 mt-5 pb-2 border-b border-gray-200">{line.slice(2)}</h1>;
                if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold text-gray-800 mb-2 mt-4">{line.slice(3)}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} className="text-base font-medium text-gray-700 mb-1.5 mt-3">{line.slice(4)}</h3>;
                if (line.trim() === '---') return <hr key={i} className="my-5 border-gray-200" />;
                if (/^\s*[-*]\s/.test(line)) {
                    return <li key={i} className="ml-5 list-disc text-gray-700 text-sm mb-1 leading-relaxed">{renderBold(line.replace(/^\s*[-*]\s/, ''))}</li>;
                }
                if (line.trim()) return <p key={i} className="text-sm text-gray-700 mb-1.5 leading-relaxed">{renderBold(line)}</p>;
                return <div key={i} className="h-1.5" />;
            })}
        </div>
    );
};

function renderBold(text: string) {
    return text.split(/(\*\*.*?\*\*)/g).map((seg, i) =>
        seg.startsWith('**') && seg.endsWith('**')
            ? <strong key={i} className="font-semibold text-gray-900">{seg.slice(2, -2)}</strong>
            : seg
    );
}

/* ── Highlight editor ───────────────────────────────────────────────────── */

interface HighlightEditorProps {
    text: string;
    highlights: string[];
    onUpdateHighlights: (h: string[]) => void;
    onDone: () => void;
    onSkip: () => void;
}

const HighlightEditor: React.FC<HighlightEditorProps> = ({ text, highlights, onUpdateHighlights, onDone, onSkip }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    const handleSelect = () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) return;
        const selected = sel.toString().trim();
        if (selected.length < 3) return;
        if (highlights.includes(selected)) return;
        onUpdateHighlights([...highlights, selected]);
        sel.removeAllRanges();
    };

    const removeHighlight = (idx: number) => {
        onUpdateHighlights(highlights.filter((_, i) => i !== idx));
    };

    // Render text with highlights marked
    const renderHighlightedText = () => {
        if (highlights.length === 0) return text;

        let result = text;
        // Sort by length descending so longer matches get replaced first
        const sorted = [...highlights].sort((a, b) => b.length - a.length);
        sorted.forEach((h, idx) => {
            const escaped = h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            result = result.replace(
                new RegExp(escaped, 'g'),
                `<mark data-idx="${idx}" class="bg-amber-200 text-amber-900 px-0.5 rounded-sm">${h}</mark>`
            );
        });
        return result;
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <Highlighter className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-white">Select text below to highlight key sections</span>
                    {highlights.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 bg-amber-500/15 border border-amber-500/20 rounded-full text-amber-300 font-semibold">
                            {highlights.length} highlighted
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button onClick={onSkip} className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-white border border-white/10 rounded-lg transition-colors">
                        Skip
                    </button>
                    <button
                        onClick={onDone}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                    >
                        Continue{highlights.length > 0 ? ` with ${highlights.length} highlights` : ''}
                    </button>
                </div>
            </div>

            {/* Highlight chips */}
            {highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {highlights.map((h, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-200 font-medium max-w-[200px]">
                            <span className="truncate">{h}</span>
                            <button onClick={() => removeHighlight(idx)} className="shrink-0 hover:text-white transition-colors">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Text display */}
            <div
                ref={editorRef}
                onMouseUp={handleSelect}
                className="bg-white rounded-lg border border-gray-200 p-5 max-h-[50vh] overflow-y-auto text-sm text-gray-800 leading-relaxed select-text cursor-text whitespace-pre-wrap"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                dangerouslySetInnerHTML={{ __html: renderHighlightedText() }}
            />
        </div>
    );
};

/* ── Main component ─────────────────────────────────────────────────────── */

type Step = 'upload' | 'highlight' | 'config' | 'loading' | 'result';

const PdfSummariser: React.FC<PdfSummariserProps> = ({
    onBack, examLabel, defaultPersonaId = 'university_professor', defaultToneId = 'supportive',
}) => {
    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [highlights, setHighlights] = useState<string[]>([]);
    const [summary, setSummary] = useState('');
    const [extractionProgress, setExtractionProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    // Length config
    const [lengthMode, setLengthMode] = useState<SummaryLengthMode>('words');
    const [wordCount, setWordCount] = useState(1000);
    const [pageCount, setPageCount] = useState(2);

    const personaId = defaultPersonaId;
    const toneId = defaultToneId;
    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ── File handling ── */

    const handleFileDrop = useCallback(async (selectedFile: File) => {
        setError('');
        setSummary('');
        setHighlights([]);

        if (selectedFile.type !== 'application/pdf') {
            setError('Only PDF files are supported.');
            return;
        }
        if (selectedFile.size > PDF_SUMMARISER_CONFIG.maxFileSizeBytes) {
            setError(`File exceeds the ${PDF_SUMMARISER_CONFIG.maxFileSizeMB} MB limit.`);
            return;
        }

        setFile(selectedFile);
        setStep('upload');
        setExtractionProgress(0);

        try {
            const text = await extractTextFromPDF(selectedFile, (pct) => setExtractionProgress(pct));
            if (!text || text.trim().length < 50) {
                setError('Could not extract text. The PDF may be a scanned image.');
                setFile(null);
                return;
            }
            setExtractedText(text);
            setStep('highlight');
        } catch {
            setError('Failed to read PDF. It may be encrypted or corrupted.');
            setFile(null);
        }
    }, []);

    /* ── Summarise ── */

    const handleSummarise = async () => {
        if (!extractedText) return;
        setStep('loading');
        setError('');

        // Prepend highlights to content so the AI prioritizes them
        let content = extractedText;
        if (highlights.length > 0) {
            const highlightBlock = highlights.map((h, i) => `${i + 1}. ${h}`).join('\n');
            content = `[USER HIGHLIGHTS — PRIORITIZE THESE SECTIONS:]\n${highlightBlock}\n\n---\n\n${extractedText}`;
        }

        try {
            const result = await GeminiService.summarisePdf(content, wordCount, pageCount, lengthMode, personaId, toneId, examLabel);
            setSummary(result);
            setStep('result');
        } catch {
            setError('Failed to generate summary. Please try again.');
            setStep('highlight');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPDF = () => {
        const win = window.open('', '_blank');
        if (!win) return;
        const title = file?.name?.replace('.pdf', '') || 'Summary';
        win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      @media print { body { -webkit-print-color-adjust: exact; } }
      body { max-width: 720px; margin: 40px auto; padding: 0 32px; font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; line-height: 1.7; font-size: 14px; }
      h1 { font-size: 22px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 6px; }
      h2 { font-size: 17px; font-weight: 600; margin-top: 24px; color: #1e1e1e; }
      h3 { font-size: 15px; font-weight: 600; margin-top: 16px; color: #374151; }
      p { margin-bottom: 8px; }
      ul { margin-left: 20px; margin-bottom: 8px; }
      li { margin-bottom: 4px; }
      strong { color: #1e1e1e; }
      .meta { color: #9ca3af; font-size: 11px; margin-bottom: 20px; }
      .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 12px; color: #9ca3af; font-size: 10px; text-align: center; }
    </style></head><body>
    <h1>${title}</h1>
    <p class="meta">ExamWrap AI · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · ${examLabel}</p>
    ${document.getElementById('summary-render')?.innerHTML || ''}
    <div class="footer">Generated by ExamWrap AI</div>
    </body></html>`);
        win.document.close();
        setTimeout(() => win.print(), 350);
    };

    const handleDownloadMD = () => {
        const name = (file?.name?.replace('.pdf', '') || 'summary').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const blob = new Blob([summary], { type: 'text/markdown' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${name}_summary.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const reset = () => {
        setFile(null);
        setExtractedText('');
        setSummary('');
        setHighlights([]);
        setError('');
        setStep('upload');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    /* ── Render ── */

    return (
        <div className="max-w-5xl mx-auto mt-6 px-4 pb-12 fade-in">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 rounded-lg border border-white/10 text-text-secondary hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-amber-400" />
                            PDF Summariser
                        </h1>
                        <p className="text-[10px] text-text-tertiary mt-0.5">
                            {examLabel} · Max {PDF_SUMMARISER_CONFIG.maxFileSizeMB}MB
                        </p>
                    </div>
                </div>
            </div>

            {/* Global Summary Length Config */}
            {step !== 'result' && (
                <div className="glass-card p-4 mb-6 flex items-center justify-between flex-wrap gap-4 animate-fade-in border border-white/10">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                        </span>
                        <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Summary Output Length</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                            <button
                                onClick={() => setLengthMode('words')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${lengthMode === 'words' ? 'bg-amber-600/20 border border-amber-600/30 text-amber-300' : 'text-text-tertiary hover:text-white border border-transparent'}`}
                            >
                                Words
                            </button>
                            <button
                                onClick={() => setLengthMode('pages')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${lengthMode === 'pages' ? 'bg-amber-600/20 border border-amber-600/30 text-amber-300' : 'text-text-tertiary hover:text-white border border-transparent'}`}
                            >
                                Pages
                            </button>
                        </div>
                        <select
                            value={lengthMode === 'words' ? wordCount : pageCount}
                            onChange={(e) => lengthMode === 'words' ? setWordCount(Number(e.target.value)) : setPageCount(Number(e.target.value))}
                            className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-amber-500/50 min-w-[140px]"
                        >
                            {(lengthMode === 'words' ? PDF_SUMMARISER_CONFIG.wordCountOptions : PDF_SUMMARISER_CONFIG.pageCountOptions).map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <p className="text-xs text-rose-300">{error}</p>
                </div>
            )}

            {/* ─── Step: Upload ─── */}
            {step === 'upload' && !file && (
                <div
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) handleFileDrop(f); }}
                    onClick={() => fileInputRef.current?.click()}
                    className="glass-card border-dashed border-white/15 flex flex-col items-center justify-center text-center cursor-pointer group hover:border-amber-500/30 transition-all min-h-[300px] p-10"
                >
                    <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6 text-amber-400" />
                    </div>
                    <p className="text-base font-semibold text-white mb-1">Drop your PDF here</p>
                    <p className="text-xs text-text-tertiary mb-4">or click to browse</p>
                    <p className="text-[9px] text-text-tertiary uppercase tracking-wider font-semibold">PDF only · Max {PDF_SUMMARISER_CONFIG.maxFileSizeMB} MB</p>
                    <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileDrop(f); }} />
                </div>
            )}

            {/* Extraction progress */}
            {step === 'upload' && file && (
                <div className="glass-card p-10 flex flex-col items-center text-center min-h-[300px] justify-center">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-5" />
                    <p className="text-sm font-semibold text-white mb-1">Extracting text</p>
                    <p className="text-xs text-text-tertiary mb-4">{file.name}</p>
                    <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all duration-300 rounded-full" style={{ width: `${extractionProgress}%` }} />
                    </div>
                </div>
            )}

            {/* ─── Step: Highlight ─── */}
            {step === 'highlight' && (
                <div className="space-y-4">
                    {/* File info bar */}
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-medium text-white">{file?.name}</span>
                            <span className="text-[10px] text-text-tertiary">
                                {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : ''}
                            </span>
                        </div>
                        <button onClick={reset} className="text-[10px] text-text-tertiary hover:text-white transition-colors">Change file</button>
                    </div>

                    {/* Highlight editor */}
                    <HighlightEditor
                        text={extractedText}
                        highlights={highlights}
                        onUpdateHighlights={setHighlights}
                        onDone={() => handleSummarise()}
                        onSkip={() => handleSummarise()}
                    />
                </div>
            )}

            {/* ─── Step: Loading ─── */}
            {step === 'loading' && (
                <div className="glass-card p-10 flex flex-col items-center text-center min-h-[300px] justify-center">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-5" />
                    <p className="text-sm font-semibold text-white mb-1">Generating summary</p>
                    <p className="text-xs text-text-tertiary">
                        {highlights.length > 0 ? `Using ${highlights.length} highlighted sections` : 'Analysing full document'}
                    </p>
                </div>
            )}

            {/* ─── Step: Result ─── */}
            {step === 'result' && summary && (
                <div className="space-y-3">
                    {/* Action bar */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs font-medium text-white">{file?.name}</span>
                            {highlights.length > 0 && (
                                <span className="text-[10px] text-amber-300">{highlights.length} highlights used</span>
                            )}
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                            <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-white/10 text-text-secondary hover:text-white rounded-lg transition-colors">
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                            <button onClick={handleDownloadPDF} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors">
                                <Download className="w-3.5 h-3.5" />
                                Download PDF
                            </button>
                            <button onClick={handleDownloadMD} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-white/10 text-text-secondary hover:text-white rounded-lg transition-colors">
                                <Download className="w-3.5 h-3.5" />
                                .md
                            </button>
                            <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                New
                            </button>
                        </div>
                    </div>

                    {/* Summary card */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Summary</span>
                            <span className="text-[10px] text-gray-400">{examLabel}</span>
                        </div>
                        <div id="summary-render" className="p-6 overflow-y-auto max-h-[60vh]">
                            <Markdown text={summary} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfSummariser;
