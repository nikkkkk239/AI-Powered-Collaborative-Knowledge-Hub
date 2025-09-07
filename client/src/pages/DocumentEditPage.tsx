// @ts-nocheck
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import TextareaAutosize from "react-textarea-autosize";
import { API_BASE_URL, useAuthStore } from "../stores/authStore";
import { Sparkles, Tag } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Quill from "quill";
import ImageResize from "quill-image-resize-module-react";


const DocumentEditPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const [document, setDocument] = useState<any>(null);

  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    summary: "",
    tags: [] as string[],
  });
  const [loading, setLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

  // Fetch document
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDocument(data);
        const cleanDoc = {
          title: data.title,
          content: data.content,
          summary: data.summary || "",
          tags: data.tags || [],
        };
        setEditForm(cleanDoc);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [documentId, token]);

  const handleSave = async () => {

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const updated = await res.json();
      setDocument(updated); // update local snapshot
      console.log("Document saved!");
      navigate(`/document/edit/${documentId}`); 
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };


  const handleCancel = () => navigate(`/document/edit/${documentId}`);

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      setEditForm({ ...editForm, tags: [...editForm.tags, e.currentTarget.value.trim()] });
      e.currentTarget.value = "";
    }
  };

  const removeTag = (tag: string) => setEditForm({ ...editForm, tags: editForm.tags.filter(t => t !== tag) });



  const handleSummarize = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/summarize/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: editForm.content, title: editForm.title }),
      });
      const data = await res.json();
      if (res.ok) setEditForm(prev => ({ ...prev, summary: data.summary }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateTags = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/tags/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: editForm.content, title: editForm.title }),
      });
      const data = await res.json();
      if (res.ok) setEditForm(prev => ({ ...prev, tags: data.tags }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className={`flex min-h-screen items-center justify-center ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-current"></div>
      <p className="ml-3">Loading...</p>
    </div>
  );

  return (
    <div className={`${darkMode ? "bg-black text-white" : "bg-white text-black"} min-h-screen p-6 w-full mx-auto`}>
      {/* Header */}
      <div
        className={`
          sticky top-0 z-50 
          flex justify-between items-center 
          mb-5 p-4 ${darkMode ? "bg-black/50" : "bg-white/70"}
          backdrop-blur-md  mx-auto
        `}
      >
        <input
          type="text"
          value={editForm.title}
          onChange={(e) => {
            setEditForm({ ...editForm, title: e.target.value })
          }}
          className={`text-3xl font-bold border-b px-2 w-full max-w-[300px] focus:outline-none ${
            darkMode ? "border-white text-blue-500" : "border-black text-blue-500"
          }`}
        />

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-5 py-2 rounded-full hover:-translate-y-1 transition-all duration-200  bg-green-600 text-white hover:bg-green-700 ${
              isSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            className="px-5 py-2 rounded-full hover:-translate-y-1 transition-all duration-200 cursor-pointer bg-gray-400 text-white hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>


      {/* Content */}
      <div className="mb-15 w-full">
        {/* <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-blue-500" : "text-blue-700"}`}>Content</h2> */}
        <ReactQuill
          value={editForm.content}
          onChange={(val) => setEditForm({ ...editForm, content: val })}
          theme="snow"
          style={{ height: "fit-content" }}
          className={` [&_.ql-container]:min-h-[80vh] [&_.ql-container]:p-4 [&_.ql-container]:max-h-[80vh] [&_.ql-container]:overflow-y-scroll  [&_.ql-editor]:border-1 [&_.ql-editor]:border-black/10 [&_.ql-editor]:max-w-3xl [&_.ql-editor]:shadow-xl ${ darkMode && "[&_.ql-editor]:shadow-white/10 [&_.ql-editor]:bg-white/7 [&_.ql-editor]:border-white/10"} [&_.ql-container]:outline-none [&_.ql-editor]:min-h-[80vh] [&_.ql-editor]:mx-auto`}
          modules={fullToolbar}
        />
      </div>

      {/* Summary */}
      <div className="mb-4">
        <div className="flex w-full justify-between mb-2 items-center">
           <h2 className={`text-lg font-semibold mb-2 ${darkMode ? "text-blue-500" : "text-blue-700"}`}>Summary</h2>
          <button
          onClick={handleSummarize}
          disabled={!user?.hasGeminiKey || isProcessing}
          className="flex items-center space-x-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>Summarize</span>
          </button>
        </div>
       
        <TextareaAutosize
          minRows={2} maxRows={10}
          value={editForm.summary}
          onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
          className={`w-full border rounded-lg p-2 focus:outline-none ${darkMode ? "border-white text-white bg-black" : "border-black text-black bg-white"}`}
        />
      </div>

      {/* Tags */}
      <div className="mb-6">
        <div className="flex justify-between w-full items-center">
          <h2 className={`text-lg font-semibold mb-2 ${darkMode ? "text-blue-500" : "text-blue-700"}`}>Tags</h2>
          <button
            onClick={handleGenerateTags}
            disabled={!user?.hasGeminiKey || isProcessing}
            className="flex items-center cursor-pointer space-x-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 disabled:opacity-50"
          >
            <Tag className="h-4 w-4" />
            <span>Generate Tags</span>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {editForm.tags.map((tag, i) => (
            <span key={i} className={`px-3 py-1 rounded-full ${darkMode ? "bg-white/10 text-white" : "bg-blue-100 text-blue-700"} flex items-center gap-2`}>
              {tag}
              <button onClick={() => removeTag(tag)} className="text-red-500 hover:text-red-700">×</button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Press Enter to add tag"
            onKeyDown={handleTagInput}
            className={`border px-2 py-1 rounded-md ${darkMode ? "border-white text-white bg-black" : "border-black text-black bg-white"}`}
          />
        </div>
      </div>

      {/* AI Actions */}
      <div className="flex gap-2">
        
        
      </div>
      {!user?.hasGeminiKey && (
        <p className="text-xs text-yellow-600 mt-2">
          Add your Gemini API key in profile settings to use AI features
        </p>
      )}
    </div>
  );
};

export default DocumentEditPage;
