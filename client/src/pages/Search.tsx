import React, { useState } from 'react';
import { Search as SearchIcon, Sparkles } from 'lucide-react';
import { Layout } from '../components/Layout';
import { DocumentCard } from '../components/DocumentCard';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../stores/authStore';

export const Search: React.FC = () => {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSemanticSearch = async () => {
    if (!user?.hasGeminiKey) {
      alert('Please add your Gemini API key in profile settings to use AI features.');
      return;
    }
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/search`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ body: searchQuery })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      const results = await response.json();
      setSearchResults(results);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegularSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/documents?search=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.documents);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Layout>
      <div className={`${darkMode ? "bg-black text-white" : "bg-white text-black"} max-w-4xl slide-down-in mx-auto space-y-6`}>
        <div>
          <h1 className="text-2xl font-bold">
            Search <span className='text-blue-700'>Documents</span>
          </h1>
          <p className={`${darkMode ? "text-white/60" : "text-black"} mt-1 text-sm`}>
            Find documents using regular text search or AI-powered semantic search
          </p>
        </div>

        {/* Search Interface */}
        <div className={`${darkMode ? "bg-black border-white/70" : "bg-white border-black"} rounded-lg shadow-sm border p-6`}>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRegularSearch()}
                className={`${darkMode ? "bg-white/10 text-white border-white/40" : "bg-white text-black border-black"} w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Search for documents or topics..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleRegularSearch}
                disabled={!searchQuery.trim() || isSearching}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SearchIcon className="h-4 w-4" />
                <span>Text Search</span>
              </button>

              <button
                onClick={handleSemanticSearch}
                disabled={!searchQuery.trim() || isSearching || !user?.hasGeminiKey}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                <span>AI Semantic Search</span>
              </button>
            </div>

            {!user?.hasGeminiKey && (
              <p className="text-sm text-yellow-600">
                Add your Gemini API key in profile settings to use AI semantic search
              </p>
            )}
          </div>
        </div>

        {/* Search Results */}
        {isSearching ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className={`${darkMode ? "text-white" : "text-black"} mt-4`}>Searching...</p>
          </div>
        ) : searchResults?.length > 0 ? (
          <div className="space-y-6">
            <h2 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-black"}`}>
              Search Results ({searchResults?.length})
            </h2>
            <div className="grid gap-6">
              {searchResults?.map(document => (
                <DocumentCard
                  key={document?._id}
                  document={document}
                  onEdit={(id) => navigate(`/documents/${id}/edit`)}
                  onDelete={() => { }}
                  onSummarize={() => { }}
                  onGenerateTags={() => { }}
                  darkMode={darkMode}
                />
              ))}
            </div>
          </div>
        ) : searchQuery && !isSearching ? (
          <div className={`${darkMode ? "bg-black border-white/50 text-white/60" : "bg-white border-black text-black"} text-center py-12 rounded-lg shadow-sm border`}>
            <SearchIcon className={`${darkMode ? "text-white" : "text-gray-400"} h-12 w-12 mx-auto mb-4`} />
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p>Try adjusting your search terms or use semantic search</p>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};
