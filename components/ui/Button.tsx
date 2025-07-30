import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  type?: 'button' | 'submit';
}

export function Button({ 
  onClick, 
  disabled, 
  loading, 
  children, 
  variant = 'primary',
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseClasses = `relative overflow-hidden font-semibold px-8 py-4 rounded-xl shadow-lg
    transform hover:scale-[1.02] hover:shadow-xl
    disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
    transition-all duration-300 group`;
  
  const variants = {
    primary: `bg-gradient-to-r from-blue-600 to-purple-600 text-white
      hover:from-blue-700 hover:to-purple-700`,
    secondary: `bg-gray-500/20 hover:bg-gray-500/30 text-gray-600 dark:text-gray-400 
      hover:text-gray-800 dark:hover:text-gray-200`
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center">
        {loading && (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </span>
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent 
          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
      )}
    </button>
  );
}
