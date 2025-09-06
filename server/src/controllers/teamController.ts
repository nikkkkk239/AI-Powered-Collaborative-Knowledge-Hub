// POST /api/teams
import { Request, Response } from "express";
import Team from "../models/Team";
import User from "../models/User";
import { IUser } from "../models/User";
import { ObjectId } from "mongoose";
import Document from "../models/Document";
import redisClient from "../client"

interface AuthRequest extends Request {
  user: IUser & {_id : ObjectId};
}


export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = (req.user as any)._id; // from auth middleware

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    let team = await Team.create({
      name,
      description,
      owner: userId,
      members: [],
    });

    (user as any).teamId = team._id;
    await user.save();

    // Populate owner and members.user
    const populatedTeam = await Team.findById(team._id)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    res.status(201).json({ team : populatedTeam, user });
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
    const userId = req?.user?._id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // check if already in team
    if (team.members.some(m => m.user.toString() === userId.toString())) {
      return res.status(400).json({ message: "You are already a member of this team" });
    }

    (user as any).teamId = team._id;
    await user.save();

    team.members.push({ user: userId as any, role: "member" });
    await team.save();

    // Populate owner and members.user
    const populatedTeam = await Team.findById(team._id)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    await redisClient.publish(
    "team:join",
      JSON.stringify({
        teamId: team._id,
        member: { _id: user._id, name: user.name, email: user.email },
      })
    );

    res.json({ message: "Joined team successfully", team: populatedTeam, user });
  } catch (err) {
    console.log("Error in joinTeam:", err);
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
    if(team.owner._id.toString() != requesterId.toString()){
      return res.status(403).json({message : "Not the owner of the Team."})
    }
    
    const user = await User.findById(memberId);
    if(!user){
      return res.status(404).json({message : "Member Not Found."});
    }
    user.teamId = null;
    await user.save();

    team.members = team.members.filter(m => m.user.toString() !== memberId.toString());
    await team.save();
    const updatedTeam = await Team.findById(teamId)
      .populate("members.user", "name email") // populate only needed fields
      .populate("owner", "name email");

    await redisClient.publish("team:remove" , JSON.stringify({
      teamId,
      memberId,
      senderId : requesterId

    }))

    res.json({team : updatedTeam});
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

    await User.updateMany({
      teamId : teamId
    },{$set:{teamId : null}});

    await Document.deleteMany({ teamId });

    await Team.findByIdAndDelete(teamId);

    await redisClient.publish("team:delete" , JSON.stringify({
      teamId,
    }))

    res.json({ message: "Team deleted successfully" });
  } catch (err) {
    console.log("Error in deleteTeam : " , err);

    res.status(500).json({ message: "Error deleting team", error: err });
  }
};

export const getTeamDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId)
      .populate("members.user", "name email") // populate only needed fields
      .populate("owner", "name email");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching team details", error: err });
  }
};
