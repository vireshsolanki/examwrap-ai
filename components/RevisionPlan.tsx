import React, { useState, useEffect } from 'react';
import { RevisionPlan as RevisionPlanType, SubjectContext } from '../types';
import { Calendar, CheckSquare, RefreshCcw, Square, ArrowLeft } from 'lucide-react';

interface RevisionPlanProps {
  plan: RevisionPlanType;
  onReset: () => void;
  context?: SubjectContext | null;
  completedTasks?: string[];
  onToggleTask?: (taskId: string, isChecked: boolean) => void;
}

const RevisionPlan: React.FC<RevisionPlanProps> = ({ plan, onReset, context, completedTasks = [], onToggleTask }) => {
  const [localChecked, setLocalChecked] = useState<Set<string>>(new Set(completedTasks));

  useEffect(() => {
    setLocalChecked(new Set(completedTasks));
  }, [completedTasks]);

  const toggleTask = (day: number, taskIdx: number) => {
    const id = `${day}-${taskIdx}`;
    const isChecked = !localChecked.has(id);

    setLocalChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    if (onToggleTask) {
      onToggleTask(id, isChecked);
    }
  };

  const completionPercentage = Math.round((localChecked.size / plan.schedule.reduce((acc, day) => acc + day.tasks.length, 0)) * 100) || 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button onClick={onReset} className="flex items-center gap-2 text-text-tertiary hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            7-Day Revision Plan
            {context && <span className="text-sm font-normal px-3 py-1 bg-white/5 border border-white/10 rounded-full text-text-secondary">{context.subjectName}</span>}
          </h2>
          <p className="text-slate-400">Your personalized roadmap to mastering weak concepts.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-text-tertiary uppercase font-bold">Progress</div>
            <div className="text-xl font-mono text-cyan-400">{completionPercentage}%</div>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 glass-panel hover:bg-white/10 text-white rounded-xl transition-all active:scale-95 duration-200"
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="hidden md:inline">Close Plan</span>
          </button>
        </div>
      </div>

      <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-2xl mb-8 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-indigo-300 mb-2">Strategic Advice</h3>
        <p className="text-indigo-100/80 leading-relaxed text-sm md:text-base">{plan.generalAdvice}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from(
          plan.schedule.reduce((acc, current) => {
            const existing = acc.get(current.day);
            if (existing) {
              existing.tasks = [...existing.tasks, ...current.tasks];
              // Merge focus if they are different
              if (existing.focus !== current.focus) {
                existing.focus = `${existing.focus} & ${current.focus}`;
              }
            } else {
              acc.set(current.day, { ...current });
            }
            return acc;
          }, new Map<number, (typeof plan.schedule)[0]>())
            .values()
        ).sort((a: any, b: any) => a.day - b.day).map((day: any) => (
          <div
            key={day.day}
            className="glass-panel rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 group"
          >
            <div className="bg-white/5 p-4 border-b border-white/5 flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Day {day.day}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 max-w-[150px] truncate" title={day.focus}>
                {day.focus}
              </span>
            </div>
            <div className="p-5">
              <ul className="space-y-4">
                {day.tasks.map((task, idx) => {
                  const taskId = `${day.day}-${idx}`;
                  const isChecked = localChecked.has(taskId);
                  return (
                    <li
                      key={idx}
                      className={`flex items-start gap-3 text-sm transition-all cursor-pointer select-none`}
                      onClick={() => toggleTask(day.day, idx)}
                    >
                      <div className={`mt-0.5 shrink-0 transition-colors ${isChecked ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-500'}`}>
                        {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </div>
                      <span className={`transition-colors ${isChecked ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-300'}`}>
                        {task}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevisionPlan;