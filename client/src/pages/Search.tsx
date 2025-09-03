import React, { useState } from 'react';
import { Search as SearchIcon, Sparkles } from 'lucide-react';
import { Layout } from '../components/Layout';
import { DocumentCard } from '../components/DocumentCard';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

export const Search: React.FC = () => {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();

  
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
      const response = await fetch("http://localhost:5000/api/ai/search",{
        method:"POST",
        headers:{
           'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body:JSON.stringify({body : searchQuery})
      })
      if(!response.ok){
        const error = await response.json();
        throw new Error(error.message);
      }
      const results = await response.json();
      console.log("Results : " , results);
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
      const response = await fetch(`http://localhost:5000/api/documents?search=${encodeURIComponent(searchQuery)}`, {
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Documents</h1>
          <p className="mt-1 text-sm text-gray-600">
            Find documents using regular text search or AI-powered semantic search
          </p>
        </div>

        {/* Search Interface */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRegularSearch()}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        ) : searchResults?.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Search Results ({searchResults?.length})
            </h2>
            <div className="grid gap-6">
              {searchResults?.map(document => (
                <DocumentCard
                  key={document?._id}
                  document={document}
                  onEdit={(id) => navigate(`/documents/${id}/edit`)}
                  onDelete={() => {}}
                  onSummarize={() => {}}
                  onGenerateTags={() => {}}
                />
              ))}
            </div>
          </div>
        ) : searchQuery && !isSearching ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search terms or use semantic search</p>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};