import mongoose, { Schema, Document, Model } from "mongoose";

export interface TeamMember {
  user: mongoose.Types.ObjectId;
  role: "owner" | "admin" | "member";
}

export interface RecentActivity{
  user : mongoose.Types.ObjectId;
  activityType : "update" | "create" | "delete";
  date : Date;
  docName : string;
}

export interface ITeam extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId; // user who created the team
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
  recentActivities : RecentActivity[];
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
    recentActivities:[
      {
        docName : {
          type:String,
          required:true,
        },
        user : {type:Schema.Types.ObjectId , ref:"User" , required:true},
        activityType : {
          type:String,
          enum : ["update" , "create" , "delete"],
          default : "update"
        },
        date : {
          type:Date,
          default:Date.now(),
        }
      }
    ],
    
  },
  { timestamps: true }
);

const Team: Model<ITeam> = mongoose.model<ITeam>("Team", teamSchema);
export default Team;
