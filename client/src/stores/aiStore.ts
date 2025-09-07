import { create } from 'zustand';
import { API_BASE_URL } from './authStore';
interface AIState {
  isProcessing: boolean;
  
  // Actions
  summarizeDocument: (token: string, content: string, documentId?: string) => Promise<string>;
  generateTags: (token: string, title: string, content: string) => Promise<string[]>;
  semanticSearch: (token: string, query: string) => Promise<any[]>;
  askQuestion: (token: string, question: string) => Promise<string>;
  setProcessing: (processing: boolean) => void;
}

export const useAIStore = create<AIState>((set) => ({
  isProcessing: false,

  summarizeDocument: async (token: string, content: string, documentId?: string) => {
    set({ isProcessing: true });
    try {
      const response = await fetch(`${API_BASE_URL}/ai/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content, documentId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      return data.summary;
    } finally {
      set({ isProcessing: false });
    }
  },

  generateTags: async (token: string, title: string, content: string) => {
    set({ isProcessing: true });
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      return data.tags;
    } finally {
      set({ isProcessing: false });
    }
  },

  semanticSearch: async (token: string, query: string) => {
    set({ isProcessing: true });
    try {
      const response = await fetch(`${API_BASE_URL}/ai/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      return data.documents;
    } finally {
      set({ isProcessing: false });
    }
  },

  askQuestion: async (token: string, question: string) => {
    set({ isProcessing: true });
    try {
      const response = await fetch(`${API_BASE_URL}/ai/qa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      return data.answer;
    } finally {
      set({ isProcessing: false });
    }
  },

  setProcessing: (processing: boolean) => set({ isProcessing: processing }),
}));