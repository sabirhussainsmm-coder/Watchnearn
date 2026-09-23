import React from 'react';
import { PaymentGateway } from '../types';

interface PaymentLogoProps {
  gateway: PaymentGateway | 'all';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const JazzCashLogo: React.FC<{ size?: string; className?: string; showText?: boolean }> = ({
  size = 'md',
  className = '',
  showText = true,
}) => {
  const sizeClasses = {
    xs: 'h-4',
    sm: 'h-5',
    md: 'h-7',
    lg: 'h-9',
    xl: 'h-12',
  }[size as 'xs' | 'sm' | 'md' | 'lg' | 'xl'] || 'h-7';

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      {/* Official JazzCash Emblem */}
      <svg
        viewBox="0 0 100 100"
        className={`${sizeClasses} aspect-square shrink-0 rounded-lg shadow-sm`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="jc-red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d30915" />
            <stop offset="100%" stopColor="#9a0008" />
          </linearGradient>
          <linearGradient id="jc-yellow-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffb800" />
            <stop offset="100%" stopColor="#ff7700" />
          </linearGradient>
        </defs>
        {/* Rounded square container */}
        <rect width="100" height="100" rx="22" fill="url(#jc-red-grad)" />
        {/* Yellow curved crescent / ring arc */}
        <path
          d="M 50 16 A 34 34 0 0 1 84 50 A 34 34 0 0 1 50 84 A 34 34 0 0 1 20 62"
          fill="none"
          stroke="url(#jc-yellow-glow)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Core iconic flame/diamond spark */}
        <circle cx="50" cy="50" r="14" fill="#ffffff" />
        <circle cx="50" cy="50" r="8" fill="#d30915" />
      </svg>

      {showText && (
        <span className="font-black tracking-tight leading-none text-slate-900 dark:text-white flex items-center">
          <span className="text-red-600 font-extrabold text-[1.05em]">Jazz</span>
          <span className="text-amber-500 font-black ml-0.5 text-[1.05em]">Cash</span>
        </span>
      )}
    </div>
  );
};

export const EasyPaisaLogo: React.FC<{ size?: string; className?: string; showText?: boolean }> = ({
  size = 'md',
  className = '',
  showText = true,
}) => {
  const sizeClasses = {
    xs: 'h-4',
    sm: 'h-5',
    md: 'h-7',
    lg: 'h-9',
    xl: 'h-12',
  }[size as 'xs' | 'sm' | 'md' | 'lg' | 'xl'] || 'h-7';

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      {/* Official EasyPaisa Emblem */}
      <svg
        viewBox="0 0 100 100"
        className={`${sizeClasses} aspect-square shrink-0 rounded-lg shadow-sm`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ep-green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00b050" />
            <stop offset="100%" stopColor="#008035" />
          </linearGradient>
        </defs>
        {/* Rounded square container */}
        <rect width="100" height="100" rx="22" fill="url(#ep-green-grad)" />
        {/* Signature lower-case swoosh "e" icon */}
        <path
          d="M 50 22 C 34.5 22 23 33.5 23 49 C 23 64.5 35 77 52 77 C 65 77 74 69 77 60 L 64 56 C 62 61 58 65 51 65 C 41 65 34.5 58 34.5 49 L 77 49 C 77.5 47 77.5 44 77.5 42 C 77.5 30 65 22 50 22 Z M 34.8 42 C 36 34.5 42 29.5 50 29.5 C 58 29.5 64 34.5 65.2 42 L 34.8 42 Z"
          fill="#ffffff"
        />
      </svg>

      {showText && (
        <span className="font-black tracking-tight leading-none text-slate-900 dark:text-white flex items-center">
          <span className="text-emerald-500 font-extrabold text-[1.05em]">easy</span>
          <span className="text-slate-800 dark:text-slate-100 font-black ml-0.5 text-[1.05em]">paisa</span>
        </span>
      )}
    </div>
  );
};

export const PaymentLogo: React.FC<PaymentLogoProps> = ({
  gateway,
  size = 'md',
  showText = true,
  className = '',
}) => {
  if (gateway === 'jazzcash') {
    return <JazzCashLogo size={size} showText={showText} className={className} />;
  }

  if (gateway === 'easypaisa') {
    return <EasyPaisaLogo size={size} showText={showText} className={className} />;
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <JazzCashLogo size={size} showText={false} />
      <EasyPaisaLogo size={size} showText={false} />
    </div>
  );
};
