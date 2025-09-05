import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useSocket } from "../context/SocketContext";

export function SocketListener() {
  const { user, removeSelf , joinMember} = useAuthStore();
  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const handleNewQnA = ({ senderId, memberId }: any) => {
      if (memberId !== user?._id || senderId === user?._id) return;

      console.log("📄 Remove received:");
      removeSelf();
      navigate("/joinTeam");
    };

    const handleTeamJoin = (member: any) => {
      console.log("✅ New team member joined:", member);
      // e.g. update zustand store
      joinMember(member);
    };

    const handleTeamDelete = (teamId : any) => {

      console.log("✅Team Delete received");
      // e.g. update zustand store
      removeSelf();
    };

    socket.on("team:remove", handleNewQnA);
    socket.on("team:join", handleTeamJoin);
    socket.on("team:delete", handleTeamDelete);
    return () => {
      socket.off("team:remove", handleNewQnA);
      socket.off("team:join", handleTeamJoin);
      socket.off("team:delete", handleTeamDelete);

    };
  }, [socket, user?._id]);

  return null; // invisible listener
}




