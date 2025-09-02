import express from "express";
import { AuthRequest } from "../middleware/auth";
import Document from "../models/Document";
import { authenticate } from "../middleware/auth";
import { callGemini } from "../lib/gemini";
import { QA } from "../models/q&a";

const router = express();


router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { question } = req.body;
    const userId = req.user!._id;
    const teamId = req.user!.teamId;

   const docs = await Document.find({ teamId, $text: { $search: question } },{ score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } }).limit(5);
    let answer;
    
    const context = docs.map(d => `${d.title}: ${d.content}`).join("\n\n");


    const prompt = `
      You are answering based on the team's knowledge hub.
      Documents:
      ${context}
      
      Question: ${question}
      Answer in a clear, concise way.
    `;

    if (!docs.length) {
        answer = "No relevant documents found in your team's knowledge hub."
    }
    else{
        answer = await callGemini(req?.user?.geminiApiKey || "", prompt);
    }

    const qa = await QA.create({
      teamId,
      question,
      answer,
      createdBy: userId
    });

   const populatedQA = await QA.findById(qa._id).populate("createdBy", "name email");

    res.json({ qa:populatedQA });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/",authenticate , async(req:AuthRequest , res)=>{
    try {
        const userId = req?.user?._id;
        const teamId = req?.user?.teamId;

        const qnas = await QA.find({teamId}).populate("createdBy" , "name email");

        return res.status(200).json(qnas);
    } catch (error:any) {
        console.log("Error in fetching q&a : " , error);
        res.status(500).json({ message: error.message });
        
    }
})

export default router;