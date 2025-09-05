import { create } from "zustand";
import axios from "axios";

interface User{
    name : string,
    email : string
}

export interface QA {
  _id?: string;
  question: string;
  answer: string;
  createdBy?: User;
  teamId?: string;
  createdAt?: string;
}

interface QAStore {
  qaList: QA[];
  isProcessing: boolean;
  error: string | null;
  askQuestion: (question: string , token : string) => Promise<void>;
  fetchQuestions : (token:string)=>Promise<void>;
  addQnA : (qna : QA)=>void;
}

export const useQAStore = create<QAStore>((set, get) => ({
  qaList: [],
  isProcessing: false,
  error: null,
  addQnA : (qna : QA)=>{
    set((state)=>({qaList : [qna,...state.qaList]}))
  },

  askQuestion: async (question: string , token : string) => {

    try {
      set({ isProcessing: true, error: null });

      const response = await fetch("http://localhost:5000/api/q&a/", { 
        method : "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body:JSON.stringify({question})
       });
       if (!response.ok){
        const error = await response.json();
        throw new Error(error.message);
       }
       const res = await response.json();
      const newQA = res.qa;

      set({
        qaList: [newQA, ...get().qaList],
        isProcessing: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message,
        isProcessing: false,
      });
    }
  },
  fetchQuestions : async(token : string)=>{
    try {
        const response = await fetch("http://localhost:5000/api/q&a/", { 
        method : "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
       });
       if (!response.ok){
        const error = await response.json();
        throw new Error(error.message);
       }

        const qnas = await response.json();

        qnas.sort((a: QA, b: QA) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

        set({qaList : qnas});



    } catch (err:any) {
        set({
        error: err.response?.data?.message || err.message,
        isProcessing: false,
      });
    }
  }
}));
