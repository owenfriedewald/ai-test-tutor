import React, { useState } from 'react';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
    
    setLoading(false);
  };

  return (
    <Card className="max-w-md mx-auto">
      <div className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Welcome Back</h2>
          <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={100}
          />
          
          <div className="relative group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm 
                border border-gray-200/50 dark:border-gray-700/50 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 
                text-gray-800 dark:text-gray-200"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </Card>
  );
}