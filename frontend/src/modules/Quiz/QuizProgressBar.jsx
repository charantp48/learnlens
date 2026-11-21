import React from 'react';

export default function QuizProgressBar({ total, current, answers }) {
  const progressPercent = Math.round(((current + 1) / total) * 100);
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-[#6B6660]">
        <span>
          Question <strong className="text-[#0D0D0D] font-bold text-sm">{current + 1}</strong> of {total}
        </span>
        <span>
          <strong className="text-[#F26522] font-bold">{answeredCount}</strong> of {total} answered
        </span>
      </div>

      {/* Main Bar */}
      <div className="w-full h-2 rounded-full bg-[#E3DCD3] overflow-hidden">
        <div
          className="h-full bg-[#F26522] transition-all duration-300 ease-out rounded-full"
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
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                isCurrent
                  ? 'bg-[#F26522] text-white ring-2 ring-[#F26522]/30 shadow-xs'
                  : isAnswered
                  ? 'bg-[#0D0D0D] text-white'
                  : 'bg-[#FBF8F4] text-[#6B6660] border border-[#E3DCD3]'
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
