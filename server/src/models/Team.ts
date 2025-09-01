import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeam extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId; // user who created the team
  members: {
    user: mongoose.Types.ObjectId;
    role: "owner" | "admin" | "member";
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: {
          type: String,
          enum: ["owner", "admin", "member"],
          default: "member",
        },
      },
    ],
  },
  { timestamps: true }
);

const Team: Model<ITeam> = mongoose.model<ITeam>("Team", teamSchema);
export default Team;
