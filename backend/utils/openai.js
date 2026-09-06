const openaiApiResponse=async(message)=>{
     const options={
        method:"POST",
        headers:{
            "Content-Type": "application/json",
   "Authorization":`Bearer ${process.env.GROQ_API_KEY}`
        },
        body:JSON.stringify({
             model: "openai/gpt-oss-20b",
    input:message
        })
    }
    try{
        const response=await fetch("https://api.groq.com/openai/v1/responses",
            options)

        const data=await response.json()
        console.log(data.output[1].content[0].text)
      
       return data.output[1].content[0].text;

    }
    catch(err){
        console.log(err)
    }

}

export default openaiApiResponse