import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl 
      border border-white/50 dark:border-gray-700/50 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}