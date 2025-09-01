// POST /api/teams
import { Request, Response } from "express";
import Team from "../models/Team";
import User from "../models/User";
import { IUser } from "../models/User";
import { ObjectId } from "mongoose";

interface AuthRequest extends Request {
  user: IUser & {_id : ObjectId};
}


export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = (req.user as any)._id; // from auth middleware

    const user = await User.findById(userId);
    if(!user) return res.status(404).json({message: "User not found."});

    const team = await Team.create({
      name,
      description,
      owner: userId,
      members: [{ user: userId, role: "owner" }],
    });

    (user as any).teamId = team._id;
    await user.save();

    res.status(201).json({team , user});
  } catch (err) {
    res.status(500).json({ message: "Error creating team", error: err });
  }
};

// GET /api/teams
export const getUserTeams = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req?.user?._id;

    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message: "User Not Found"});
    }
    const team = await Team.findOne({_id : user.teamId});
    if(!team){
      return res.status(404).json({message: "Team Not Found"});
    }

    res.json(team);
  } catch (err) {
    console.log("Error in getUserTeams : " , err);
    res.status(500).json({ message: "Error fetching teams", error: err });
  }
};

// POST /api/teams/:teamId/members
export const joinTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req?.user?._id; // logged-in user
    

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message : "User not found."});
    }

    // check if already in team
    if (team.members.some(m => m.user.toString() === userId.toString())) {
      return res.status(400).json({ message: "You are already a member of this team" });
    }
    (user as any).teamId = team._id;
    await user.save();
    // default role = "member"
    team.members.push({ user: userId as any, role: "member" });
    
    await team.save();

    res.json({ message: "Joined team successfully", team , user});
  } catch (err) {
    console.log("Error in joinTeam : " , err);
    res.status(500).json({ message: "Error joining team", error: err });
  }
};


// DELETE /api/teams/:teamId/members/:memberId
export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, memberId } = req.params;
    const requesterId = req?.user?._id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // only owner or admin can remove members
    const requester = team.members.find(m => m.user.toString() === requesterId.toString());
    if (!requester || !["owner", "admin"].includes(requester.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    team.members = team.members.filter(m => m.user.toString() !== memberId);
    await team.save();

    res.json(team);
  } catch (err) {
    console.log("Error in removeMember : " , err);

    res.status(500).json({ message: "Error removing member", error: err });
  }
};

// DELETE /api/teams/:teamId
export const deleteTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const requesterId = req?.user?._id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.owner.toString() !== requesterId.toString()) {
      return res.status(403).json({ message: "Only owner can delete team" });
    }

    await Team.findByIdAndDelete(teamId);

    res.json({ message: "Team deleted successfully" });
  } catch (err) {
    console.log("Error in deleteTeam : " , err);

    res.status(500).json({ message: "Error deleting team", error: err });
  }
};
