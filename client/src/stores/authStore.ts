import toast from 'react-hot-toast';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  hasGeminiKey: boolean;
  teamId : string | null;
  geminiKey : string;
}

interface PopulatedUser{
  _id: string;
  name: string;
  email: string;
}

interface Member{
  user : PopulatedUser;
  role : "owner" | "admin" | "member";
}
interface Team{
  _id:string;
  name : string;
  descripton?: string;
  owner : PopulatedUser;
  members : Member[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  team : Team | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; geminiApiKey?: string }) => Promise<void>;
  setLoading: (loading: boolean) => void;
  joinTeam : (data : {teamId : string})=>Promise<void>;
  createTeam : (data:{name : string , description?:string})=>Promise<void>;
  getTeamDetails : ()=>Promise<void>;
  deleteTeam : ()=>Promise<void>;
  removeMember : (memberId : string)=>Promise<void>;
  removeSelf : ()=>void;
  joinMember : (member : any)=>void;
}



export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      team : null,
      isLoading: false,
      
      removeSelf : ()=>{
        set((state)=>({
          user: state.user ? { ...state.user, teamId: null } : null,
          team : null
        }))
        const current = get();
        localStorage.setItem("auth-storage", JSON.stringify({ state: current }));
      },
      joinMember : (member)=>{
        set((state) => ({
          team: state.team
            ? { ...state.team, members: [...state.team.members, { user: member, role: "member" }] }
            : state.team,
        }));
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }

          const data = await response.json();
          set({ user: data.user, token: data.token });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }

          const data = await response.json();
          set({ user: data.user, token: data.token });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        localStorage.setItem("auth-storage", "");
        localStorage.setItem("theme", "light");
        set({ user: null, token: null });
      },
      createTeam : async(data : {name : string , description?:string})=>{
        const {token} = get();
        try {
          const response = await fetch("http://localhost:5000/api/team/",{
              method:"POST",
              headers:{
                'Content-Type':"application/json",
                'Authorization' : `Bearer ${token}`
              },
              body :JSON.stringify(data),
          })
          if(!response.ok){
            const error = await response.json();
            throw new Error(error.message);
          }
          const res = await response.json();
          set((state) => ({
            team: res.team,
            user: state.user ? { ...state.user, ...res.user } : res.user,
          }));

        } catch (error) {
            console.log("Error in handleCreateTeam : " , error);
        }
      },
      joinTeam : async(data : {teamId : string})=>{
        try {
          const {token} = get();
          if(!token) throw new Error("Not Authenticated.");

          const response = await fetch(`http://localhost:5000/api/team/${data.teamId}/join`,{
            method : "POST",
            headers:{
              'Content-Type':"application/json",
              'Authorization' : `Bearer ${token}`
            },
          })

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }

          const res = await response.json();
          set((state) => ({
            team: res.team,
            user: state.user ? { ...state.user, ...res.user } : res.user,
          }));
        } catch (error : any) {
          console.log("Error in joinTeam :" , error);
          toast.error("Failed to join team");
          
        }
      },
      getTeamDetails : async()=>{
        const {user , token} = get();
        try {
          const response = await fetch(`http://localhost:5000/api/team/getDetails/${user?.teamId}`,{
            method :"GET",
            headers:{
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          })

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }

          const team = await response.json();
          set({ team });


        } catch (error) {
          console.log("Error in getTeam Details:" , error);
          toast.error("Fetching Failed.") 
        }
      },
      deleteTeam : async()=>{
          const {team ,user, token} = get();

        try {
          
          const response = await fetch(`http://localhost:5000/api/team/${team?._id}`,{
            method :"DELETE",
            headers:{
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          })
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }

          set({team : null});
          set({user :  user ? { ...user, teamId: null } : null })
          

        } catch (error) {
          console.log("Error in deleteTeam Details:" , error);
          toast.error("Fetching Failed.") 
        }
      },
      removeMember : async(memberId)=>{
        const {team, token} = get();
        try {
          
          const response = await fetch(`http://localhost:5000/api/team/${team._id}/members/${memberId}`,{
            method :"DELETE",
            headers:{
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          })
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }
          const res = await response.json();

          set({team : res.team});
        } catch (error) {
          console.log("Error in deleteTeam Details:" , error);
          toast.error("Fetching Failed.") 
        }
        // /teams/:teamId/members/:memberId
      },

      updateProfile: async (data: { name?: string; geminiApiKey?: string }) => {
        const { token } = get();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch('http://localhost:5000/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }

        const user = await response.json();
        set({ user });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
    }
  )
);



