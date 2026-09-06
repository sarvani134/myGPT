import { application, json } from "express"

const openaiApiResponse=async(message)=>{

    const options={
        method:"POST",
        headers:{
            "Content-Type":"application/json",
             "Authorization":`Bearer ${process.env.GROK_KEY}`
        },
        body:JSON.stringify({
            "model":"",
            "content":message
        })

    }

    try{



    }
    catch(err){
        console.log(err)
    }
}