import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="fixed top-6 left-6 z-20">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
            rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50
            hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 px-4 py-3"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-gray-800 dark:text-gray-200 font-medium">
            {user?.name}
          </span>
          <svg className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm 
            rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 py-2">
            <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 
                hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}