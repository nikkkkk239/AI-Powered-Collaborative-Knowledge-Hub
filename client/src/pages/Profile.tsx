import React, { useState } from 'react';
import { Save, Key, User, Mail, Sun, Moon } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../context/ThemeContext';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    geminiApiKey: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setFormData(prev => ({ ...prev, geminiApiKey: '' }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const dark = theme === "dark";

  return (
    <Layout>
      <div className={`max-w-2xl slide-top-in mx-auto space-y-6 transition-colors duration-300 ${dark ? "bg-black shadow-2xl shadow-white/20 border border-white/20" : "bg-gray-50 shadow-lg shadow-black/10"} p-6 rounded-lg`}>
        {/* Header with theme toggle */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>Profile Settings</h1>
            <p className={`${dark ? "text-gray-400" : "text-gray-600"} mt-1 text-sm`}>
              Update your profile information and AI settings
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className={`w-10 h-10 cursor-pointer flex justify-center items-center rounded-full transition-colors duration-150 ${dark ? "bg-white/10 hover:bg-white/20" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            {dark ? <Sun className="h-5 w-5 text-white" /> : <Moon className="h-5 w-5 text-gray-900" />}
          </button>
        </div>

        {/* Profile Form */}
        <div className={`rounded-lg  p-6 transition-colors duration-300 ${dark && "bg-[#0a0a0a"}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={`px-4 py-3 rounded-md border ${dark ? "bg-red-900 border-red-700 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
                {error}
              </div>
            )}

            {success && (
              <div className={`px-4 py-3 rounded-md border ${dark ? "bg-green-900 border-green-700 text-green-300" : "bg-green-50 border-green-200 text-green-700"}`}>
                {success}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className={`text-lg font-medium ${dark ? "text-white" : "text-gray-900"}`}>Basic Information</h3>

              {/* Email */}
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${dark ? "text-gray-400" : "text-gray-700"}`}>Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${dark ? "text-gray-400" : "text-gray-400"}`} />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className={`block w-full pl-10 pr-3 py-2 rounded-md border ${dark ? "bg-white/10 border-black/60 text-gray-200" : "bg-gray-50 border-gray-300 text-gray-500"}`}
                  />
                </div>
                <p className={`mt-1 text-xs ${dark ? "text-gray-500" : "text-gray-500"}`}>Email cannot be changed</p>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className={`block text-sm font-medium mb-2 ${dark ? "text-gray-400" : "text-gray-700"}`}>Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`h-5 w-5 ${dark ? "text-gray-400" : "text-gray-400"}`} />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${dark ? "bg-white/10 border-black/60 text-gray-200" : "bg-white border-gray-300 text-gray-900"}`}
                  />
                </div>
              </div>
            </div>

            {/* AI Settings */}
            <div className={`space-y-4 pt-6 border-t ${dark ? "border-black/60" : "border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-medium ${dark ? "text-white" : "text-gray-900"}`}>AI Configuration</h3>
                {user?.hasGeminiKey && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dark ? "bg-green-800 text-green-100" : "bg-green-100 text-green-800"}`}>
                    API Key Configured
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="geminiApiKey" className={`block text-sm font-medium mb-2 ${dark ? "text-gray-400" : "text-gray-700"}`}>Gemini API Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className={`h-5 w-5 ${dark ? "text-gray-400" : "text-gray-400"}`} />
                  </div>
                  <input
                    type="password"
                    id="geminiApiKey"
                    name="geminiApiKey"
                    value={formData.geminiApiKey}
                    onChange={handleChange}
                    placeholder={user?.hasGeminiKey ? "Enter new API key to update..." : "Enter your Gemini API key..."}
                    className={`block w-full pl-10 pr-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${dark ? "bg-white/10 border-black/60 text-gray-200" : "bg-white border-gray-300 text-gray-900"}`}
                  />
                </div>
                <div className={`mt-2 text-xs ${dark ? "text-gray-500" : "text-gray-500"}`}>
                  <p>Your API key is stored securely and used only for AI features.</p>
                  <p className="mt-1">
                    Get your free API key from{' '}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${dark ? "text-blue-400 hover:text-blue-200" : "text-blue-600 hover:text-blue-800"}`}
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
