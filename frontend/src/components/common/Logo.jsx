import React from 'react';

export default function Logo({ size = 'md', showText = true, className = '' }) {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base sm:text-lg' },
    md: { icon: 'w-9 h-9', text: 'text-xl' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl sm:text-3xl' },
    xl: { icon: 'w-20 h-20', text: 'text-3xl sm:text-4xl' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 120"
        className={`${currentSize.icon} shrink-0`}
        role="img"
        aria-label="LearnLens logo: a lens on a missing step"
      >
        <rect width="120" height="120" rx="28" fill="#0D0D0D" />
        <path d="M22 98V80h24V62h24V44h28v54z" fill="#F5F0EA" />
        <circle cx="58" cy="62" r="16" fill="none" stroke="#F26522" strokeWidth="6.5" />
        <line x1="70" y1="74" x2="84" y2="88" stroke="#F26522" strokeWidth="7" strokeLinecap="round" />
      </svg>
      {showText && (
        <span className={`font-heading font-extrabold text-[#0D0D0D] tracking-tight ${currentSize.text}`}>
          LearnLens
        </span>
      )}
    </div>
  );
}
