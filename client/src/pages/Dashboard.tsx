import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter,FileText, X } from 'lucide-react';
import { Layout } from '../components/Layout';
import { DocumentCard } from '../components/DocumentCard';
import { useAuthStore } from '../stores/authStore';
import { useDocumentStore } from '../stores/documentStore';
import { useAIStore } from '../stores/aiStore';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const { 
    documents, 
    recentActivity, 
    isLoading, 
    selectedTags, 
    searchQuery,
    fetchDocuments, 
    deleteDocument, 
    fetchRecentActivity,
    setSelectedTags,
    setSearchQuery
  } = useDocumentStore();
  const { summarizeDocument, generateTags } = useAIStore();
  
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (token) {
      fetchDocuments(token, {
        search: searchQuery,
        tags: selectedTags.join(',')
      });
      fetchRecentActivity(token);
    }
  }, [token, searchQuery, selectedTags]);

  useEffect(() => {
    // Extract all unique tags
    const tags = new Set<string>();
    documents.forEach(doc => {
      doc.tags.forEach(tag => tags.add(tag));
    });
    setAvailableTags(Array.from(tags));
  }, [documents]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(token!, id);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleSummarize = async (id: string) => {
    if (!user?.hasGeminiKey) {
      alert('Please add your Gemini API key in profile settings to use AI features.');
      return;
    }

    try {
      const doc = documents.find(d => d._id === id);
      if (doc) {
        await summarizeDocument(token!, doc.content, id);
        fetchDocuments(token!);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleGenerateTags = async (id: string) => {
    if (!user?.hasGeminiKey) {
      alert('Please add your Gemini API key in profile settings to use AI features.');
      return;
    }

    try {
      const doc = documents.find(d => d._id === id);
      if (doc) {
        const tags = await generateTags(token!, doc.title, doc.content);
        // Update document with new tags
        const response = await fetch(`http://localhost:5000/api/documents/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ tags }),
        });
        
        if (response.ok) {
          fetchDocuments(token!);
        }
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and explore your team's knowledge base
            </p>
          </div>
          <button
            onClick={() => navigate('/documents/new')}
            className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Document</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Tags</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{tag}</span>
                    {selectedTags.includes(tag) && <X className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Documents */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                <p className="text-gray-600 mb-4">Start building your knowledge base</p>
                <button
                  onClick={() => navigate('/documents/new')}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create First Document</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {documents.map(document => (
                  <DocumentCard
                    key={document._id}
                    document={document}
                    onEdit={(id) => navigate(`/documents/${id}/edit`)}
                    onDelete={handleDelete}
                    onSummarize={handleSummarize}
                    onGenerateTags={handleGenerateTags}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map(doc => (
                  <div key={doc._id} className="flex items-start space-x-3">
                    <FileText className="h-4 w-4 text-gray-400 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {doc.createdBy.name} • {new Date(doc.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};