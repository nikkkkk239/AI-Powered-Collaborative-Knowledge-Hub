import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FileText, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { user, login, register, isLoading } = useAuthStore();

  if (user) {
    return <Navigate to="/joinTeam" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.name);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 animate-[fadeInUp_0.6s_ease]">
        <div className="text-center">
          <div className="flex justify-center">
            <FileText className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white drop-shadow-md">
            {isLogin ? 'Sign in to' : 'Create'} KnowledgeHub
          </h2>


          <p className="mt-2 text-sm text-gray-700">
            {isLogin
              ? "Access your team's collaborative knowledge base"
              : "Join your team's knowledge sharing platform"}
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/70 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md animate-shake">
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Full Name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md placeholder-gray-400 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-white cursor-pointer
                           bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                           disabled:opacity-50 disabled:cursor-not-allowed 
                           transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.97]"
              >
                {isLoading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create account')}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Extra animations */}
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};
