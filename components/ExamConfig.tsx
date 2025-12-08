
import React, { useState } from 'react';
import { SubjectContext, Topic, QuestionType, ExamConfig as ConfigType } from '../types';
import { Sliders, BookOpen, Clock, Zap } from 'lucide-react';

interface ExamConfigProps {
  analysis: SubjectContext;
  topics: Topic[];
  onStart: (config: ConfigType) => void;
}

const ExamConfig: React.FC<ExamConfigProps> = ({ analysis, topics, onStart }) => {
  const [questionCount, setQuestionCount] = useState(20);
  const [selectedType, setSelectedType] = useState<QuestionType>(QuestionType.MCQ);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState(30);
  
  // Per Question Timer State
  const [enablePerQuestionTimer, setEnablePerQuestionTimer] = useState(false);
  const [perQuestionSeconds, setPerQuestionSeconds] = useState(60);

  const toggleTopic = (topicName: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicName) ? prev.filter(t => t !== topicName) : [...prev, topicName]
    );
  };

  const handleStart = () => {
    onStart({
        questionCount,
        questionTypes: [selectedType],
        focusTopics: selectedTopics,
        timeLimitMinutes: timeLimit,
        timeLimitPerQuestionSeconds: enablePerQuestionTimer ? perQuestionSeconds : undefined
    });
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 px-6 fade-in grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      {/* Sidebar: Context */}
      <div className="lg:col-span-1 space-y-6">
        <div>
            <h2 className="text-xl font-semibold text-text-primary mb-1">Configuration</h2>
            <p className="text-sm text-text-secondary">Customize your assessment parameters.</p>
        </div>

        <div className="p-5 rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-4">Exam Context</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-xs text-text-secondary block mb-1">Subject</label>
                    <div className="text-sm font-medium text-text-primary">{analysis.subjectName}</div>
                </div>
                <div>
                    <label className="text-xs text-text-secondary block mb-1">Exam Target</label>
                    <div className="text-sm font-medium text-text-primary">{analysis.examType}</div>
                </div>
            </div>
        </div>
      </div>

      {/* Main: Settings */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Structure Settings */}
        <div className="p-6 rounded-lg border border-border bg-surface">
             <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                <Sliders className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-text-primary">Assessment Structure</h3>
             </div>

             <div className="space-y-8">
                {/* Question Count */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-medium text-text-primary">Total Questions</label>
                        <span className="text-sm font-mono bg-background border border-border px-2 py-1 rounded text-text-primary">{questionCount}</span>
                    </div>
                    <input 
                        type="range" 
                        min="5" 
                        max="50" 
                        step="5"
                        value={questionCount} 
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between mt-2 text-xs text-text-tertiary">
                        <span>5</span>
                        <span>25</span>
                        <span>50</span>
                    </div>
                </div>

                {/* Total Time Limit */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                            <Clock className="w-4 h-4 text-text-secondary" />
                            Total Time Limit (Minutes)
                        </label>
                        <span className="text-sm font-mono bg-background border border-border px-2 py-1 rounded text-text-primary">{timeLimit}m</span>
                    </div>
                    <input 
                        type="range" 
                        min="5" 
                        max="180" 
                        step="5"
                        value={timeLimit} 
                        onChange={(e) => setTimeLimit(Number(e.target.value))}
                        className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between mt-2 text-xs text-text-tertiary">
                        <span>5m</span>
                        <span>90m</span>
                        <span>180m</span>
                    </div>
                </div>

                {/* Per Question Timer */}
                <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Per Question Timer
                            <span className="text-xs text-text-tertiary font-normal">(Auto-skip when time is up)</span>
                        </label>
                        <button 
                            onClick={() => setEnablePerQuestionTimer(!enablePerQuestionTimer)}
                            className={`
                                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                ${enablePerQuestionTimer ? 'bg-primary' : 'bg-border'}
                            `}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${enablePerQuestionTimer ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {enablePerQuestionTimer && (
                        <div className="animate-in slide-in-from-top-2 fade-in">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs text-text-secondary">Time per question</span>
                                <span className="text-sm font-mono bg-background border border-border px-2 py-1 rounded text-text-primary">
                                    {perQuestionSeconds}s
                                </span>
                            </div>
                            <input 
                                type="range" 
                                min="10" 
                                max="300" 
                                step="10"
                                value={perQuestionSeconds} 
                                onChange={(e) => setPerQuestionSeconds(Number(e.target.value))}
                                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-yellow-500"
                            />
                            <div className="flex justify-between mt-2 text-xs text-text-tertiary">
                                <span>10s</span>
                                <span>60s</span>
                                <span>300s</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Question Type */}
                <div className="pt-4 border-t border-border">
                    <label className="text-sm font-medium text-text-primary block mb-4">Question Style</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { id: QuestionType.MCQ, label: "Multiple Choice", desc: "Standard recall & logic" },
                            { id: QuestionType.ShortAnswer, label: "Short Answer", desc: "Brief explanations" },
                            { id: QuestionType.LongAnswer, label: "Long Form", desc: "Deep application" }
                        ].map(type => (
                            <div 
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`
                                    cursor-pointer p-3 rounded border transition-all select-none relative overflow-hidden
                                    ${selectedType === type.id
                                        ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_#2563eb]' 
                                        : 'border-border bg-background hover:border-text-secondary'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-2 mb-1 relative z-10">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedType === type.id ? 'border-primary bg-primary' : 'border-text-tertiary'}`}>
                                        {selectedType === type.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                    <span className={`text-sm font-medium ${selectedType === type.id ? 'text-primary' : 'text-text-primary'}`}>{type.label}</span>
                                </div>
                                <p className="text-xs text-text-tertiary pl-6 relative z-10">{type.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        </div>

        {/* Topic Selection */}
        <div className="p-6 rounded-lg border border-border bg-surface flex flex-col h-[400px]">
             <div className="flex items-center gap-2 mb-4 border-b border-border pb-4">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-text-primary">Domain Focus</h3>
                <span className="ml-auto text-xs text-text-tertiary">
                    {selectedTopics.length === 0 ? "Covering All Topics" : `Focusing on ${selectedTopics.length} Topics`}
                </span>
             </div>

             <div className="flex-grow overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {topics.map(topic => (
                    <label 
                        key={topic.id}
                        className={`
                            flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors group
                            ${selectedTopics.includes(topic.name) ? 'bg-background' : 'hover:bg-background/50'}
                        `}
                    >
                        <div className={`
                            w-4 h-4 rounded border flex items-center justify-center transition-colors
                            ${selectedTopics.includes(topic.name) ? 'bg-primary border-primary' : 'border-border group-hover:border-text-secondary'}
                        `}>
                            {selectedTopics.includes(topic.name) && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <input 
                            type="checkbox"
                            className="hidden"
                            checked={selectedTopics.includes(topic.name)}
                            onChange={() => toggleTopic(topic.name)}
                        />
                        <span className={`text-sm ${selectedTopics.includes(topic.name) ? 'text-text-primary' : 'text-text-secondary'}`}>
                            {topic.name}
                        </span>
                    </label>
                ))}
             </div>
        </div>

        <div className="flex justify-end">
            <button
                onClick={handleStart}
                className="px-8 py-3 bg-primary hover:bg-primaryHover text-white text-sm font-medium rounded-md shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
            >
                Generate Assessment
            </button>
        </div>

      </div>
    </div>
  );
};

export default ExamConfig;
