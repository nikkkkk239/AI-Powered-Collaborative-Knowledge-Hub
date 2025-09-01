import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useDocumentStore } from "../stores/documentStore";

const DocumentDetailsPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { user ,token} = useAuthStore();


  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", content: "" });

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/documents/${documentId}`,{
            method:"GET",
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        const data = await res.json();
        setDocument(data);
        setEditForm({ title: data.title, content: data.content });
      } catch (err) {
        console.error("Error fetching document:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [documentId]);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
      await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
      navigate("/documents");
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (!document) return <div className="p-6 text-red-600">Document not found</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        {editing ? (
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            className="text-3xl font-bold text-blue-700 border-b border-gray-300 focus:outline-none px-2"
          />
        ) : (
          <h1 className="text-3xl font-bold text-blue-700">{document.title}</h1>
        )}

        <div className="flex gap-3">
          {editing ? (
            <>
              <button
                onClick={handleUpdate}
                className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tags */}
      {document.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {document.tags.map((tag: string, i: number) => (
            <span
              key={i}
              className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Summary */}
      {document.summary && (
        <p className="text-gray-700 italic mb-6">“{document.summary}”</p>
      )}

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
      {document.versions?.length > 0 && (
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold mb-3">Version History</h2>
          <ul className="space-y-2">
            {document.versions.map((v: any, i: number) => (
              <li
                key={i}
                className="flex justify-between items-center border-b pb-2"
              >
                <span className="text-gray-700">
                  {v.title || "Untitled"} (saved on{" "}
                  {new Date(v.timestamp).toLocaleString()})
                </span>
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => setDocument(v)}
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Actions */}
      <div className="flex gap-4">
        <button
          disabled={!user?.hasGeminiKey}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            user?.hasGeminiKey
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Summarize
        </button>
        <button
          disabled={!user?.hasGeminiKey}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            user?.hasGeminiKey
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Generate Tags
        </button>
        <button
          disabled={!user?.hasGeminiKey}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            user?.hasGeminiKey
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Q&A
        </button>
      </div>
    </div>
  );
};

export default DocumentDetailsPage;
