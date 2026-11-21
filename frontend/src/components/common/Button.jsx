import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Button({
  children,
  to,
  href,
  variant = 'primary', // 'primary' | 'secondary' | 'dark' | 'ghost'
  size = 'md',        // 'sm' | 'md' | 'lg'
  icon,
  showArrow = false,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight rounded-full transition-all duration-200 active:scale-[0.98] cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-3.5 text-base gap-2.5',
  }[size] || 'px-6 py-3 text-sm gap-2';

  const variantStyles = {
    primary: 'bg-[#F26522] hover:bg-[#D9531A] text-white shadow-sm hover:shadow-md',
    secondary: 'border border-[#0D0D0D] text-[#0D0D0D] hover:bg-[#0D0D0D]/5 bg-transparent',
    dark: 'bg-[#0D0D0D] hover:bg-[#262626] text-white shadow-sm hover:shadow',
    ghost: 'text-[#0D0D0D] hover:bg-[#0D0D0D]/5 bg-transparent font-medium',
  }[variant] || 'bg-[#F26522] hover:bg-[#D9531A] text-white';

  const combinedClasses = `${baseStyles} ${sizeStyles} ${variantStyles} ${className}`.trim();

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon;
    return <IconComponent className="w-4 h-4 shrink-0" />;
  };

  const content = (
    <>
      {renderIcon()}
      {children && <span>{children}</span>}
      {showArrow && <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${combinedClasses} group`} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={`${combinedClasses} group`} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button className={`${combinedClasses} group`} {...props}>
      {content}
    </button>
  );
}
