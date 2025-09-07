import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Sparkles, Tag, ArrowLeft, X } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useDocumentStore } from '../stores/documentStore';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Quill styles
import ImageResize from "quill-image-resize-module-react";
import { Maximize2, Minimize2 } from "lucide-react";
import Quill from "quill";
import { useTheme } from '../context/ThemeContext';

Quill.register("modules/imageResize", ImageResize);

export const DocumentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const {theme} = useTheme();

  const darkMode = theme == "dark";

  const fullToolbar = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ['blockquote', 'code-block'],
      [{ script: 'sub' }, { script: 'super' }],
      [{ direction: 'rtl' }],
      ['link', 'image', 'video', 'formula'],
      ['clean'],
    ],
    imageResize: {
      parchment: Quill.import("parchment"),
      modules: ["Resize", "DisplaySize", "Toolbar"]
    }
  };

  const { token, user } = useAuthStore();
  const { currentDocument, fetchDocument, createDocument, updateDocument } = useDocumentStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    summary: ''
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isEditing && id && token) fetchDocument(token, id);
  }, [id, isEditing, token]);

  useEffect(() => {
    if (currentDocument && isEditing) {
      setFormData({
        title: currentDocument.title,
        content: currentDocument.content,
        tags: currentDocument.tags,
        summary: currentDocument.summary!
      });
    }
  }, [currentDocument, isEditing]);

  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isFullscreen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleEditorChange = (value: string) => setFormData(prev => ({ ...prev, content: value }));

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };
  const removeTag = (tag: string) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const handleSummarize = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`http://localhost:5000/api/ai/summarize/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: formData.content, title: formData.title })
      });
      const data = await res.json();
      if (res.ok) setFormData(prev => ({ ...prev, summary: data.summary }));
      else console.error("Summarize failed:", data.message);
    } catch (err) { console.error(err); }
    finally { setIsProcessing(false); }
  };

  const handleGenerateTags = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`http://localhost:5000/api/ai/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: formData.content, title: formData.title })
      });
      const data = await res.json();
      if (res.ok) setFormData(prev => ({ ...prev, tags: data.tags }));
      else console.error("Tags failed:", data.message);
    } catch (err) { console.error(err); }
    finally { setIsProcessing(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && id) await updateDocument(token!, id, formData);
      else await createDocument(token!, formData);
      navigate('/dashboard');
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/dashboard')} className={`inline-flex items-center space-x-2 cursor-pointer ${darkMode ? "text-gray-300 hover:text-white" : "text-gray-600  hover:text-gray-900"} mb-4`}>
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
        <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{isEditing ? 'Edit Document' : 'Create New Document'}</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={` ${darkMode ?"shadow-white/10 shadow-lg bg-black border-gray-700" : "border-gray-200 bg-white shadow-sm"}  rounded-lg  border   p-6 space-y-6 relative z-10`}>
        
        {/* Fullscreen overlay */}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-start p-8 overflow-y-auto">
            <div className={`w-full max-w-5xl ${darkMode ?" bg-black" : "bg-white"} py-8 md:px-6 rounded-md shadow-lg relative min-h-[90vh]`}>
              <div className="flex justify-between items-center mb-4">
                <label className={`block text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-700 "} mb-2`}>Content</label>
                <button type="button" onClick={() => setIsFullscreen(false)} className={`p-2 rounded-md  ${darkMode ? "text-white/70 hover:text-white" :"text-black/50 hover:text-black"} cursor-pointer  transition-colors z-50`}>
                  
                  <Minimize2 className="h-5 w-5" />
                </button>
              </div>

              {/* Content inside fullscreen */}
              <div className="space-y-6">
                {/* Title */}
                {/* Editor */}
                <div>
                  
                  <ReactQuill
                    value={formData.content}
                    onChange={handleEditorChange}
                    theme="snow"
                    modules={fullToolbar}
                    className="rounded-md min-h-[80vh] [&_.ql-editor]:min-h-[70vh]"
                    placeholder='Write your content...'
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Normal view content */}
        {!isFullscreen && (
          <>
            {/* Title */}
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-white/90" : "text-black"} mb-2`}>Title</label>
              <input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 border  border-gray-300 rounded-md bg-white  text-gray-900 0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode && "border-gray-600 bg-white/10 text-white"}`}
                placeholder="Document title..."
              />
            </div>

            {/* Editor */}
            <div className="relative">
              <div className='mb-3 flex items-center justify-between'>
                <label className={`block text-sm font-medium ${darkMode ? "text-white/90" : "text-black"} mb-2`}>Content</label>
                <button 
                  type="button" 
                  onClick={() => setIsFullscreen(true)} 
                  className={`p-2 rounded-md  ${darkMode ? "text-white/70 hover:text-white" :"text-black/50 hover:text-black"} cursor-pointer  transition-colors z-50`}
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
              </div>
              <ReactQuill
                value={formData.content}
                onChange={handleEditorChange}
                theme="snow"
                modules={fullToolbar}
                className="[&_.ql-editor]:min-h-[300px] rounded-md [&_.ql-editor.ql-blank::before]:text-gray-400"
                placeholder='write your content...'
              />
            </div>

            <div>
          <div className="flex items-center justify-between mb-3">
            <label className={`block text-sm font-medium ${darkMode ? "text-white/90" : "text-black"} mb-2`}>Summary</label>
            <button type="button" onClick={handleSummarize} disabled={!formData.content || isProcessing || !user?.hasGeminiKey} className="inline-flex items-center space-x-1 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Sparkles className="h-4 w-4" />
              <span>AI Summarize</span>
            </button>
          </div>
          <textarea name="summary" rows={3} value={formData.summary} onChange={handleChange} className={`w-full px-4 py-2 border  border-gray-300 rounded-md bg-white  text-gray-900 0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode && "border-gray-600 bg-white/10 text-white"}`} placeholder="Document summary..." />
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className={`block text-sm font-medium ${darkMode ? "text-white/90" : "text-black"} mb-2`}>Tags</label>
            <button type="button" onClick={handleGenerateTags} disabled={!formData.content || isProcessing || !user?.hasGeminiKey} className="inline-flex items-center space-x-1 px-3 py-2 text-sm bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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
              className={`w-full px-4 py-2 border  border-gray-300 rounded-md bg-white  text-gray-900 0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode && "border-gray-600 bg-white/10 text-white"}`}
              placeholder="Add tags..."
            />
            <button type="button" onClick={addTag} className="px-4 py-2 cursor-pointer bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">Add</button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span key={tag} className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <span>{tag}</span>
                <button type="button" onClick={() => removeTag(tag)} className="text-blue-600 hover:text-blue-800"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/dashboard')} className={`px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md ${darkMode ? "hover:bg-white/40" : "hover:bg-black"} cursor-pointer transition-colors`}>Cancel</button>
          <button type="submit" className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
            <Save className="h-4 w-4" />
            <span>{isEditing ? 'Update' : 'Create'}</span>
          </button>
        </div>

            {/* Summary, Tags, Submit (same as your previous code) */}
            {/* ...copy your previous summary, tags, and submit section here */}
          </>
        )}
      </form>
    </div>
  );
};
