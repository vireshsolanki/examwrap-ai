
import React, { useState } from 'react';
import { X, Upload, Highlighter, FileText, MousePointer2, Download, ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Monitor, Smartphone } from 'lucide-react';

interface PdfUploadGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

interface GuideStep {
    title: string;
    description: string;
    icon: React.FC<any>;
    color: string;
    tips: string[];
    image?: string;
}

const steps: GuideStep[] = [
    {
        title: "Step 1: Open Your PDF in a Reader",
        description: "Before uploading, open your study material PDF in any PDF reader app on your computer or phone that supports text highlighting.",
        icon: FileText,
        color: "text-blue-400",
        tips: [
            "🖥️ Windows: Use Adobe Acrobat Reader (Free) or Microsoft Edge browser",
            "🍎 Mac: Use Preview (built-in) or Adobe Acrobat Reader",
            "🌐 Browser: Open the PDF directly in Chrome or Edge — they have built-in highlight tools",
            "📱 Mobile: Use Adobe Acrobat, Xodo, or any PDF app with highlight support",
            "⚠️ Make sure your PDF has selectable text (not scanned images without OCR)"
        ]
    },
    {
        title: "Step 2: Manually Highlight Important Text",
        description: "This is the key step! YOU manually select and highlight the definitions, formulas, and concepts that matter most. This tells our AI what to focus on.",
        icon: Highlighter,
        color: "text-yellow-400",
        tips: [
            "📌 Adobe Reader: Click the Highlight tool (marker icon) in toolbar → Select text by clicking and dragging → It gets highlighted automatically",
            "📌 Chrome PDF viewer: Select text by clicking and dragging → Right-click → Choose 'Highlight'",
            "📌 Preview (Mac): Select text → Click the Highlight button (marker icon) in the toolbar",
            "📌 Edge: Select text → A toolbar appears with a highlight option",
            "🎨 Use ANY highlight color — yellow, green, pink — our AI detects all of them",
            "💡 Focus on: definitions, formulas, key dates, important theorems, and critical concepts"
        ]
    },
    {
        title: "Step 3: Save Your Highlighted PDF",
        description: "After you've finished highlighting, save the PDF so the highlights become part of the file. This is important — unsaved highlights won't be detected!",
        icon: Download,
        color: "text-emerald-400",
        tips: [
            "💾 Press Ctrl+S (Windows) or Cmd+S (Mac) to save in Adobe Reader or Preview",
            "💾 In Chrome: Click the download icon (↓) to save a copy with highlights embedded",
            "✅ Verify: Close the PDF and reopen it — your highlights should still be visible",
            "📁 The saved file is now ready to upload to ExamWarp!"
        ]
    },
    {
        title: "Step 4: Upload Your Highlighted PDF Here",
        description: "Now come back to ExamWarp and upload the highlighted PDF you just saved. Drag and drop it onto the upload zone, or click to browse your files.",
        icon: Upload,
        color: "text-primary",
        tips: [
            "🖱️ Drag and drop: Simply drag the highlighted PDF file from your folder onto the upload area",
            "📂 Or click the upload area to open a file picker and select your file",
            "📋 Supported formats: PDF (highlighted), TXT, or MD files (up to 10MB)",
            "⚡ Our AI will automatically detect and extract your highlighted sections"
        ]
    },
    {
        title: "Step 5: AI Generates Your Exam! ✨",
        description: "Our AI reads your PDF, finds all your highlighted sections, and treats them as 'High-Yield' content. Questions will focus primarily on what YOU chose to highlight!",
        icon: Sparkles,
        color: "text-purple-400",
        tips: [
            "🎯 Highlighted text = 'High-Yield' — AI generates more questions from these areas",
            "📖 Non-highlighted text is still analyzed but given lower priority",
            "📈 The more precisely you highlight, the more relevant your exam questions will be",
            "🏆 Pro tip: Highlight 20-40% of the content for the best balance of focus and coverage"
        ]
    }
];

const PdfUploadGuide: React.FC<PdfUploadGuideProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isClosing, setIsClosing] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setCurrentStep(0);
            onClose();
        }, 300);
    };

    const step = steps[currentStep];

    return (
        <div className={`fixed inset-0 z-[250] flex items-center justify-center p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/85 backdrop-blur-xl"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-xl glass-card p-0 overflow-hidden shadow-2xl border-white/10 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} transition-all duration-300`}>
                {/* Progress Bar */}
                <div className="h-1 w-full bg-white/5 relative">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-tertiary hover:text-white transition-all z-10"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-8 space-y-6">
                    {/* Step Header */}
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${step.color} transition-all duration-300`}>
                            <step.icon className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.2em]">
                                    {currentStep + 1} of {steps.length}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-white tracking-tight">
                                {step.title}
                            </h3>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-text-secondary leading-relaxed pl-1">
                        {step.description}
                    </p>

                    {/* Tips */}
                    <div className="space-y-3 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                        <p className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.15em]">
                            How to do it:
                        </p>
                        <div className="space-y-2.5">
                            {step.tips.map((tip, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${step.color} opacity-70`} />
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        {tip}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step Indicators */}
                    <div className="flex items-center justify-center gap-2">
                        {steps.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentStep(i)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentStep
                                    ? 'bg-primary w-6'
                                    : i < currentStep
                                        ? 'bg-primary/40'
                                        : 'bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-3">
                        {currentStep > 0 && (
                            <button
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition-all active:scale-95 text-xs font-bold uppercase tracking-wider"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </button>
                        )}

                        {currentStep < steps.length - 1 ? (
                            <button
                                onClick={() => setCurrentStep(currentStep + 1)}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primaryHover hover:to-blue-700 text-white font-bold transition-all active:scale-95 text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
                            >
                                Next Step
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleClose}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold transition-all active:scale-95 text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                            >
                                <Sparkles className="w-4 h-4" />
                                Got it, Let's Upload!
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PdfUploadGuide;
