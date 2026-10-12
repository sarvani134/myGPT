import React from "react";
import "../../public/Sidebar.css";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { MyContext } from "../MyContext";
import api from "../api";
import { useAuth0 } from "@auth0/auth0-react";
import ShowPlanPage from "./ShowPlanPage";


function Sidebar({ collapsed, onToggle, onClose }) {
 const { getAccessTokenSilently,isAuthenticated, user } = useAuth0();
const [userPlan, setUserPlan] = useState(null);
const [planError, setPlanError] = useState("");
 const [showPlans,setShowPlans]=useState(false)

      useEffect(()=>{
        let cancelled=false
        setPlanError("")
        setUserPlan(null)
        if(!isAuthenticated || !user?.sub){
          return
        }
        const loadPlan=async()=>{
          try{
            const token=await getAccessTokenSilently()
          const response=await api.get("/user/me",{
            headers:{
              Authorization:`Bearer ${token}`
            }
          })
          if(!cancelled){
            setUserPlan(response.data.plan)
          }

          }
          catch(err){
            console.log(err)
            if(!cancelled){
              setPlanError("Trouble loading Plan")
            }
          }
        }
        loadPlan()
        return()=>{
          cancelled=true
        }
      },[isAuthenticated,user?.sub,getAccessTokenSilently])
const displayName = user?.name || "Your name";
const initials = displayName
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map((part) => part[0])
  .join("")
  .toUpperCase();

  const [threads,setThreads]=useState([]);
  useEffect(() => {
    if (collapsed) return;
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [collapsed, onClose]);

  const closeOnMobile = () => {
    if (window.matchMedia("(max-width: 760px)").matches) onClose();
  };
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
    closeOnMobile()
}
const handleThreadClick=async(threadId)=>{
  if (isSending) return;
  setThreadId(threadId)
  closeOnMobile()
  const token = await getAccessTokenSilently();
  const response = await api.get(`/thread/getMessages/${threadId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(response.data.data)
  setMessages(response.data.data)
}

    

  return (
    <>
    {!collapsed && <button className="sidebar-backdrop" aria-label="Close sidebar" onClick={onClose} />}
    <aside className={`sidebar${collapsed ? ' is-collapsed' : ''}`} aria-label="Chat navigation">

      {/* Top */}
      
        <div className="sidebar-top">
         
        <div className="sidebar-logo">
          <img src="/smart-ai-logo.svg" alt="The Smart AI" width="30" height="30" />
          <h2>The Smart AI</h2>
        </div>  

        <button className="close-sidebar" type="button" onClick={() => { setOpenDropdown(null); onToggle(); }} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} aria-controls="sidebar-recents" title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        <i className="fa-solid fa-bars" aria-hidden="true"></i>
        </button>

      </div>


      {/* New Chat */}
       <div className="new-chat">
        <button className="new-chat-button" aria-label="New chat" title="New chat" disabled={isSending} onClick={()=>handleNewChat()}>
    <i className="fa-regular fa-pen-to-square"></i>
    <span>New chat</span>
  </button>
</div>


      {/* Recents */}
       <div className="recents" id="sidebar-recents" hidden={collapsed}>

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
      <div className="sidebar-profile">
  <div className="sidebar-avatar" title={displayName}>
    {initials}
  </div>

  <div className="sidebar-profile-details">
    <p className="sidebar-profile-name" title={displayName}>
      {displayName}
    </p>
    <p className="sidebar-profile-plan">
      <span>{planError || userPlan || "Loading plan…"}</span>
      <span aria-hidden="true"> · </span>
      <button
        type="button"
        className="show-plans-button"
        onClick={() => setShowPlans(true)}
      >
        See plans
      </button>
    </p>
  </div>
</div>

    </aside>
    {showPlans && (
  <ShowPlanPage
    currentPlan={userPlan}
    onPlanChange={setUserPlan}
    onClose={() => setShowPlans(false)}
  />
  
)}
    </>
  );
}

export default Sidebar;
