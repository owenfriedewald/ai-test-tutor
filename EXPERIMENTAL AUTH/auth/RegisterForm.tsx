import React, { useState } from 'react';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await register(email, password, name);
    if (!success) {
      setError('Registration failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <Card className="max-w-md mx-auto">
      <div className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Create Account</h2>
          <p className="text-gray-600 dark:text-gray-400">Join AI Test Tutor today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
          
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
              minLength={6}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </Card>
  );
}