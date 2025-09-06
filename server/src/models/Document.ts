// import mongoose, { Document, Schema } from 'mongoose';

// export interface IDocument extends Document {
//   title: string;
//   content: string;
//   tags: string[];
//   summary?: string;
//   createdBy: mongoose.Types.ObjectId;
//   createdAt: Date;
//   updatedAt: Date;
//   teamId : mongoose.Types.ObjectId;
//   versions: Array<{
//     content: string;
//     title:string;
//     summary?: string;
//     teamId : mongoose.Types.ObjectId;
//     tags: string[];
//     updatedAt: Date;
//     updatedBy: mongoose.Types.ObjectId;
//   }>;
//   embedding: number[]
// }

// const documentSchema = new Schema<IDocument>({
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 200
//   },
//   content: {
//     type: String,
//     required: true
//   },
//   teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" , required : true },
//   tags: [{
//     type: String,
//     trim: true,
//     lowercase: true
//   }],
//   summary: {
//     type: String,
//     default: ''
//   },
//   createdBy: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   versions: [{
//     content: { type: String, required: true },
//     title : {type:String , required : true},
//     summary: { type: String, default: '' },
//     tags: [{ type: String, trim: true, lowercase: true }],
//     updatedAt: { type: Date, default: Date.now },
//     updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
//   }],
//   embedding: {
//     type: [Number], // vector
//     index: true,    // good for Atlas vector search
//   },
// }, {
//   timestamps: true
// });

// // Index for search
// documentSchema.index({ title: 'text', content: 'text', tags: 'text' });
// documentSchema.index({ createdBy: 1 });
// documentSchema.index({ tags: 1 });

// export default mongoose.model<IDocument>('Document', documentSchema);



import mongoose, { Document, Schema } from 'mongoose';

export interface IQuillDeltaOp {
  insert?: string | object;   // text or embed (image, video, etc.)
  delete?: number;            // delete N chars
  retain?: number;            // skip N chars
  attributes?: {              // formatting info
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    header?: number;          // 1,2,3 etc.
    list?: 'ordered' | 'bullet';
    link?: string;
    color?: string;
    background?: string;
  };
}

export interface IDocument extends Document {
  title: string;
  content: IQuillDeltaOp[]; // Quill JSON instead of plain string
  tags: string[];
  summary?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  teamId: mongoose.Types.ObjectId;
  versions: Array<{
    content: IQuillDeltaOp[];
    title: string;
    summary?: string;
    teamId: mongoose.Types.ObjectId;
    tags: string[];
    updatedAt: Date;
    updatedBy: mongoose.Types.ObjectId;
  }>;
  embedding: number[];
}

const documentSchema = new Schema<IDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: Schema.Types.Mixed, // JSON for Quill Delta
    required: true
  },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  tags: [{ type: String, trim: true, lowercase: true }],
  summary: { type: String, default: '' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  versions: [{
    content: { type: Schema.Types.Mixed, required: true }, // JSON Delta
    title: { type: String, required: true },
    summary: { type: String, default: '' },
    tags: [{ type: String, trim: true, lowercase: true }],
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  }],
  embedding: {
    type: [Number],
    index: true
  },
}, {
  timestamps: true
});

// Text index (optional, but you can also generate embeddings from plain text)
documentSchema.index({ title: 'text', tags: 'text' });
documentSchema.index({ createdBy: 1 });
documentSchema.index({ tags: 1 });

export default mongoose.model<IDocument>('Document', documentSchema);
