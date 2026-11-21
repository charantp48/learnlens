import React from 'react';
import Button from './Button';

export default function CtaBanner({
  title = "Let's Create Something Extraordinary Together.",
  accentWord = "Extraordinary",
  subtitle = "Have a question in mind? Experience diagnostic learning that fixes root gaps.",
  buttonText = "Get in Touch",
  buttonTo = "/quiz",
  onButtonClick,
  className = '',
}) {
  // Highlight the accent word in orange if present in title
  const renderTitle = () => {
    if (!accentWord || !title.includes(accentWord)) {
      return title;
    }
    const parts = title.split(accentWord);
    return (
      <>
        {parts[0]}
        <span className="text-[#F26522]">{accentWord}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <div
      className={`rounded-[24px] bg-[#111111] border border-[#262626] p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl ${className}`.trim()}
    >
      {/* Original Geometric Ambient Glow (No brand copying) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F26522]/10 rounded-full blur-3xl pointer-events-none" />
      <svg
        className="absolute right-12 top-1/2 -translate-y-1/2 w-48 h-48 opacity-15 pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="80" stroke="#F26522" strokeWidth="1.5" strokeDasharray="4 6" />
        <circle cx="100" cy="100" r="40" stroke="#FFFFFF" strokeWidth="1" opacity="0.3" />
        <path d="M100 0v200M0 100h200" stroke="#F26522" strokeWidth="0.75" opacity="0.4" />
      </svg>

      {/* Text Section */}
      <div className="relative z-10 space-y-2 max-w-xl">
        <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {renderTitle()}
        </h3>
        <p className="text-xs sm:text-sm text-[#A8A29E] leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Button Section */}
      <div className="relative z-10 shrink-0">
        <Button
          to={buttonTo}
          onClick={onButtonClick}
          variant="primary"
          size="md"
          showArrow
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
