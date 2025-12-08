
import React, { useState } from 'react';
import { RevisionPlan as RevisionPlanType } from '../types';
import { Calendar, CheckSquare, RefreshCcw, Square } from 'lucide-react';

interface RevisionPlanProps {
  plan: RevisionPlanType;
  onReset: () => void;
}

const RevisionPlan: React.FC<RevisionPlanProps> = ({ plan, onReset }) => {
  // Local state to track checked tasks
  // We create a unique ID for each task based on day and index
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (day: number, taskIdx: number) => {
    const id = `${day}-${taskIdx}`;
    setCheckedTasks(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Personalized Revision Plan</h2>
          <p className="text-slate-400">A 7-day strategy tailored to your weak areas.</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Start New Session</span>
        </button>
      </div>

      <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-xl mb-8">
        <h3 className="text-xl font-semibold text-indigo-300 mb-2">AI Coach Advice</h3>
        <p className="text-indigo-100 leading-relaxed">{plan.generalAdvice}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plan.schedule.map((day) => (
          <div 
            key={day.day}
            className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-colors"
          >
            <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Day {day.day}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded bg-slate-700 text-cyan-300">
                {day.focus}
              </span>
            </div>
            <div className="p-5">
              <ul className="space-y-3">
                {day.tasks.map((task, idx) => {
                  const taskId = `${day.day}-${idx}`;
                  const isChecked = checkedTasks.has(taskId);
                  return (
                    <li 
                        key={idx} 
                        className={`flex items-start gap-3 text-sm transition-all cursor-pointer select-none group`}
                        onClick={() => toggleTask(day.day, idx)}
                    >
                        <div className={`mt-0.5 shrink-0 ${isChecked ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400/50'}`}>
                            {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </div>
                        <span className={`${isChecked ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
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
