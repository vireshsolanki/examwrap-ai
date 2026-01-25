
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wand2, Download, Copy, Check, FileText, Save, Trash2, History, Plus } from 'lucide-react';
import * as GeminiService from '../services/geminiService';
import * as StorageService from '../services/storageService';
import { NoteRecord } from '../types';

interface NotesFormatterProps {
    onBack: () => void;
}

const SimpleMarkdownRenderer = ({ content }: { content: string }) => {
    // Basic Markdown Parser (since we might not have a library installed yet)
    // Supports H1, H2, H3, Bold, Lists, Blockquotes

    if (!content) return null;

    const sections = content.split('\n').map((line, idx) => {
        // Headers
        if (line.startsWith('# ')) return <h1 key={idx} className="text-2xl font-black text-black mb-4 mt-6 border-b pb-2">{line.replace('# ', '')}</h1>;
        if (line.startsWith('## ')) return <h2 key={idx} className="text-xl font-bold text-gray-800 mb-3 mt-5">{line.replace('## ', '')}</h2>;
        if (line.startsWith('### ')) return <h3 key={idx} className="text-lg font-semibold text-gray-700 mb-2 mt-4">{line.replace('### ', '')}</h3>;

        // Lists
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            // Handle bold inside lists
            const text = line.replace(/^[\*\-]\s/, '');
            const parts = text.split(/(\*\*.*?\*\*)/g);

            return (
                <li key={idx} className="ml-5 list-disc text-gray-700 mb-1">
                    {parts.map((part, pIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={pIdx} className="text-violet-700">{part.slice(2, -2)}</strong>
                        }
                        return part;
                    })}
                </li>
            )
        }

        // Horizontal Rule
        if (line.trim() === '---') return <hr key={idx} className="my-6 border-gray-200" />;

        // Paragraphs with Bold support
        if (line.trim().length > 0) {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <p key={idx} className="mb-2 text-gray-700 leading-relaxed">
                    {parts.map((part, pIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={pIdx} className="text-violet-700">{part.slice(2, -2)}</strong>
                        }
                        return part;
                    })}
                </p>
            );
        }

        return <div key={idx} className="h-2"></div>;
    });

    return <div>{sections}</div>;
}

const NotesFormatter: React.FC<NotesFormatterProps> = ({ onBack }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [title, setTitle] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [notesHistory, setNotesHistory] = useState<NoteRecord[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        const history = StorageService.loadNotes();
        setNotesHistory(history);
    };

    const handleFormat = async () => {
        if (!input.trim()) return;
        setIsProcessing(true);
        try {
            const formatted = await GeminiService.formatStudyNotes(input);
            setOutput(formatted);

            // Auto-generate title if missing
            if (!title) {
                const firstLine = input.split('\n')[0].substring(0, 30);
                setTitle(firstLine || 'Untitled Note');
            }
        } catch (e) {
            console.error(e);
            alert("Failed to format notes. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = () => {
        if (!output || !title) return;

        const newNote: NoteRecord = {
            id: activeNoteId || Date.now().toString(),
            date: new Date().toISOString(),
            title: title,
            content: output
        };

        StorageService.saveNote(newNote);
        loadHistory();
        setActiveNoteId(newNote.id);
        alert("Note Saved Successfully!");
    };

    const handleLoadNote = (note: NoteRecord) => {
        setTitle(note.title);
        setOutput(note.content);
        setActiveNoteId(note.id);
        // We don't populate input to keep the 'formatter' abstraction clean, 
        // or we could set input to content if we want to allow re-editing.
    };

    const handleDeleteNote = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm("Delete this note?")) {
            StorageService.deleteNote(id);
            loadHistory();
            if (activeNoteId === id) {
                setActiveNoteId(null);
                setOutput('');
                setTitle('');
            }
        }
    }

    const handleNewNote = () => {
        setActiveNoteId(null);
        setOutput('');
        setInput('');
        setTitle('');
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrintPDF = () => {
        // Create a temporary iframe to print only the content
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
            <head>
                <title>${title}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { padding: 40px; font-family: sans-serif; }
                    h1 { font-size: 24px; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
                    h2 { font-size: 20px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #333; }
                    h3 { font-size: 18px; font-weight: 600; margin-top: 15px; margin-bottom: 8px; color: #555; }
                    p { margin-bottom: 10px; line-height: 1.6; color: #333; }
                    ul { list-style-type: disc; margin-left: 20px; margin-bottom: 10px; }
                    li { margin-bottom: 5px; color: #333; }
                    strong { color: #5b21b6; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <div class="content">
                    ${(document.getElementById('rendered-output')?.innerHTML || '')}
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleDownloadText = () => {
        const blob = new Blob([output], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-7xl mx-auto mt-6 px-4 pb-12 fade-in h-[calc(100vh-80px)] flex gap-4">

            {/* Sidebar History */}
            <div className={`
                ${showHistory ? 'w-64' : 'w-0 opacity-0 overflow-hidden'} 
                transition-all duration-300 flex flex-col bg-surface border border-white/5 rounded-xl
            `}>
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-2">
                        <History className="w-4 h-4" /> History
                    </span>
                    <button onClick={handleNewNote} className="p-1 hover:bg-white/10 rounded-lg transition-colors" title="New Note">
                        <Plus className="w-4 h-4 text-primary" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {notesHistory.map(note => (
                        <div
                            key={note.id}
                            onClick={() => handleLoadNote(note)}
                            className={`p-3 rounded-lg cursor-pointer group transition-all text-left relative ${activeNoteId === note.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
                        >
                            <h4 className={`text-xs font-bold mb-1 truncate ${activeNoteId === note.id ? 'text-white' : 'text-text-secondary group-hover:text-white'}`}>{note.title}</h4>
                            <p className="text-[10px] text-text-tertiary">{new Date(note.date).toLocaleDateString()}</p>

                            <button
                                onClick={(e) => handleDeleteNote(e, note.id)}
                                className="absolute right-2 top-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-400 rounded transition-all"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {notesHistory.length === 0 && (
                        <div className="text-center py-10 opacity-30 text-[10px] uppercase font-bold tracking-widest text-text-tertiary">No Saved Notes</div>
                    )}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="p-2 bg-white/5 border border-white/10 rounded-lg text-text-secondary hover:text-white transition-colors"
                        >
                            <History className="w-4 h-4" />
                        </button>
                    </div>

                    {output && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Note Title..."
                                className="bg-transparent border-b border-white/20 text-white text-sm px-2 focus:outline-none focus:border-primary w-48 mr-4"
                            />

                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold transition-all"
                            >
                                <Save className="w-3.5 h-3.5" />
                                Save
                            </button>

                            <button
                                onClick={handlePrintPDF}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white text-black border border-white hover:bg-gray-200 rounded-lg text-xs font-bold transition-all"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                Print / PDF
                            </button>

                            <button
                                onClick={handleDownloadText}
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all"
                            >
                                <Download className="w-3.5 h-3.5" />
                                .MD
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
                    <div className="flex flex-col h-full bg-white text-black border border-border rounded-xl overflow-hidden relative shadow-lg">
                        <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Formatted Output (Preview)</span>
                            {output && <span className="text-[10px] text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" /> Ready</span>}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            {output ? (
                                <div id="rendered-output" className="prose prose-sm max-w-none">
                                    <SimpleMarkdownRenderer content={output} />
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                    <FileText className="w-10 h-10 mb-3" />
                                    <p className="text-xs">Formatted notes will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesFormatter;