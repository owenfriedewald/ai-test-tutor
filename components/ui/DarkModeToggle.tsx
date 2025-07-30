import React from 'react';

interface DarkModeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
}

export function DarkModeToggle({ darkMode, onToggle }: DarkModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-6 right-6 z-20 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
        rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50
        hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 group"
    >
      {darkMode ? (
        <svg className="w-5 h-5 text-yellow-500 group-hover:rotate-12 transition-transform duration-300" 
          fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-700 group-hover:rotate-12 transition-transform duration-300" 
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}