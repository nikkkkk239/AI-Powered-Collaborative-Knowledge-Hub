// @ts-nocheck

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from "use-debounce"; 
import { Plus, Filter, FileText, X, Edit, Trash } from 'lucide-react';
import { API_BASE_URL, useAuthStore } from '../stores/authStore';
import { useDocumentStore } from '../stores/documentStore';
import { useAIStore } from '../stores/aiStore';
import { useTheme } from '../context/ThemeContext';
import { DocumentCard } from '../components/DocumentCard';
import { useSocket } from "../context/SocketContext";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const socket = useSocket();
  const { theme } = useTheme();
  const dark = theme === "dark";

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
    setSearchQuery,
    addDocument , addActivity
  } = useDocumentStore();

  const { summarizeDocument, generateTags } = useAIStore();
  
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 500);

  useEffect(() => {
    if (token) {
      fetchDocuments(token, {
        search: debouncedSearch.trim(),
        tags: selectedTags.join(","),
      });
      fetchRecentActivity(token);
    }
  }, [token, debouncedSearch, selectedTags]);


   useEffect(() => {
    if (!socket) return;

    // New Document Event
    socket.on("document:new", (doc : any) => {
      console.log("📄 New document received:", doc);
      addDocument(doc); // update store
    });

    // Document Updated Event
    socket.on("document:update", (doc:any) => {
      console.log("✏️ Document updated:", doc);
      fetchDocuments(token!); // or update store directly
    });

    socket.on("document:delete", (docId:string) => {
      console.log("🗑️ Document deleted:", docId);
      fetchDocuments(token!);
    });

    // Recent Activity Event
    socket.off("activity:new");
    socket.on("team:activity", (activity : any) => {
      console.log("🔥 New activity received:", activity);
      addActivity(activity); // update store
    });

    return () => {
      socket.off("document:new");
      socket.off("document:update");
      socket.off("document:delete");
      socket.off("activity:new");
    };
  }, [socket, token, addDocument, addActivity, fetchDocuments]);

  useEffect(() => {
    const tags = new Set<string>();
    documents.forEach(doc => doc.tags.forEach(tag => tags.add(tag)));
    setAvailableTags(Array.from(tags));
  }, [documents]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try { await deleteDocument(token!, id); } 
      catch (error: any) { alert(error.message); }
    }
  };

  const handleSummarize = async (id: string) => {
    if (!user?.hasGeminiKey) {
      alert('Please add your Gemini API key in profile settings.');
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
      alert('Please add your Gemini API key in profile settings.');
      return;
    }
    try {
      const doc = documents.find(d => d._id === id);
      if (doc) {
        const tags = await generateTags(token!, doc.title, doc.content);
        const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ tags }),
        });
        if (response.ok) fetchDocuments(token!);
      }
    } catch (error: any) { alert(error.message); }
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
  };

  return (
    <div className={`space-y-6 transition-colors duration-300 ${dark ? "bg-black text-gray-200" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <div className={`flex flex-col slide-down-in sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <h1 className={`text-2xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>
            Docs <span className={dark ? "text-blue-400" : "text-blue-700"}>Dashboard</span>
          </h1>
          <p className={dark ? "mt-1 text-sm text-gray-400" : "mt-1 text-sm text-gray-600"}>
            Manage and explore your team's knowledge base
          </p>
        </div>
        <button
          onClick={() => navigate('/documents/new')}
          className="mt-4 sm:mt-0 cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-md shadow-lg transition-all max-w-[190px] text-center hover:scale-105 bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/50"
        >
          <Plus className="h-4 w-4" />
          <span>New Document</span>
        </button>
      </div>

      {/* Filters */}
      <div className={`transition-all slide-down-in rounded-2xl shadow-sm border p-6 ${dark ? "bg-white/10 border-gray-700" : "bg-white border-gray-100"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <span className={`absolute inset-y-0 left-3 flex items-center ${dark ? "text-gray-400" : "text-gray-400"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm ${
                dark ? "bg-white/10 border-gray-700 text-gray-200 placeholder-gray-400" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex max-w-[100px] items-center gap-2 px-4 py-2 rounded-full text-sm font-medium justify-center cursor-pointer transition-all shadow-sm ${
              showFilters
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : dark
                  ? "bg-white/10 text-gray-200 hover:bg-white/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Tags</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-5 pt-5 border-t transition-colors duration-300" style={{borderColor: dark ? "#444" : ""}}>
            <div className="flex flex-wrap gap-2">
              {availableTags.length === 0 ? (
                <div className="text-sm text-gray-400">No tags available</div>
              ) : availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex cursor-pointer items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm ${
                    selectedTags.includes(tag)
                      ? dark
                        ? "bg-white/20 text-white border-black/20"
                        : "bg-blue-100 text-blue-800 border-blue-200"
                      : dark
                        ? "bg-black text-gray-200 border-white hover:bg-white/10"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Documents */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="text-center py-12">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${dark ? "border-white" : "border-blue-600"} mx-auto`}></div>
              <p className={dark ? "mt-4 text-gray-400" : "mt-4 text-gray-600"}>Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className={`text-center py-12 rounded-lg border p-6 ${dark ? "bg-white/10 border-gray-700" : "bg-white border-gray-200"}`}>
              <FileText className={`h-12 w-12 ${dark ? "text-gray-400" : "text-gray-400"} mx-auto mb-4`} />
              <h3 className={dark ? "text-lg font-medium text-white mb-2" : "text-lg font-medium text-gray-900 mb-2"}>No documents yet</h3>
              <p className={dark ? "text-gray-400 mb-4" : "text-gray-600 mb-4"}>Start building your knowledge base</p>
              <button
                onClick={() => navigate('/documents/new')}
                className='inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700'
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
                  darkMode={dark} // if your DocumentCard supports darkMode prop
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 slide-right-in">
          <div className={`rounded-2xl shadow-sm hover:shadow-lg hover:shadow-blue-500/20 hover:scale-102 p-6 transition-all duration-200 ${dark ? "bg-white/10 border border-gray-700" : "bg-white border border-gray-100"}`}>
            <div className='flex items-center justify-between mb-6'>
              <h3 className={dark ? "text-lg font-semibold text-white" : "text-lg font-semibold text-gray-900"}>
                Team <span className={dark ? "text-blue-400" : "text-blue-700"}>Activity</span>
              </h3>
            </div>

            <div className="space-y-4">
              {fetchingRecent ? (
                <div className="text-center py-12">
                  <div className={`animate-spin rounded-full h-6 w-6 border-b-2 mx-auto ${dark ? "border-white" : "border-blue-600"}`}></div>
                  <p className={dark ? "mt-4 text-gray-400" : "mt-4 text-gray-600"}>Loading activities...</p>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className={dark ? "text-sm text-gray-400" : "text-sm text-black/40"}>No Recent Activities</div>
              ) : recentActivity.map((doc, i) => {
                const iconStyles =
                  doc.activityType === "create"
                    ? dark ? "bg-green-800 text-green-100" : "bg-green-100 text-green-600"
                    : doc.activityType === "update"
                    ? dark ? "bg-blue-800 text-blue-100" : "bg-blue-100 text-blue-600"
                    : dark ? "bg-red-800 text-red-100" : "bg-red-100 text-red-600";

                const Icon =
                  doc.activityType === "create"
                    ? FileText
                    : doc.activityType === "update"
                    ? Edit
                    : Trash;

                return (
                  <div key={i} className={`flex items-start gap-4 p-3 rounded-xl ${dark?"hover:bg-white/10" : "hover:bg-gray-200"} transition-all duration-150`}>
                    <div className={`flex-shrink-0 p-2 rounded-lg shadow-sm ${iconStyles}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={dark ? "text-sm font-medium text-gray-200 break-words" : "text-sm font-medium text-gray-900 break-words"}>
                        <span className="font-semibold">{doc.docName}</span>{" "}
                        {doc.activityType === "create" ? "was created" : doc.activityType === "update" ? "was updated" : "was deleted"}
                      </p>
                      <p className={dark ? "text-xs text-gray-400 mt-1" : "text-xs text-gray-500 mt-1"}>
                        by <span className="font-medium">{doc.user.name}</span> • {new Date(doc.date).toLocaleString()}
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
  );
};
