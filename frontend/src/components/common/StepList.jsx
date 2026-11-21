import React from 'react';

export default function StepList({ steps = [], className = '' }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const numStr = step.number || `0${idx + 1}`;

        return (
          <div key={idx} className="relative flex items-start gap-4 sm:gap-6 group">
            {/* Left Number Bubble & Connector Line */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FBF8F4] border border-[#E3DCD3] group-hover:border-[#F26522] text-[#0D0D0D] group-hover:text-[#F26522] font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center transition-colors shadow-xs">
                {numStr}
              </div>
              {!isLast && (
                <div className="w-px h-12 sm:h-14 bg-[#E3DCD3] my-1 group-hover:bg-[#F26522]/30 transition-colors" />
              )}
            </div>

            {/* Right Text Content */}
            <div className="pt-1 space-y-1">
              <h4 className="font-heading text-base sm:text-lg font-bold text-[#0D0D0D] tracking-tight">
                {step.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#6B6660] leading-relaxed max-w-md">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
