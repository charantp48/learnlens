import React from 'react';

export default function QuizProgressBar({ total, current, answers }) {
  const progressPercent = Math.round(((current + 1) / total) * 100);
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium text-slate-300">
          Question <strong className="text-white text-sm">{current + 1}</strong> of {total}
        </span>
        <span className="font-medium">
          <strong className="text-indigo-400">{answeredCount}</strong> of {total} answered
        </span>
      </div>

      {/* Main Bar */}
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Number Pills */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
        {Array.from({ length: total }, (_, i) => {
          const isAnswered = !!answers[i];
          const isCurrent = current === i;

          return (
            <div
              key={i}
              className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                isCurrent
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50 shadow-md'
                  : isAnswered
                  ? 'bg-slate-700 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-500 border border-slate-700/40'
              }`}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}
