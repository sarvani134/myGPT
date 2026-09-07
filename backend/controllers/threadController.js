import Thread from "../models/ThreadSchema.js"
import openaiApiResponse from "../utils/openai.js"
import crypto from "crypto"
export const getThreads=async(req,res)=>{
    try{
        const userId=req.auth.payload.sub

        const response=await Thread.find({userId}).sort({updatedAt:-1})

        return res.json({response})

    }
    catch(err){
return console.log(err)
    }
}
export const createThread=async (req, res) => {
    try {
      
        
        const thread = await Thread.create({
            threadId: crypto.randomUUID(),
            userId:req.auth.payload.sub,

            title: "New Chat",

            messages: []
        });

        res.status(201).json({
            message: "Thread created successfully",
            thread: thread
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            error: err.message
        });
    }
}

export const getThreadById=async(req,res)=>{
    try{
   const userId=req.auth.payload.sub
        const {threadId}=req.params
        const response=await Thread.findOne({threadId,userId})

        if(!response){
            return res.json({err:"thread not found"})
        }

        return res.json({msg:response.messages})

    }
    catch(err){
        console.log(err)
    }
}
export const deleteThreadById=async(req,res)=>{
    try{
   const userId=req.auth.payload.sub
           const  threadId  = req.params.threadId;

        
        const response=await Thread.findOneAndDelete({threadId,userId})

        if(!response){
            return res.json({err:"thread not found"})
        }

        return res.json({msg:"successfully deleted "})

    }
    catch(err){
        console.log(err)
    }
}

export const addMessage = async (req, res) => {
  try {
   const userId=req.auth.payload.sub
    const { threadId, message } = req.body;

    if (!threadId || !message) {
      return res.json({
        err: "Incomplete data"
      });
    }


    let thread = await Thread.findOne({ threadId ,userId});


    // If thread doesn't exist, create it
    if (!thread) {

      thread = await Thread.create({
        threadId: threadId,
        userId,
        title: message,
        messages: []
      });

    }
 if (thread.messages.length === 0) {
  const title = message.trim().replace(/\s+/g, " ");
  thread.title =
    title.length > 50 ? title.slice(0, 50) + "…" : title;
}

    // Add user's message
    thread.messages.push({
      role: "user",
      content: message
    });


    thread.updatedAt = new Date();
    await thread.save();

    // Get GPT response
    const assistantResponse =
      await openaiApiResponse(message);


    // Add GPT response
   
    thread.messages.push({
      role: "assistant",
      content: assistantResponse
    });


    thread.updatedAt = new Date();

    await thread.save();


    return res.json({
      thread
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      err: err.message
    });

  }
};

export const getMessages=async(req,res)=>{
    try{
           const userId=req.auth.payload.sub
        const {threadId}=req.params
        if(!threadId){
            return res.json({})
        }
        const response=await Thread.findOne({threadId,userId})
        return res.json({data:response.messages})

    }
    catch(err){
        console.log(err)
    }
}

export const renameThread=async(req,res)=>{
    try{
        const {threadId,newName}=req.body
           const userId=req.auth.payload.sub

        if (!threadId || !newName?.trim()) {
      return res.status(400).json({
        msg: "threadId and newName are required"
      });
    }

        const thread=await Thread.findOne({threadId,userId})
        thread.title=newName
        thread.updatedAt=new Date()
        await thread.save()
        res.json({thread})
    }
    catch(err){
        console.log(err)

    }
}
