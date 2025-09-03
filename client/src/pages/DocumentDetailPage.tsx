import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog } from "@headlessui/react"; 
import { X } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { MoveLeftIcon, Sparkles, Tag } from "lucide-react";

const DocumentDetailsPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing , setIsProcessing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    tags: [] as string[],
    summary: "",
  });

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/documents/${documentId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setDocument(data);
        setEditForm({
          title: data.title,
          content: data.content,
          tags: data.tags || [],
          summary: data.summary || "",
        });
      } catch (err) {
        console.error("Error fetching document:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [documentId, token]);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      const updated = await res.json();
      setDocument(updated);
      setEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await fetch(`http://localhost:5000/api/documents/${documentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleGenerateTags = async () => {
    setIsProcessing(true);

  try {
    const res = await fetch(`http://localhost:5000/api/ai/tags/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body:JSON.stringify({content : editForm.content , title:editForm.title})
    });
    const data = await res.json();
    if (res.ok) {
      setEditForm((prev) => ({ ...prev, tags: data.tags }));
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
      body: JSON.stringify({ content: editForm.content , title : editForm.title})
    });
    const data = await res.json();
    if (res.ok) {
      setEditForm((prev) => ({ ...prev, summary: data.summary }));
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

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      setEditForm({
        ...editForm,
        tags: [...editForm.tags, e.currentTarget.value.trim()],
      });
      e.currentTarget.value = "";
    }
  };

  const removeTag = (tag: string) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter((t) => t !== tag),
    });
  };

  // ✅ Check if any changes are made
  const isChanged = useMemo(() => {
    if (!document) return false;
    return (
      editForm.title !== document.title ||
      editForm.content !== document.content ||
      editForm.summary !== (document.summary || "") ||
      JSON.stringify(editForm.tags) !== JSON.stringify(document.tags || [])
    );
  }, [editForm, document]);
  console.log(selectedVersion);

  if (loading) return <div className="text-center min-h-[100vh] flex min-w-[100vw] gap-5 items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 "></div>
                <p className=" text-gray-600">Loading...</p>
              </div>;
  if (!document) return <div className="p-6 text-red-600">Document not found</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-row items-center gap-5">
        <MoveLeftIcon className="cursor-pointer" onClick={()=>navigate("/dashboard")}/>
        {editing ? (
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            className="text-3xl font-bold text-blue-700 border-b border-gray-300 focus:outline-none px-2 w-full"
          />
        ) : (
          <h1 className="text-3xl font-bold text-blue-700">{document.title}</h1>
        )}
        </div>

        <div className="flex gap-3">
          {editing ? (
            <>
              <button
                onClick={handleUpdate}
                disabled={!isChanged} // ✅ disabled when no changes
                className={`px-3 py-1 cursor-pointer rounded-lg text-white ${
                  isChanged
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1 bg-gray-400 text-white rounded-lg hover:bg-gray-500 cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <div className="flex gap-3">
  <button
    onClick={() => setEditing(true)}
    className="px-4 cursor-pointer py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white 
               shadow-md hover:from-blue-600 hover:to-blue-700 
               active:scale-95 transition-all duration-200"
  >
    Edit
  </button>

  <button
    onClick={handleDelete}
    className="px-4 cursor-pointer py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white 
               shadow-md hover:from-red-600 hover:to-red-700 
               active:scale-95 transition-all duration-200"
  >
    Delete
  </button>
</div>

            </>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Tags</h2>
        {editing ? (
          <div className="flex flex-wrap gap-2">
            {editForm.tags.map((tag, i) => (
              <span
                key={i}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              onKeyDown={handleTagInput}
              placeholder="Press Enter to add tag"
              className="border px-2 py-1 rounded-md text-sm"
            />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {document.tags?.map((tag: string, i: number) => (
              <span
                key={i}
                className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        {editing ? (
          <textarea
            value={editForm.summary}
            onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2 h-20 focus:outline-none"
          />
        ) : (
          <p className="text-gray-700 italic">{document.summary || "No summary"}</p>
        )}
      </div>

      {/* Content */}
      <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-3">Content</h2>
        {editing ? (
          <textarea
            value={editForm.content}
            onChange={(e) =>
              setEditForm({ ...editForm, content: e.target.value })
            }
            className="w-full h-40 border border-gray-300 rounded-lg p-2 focus:outline-none"
          />
        ) : (
          <p className="text-gray-800 whitespace-pre-wrap">{document.content}</p>
        )}
      </div>

      {/* Versions */}
      {document.versions?.length > 0 && !editing && (
  <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200 mb-6">
    <h2 className="text-xl font-semibold mb-3">Version History</h2>

    {/* Horizontal Scroll */}
    <div className="flex gap-4 overflow-x-auto pb-2">
      {document.versions.map((v: any, i: number) => (
        <div
          key={i}
          onClick={() => setSelectedVersion(v)}
          className="min-w-[250px] max-w-[400px] cursor-pointer bg-gray-50 border rounded-xl shadow-sm p-4 hover:shadow-md transition-all"
        >
          <p className="text-sm text-gray-700 font-medium">
            {new Date(v.updatedAt).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Updated by: {v.updatedBy?.name || "Unknown"}
          </p>
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            {v.summary || "No summary"}
          </p>
        </div>
      ))}
    </div>
  </div>
)}

{/* Modal for Version Details */}
{selectedVersion && (
  <Dialog
    open={!!selectedVersion}
    onClose={() => setSelectedVersion(null)}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    {/* Background Overlay */}
    <div 
  className="fixed inset-0 bg-black/40 backdrop-blur-sm" 
  aria-hidden="true" 
/>

    <div className="relative bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl overflow-y-auto max-h-[90vh]">
      {/* Close Button */}
      <button
        onClick={() => setSelectedVersion(null)}
        className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-800"
      >
        <X className="h-6 w-6" />
      </button>

      <h3 className="text-xl font-semibold mb-4">Version Details</h3>

      <p className="text-sm text-gray-600 mb-2">
        Updated on:{" "}
        <span className="font-medium">
          {new Date(selectedVersion.updatedAt).toLocaleString()}
        </span>
      </p>

      <p className="text-sm text-gray-600 mb-4">
        Updated by:{" "}
        <span className="font-medium">
          {selectedVersion.updatedBy?.name || "Unknown"} (
          {selectedVersion.updatedBy?.email || "No email"})
        </span>
      </p>

      <div className="mb-4">
        <h4 className="text-lg font-medium">Summary</h4>
        <p className="text-gray-700 italic">
          {selectedVersion.summary || "No summary"}
        </p>
      </div>

      <div className="mb-4">
        <h4 className="text-lg font-medium">Tags</h4>
        <div className="flex flex-wrap gap-2 mt-1">
          {selectedVersion.tags?.length > 0 ? (
            selectedVersion.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No tags</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium mb-2">Content</h4>
        <p className="text-gray-800 whitespace-pre-wrap">
          {selectedVersion.content}
        </p>
      </div>
    </div>
  </Dialog>
)}

      {/* AI Actions */}
      {editing && <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-4">
        <button
          disabled={!user?.hasGeminiKey || isProcessing}
          onClick={handleSummarize}
          className="flex items-center space-x-1 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          <span>Summarize</span>
        </button>
        <button
          disabled={!user?.hasGeminiKey || isProcessing}
          onClick={handleGenerateTags}
          className="flex items-center space-x-1 px-3 py-2 text-sm bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Tag className="h-4 w-4" />
          <span>Generate Tags</span>
        </button>
        </div>
        {!user?.hasGeminiKey && (
          <p className="text-xs text-yellow-600 mt-2">
            Add your Gemini API key in profile settings to use AI features
          </p>
      )}
      </div>
      
      
      }
      

    </div>
  );
};

export default DocumentDetailsPage;
