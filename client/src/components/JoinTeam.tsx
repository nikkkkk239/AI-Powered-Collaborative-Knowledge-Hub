import React, { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const JoinTeam: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"create" | "join">("join");
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamId, setTeamId] = useState("");

  const {user ,team, token , createTeam , joinTeam} = useAuthStore();

  const handleCreateTeam = async(e: React.FormEvent) => {
    e.preventDefault();
    console.log({ teamName, teamDescription });
    await createTeam({name : teamName , description : teamDescription});
    
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ teamId });
    if(teamId.length == 0){
        toast.error("ID required.");
        return ;
    }
    try {
        const resilt = await joinTeam({teamId});
    } catch (error:any) {
        toast.error(error);
    }
    

    // 🔗 Call backend API to join team
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {mode === "create" ? "Create a Team" : "Join a Team"}
        </h2>

        {/* Toggle buttons */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={() => setMode("join")}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              mode === "join"
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Join Team
          </button>
          <button
            onClick={() => setMode("create")}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              mode === "create"
                ? "bg-green-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Create Team
          </button>
        </div>

        {/* Join Form */}
        {mode === "join" && (
          <form onSubmit={handleJoinTeam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team ID / Invite Code
              </label>
              <input
                type="text"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="Enter team ID"
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Join Team
            </button>
          </form>
        )}

        {/* Create Form */}
        {mode === "create" && (
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                placeholder="Describe your team"
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              Create Team
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default JoinTeam;
