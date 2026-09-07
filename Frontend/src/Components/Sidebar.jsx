import React from "react";
import "../../public/Sidebar.css";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { MyContext } from "../MyContext";
import api from "../api";
import { useAuth0 } from "@auth0/auth0-react";

function Sidebar() {
  const { getAccessTokenSilently } = useAuth0();

  const [threads,setThreads]=useState([]);
 const {threadId,setThreadId,setMessages,messages,isSending}=useContext(MyContext)
 const [renamingValue,setRenamingValue]=useState("")
 const [renamingThreadId,setRenamingThreadId]=useState(null)
  
  useEffect(() => {
  const getThreads = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await api.get("/thread/getThreads", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setThreads(response.data.response);
    } catch (err) {
      console.log(err);
    }
  };

  getThreads();
}, [threadId, messages, getAccessTokenSilently]);
const [openDropdown,setOpenDropdown]=useState(null)

const handleDelete=async(threadId)=>{
  if (isSending) return;

  try{
      const token = await getAccessTokenSilently();
      const response = await api.delete(`/thread/deleteThread/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setThreads((prevThreads)=>{
        return prevThreads.filter((thread)=>{
          return thread.threadId!==threadId
        })

      })
      setOpenDropdown(null)

  }
  catch(err){
    console.log(err)
  }

}
const handleRename=async(threadId)=>{
  if (isSending) return;
  try{
    if(renamingValue.trim()===""){
      return;
    }
      const token = await getAccessTokenSilently();
      const response = await api.post(
        "/thread/renameThread",
        { threadId, newName: renamingValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
     setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.threadId === threadId
          ? {
              ...thread,
              title: renamingValue
            }
          : thread
      )
    );

    setRenamingThreadId(null);
    setRenamingValue("");
    setOpenDropdown(null);


  }
  catch(err){
    console.log(err)
  }


}

const handleNewChat=()=>{
    if (isSending) return;
    setThreadId(null)
    setMessages([])
}
const handleThreadClick=async(threadId)=>{
  if (isSending) return;
  setThreadId(threadId)
  const token = await getAccessTokenSilently();
  const response = await api.get(`/thread/getMessages/${threadId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(response.data.data)
  setMessages(response.data.data)
}

    

  return (
    <div className="sidebar">

      {/* Top */}
      <div className="sidebar-top">

        <div className="sidebar-logo">
          <img src="/chatgptLogo.png" alt="ChatGPT" />
          <h2>ChatGPT</h2>
        </div>

        <button className="close-sidebar">
        <i className="fa-solid fa-bars"></i>
        </button>

      </div>


      {/* New Chat */}
       <div className="new-chat">
        <button className="new-chat-button" disabled={isSending} onClick={()=>handleNewChat()}>
    <i className="fa-regular fa-pen-to-square"></i>
    <span>New chat</span>
  </button>
</div>


      {/* Recents */}
       <div className="recents">

        <p className="recent-title">Recents</p>

       {threads.map((thread) => (
          <div className="recent-item" key={thread.threadId} aria-disabled={isSending} onClick={()=>handleThreadClick(thread.threadId)}>

           {renamingThreadId === thread.threadId ? (

  <input
    type="text"
    value={renamingValue}
    onChange={(e) =>
     setRenamingValue(e.target.value)
    }
    onClick={(e) =>
      e.stopPropagation()
    }
    onKeyDown={(e) => {

      if (e.key === "Enter") {
        e.stopPropagation();

        handleRename(thread.threadId);
      }

      if (e.key === "Escape") {
        e.stopPropagation();

        setRenamingThreadId(null);
       setRenamingValue("");
      }

    }}
    autoFocus
  />

) : (

  <span>{thread.title}</span>

)}

            <i
              className="fa-solid fa-ellipsis"
              onClick={(e) =>{
                e.stopPropagation()
                setOpenDropdown(
                  openDropdown === thread.threadId ? null : thread.threadId
                )}
              }
            ></i>

            {openDropdown === thread.threadId && (
  <div className="dropdown"
   onClick={(e) => e.stopPropagation()}>

    <button
  className="dropdown-btn"
  onClick={() => {
    setRenamingThreadId(thread.threadId);
   setRenamingValue(thread.title);
    setOpenDropdown(null);
  }}
>
  <i className="fa-solid fa-pen"></i>
  <span>Rename</span>
</button>

    <button
      className="dropdown-btn delete-btn"
      onClick={() => handleDelete(thread.threadId)}
    >
      <i className="fa-solid fa-trash"></i>
      <span>Delete</span>
    </button>

  </div>
)}
            </div>
        ))}

      </div>

    </div>
  );
}

export default Sidebar;
