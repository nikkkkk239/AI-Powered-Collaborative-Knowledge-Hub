import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Sparkles, Tag, ArrowLeft , X} from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuthStore } from '../stores/authStore';
import { useDocumentStore } from '../stores/documentStore';
import { useAIStore } from '../stores/aiStore';
import toast from 'react-hot-toast';

export const DocumentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { token, user } = useAuthStore();
  const { currentDocument, fetchDocument, createDocument, updateDocument } = useDocumentStore();
  const [isProcessing , setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    summary: ''
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isEditing && id && token) {
      fetchDocument(token, id);
    }
  }, [id, isEditing, token]);

  useEffect(() => {
    if (currentDocument && isEditing) {
      setFormData({
        title: currentDocument.title,
        content: currentDocument.content,
        tags: currentDocument.tags,
        summary: currentDocument.summary
      });
    }
  }, [currentDocument, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && id) {
        await updateDocument(token!, id, formData);
      } else {
        await createDocument(token!, formData);
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSummarize = async () => {
    setIsProcessing(true)
  try {
    console.log("click")
    const res = await fetch(`http://localhost:5000/api/ai/summarize/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: formData.content , title : formData.title})
    });
    const data = await res.json();
    if (res.ok) {
      setFormData((prev) => ({ ...prev, summary: data.summary }));
    } else {
      if (res.status === 503) {
        alert("Gemini is currently overloaded. Please try again later.");
      } else {
        console.error("Summarize failed:", data.message);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
  finally{
    
    setIsProcessing(false)

  }
};

  const handleGenerateTags = async () => {
    setIsProcessing(true);


  try {
    const res = await fetch(`http://localhost:5000/api/ai/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body:JSON.stringify({content : formData.content , title:formData.title})
    });
    const data = await res.json();
    if (res.ok) {
      setFormData((prev) => ({ ...prev, tags: data.tags }));
    } else {
      if (res.status === 503) {
        alert("Gemini is currently overloaded. Please try again later.");
      } else {
        console.error("Summarize failed:", data.message);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
  finally{
    setIsProcessing(false);
  }
};

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex cursor-pointer items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Document' : 'Create New Document'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Document title..."
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={12}
              value={formData.content}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write your document content here..."
            />
          </div>

          {/* Summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                Summary
              </label>
              <button
                type="button"
                onClick={handleSummarize}
                disabled={!formData.content || isProcessing || !user?.hasGeminiKey}
                className="inline-flex cursor-pointer items-center space-x-1 px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                <span>AI Summarize</span>
              </button>
            </div>
            <textarea
              id="summary"
              name="summary"
              rows={3}
              value={formData.summary}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Document summary..."
            />
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <button
                type="button"
                onClick={handleGenerateTags}
                disabled={!formData.content || isProcessing || !user?.hasGeminiKey}
                className="inline-flex cursor-pointer items-center space-x-1 px-3 py-1 text-sm bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Tag className="h-4 w-4" />
                <span>AI Generate</span>
              </button>
            </div>
            
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add tags..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isEditing ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};