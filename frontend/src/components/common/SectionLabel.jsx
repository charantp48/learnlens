import React from 'react';

export default function SectionLabel({ children, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#6B6660] ${className}`.trim()}>
      <span className="w-4 h-0.5 bg-[#F26522] rounded-full inline-block shrink-0" />
      <span>{children}</span>
    </div>
  );
}
