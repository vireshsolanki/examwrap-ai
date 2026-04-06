import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, BookOpen, HelpCircle } from 'lucide-react';
import { extractTextFromPDF } from '../services/pdfService';
import PdfUploadGuide from './PdfUploadGuide';

const PDF_GUIDE_SEEN_KEY = 'examwarp_pdf_guide_seen';

interface FileUploadProps {
  onUpload: (content: string) => void;
  isLoading: boolean;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageStatus, setPageStatus] = useState({ current: 0, total: 0 });
  const [showPdfGuide, setShowPdfGuide] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(PDF_GUIDE_SEEN_KEY);
    if (!hasSeen) {
      const timer = setTimeout(() => setShowPdfGuide(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePdfGuide = () => {
    setShowPdfGuide(false);
    localStorage.setItem(PDF_GUIDE_SEEN_KEY, 'true');
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      alert("Please upload a PDF, Text, or Markdown file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      let content = "";
      if (file.type === "application/pdf") {
        content = await extractTextFromPDF(file, (percent, current, total) => {
          setProgress(percent);
          setPageStatus({ current, total });
        });
      } else {
        setProgress(50);
        content = await file.text();
        setProgress(100);
      }

      if (content.length < 50) {
        alert("The file appears to be empty or too short. Please upload a detailed study material.");
        setIsProcessing(false);
        return;
      }

      setTimeout(() => {
        onUpload(content);
      }, 500);

    } catch (err: any) {
      console.error(err);
      alert(`Error processing file: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 px-6 animate-fade-in pb-20">
      <PdfUploadGuide isOpen={showPdfGuide} onClose={handleClosePdfGuide} />

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest mb-6">
          <BookOpen className="w-3.5 h-3.5" /> Study Material Upload
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          Upload Your <span className="text-primary">Content</span>
        </h1>
        <p className="text-text-secondary text-base font-medium max-w-lg mx-auto opacity-80 leading-relaxed">
          Upload your syllabus, notes, or sample papers. We'll analyze them to help you prepare better.
        </p>
        <button
          onClick={() => setShowPdfGuide(true)}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-all active:scale-95 group"
        >
          <HelpCircle className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
          <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 uppercase tracking-wider transition-colors">
            How to Upload a Highlighted PDF
          </span>
        </button>
      </div>

      <div
        className={`
          relative group glass-card transition-all duration-300 ease-out
          flex flex-col items-center justify-center min-h-[340px] p-10 border-dashed
          ${isProcessing ? "cursor-wait" : "cursor-pointer"}
          ${dragActive
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-white/10 hover:border-primary/30"
          }
        `}
        onDragEnter={!isProcessing ? handleDrag : undefined}
        onDragLeave={!isProcessing ? handleDrag : undefined}
        onDragOver={!isProcessing ? handleDrag : undefined}
        onDrop={!isProcessing ? handleDrop : undefined}
      >
        {!isProcessing && (
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            id="file-upload"
            accept=".pdf,.txt,.md"
            onChange={handleChange}
            disabled={isLoading || isProcessing}
            aria-label="File Upload"
          />
        )}

        {isProcessing ? (
          <div className="w-full max-w-xs flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="w-full space-y-3 mb-4">
              <div className="flex justify-between text-xs font-bold text-primary uppercase tracking-wider">
                <span>Reading File</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-text-tertiary font-bold uppercase tracking-wider">
              {pageStatus.total > 0
                ? `Processing Page ${pageStatus.current} of ${pageStatus.total}`
                : "Scanning content..."
              }
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center pointer-events-none z-10 text-center px-6">
            <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300
                  ${dragActive ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-white/5 border border-white/10 text-text-tertiary'}
              `}>
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-2xl font-bold text-white mb-2">
              {dragActive ? "Drop to start" : "Select Study Material"}
            </p>
            <p className="text-sm text-text-tertiary font-medium mb-6">
              Drag and drop your PDF, TXT or MD files here
            </p>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-text-tertiary uppercase tracking-wider">PDF</span>
              <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-text-tertiary uppercase tracking-wider">TXT</span>
              <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-text-tertiary uppercase tracking-wider">MD</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: FileText, title: "Smart Analysis", desc: "We automatically identify key concepts from your text.", color: "text-blue-400" },
          { icon: CheckCircle2, title: "Topic Mapping", desc: "Subjects are categorized into high and low yield topics.", color: "text-emerald-400" },
          { icon: AlertCircle, title: "Easy Import", desc: "Support for all standard academic document formats.", color: "text-rose-400" }
        ].map((feat, i) => (
          <div key={i} className="flex flex-col items-start p-2">
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-5 ${feat.color}`}>
              <feat.icon className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">{feat.title}</h4>
            <p className="text-sm text-text-secondary leading-relaxed opacity-70">
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUpload;
