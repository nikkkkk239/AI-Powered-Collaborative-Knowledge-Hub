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
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onEdit,
  onDelete,
  onSummarize,
  onGenerateTags,
}) => {
  const { user } = useAuthStore();
  const { isProcessing } = useAIStore();
  const navigate = useNavigate();

  const canEdit =
    user?.role === "admin" || document.createdBy._id === user?._id;
  const hasAIAccess = user?.hasGeminiKey;

  return (
    <div
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-transform transform hover:scale-[1.02] duration-300 border border-gray-100 cursor-pointer flex flex-col justify-between"
      onClick={() => navigate(`/document/edit/${document._id}`)}
    >
      <div className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {document.title}
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{document.createdBy.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(document.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {document.summary && (
          <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              {document.summary}
            </p>
          </div>
        )}

        {/* Content preview */}
        <div className="mb-4 flex-1">
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {document.content.substring(0, 200)}...
          </p>
        </div>

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex items-start gap-2 mb-4 flex-wrap">
            <Tag className="h-4 w-4 text-gray-400 mt-1" />
            <div className="flex flex-wrap gap-2">
              {document.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI warning */}
        {!hasAIAccess && (
          <p className="text-xs text-yellow-600 mt-2">
            Add your Gemini API key in profile settings to use AI features
          </p>
        )}
      </div>

    </div>
  );
};
