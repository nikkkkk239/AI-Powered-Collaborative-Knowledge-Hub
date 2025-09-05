import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  content: string;
  tags: string[];
  summary?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  teamId : mongoose.Types.ObjectId;
  versions: Array<{
    content: string;
    title:string;
    summary?: string;
    teamId : mongoose.Types.ObjectId;
    tags: string[];
    updatedAt: Date;
    updatedBy: mongoose.Types.ObjectId;
  }>;
  embedding: number[]
}

const documentSchema = new Schema<IDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" , required : true },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  summary: {
    type: String,
    default: ''
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  versions: [{
    content: { type: String, required: true },
    title : {type:String , required : true},
    summary: { type: String, default: '' },
    tags: [{ type: String, trim: true, lowercase: true }],
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  }],
  embedding: {
    type: [Number], // vector
    index: true,    // good for Atlas vector search
  },
}, {
  timestamps: true
});

// Index for search
documentSchema.index({ title: 'text', content: 'text', tags: 'text' });
documentSchema.index({ createdBy: 1 });
documentSchema.index({ tags: 1 });

export default mongoose.model<IDocument>('Document', documentSchema);