
import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, File } from 'lucide-react';
import { extractTextFromPDF } from '../services/pdfService';

interface FileUploadProps {
  onUpload: (content: string) => void;
  isLoading: boolean;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageStatus, setPageStatus] = useState({ current: 0, total: 0 });

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
        alert(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB for testing purposes.`);
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
        alert("The file appears to be empty or too short.");
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
    <div className="max-w-3xl mx-auto mt-16 px-6 fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text-primary mb-3">
          Import Study Material
        </h1>
        <p className="text-text-secondary text-base max-w-lg mx-auto leading-relaxed">
          Upload your syllabus, textbook, or notes. Limit: <span className="text-primary font-bold">{MAX_FILE_SIZE_MB}MB</span>.
        </p>
      </div>

      <div 
        className={`
          relative group border-2 border-dashed rounded-xl transition-all duration-300 ease-out
          flex flex-col items-center justify-center min-h-[360px] bg-surface/50
          ${isProcessing ? "border-border cursor-default" : "cursor-pointer"}
          ${dragActive 
            ? "border-primary bg-primary/5 scale-[1.01] shadow-2xl shadow-primary/10" 
            : "border-border hover:border-text-tertiary hover:bg-surface"
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
           <div className="w-full max-w-xs px-6 flex flex-col items-center animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-background rounded-2xl border border-border flex items-center justify-center mb-6 shadow-sm">
                  <File className="w-8 h-8 text-primary animate-pulse" />
              </div>
              
              <div className="w-full space-y-2 mb-2">
                <div className="flex justify-between text-xs font-medium text-text-primary uppercase tracking-wide">
                    <span>Extracting Content</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border">
                    <div 
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
              </div>
              
              <p className="text-xs text-text-tertiary">
                  {pageStatus.total > 0 
                    ? `Processing page ${pageStatus.current} of ${pageStatus.total}`
                    : "Initializing parser..."
                  }
              </p>
           </div>
        ) : (
           <div className="flex flex-col items-center pointer-events-none z-10">
              <div className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300
                  ${dragActive ? 'bg-primary text-white scale-110' : 'bg-background border border-border text-text-secondary'}
              `}>
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-lg text-text-primary font-medium mb-2">
                {dragActive ? "Drop file to upload" : "Click to upload or drag & drop"}
              </p>
              <div className="flex items-center gap-2 text-sm text-text-tertiary">
                <span className="bg-background border border-border px-2 py-0.5 rounded text-xs font-mono">PDF</span>
                <span className="bg-background border border-border px-2 py-0.5 rounded text-xs font-mono">TXT</span>
                <span className="bg-background border border-border px-2 py-0.5 rounded text-xs font-mono">MD</span>
              </div>
           </div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2 p-4 rounded-lg hover:bg-surface/50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-1">
                <FileText className="w-4 h-4 text-emerald-500" />
            </div>
            <h4 className="text-sm font-medium text-text-primary">Deep Parsing</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
                Advanced extraction engine handles complex PDF layouts efficiently.
            </p>
        </div>
        <div className="flex flex-col gap-2 p-4 rounded-lg hover:bg-surface/50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-1">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
            </div>
            <h4 className="text-sm font-medium text-text-primary">Context Aware</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
                Automatically detects the subject and difficulty level from your content.
            </p>
        </div>
        <div className="flex flex-col gap-2 p-4 rounded-lg hover:bg-surface/50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mb-1">
                <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <h4 className="text-sm font-medium text-text-primary">Testing Limit</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
                Max 5MB per upload for experimental testing.
            </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
