import React from 'react';
import { FileText, Tag, User, Calendar, Trash2, Edit, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useAIStore } from '../stores/aiStore';
import { useNavigate } from 'react-router-dom';

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
  
  const canEdit = user?.role === 'admin' || document.createdBy._id === user?._id;
  const hasAIAccess = user?.hasGeminiKey;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200" onClick={()=>navigate(`/document/edit/${document._id}`)}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{document.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{document.createdBy.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(document.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {canEdit && (
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(document._id)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(document._id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Summary */}
        {document.summary && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{document.summary}</p>
          </div>
        )}

        {/* Content preview */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm line-clamp-3">
            {document.content.substring(0, 200)}...
          </p>
        </div>

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="h-4 w-4 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {document.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Actions */}
        <div className="flex space-x-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onSummarize(document._id)}
            disabled={!hasAIAccess || isProcessing}
            className="flex items-center space-x-1 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Summarize</span>
          </button>
          
          <button
            onClick={() => onGenerateTags(document._id)}
            disabled={!hasAIAccess || isProcessing}
            className="flex items-center space-x-1 px-3 py-2 text-sm bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Tag className="h-4 w-4" />
            <span>Generate Tags</span>
          </button>
        </div>

        {!hasAIAccess && (
          <p className="text-xs text-yellow-600 mt-2">
            Add your Gemini API key in profile settings to use AI features
          </p>
        )}
      </div>
    </div>
  );
};