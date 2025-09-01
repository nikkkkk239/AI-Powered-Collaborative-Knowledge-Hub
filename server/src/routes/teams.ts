import { Router } from "express";
import { createTeam, getUserTeams, joinTeam, removeMember, deleteTeam } from "../controllers/teamController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, createTeam);
router.get("/", authenticate, getUserTeams);
router.post("/:teamId/join", authenticate, joinTeam);
router.delete("/:teamId/members/:memberId", authenticate, removeMember);
router.delete("/:teamId", authenticate, deleteTeam);

export default router;
