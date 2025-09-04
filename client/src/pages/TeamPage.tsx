import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { useAuthStore } from "../stores/authStore";
import { UserX, Share2, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


// Helper: Get initials from name
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const TeamPage: React.FC = () => {
  const { getTeamDetails, deleteTeam ,removeMember, team, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [deletingTeam, setDeletingTeam] = useState(false);
  const [search, setSearch] = useState("");

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

  return (
    <Layout>
      <div className="max-w-5xl slide-top-in mx-auto p-8 rounded-2xl shadow-lg bg-gradient-to-br from-white/80 to-gray-50/70 backdrop-blur border border-gray-200">
        {isLoading ? (
          <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading Team Details...</p>
              </div>
        ) : !team ? (
          <div className="text-center text-gray-400 italic">🚫 No team found</div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {team.name}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage your team, invite members, and collaborate.
                </p>
              </div>
              {user?.id === team?.owner?._id && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(team?._id);
                    toast.success("Invite code copied to clipboard!");
                  }}
                  className="px-4 py-2 flex items-center space-x-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-white shadow border">
                <p className="text-xs text-gray-500 uppercase">Owner</p>
                <p className="text-blue-700 font-bold">{team.owner.name}</p>
              </div>
              <div className="p-4 rounded-xl bg-white shadow border">
                <p className="text-xs text-gray-500 uppercase">Members</p>
                <p className="text-gray-800 font-bold">{team.members.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-white shadow border">
                <p className="text-xs text-gray-500 uppercase">Team ID</p>
                <p className="text-gray-600 text-sm">{team._id}</p>
              </div>
            </div>

            {/* Search Bar */}
            {team.members.length > 0 && (
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            {/* Members */}
            {team.members.length > 0 ? (
              <div className="mb-6 p-4 bg-white rounded-xl border shadow-sm">
                <h2 className="text-sm uppercase text-gray-500 font-medium mb-3">
                  Members
                </h2>
                <ul className="space-y-3">
                  {filteredMembers.length == 0 ? <div>No Such Member</div> : filteredMembers.map((member) => (
                    <li
                      key={member.user._id}
                      className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition border"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold">
                          {getInitials(member.user.name)}
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium">
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
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center text-gray-500 italic">
                No members yet.{" "}
                <span className="text-blue-500 text-sm">
                  (Tip: Share your Team ID to invite others)
                </span>
              </div>
            )}

            {/* Danger Zone */}
            {user?.id === team?.owner?._id && (
              <div className="mt-10 flex flex-col justify-center items-center p-6 border-2 border-red-200 rounded-xl bg-red-50 text-center">
                <h3 className="text-red-700 font-semibold mb-3">
                  Danger Zone
                </h3>
                <p className="text-gray-600 text-sm mb-4">
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
