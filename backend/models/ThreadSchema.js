import mongoose from "mongoose";

const Schema=mongoose.Schema


const MessageSchema=new Schema({
    role:{
        type:String,
        enum:["assistant","user"],

        required:true
    },
    content:{
        type:String,
        required:true
    },
   timestamp:{
     type:Date,
     default:Date.now
   }

})

const ThreadSchema=new Schema({
    userId:{
        type:String,
        required:true,
        index:true

    },
    threadId:{
        type:String,
        unique:true,
        required:true

    },
    title:{
        type:String,
        default:"New Chat"
    },
    messages:[MessageSchema],
    createdAt:{
         type:Date,
        default:Date.now

    },
    updatedAt:{
        type:Date,
        default:Date.now
    }

})

const Thread=mongoose.model("Thread",ThreadSchema)
export default Thread
