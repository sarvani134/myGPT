import React, { useState } from "react";
import NavBar from "./NavBar";
import "../../public/ChatWindow.css";

function ChatWindow() {
    let [message,setMessage]=useState("")

    const handleKeyDown=(e)=>{

    }
 

  
  return (
    <div className="chat-window">

      {/* Navbar */}
      <NavBar />

      {/* Main Chat Area */}
      <div className="chat-main">

        <h2 className="welcome-text">
          Hello, Welcome!
        </h2>

        {/* Search / Message Bar */}
        <div className="chat-input-container">

          <input 
          type="text"
          placeholder="what would you like to know"
          value={message}
          onChange={e=>setMessage(e.target.value)}
          onKeyDown={()=>handleKeyDown()}

          />
          
          <input
            type="text"
            placeholder="What would you like to know?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={()=>handleKeyDown()}
          />

          <button
            className="send-button"
            onClick={()=>handleSend()}
            disabled={message.trim() === ""}
          >
           
            <i className="fa-solid fa-arrow-up"></i>
          </button>

        </div>

      </div>

    </div>
  );
}

export default ChatWindow;