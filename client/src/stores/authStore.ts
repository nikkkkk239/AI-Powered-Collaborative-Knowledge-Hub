import toast from 'react-hot-toast';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  hasGeminiKey: boolean;
  teamId : string | null;
}

interface Member{
  user : string;
  role : ["owner" | "admin" | "member"]
}
interface Team{
  _id:string;
  name : string;
  descripton?: string;
  owner : string;
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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      team : null,
      isLoading: false,

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
        localStorage.clear();
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
          set({ team : res.team , user : res.user });

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
          set({ team : res.team , user: res.user });
        } catch (error : any) {
          console.log("Error in joinTeam :" , error);
          toast.error("Failed to join team");
          
        }
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