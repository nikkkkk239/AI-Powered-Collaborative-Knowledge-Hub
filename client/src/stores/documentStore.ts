import { create } from 'zustand';
import type { User } from './authStore';

interface Document {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  summary: string;
  teamId : string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  versions?: Array<{
    content: string;
    summary: string;
    tags: string[];
    teamId : string;
    updatedAt: string;
    updatedBy: {
      _id: string;
      name: string;
      email: string;
    };
  }>;
}

interface Activity{
  docName : string;
  date : Date;
  user:User,
  activityType : "create" | "delete" | "update";
}

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  recentActivity: Activity[];
  isLoading: boolean;
  searchQuery: string;
  fetchingRecent : boolean;
  selectedTags: string[];
  
  // Actions
  fetchDocuments: (token: string, params?: any) => Promise<void>;
  fetchDocument: (token: string, id: string) => Promise<void>;
  createDocument: (token: string, data: any) => Promise<Document>;
  updateDocument: (token: string, id: string, data: any) => Promise<Document>;
  deleteDocument: (token: string, id: string) => Promise<void>;
  fetchRecentActivity: (token: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  recentActivity: [],
  isLoading: false,
  searchQuery: '',
  fetchingRecent : true,
  selectedTags: [],

  fetchDocuments: async (token: string, params = {}) => {
    set({ isLoading: true });
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`http://localhost:5000/api/documents?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch documents');

      const data = await response.json();
      
      set({ documents: data.documents });
      console.log("Documents : " , get().documents);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDocument: async (token: string, id: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`http://localhost:5000/api/documents/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch document');

      const document = await response.json();
      set({ currentDocument: document });
    } finally {
      set({ isLoading: false });
    }
  },

  createDocument: async (token: string, data: any) => {
    const response = await fetch('http://localhost:5000/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const document = await response.json();
    set(state => ({ documents: [document, ...state.documents] }));
    return document;
  },

  updateDocument: async (token: string, id: string, data: any) => {
    const response = await fetch(`http://localhost:5000/api/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const document = await response.json();
    set(state => ({
      documents: state.documents.map(doc => doc._id === id ? document : doc),
      currentDocument: document
    }));
    return document;
  },

  deleteDocument: async (token: string, id: string) => {
    const response = await fetch(`http://localhost:5000/api/documents/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    set(state => ({
      documents: state.documents.filter(doc => doc._id !== id)
    }));
  },

  fetchRecentActivity: async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/documents/activity/recent', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch recent activity');

      const res = await response.json();
      set({ recentActivity : res.recentActivity });
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
    finally{
      set({fetchingRecent : false})
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedTags: (tags: string[]) => set({ selectedTags: tags }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));