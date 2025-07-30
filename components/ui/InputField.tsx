// components/ui/InputField.tsx
import React from 'react';

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  maxLength: number;
}

export function InputField({ placeholder, value, onChange, className = "", maxLength }: InputFieldProps) {
  const remaining = maxLength - value.length;
  
  return (
    <div className="relative group">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className={`w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm 
          border border-gray-200/50 dark:border-gray-700/50 rounded-xl 
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
          transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 
          text-gray-800 dark:text-gray-200
          group-hover:bg-white/80 dark:group-hover:bg-gray-800/80 
          group-hover:border-gray-300/50 dark:group-hover:border-gray-600/50 ${className}`}
      />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 
        opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
        {remaining}
      </div>
    </div>
  );
}
