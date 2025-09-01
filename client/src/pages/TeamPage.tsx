import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuthStore } from '../stores/authStore';
import { Trash2, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Share2 } from "lucide-react";

const TeamPage: React.FC = () => {
  const { getTeamDetails,deleteTeam, team, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeam = async () => {
      await getTeamDetails();
      setIsLoading(false);
    };
    fetchTeam();
  }, [getTeamDetails]);

  const handleRemoveMember = async (memberId: string) => {
    // if (!team) return;
    // if (!window.confirm('Are you sure you want to remove this member?')) return;

    // try {
    //   setRemovingMemberId(memberId);
    //   await removeMember(team._id, memberId);
    //   toast.success('Member removed successfully');
    // } catch (err: any) {
    //   toast.error(err.message || 'Failed to remove member');
    // } finally {
    //   setRemovingMemberId(null);
    // }
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;

    try {
      setDeletingTeam(true);
      await deleteTeam();
      toast.success('Team deleted successfully');
        navigate("/joinTeam");
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete team');
    } finally {
      setDeletingTeam(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading team details...</div>
        ) : !team ? (
          <div className="text-center text-gray-500">No team found</div>
        ) : (
          <>
          <div className='flex items-center justify-between'>
            <h1 className="text-2xl font-bold text-blue-700 mb-4">{team.name}</h1>
            {user?._id === team?.owner?._id && (

                <button
                onClick={() => {
                    navigator.clipboard.writeText(team?._id);
                    toast.success("Invite link copied to clipboard!");
                }}
                className="px-6 cursor-pointer py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
                >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
                </button>
            )}
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700">Owner</h2>
              <div className="text-blue-600 font-medium">{team.owner.name}</div>
            </div>

            {team.members.length != 0 ?  <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Members</h2>
              <ul className="space-y-2">
                {team.members.map((member) => (
                  <li
                    key={member.user._id}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-md hover:shadow-sm transition"
                  >
                    <span className="text-gray-800">{member.user.name} ({member.role})</span>
                    {user?._id === team.owner._id && (
                      <button
                        onClick={() => handleRemoveMember(member.user._id)}
                        disabled={removingMemberId === member.user._id}
                        className="flex items-center space-x-1 px-3 py-1 text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                      >
                        <UserX className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div> : <div>No Member Yet. <span className='text-blue-500 text-sm'>( Tip :- Share your Team Id with members. )</span> </div>}

            {user?._id === team?.owner?._id && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleDeleteTeam}
                  disabled={deletingTeam}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition"
                >
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
