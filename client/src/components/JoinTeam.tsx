import React, { useEffect, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Logo from "../assets/logo.jpg"

const JoinTeam: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"create" | "join">("join");
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamId, setTeamId] = useState("");

  const { user, createTeam, joinTeam } = useAuthStore();

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }
    try {
      await createTeam({ name: teamName, description: teamDescription });
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to create team");
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId.trim()) {
      toast.error("Team ID is required");
      return;
    }
    try {
      await joinTeam({ teamId });
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to join team");
    }
  };

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel (same as login) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-50 backdrop-blur-lg text-white flex-col justify-between items-center p-15">
        <div className="relative flex hover:shadow-md flex-col justify-between items-center rounded-4xl overflow-hidden w-full h-full">
          <img
            src="background3.jpeg"
            alt="Background"
            className="z-[-1] absolute object-cover w-full h-full"
          />

          <div className="flex flex-col mt-20 items-center gap-1">
            <h1 className="text-4xl font-bold drop-shadow-md">Team Up with HiveMind</h1>
            <p className="text-lg text-blue-100 mb-12 drop-shadow-md text-center px-4">
              Collaborate effortlessly by joining or creating your team.
            </p>
          </div>

          <div className="flex flex-col mb-25 items-center gap-1">
            <h2 className="text-3xl font-semibold drop-shadow-md">
              Build or Join Teams
            </h2>
            <p className="mt-2 text-blue-200 text-center drop-shadow-md px-6">
              Create your own team or join an existing one to get started.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center items-center gap-2 mb-6">
            <img src={Logo} alt="Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold text-blue-600">HiveMind</span>
          </div>

          {/* Toggle */}
          <div className="flex justify-between mb-6">
            <button
              onClick={() => setMode("join")}
              className={`w-1/2 py-2 font-medium rounded-l-xl ${
                mode === "join"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Join Team
            </button>
            <button
              onClick={() => setMode("create")}
              className={`w-1/2 py-2 font-medium rounded-r-xl ${
                mode === "create"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Create Team
            </button>
          </div>

          {/* Forms */}
          {mode === "join" ? (
            <form onSubmit={handleJoinTeam} className="space-y-5">
              <div className="relative">
                <input
                  type="text"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  placeholder="Enter Team ID / Invite Code"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition"
              >
                Join Team
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateTeam} className="space-y-5">
              <div className="relative">
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team Name"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div className="relative">
                <textarea
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={3}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-md transition"
              >
                Create Team
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinTeam;

