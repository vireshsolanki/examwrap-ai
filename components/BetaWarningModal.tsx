
import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Mail, Sparkles, Shield, Database, ExternalLink } from 'lucide-react';

const BETA_SEEN_KEY = 'examwarp_beta_warning_seen';

const BetaWarningModal: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem(BETA_SEEN_KEY);
        if (!hasSeen) {
            // Small delay so the page loads first, then the modal appears
            const timer = setTimeout(() => setIsVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsVisible(false);
            localStorage.setItem(BETA_SEEN_KEY, 'true');
        }, 400);
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[300] flex items-center justify-center p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/85 backdrop-blur-xl"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-lg glass-card p-0 overflow-hidden shadow-2xl border-white/10 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} transition-all duration-400`}>
                {/* Top Gradient Accent */}
                <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-tertiary hover:text-white transition-all z-10"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-8 space-y-6">
                    {/* Welcome Header */}
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2">
                            <Sparkles className="w-3 h-3" /> Welcome to ExamWarp
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            Hey there, future topper! 👋
                        </h2>
                        <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
                            Welcome to <span className="text-primary font-bold">ExamWarp AI</span> — your personal AI-powered exam preparation platform.
                        </p>
                    </div>

                    {/* Beta Warning Card */}
                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/20 shrink-0 mt-0.5">
                                <AlertTriangle className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                                    🚧 Beta Phase — Important Notice
                                </h3>
                                <p className="text-xs text-amber-200/70 leading-relaxed">
                                    ExamWarp is currently in <span className="text-amber-300 font-bold">active beta</span>. Here's what you need to know:
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2.5 ml-1">
                            {[
                                {
                                    icon: Database,
                                    text: "No database is used — your data is stored in your browser's Local Storage only.",
                                    color: "text-amber-400"
                                },
                                {
                                    icon: Shield,
                                    text: "Clearing your browser cache/cookies WILL erase all your exam history and progress.",
                                    color: "text-rose-400"
                                },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <item.icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${item.color}`} />
                                    <p className="text-[11px] text-amber-100/60 leading-relaxed font-medium">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Card */}
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                            <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.15em] mb-1">
                                For feedback, bugs & involvement
                            </p>
                            <a
                                href="mailto:vireshsolanki58@gmail.com"
                                className="text-sm font-bold text-primary hover:text-white transition-colors flex items-center gap-1.5 group"
                            >
                                vireshsolanki58@gmail.com
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleClose}
                        className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primaryHover hover:to-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
                    >
                        Got it, Let's Go!
                        <Sparkles className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BetaWarningModal;
