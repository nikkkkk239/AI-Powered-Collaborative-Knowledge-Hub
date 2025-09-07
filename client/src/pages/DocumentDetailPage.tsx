import { ChevronLeft, ChevronRight } from "lucide-react"
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { X, MoveLeftIcon, Sparkles, Tag } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { useAuthStore } from "../stores/authStore";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { useTheme } from "../context/ThemeContext";
import { useDocumentStore } from "../stores/documentStore";

const DocumentDetailsPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const {deleteDocument} = useDocumentStore();
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false)
  const darkMode = theme === "dark";

  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom , setZoom] = useState(1)
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    tags: [] as string[],
    summary: "",
  });

  useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth < 1024) { // e.g. collapse below lg breakpoint
      setIsCollapsed(false);
    } else {
      setIsCollapsed(false);
    }
  };

  handleResize(); // run once on mount
  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/documents/${documentId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  
  const handleDelete = async()=>{
    if(!documentId) return;
    setLoading(true);

    try {
      if(!confirm("Are you sure you want to delete ?")){
        return;
      }
      await deleteDocument(token! , documentId);
      navigate("/dashboard");
    } catch (error) {
      console.error("Revert failed:", error);
    } finally {
      setLoading(false);
    }

  }

  const handleRevert = async (selectedVersion : any) => {

    if (!selectedVersion) return;

    let index = document.versions.findIndex((v : any) => v === selectedVersion);

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/documents/revert/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          versionIndex : index
        }),
      });
      const updated = await res.json();
      setDocument(updated);
      setSelectedVersion(null);
    } catch (err) {
      console.error("Revert failed:", err);
    } finally {
      setLoading(false);
    }
  };

  

  if (loading) return (
    <div className={`flex min-h-screen items-center justify-center ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-current"></div>
      <p className="ml-3">Loading...</p>
    </div>
  );

  if (!document) return <div className={`p-6 ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>Document not found</div>;

  return (
    <div className={`${darkMode ? "bg-black text-white" : "bg-white text-black"} [scrollbar-width:none] 
  [-ms-overflow-style:none] 
  [&::-webkit-scrollbar]:w-0 
  [&::-webkit-scrollbar]:h-0 p-6 min-h-screen flex flex-col gap-6`}>
      {/* Header */}
      <div className="flex justify-between  items-center">
        <div className="flex items-center gap-4">
          <MoveLeftIcon className="cursor-pointer" onClick={() => navigate("/dashboard")} />
          <h1 className="text-3xl font-bold text-blue-500">{document.title}</h1>
        </div>
        <div className="flex gap-4">
  {/* Edit Button */}
  <button
    onClick={() => navigate(`/documents/${documentId}/edit`)}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-blue-500  hover:bg-blue-500 bg-blue-500 text-white hover:-translate-y-1 transition-all duration-150 hover:text-white cursor-pointer "
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5h2m-1-1v2m-7 4h2m-1-1v2m4 4h2m-1-1v2m4-4h2m-1-1v2m-7-7h2m-1-1v2"
      />
    </svg>
    Edit
  </button>

  {/* Delete Button */}
  <button
    onClick={handleDelete}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-red-500  hover:bg-red-500 bg-red-500 text-white hover:-translate-y-1 hover:text-white cursor-pointer transition-all duration-150"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
    Delete
  </button>
</div>

      </div>

      <div className="flex flex-col   lg:flex-row ">
  {/* Left: Content full-page style */}
<div className="flex-1 max-h-[calc(100vh-98px)] [scrollbar-width:none] 
  [-ms-overflow-style:none] 
  [&::-webkit-scrollbar]:w-2 
  [&::-webkit-scrollbar]:h-4 relative p-10 px-0 md:px-10 overflow-y-auto flex justify-center items-start">
  <div
    className={`prose max-w-[700px] min-h-[100vh] shadow-xl  w-full p-6 border rounded-lg
      ${darkMode
        ? "prose-invert border-white/30 bg-white/5 shadow-white/10 text-white"
        : "border-black/10 bg-white text-black"
      }`} style={{ zoom: zoom }}
    dangerouslySetInnerHTML={{ __html: document.content }}
  />
  <div className="absolute top-2 right-6 self-start flex flex-col gap-2 z-10 ml-20">
    <button
      onClick={() => setZoom((prev) => Math.min(prev + 0.1, 2))}
      className="px-3 py-1 rounded cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
    >
      +
    </button>
    <button
      onClick={() => setZoom((prev) => Math.max(prev - 0.1, 0.5))}
      className="px-3 py-1 rounded cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
    >
      -
    </button>
  </div>
  
</div>



  {/* Right: metadata */}
{/* Right: metadata */}
<div
  className={`flex-shrink-0 min-h-[calc(100vh-98px)] flex flex-col border-l gap-4 pl-5 overflow-y-auto max-h-[calc(100vh-98px)] transition-all duration-300 relative ${darkMode && "border-white"} ${
    isCollapsed ? "w-16" : "w-full lg:w-80"
  }`}
>
  {/* Collapse button */}
  <button
    onClick={() => setIsCollapsed((prev) => !prev)}
    className={`absolute top-2 hidden rounded-full hover:bg-black/20 transition-all duration-300 right-3 cursor-pointer w-8 h-8 lg:flex z-10 items-center justify-center ${darkMode && "text-white hover:bg-white/20"}`}
  >
    {isCollapsed ? <ChevronLeft /> : <ChevronRight/> }
  </button>

  {/* Tags */}
  <div className={`${isCollapsed ? "mt-15" : ""}`}>
    <h2 className={`${isCollapsed ? "-rotate-90  rounded-2xl" : "rotate-0"} lg:mt-4 font-semibold mb-2 text-blue-500`}>Tags</h2>
    {!isCollapsed && (
      <div className="flex flex-wrap gap-2">
        {document.tags?.map((tag: string, i: number) => (
          <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>

  {/* Summary */}
  <div>
    <h2 className={`${isCollapsed ? "-rotate-90 mt-20 rounded-2xl" : "rotate-0"} font-semibold mb-2 text-blue-500`}>Summary</h2>
    {!isCollapsed && <p className={`italic ${darkMode ? "text-white/70" : "text-black"}`}>{document.summary || "No summary"}</p>}
  </div>

  {/* Version history */}
  {document.versions?.length > 0 && !isCollapsed && (
    <div className="overflow-y-auto relative">
      <h2 className="font-semibold mb-4 text-blue-500">Versions</h2>
      <div className="relative flex flex-col gap-6 pl-10">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-500" />

        {document.versions.map((v: any, i: number) => (
          <div
            key={i}
            className="relative flex items-start cursor-pointer"
            onClick={() => setSelectedVersion(v)}
          >
            {/* Circle on the line */}
            <div className="absolute left-[-30px] w-4 h-4 bg-blue-500 rounded-full top-1/2 -translate-y-1/2" />

            {/* Horizontal connector */}
            <div className="absolute left-[-15px] top-1/2 -translate-y-1/2 w-4 h-0.5 bg-blue-500" />

            <div className={`p-5 rounded-lg ${darkMode ? "hover:bg-white/20 border-white/20" : "hover:bg-black/5 border-black/15 border"} flex-1 ml-1`}>
              <p className="text-lg">{new Date(v.updatedAt).toLocaleString()}</p>
              <p className="text-xs">
                Updated by: <span className="text-blue-500">{v.updatedBy?.name || "Unknown"}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

</div>

      {/* Version Modal */}
      {selectedVersion && (
        <Dialog open={!!selectedVersion} onClose={() => setSelectedVersion(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
          <div className={`relative rounded-xl max-w-2xl w-full p-6 shadow-xl overflow-y-auto max-h-[90vh] ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>
            <button onClick={() => setSelectedVersion(null)} className="absolute top-4 right-4 cursor-pointer">
              <X className="h-6 w-6" />
            </button>
            <h3 className={`text-xl font-semibold mb-4 ${darkMode && "text-blue-500"}`}>Version Details</h3>
            <h2 className="font-bold text-blue-500 mb-3 text-2xl">{selectedVersion.title}</h2>
            <p className="text-sm mb-2">Updated on: <span className="font-medium">{new Date(selectedVersion.updatedAt).toLocaleString()}</span></p>
            <p className="text-sm mb-4">Updated by: <span className="font-medium">{selectedVersion.updatedBy?.name || "Unknown"} ({selectedVersion.updatedBy?.email || "No email"})</span></p>

            <div className="mb-4">
              <h4 className={`text-lg font-medium text-blue-500`}>Summary</h4>
              <p className="italic">{selectedVersion.summary || "No summary"}</p>
            </div>

            <div className="mb-4">
              <h4 className={`text-lg font-medium text-blue-500`}>Tags</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedVersion.tags?.length > 0 ? (
                  selectedVersion.tags.map((tag: string, i: number) => (
                    <span key={i} className={`${darkMode ? "bg-white/10 text-white" : "bg-blue-100 text-blue-700"} px-3 py-1 rounded-full flex items-center gap-2`}>{tag}</span>
                  ))
                ) : (<p className="text-sm">No tags</p>)}
              </div>
            </div>

            <div className="mb-4">
              <h4 className={`text-lg font-medium mb-2 text-blue-500`}>Content</h4>
              
              <div className={`prose p-4 ${ darkMode ? "bg-white/10 prose-invert" :"bg-black/5"} min-h-[80vh]`} dangerouslySetInnerHTML={{ __html: selectedVersion.content }}/>
            </div>


            <div className="w-full flex flex-col gap-2 items-center justify-center mt-3">
              <button
                className="bg-blue-500 text-white hover:bg-blue-700 transition-all duration-150 px-4 py-2 rounded-2xl cursor-pointer"
                onClick={()=>handleRevert(selectedVersion)}
              >
                Revert Back
              </button>
              <p className="text-center text-white/60 text-sm">Clicking revert back will restore this version.</p>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default DocumentDetailsPage;
