import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  let baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  let sizeStyles = 'px-3.5 py-1.5 text-sm';
  if (size === 'sm') sizeStyles = 'px-2.5 py-1 text-xs';
  if (size === 'lg') sizeStyles = 'px-5 py-2.5 text-base';

  let variantStyles =
    'bg-[#0B192C] text-white hover:bg-[#1E293B] focus:ring-[#0B192C] shadow-sm';
  if (variant === 'secondary') {
    variantStyles =
      'bg-[#0D9488] text-white hover:bg-[#0F766E] focus:ring-[#0D9488] shadow-sm';
  } else if (variant === 'outline') {
    variantStyles =
      'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400';
  } else if (variant === 'danger') {
    variantStyles = 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm';
  }

  return (
    <button className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};
