import React from 'react';

export default function Card({
  children,
  variant = 'surface', // 'surface' | 'dark' | 'outline'
  hoverLift = true,
  padding = 'md',     // 'sm' | 'md' | 'lg' | 'none'
  className = '',
  ...props
}) {
  const baseStyles = 'rounded-[24px] transition-all duration-300 relative';

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4 sm:p-5',
    md: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-10 lg:p-12',
  }[padding] || 'p-6 sm:p-8';

  const variantStyles = {
    surface: 'bg-[#FBF8F4] border border-[#E3DCD3] text-[#0D0D0D] card-shadow',
    dark: 'bg-[#111111] border border-[#262626] text-white shadow-xl',
    outline: 'bg-transparent border border-[#E3DCD3] text-[#0D0D0D]',
  }[variant] || 'bg-[#FBF8F4] border border-[#E3DCD3]';

  const liftStyles = hoverLift ? 'card-shadow-hover' : '';

  return (
    <div
      className={`${baseStyles} ${paddingStyles} ${variantStyles} ${liftStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
