import { useState } from "react";
import { createContext } from "react";

export const MyContext=createContext(null)

export const MyContextProvider=(props)=>{
    const [messages,setMessages]=useState([])
     const [threadId,setThreadId]=useState(null)

    return <MyContext.Provider value={{
        messages,setMessages,threadId,setThreadId
    }}>{props.children}</MyContext.Provider>
}