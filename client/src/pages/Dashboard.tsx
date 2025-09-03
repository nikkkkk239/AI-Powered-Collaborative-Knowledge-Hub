import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from "use-debounce"; 

import { Plus, Filter,FileText, X, Edit, DeleteIcon, Delete, LucideDelete, Trash } from 'lucide-react';
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
    fetchingRecent,
    setSelectedTags,
    setSearchQuery
  } = useDocumentStore();
  const { summarizeDocument, generateTags } = useAIStore();
  
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 500);

  useEffect(() => {
    if (token) {
      fetchDocuments(token, {
        search: debouncedSearch.trim() , // undefined means "no filter"
        tags: selectedTags.join(","),
      });
      fetchRecentActivity(token);
    }
  }, [token, debouncedSearch, selectedTags]);

  useEffect(() => {
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
//   const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//   if (e.key === "Enter" ) {
//     setSearchQuery(searchInput); // update store only when Enter is pressed
//   }
// };

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
            <h1 className="text-2xl font-bold text-gray-900">Docs <span className='text-blue-700'>Dashboard</span></h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and explore your team's knowledge base
            </p>
          </div>
          <button
            onClick={() => navigate('/documents/new')}
            className="mt-4 sm:mt-0 cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors max-w-[190px] text-center"
          >
            <Plus className="h-4 w-4" />
            <span>New Document</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
  {/* Search + Filter */}
  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
    {/* Search Input */}
    <div className="relative flex-1">
      <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
          />
        </svg>
      </span>
      <input
        type="text"
        placeholder="Search documents..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        // onKeyDown={handleSearchKeyDown}
        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm"
      />
    </div>

    {/* Filter Button */}
    <button
      onClick={() => setShowFilters(!showFilters)}
      className={`inline-flex max-w-[100px] items-center cursor-pointer gap-2 px-4 py-2 rounded-full text-sm font-medium justify-center transition-all shadow-sm ${
        showFilters
          ? "bg-blue-500 text-white hover:bg-blue-600"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      <Filter className="h-4 w-4" />
      <span>Tags</span>
    </button>
  </div>

  {/* Tag Filters */}
  {showFilters && (
    <div className="mt-5 pt-5 border-t border-gray-200">
      <div className="flex flex-wrap gap-2">
        {availableTags.length == 0 ? <div className='text-sm text-black/50'>No tags available</div> : availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm ${
              selectedTags.includes(tag)
                ? "bg-blue-100 text-blue-800 border border-blue-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
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
                  className="inline-flex cursor-pointer items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">Team <span className='text-blue-700'>Activity</span></h3>

    <div className="space-y-4">
      {fetchingRecent ? <div className="text-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading activities...</p>
              </div> : recentActivity.length == 0 ? <div className='text-sm text-black/40'>No Recent Activities</div> : recentActivity.map((doc, i) => {
        const iconStyles =
          doc.activityType === "create"
            ? "bg-green-100 text-green-600"
            : doc.activityType === "update"
            ? "bg-blue-100 text-blue-600"
            : "bg-red-100 text-red-600";

        const Icon =
          doc.activityType === "create"
            ? FileText
            : doc.activityType === "update"
            ? Edit
            : Trash;

        return (
          <div
            key={i}
            className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition"
          >
            {/* Icon */}
            <div
              className={`flex-shrink-0 p-2 rounded-lg ${iconStyles} shadow-sm`}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 break-words">
                <span className="font-semibold">{doc.docName}</span>{" "}
                {doc.activityType === "create"
                  ? "was created"
                  : doc.activityType === "update"
                  ? "was updated"
                  : "was deleted"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                by <span className="font-medium">{doc.user.name}</span> •{" "}
                {new Date(doc.date).toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
</div>

        </div>
      </div>
    </Layout>
  );
};