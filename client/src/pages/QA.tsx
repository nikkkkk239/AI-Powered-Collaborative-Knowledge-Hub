import React, { useEffect, useState } from 'react';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuthStore } from '../stores/authStore';
import { useQAStore } from '../stores/qastore';
import { useTheme } from '../context/ThemeContext';

export const QA: React.FC = () => {
  const { token, user } = useAuthStore();
  const { askQuestion, isProcessing, fetchQuestions, qaList } = useQAStore();
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  useEffect(() => {
    const func = async () => {
      await fetchQuestions(token!);
      setLoading(false);
    };
    func();
  }, [fetchQuestions, token]);

  const [question, setQuestion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.hasGeminiKey) {
      alert('Please add your Gemini API key in profile settings to use AI features.');
      return;
    }
    if (!question.trim()) return;
    const currentQuestion = question;
    setQuestion('');
    try {
      await askQuestion(currentQuestion, token!);
    } catch (error: any) {
      alert(error.message);
    }
  };

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <Layout>
      <div className={`${darkMode ? "bg-black text-white" : "bg-white text-black"} max-w-4xl mx-auto space-y-6`}>
        <div className='slide-down-in'>
          <h1 className="text-2xl font-bold">
            Team <span className='text-blue-700'>Q&A</span>
          </h1>
          <p className={`${darkMode ? "text-white" : "text-black"} mt-1 text-sm`}>
            Ask questions about your team's knowledge base and get AI-powered answers
          </p>
        </div>

        {/* Question Input */}
        <div className={`${darkMode ? "bg-white/10 border-white/70" : "bg-white border-black"} slide-down-in rounded-lg shadow-sm border p-6`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-sm font-medium mb-2">
                Ask a question about your documents
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                className={`${darkMode ? "bg-black text-white border-white/40" : "bg-white text-black border-black"} w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="What would you like to know about your team's documents?"
              />
            </div>

            <div className="flex justify-between items-center">
              {!user?.hasGeminiKey ? (
                <p className="text-sm text-yellow-600">
                  Add your Gemini API key in profile settings to use Q&A
                </p>
              ) : (
                <div className={`text-sm ${darkMode ? "text-white/40" : "text-gray-500"}`}>
                  AI will search through all your team's documents to answer your question
                </div>
              )}

              <button
                type="submit"
                disabled={!question.trim() || isProcessing || !user?.hasGeminiKey}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Ask</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Q&A History */}
        {qaList.length > 0 && (
          <div className="space-y-6 slide-top-in">
            <h2 className="text-xl font-bold">Recent Questions</h2>

            {qaList.map((qa, index) => (
              <div
                key={index}
                className={`${darkMode ? "bg-black border-white/40" : "bg-white border-black"} rounded-2xl shadow-md border p-6 hover:shadow-lg transition-all duration-200`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className={`${darkMode ? "text-white" : "text-black"} text-sm font-semibold`}>
                        {qa.createdBy?.name || "Anonymous"}
                      </p>
                      <p className="text-xs">{formatDate(qa.createdAt!)}</p>
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div className="mb-4 border-l-4 border-blue-500 pl-3">
                  <p className={`${darkMode ? "text-white" : "text-black"}`}>{qa.question}</p>
                </div>

                {/* Answer */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className={`${darkMode ? "bg-white/10 border-white text-white" : "bg-gray-50 text-black"} flex-1 rounded-xl p-4`}>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{qa.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className={`${darkMode ? "text-white" : "text-black"} mt-4`}>Loading questions...</p>
          </div>
        )}

        {!loading && qaList.length === 0 && (
          <div className={`${darkMode ? "bg-black text-white border-white" : "bg-white text-black border-black"} text-center py-12 rounded-lg shadow-sm border`}>
            <MessageCircle className={`${darkMode ? "text-white" : "text-gray-400"} h-12 w-12 mx-auto mb-4`} />
            <h3 className="text-lg font-medium mb-2">No questions yet</h3>
            <p>Ask your first question to get AI-powered answers from your knowledge base</p>
          </div>
        )}
      </div>
    </Layout>
  );
};
