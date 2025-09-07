// @ts-nocheck
import { Router } from "express";
import { createTeam, joinTeam, removeMember, deleteTeam, getTeamDetails } from "../controllers/teamController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, createTeam);
router.get("/getDetails/:teamId", authenticate, getTeamDetails);
router.post("/:teamId/join", authenticate, joinTeam);
router.delete("/:teamId/members/:memberId", authenticate, removeMember);
router.delete("/:teamId", authenticate, deleteTeam);

export default router;
