import mongoose, { mongo } from "mongoose"
const Schema=mongoose.Schema
const userSchema=new Schema({
    userId:{
        type:String,
        required:true,
        unique:true
    },
    plan:{
        type:String,
        enum:["Free-tier","Plus","Advanced"],
        default:"Free-tier"
    }
},
{timestamps:true})

const User=mongoose.model("User",userSchema)
export default User