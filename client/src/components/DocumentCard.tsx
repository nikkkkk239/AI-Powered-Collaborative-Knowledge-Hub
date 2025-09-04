import React from "react";
import {
  FileText,
  Tag,
  User,
  Calendar,
  Trash2,
  Edit,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useAIStore } from "../stores/aiStore";
import { useNavigate } from "react-router-dom";

interface Document {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  summary: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DocumentCardProps {
  document: Document;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSummarize: (id: string) => void;
  onGenerateTags: (id: string) => void;
  darkMode : boolean;
}
export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onEdit,
  onDelete,
  onSummarize,
  onGenerateTags,
  darkMode
}) => {
  const { user } = useAuthStore();
  const { isProcessing } = useAIStore();
  const navigate = useNavigate();

  const canEdit = user?.role === "admin" || document.createdBy._id === user?._id;
  const hasAIAccess = user?.hasGeminiKey;

  return (
    <div
      className={`slide-left-in rounded-2xl shadow-sm hover:shadow-xl transition-transform transform hover:scale-[1.02] duration-300 border cursor-pointer flex flex-col justify-between ${
        darkMode
          ? "bg-black border-white/30 shadow-blue-500/10"
          : "bg-white border-gray-100 shadow-blue-500/10"
      }`}
      onClick={() => navigate(`/document/edit/${document._id}`)}
    >
      <div className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
          <div className="flex items-start gap-3">
            <div className={`${darkMode ? "bg-gray-900" : "bg-blue-100"} p-2 rounded-lg`}>
              <FileText className={`${darkMode ? "text-blue-400" : "text-blue-600"} h-6 w-6`} />
            </div>
            <div>
              <h3 className={`${darkMode ? "text-white" : "text-gray-900"} text-lg font-semibold`}>
                {document.title}
              </h3>
              <div className={`flex flex-wrap gap-4 text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{document.createdBy.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(document.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {document.summary && (
          <div className={`mb-4 p-3 rounded-lg border ${
            darkMode ? "bg-white/10 border-black" : "bg-gray-50 border-gray-200"
          }`}>
            <p className={`${darkMode ? "text-white" : "text-gray-700"} text-sm leading-relaxed`}>
              {document.summary}
            </p>
          </div>
        )}

        {/* Content preview */}
        <div className="mb-4 flex-1">
          <p className={`${darkMode ? "text-gray-200" : "text-gray-600"} text-sm line-clamp-3 leading-relaxed`}>
            {document.content.substring(0, 200)}...
          </p>
        </div>

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex items-start gap-2 mb-4 flex-wrap">
            <Tag className={`${darkMode ? "text-gray-400" : "text-gray-400"} h-4 w-4 mt-1`} />
            <div className="flex flex-wrap gap-2">
              {document.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    darkMode
                      ? "bg-white/10 text-white border-gray-700"
                      : "bg-blue-50 text-blue-700 border-blue-100"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI warning */}
        {!hasAIAccess && (
          <p className={`${darkMode ? "text-yellow-400" : "text-yellow-600"} text-xs mt-2`}>
            Add your Gemini API key in profile settings to use AI features
          </p>
        )}
      </div>
    </div>
  );
};
