import { useState } from "react";
import { createContext } from "react";

export const MyContext=createContext(null)

export const MyContextProvider=(props)=>{
    const [messages,setMessages]=useState([])
     const [threadId,setThreadId]=useState(null)
    const [isSending,setIsSending]=useState(false)

    return <MyContext.Provider value={{
        messages,setMessages,threadId,setThreadId,isSending,setIsSending
    }}>{props.children}</MyContext.Provider>
}
