import React, { useState } from 'react';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuthStore } from '../stores/authStore';
import { useAIStore } from '../stores/aiStore';

interface QAItem {
  question: string;
  answer: string;
  timestamp: Date;
}

export const QA: React.FC = () => {
  const { token, user } = useAuthStore();
  const { askQuestion, isProcessing } = useAIStore();
  
  const [question, setQuestion] = useState('');
  const [qaHistory, setQAHistory] = useState<QAItem[]>([]);

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
      const answer = await askQuestion(token!, currentQuestion);
      const newQA: QAItem = {
        question: currentQuestion,
        answer,
        timestamp: new Date()
      };
      setQAHistory(prev => [newQA, ...prev]);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Q&A</h1>
          <p className="mt-1 text-sm text-gray-600">
            Ask questions about your team's knowledge base and get AI-powered answers
          </p>
        </div>

        {/* Question Input */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                Ask a question about your documents
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What would you like to know about your team's documents?"
              />
            </div>
            
            <div className="flex justify-between items-center">
              {!user?.hasGeminiKey ? (
                <p className="text-sm text-yellow-600">
                  Add your Gemini API key in profile settings to use Q&A
                </p>
              ) : (
                <div className="text-sm text-gray-500">
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
        {qaHistory.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Questions</h2>
            
            {qaHistory.map((qa, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                {/* Question */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">You asked:</p>
                    <p className="text-gray-700">{qa.question}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {qa.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {/* Answer */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">AI answered:</p>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{qa.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {qaHistory.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-600">Ask your first question to get AI-powered answers from your knowledge base</p>
          </div>
        )}
      </div>
    </Layout>
  );
};