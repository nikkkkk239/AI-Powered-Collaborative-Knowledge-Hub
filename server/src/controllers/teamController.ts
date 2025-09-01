// POST /api/teams
import { Request, Response } from "express";
import Team from "../models/Team";
import User from "../models/User";

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = req.user._id; // from auth middleware

    const team = await Team.create({
      name,
      description,
      owner: userId,
      members: [{ user: userId, role: "owner" }],
    });

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: "Error creating team", error: err });
  }
};

// GET /api/teams
export const getUserTeams = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

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
export const joinTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id; // logged-in user

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // check if already in team
    if (team.members.some(m => m.user.toString() === userId.toString())) {
      return res.status(400).json({ message: "You are already a member of this team" });
    }

    // default role = "member"
    team.members.push({ user: userId, role: "member" });
    await team.save();

    res.json({ message: "Joined team successfully", team });
  } catch (err) {
    console.log("Error in joinTeam : " , err);
    res.status(500).json({ message: "Error joining team", error: err });
  }
};


// DELETE /api/teams/:teamId/members/:memberId
export const removeMember = async (req: Request, res: Response) => {
  try {
    const { teamId, memberId } = req.params;
    const requesterId = req.user._id;

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
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const requesterId = req.user._id;

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
