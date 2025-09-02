import { Schema, model, Document, Types } from "mongoose";


export interface IQA extends Document {
  teamId: Types.ObjectId;             // Which team this belongs to
  question: string;                   // The question text
  answer?: string;                    // Optional answer text
  createdBy: Types.ObjectId;
  createdAt: Date;                    // Timestamp
  updatedAt: Date;           // User who asked
}


const QASchema = new Schema<IQA>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true } 
);


export const QA = model<IQA>("QA", QASchema);
