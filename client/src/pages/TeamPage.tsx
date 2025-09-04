import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { useAuthStore } from "../stores/authStore";
import { UserX, Share2, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

// Helper: Get initials from name
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

interface TeamPageProps {
  darkMode: boolean;
}

const TeamPage: React.FC<TeamPageProps> = () => {
  const { getTeamDetails, deleteTeam, removeMember, team, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [deletingTeam, setDeletingTeam] = useState(false);
  const [search, setSearch] = useState("");
  const {theme} = useTheme();
  const darkMode = theme == "dark";

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeam = async () => {
      await getTeamDetails();
      setIsLoading(false);
    };
    fetchTeam();
  }, [getTeamDetails]);

  const handleRemoveMember = async (memberId: string) => {
    await removeMember(memberId);
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    if (!window.confirm("Are you sure you want to delete this team?")) return;

    try {
      setDeletingTeam(true);
      await deleteTeam();
      toast.success("Team deleted successfully");
      navigate("/joinTeam");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete team");
    } finally {
      setDeletingTeam(false);
    }
  };

  const filteredMembers =
    team?.members.filter((m) =>
      m.user.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    console.log(darkMode)

  return (
    <Layout>
      <div
        className={`max-w-5xl slide-top-in mx-auto p-8 rounded-2xl shadow-lg border ${
          darkMode
            ? "bg-black border-gray-800 text-white"
            : "bg-gradient-to-br from-white/80 to-gray-50/70 border-gray-200 text-gray-900"
        }`}
      >
        {isLoading ? (
          <div className="text-center py-12">
            <div
              className={`animate-spin rounded-full h-10 w-10 border-b-2 ${
                darkMode ? "border-blue-500" : "border-blue-600"
              } mx-auto`}
            ></div>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mt-4`}>
              Loading Team Details...
            </p>
          </div>
        ) : !team ? (
          <div className="text-center italic text-gray-400">🚫 No team found</div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1
                  className={`text-3xl font-extrabold ${
                    darkMode
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-transparent bg-clip-text"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text"
                  }`}
                >
                  {team.name}
                </h1>
                <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-sm mt-1`}>
                  Manage your team, invite members, and collaborate.
                </p>
              </div>
              {user?.id === team?.owner?._id && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(team?._id);
                    toast.success("Invite code copied to clipboard!");
                  }}
                  className="px-4 py-2 flex items-center space-x-2 rounded-xl shadow transition cursor-pointer"
                  style={{
                    backgroundColor: darkMode ? "#1D4ED8" : "#2563EB",
                    color: "white",
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div
                className={`p-4 rounded-xl border shadow ${
                  darkMode ? "bg-white/10 border-white/30" : "bg-white border"
                }`}
              >
                <p className="text-xs text-gray-400 uppercase">Owner</p>
                <p className="font-bold text-blue-400">{team.owner.name}</p>
              </div>
              <div
                className={`p-4 rounded-xl border shadow ${
                  darkMode ? "bg-white/10 border-white/30" : "bg-white border"
                }`}
              >
                <p className="text-xs text-gray-400 uppercase">Members</p>
                <p className={`${darkMode ? "text-gray-200" : "text-gray-800"} font-bold`}>
                  {team.members.length}
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border shadow ${
                  darkMode ? "bg-white/10 border-white/30" : "bg-white border"
                }`}
              >
                <p className="text-xs text-gray-400 uppercase">Team ID</p>
                <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} text-sm`}>
                  {team._id}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            {team.members.length > 0 && (
              <div className="relative mb-6">
                <Search
                  className={`absolute left-3 top-3 w-4 h-4 ${
                    darkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-xl border shadow-sm focus:ring-2 outline-none ${
                    darkMode
                      ? "bg-white/10 border-white/30 text-white focus:ring-blue-500"
                      : "bg-white border-gray-200 text-gray-900 focus:ring-blue-500"
                  }`}
                />
              </div>
            )}

            {/* Members */}
            {team.members.length > 0 ? (
              <div
                className={`mb-6 p-4 rounded-xl border shadow-sm ${
                  darkMode ? "bg-white/10 border-white/30" : "bg-white border"
                }`}
              >
                <h2 className="text-sm uppercase text-gray-400 font-medium mb-3">Members</h2>
                <ul className="space-y-3">
                  {filteredMembers.length == 0 ? (
                    <div>No Such Member</div>
                  ) : (
                    filteredMembers.map((member) => (
                      <li
                        key={member.user._id}
                        className={`flex justify-between items-center p-3 rounded-lg border transition ${
                          darkMode
                            ? "bg-black border-gray-800 hover:bg-white/10"
                            : "bg-gray-50 hover:bg-gray-100 border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold">
                            {getInitials(member.user.name)}
                          </div>
                          <div>
                            <p className={`${darkMode ? "text-white" : "text-gray-800"} font-medium`}>
                              {member.user.name}
                            </p>
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                member.role === "admin"
                                  ? "bg-purple-100 text-purple-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              {member.role}
                            </span>
                          </div>
                        </div>

                        {user?.id === team.owner._id && (
                          <button
                            onClick={() => handleRemoveMember(member.user._id)}
                            disabled={removingMemberId === member.user._id}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-white cursor-pointer bg-red-600 rounded-lg hover:bg-red-700 transition"
                          >
                            <UserX className="w-4 h-4" />
                            <span>Remove</span>
                          </button>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ) : (
              <div className="text-center italic text-gray-400">
                No members yet.{" "}
                <span className="text-blue-400 text-sm">
                  (Tip: Share your Team ID to invite others)
                </span>
              </div>
            )}

            {/* Danger Zone */}
            {user?.id === team?.owner?._id && (
              <div
                className={`mt-10 flex flex-col justify-center items-center p-6 border-2 rounded-xl text-center ${
                  darkMode ? "bg-red-500 border-red-700" : "bg-red-50 border-red-200"
                }`}
              >
                <h3 className={` ${darkMode ? "text-white" : "text-red-500"} font-semibold mb-3`}>Danger Zone</h3>
                <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} text-sm mb-4`}>
                  Deleting your team will remove all members permanently. This
                  action cannot be undone.
                </p>
                <button
                  onClick={handleDeleteTeam}
                  disabled={deletingTeam}
                  className="px-6 py-3 flex cursor-pointer items-center justify-center gap-2 bg-red-600 text-white font-semibold rounded-xl shadow hover:bg-red-700 transition max-w-[200px]"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Team
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default TeamPage;
