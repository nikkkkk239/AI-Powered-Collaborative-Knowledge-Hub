import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import Logo from "../assets/logo.jpg"

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
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-50 backdrop-blur-lg text-white flex-col justify-between items-center p-15">
      <div className=' relative flex hover:shadow-md flex-col justify-between items-center rounded-4xl overflow-hidden  w-full h-full'>
        <img src="background3.jpeg" alt="Background" className='z-[-1] absolute object-cover w-full h-full ' />

      <div className='flex flex-col mt-20 items-center gap-1'>
        <h1 className="text-4xl font-bold drop-shadow-md">Welcome to HiveMind</h1>
        <p className="text-lg text-blue-100 mb-12 drop-shadow-md">
          Your Gateway to Effortless Management.
        </p>
      </div>
      <div className='flex flex-col mb-25 items-center gap-1'>
        <h2 className="text-3xl font-semibold drop-shadow-md">Seamless Collaboration</h2>
        <p className="mt-2 text-blue-200 text-center drop-shadow-md ">
          Effortlessly work together with your team in real-time.
        </p>
      </div>
      </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex  items-center justify-center bg-gray-50">
        <div  className="w-full  max-w-md  rounded-2xl  p-8">
          <div className="flex justify-center items-center gap-1 mb-6">
            <img src={Logo} alt="" className='w-10 h-10'/>
            <span className="text-2xl font-bold text-blue-600 text-left w-full">HiveMind</span>
          </div>

          <div className="flex justify-between mb-6">
            <button
              onClick={() => setIsLogin(false)}
              className={`w-1/2 py-2 font-medium rounded-l-xl ${
                !isLogin ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setIsLogin(true)}
              className={`w-1/2 py-2 font-medium rounded-r-xl ${
                isLogin ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email ID"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition"
            >
              {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>

            {/* Social Login */}
          </form>

          {/* Privacy Text */}
          <p className="mt-6 text-xs text-gray-500 text-center">
            By signing up you agree to our <span className="underline cursor-pointer">Terms of Use</span> & <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
