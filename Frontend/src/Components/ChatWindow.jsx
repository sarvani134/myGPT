import React, { useState, useContext } from "react";
import NavBar from "./NavBar";
import "../../public/ChatWindow.css";
import { MyContext } from "../MyContext";
import api from "../api";
import { useAuth0 } from "@auth0/auth0-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

function ChatWindow() {
  const { getAccessTokenSilently } = useAuth0();

  const [message, setMessage] = useState("");

  const {
    threadId,
    setThreadId,
    messages,
    setMessages
  } = useContext(MyContext);


  const handleSend = async () => {

    if (message.trim() === "") return;

    try {
      const token = await getAccessTokenSilently();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      let currentThreadId = threadId;
      if (!currentThreadId) {

      const createResponse = await api.post(
        "/thread/createThread",
        {},
        config
      );

      currentThreadId =
        createResponse.data.thread.threadId;

      setThreadId(currentThreadId);
    }

      const response = await api.post(
        "/thread/addMessage",
        {
          message,
          threadId: currentThreadId
        },
        config
      );
      

        setMessages(
          response.data.thread.messages)
      setMessage("");

    } catch (err) {

      console.log(err);

    }

  };


  const handleKeyDown = (e) => {

    if (e.key === "Enter") {

      handleSend();

    }

  };


  return (

    <div className="chat-window">

      {/* Navbar */}

      <NavBar />


      {/* Main Chat Area */}

      <div className="chat-main">


        {/* Show Welcome only when chat is empty */}

        {messages.length === 0 ? (

          <h2 className="welcome-text">
            Hello, Welcome!
          </h2>

        ) : (

          <div className="messages">

            {messages.map((msg, index) => (

              <div
                key={index}
                className={`message ${msg.role}`}
              >

                {msg.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[[rehypeHighlight, { detect: true }]]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}

              </div>

            ))}

          </div>

        )}


        {/* Message Input */}

        <div className="chat-input-container">

          <input
            type="text"
            placeholder="What would you like to know?"
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={(e) =>
              handleKeyDown(e)
            }
          />


          <button
            className="send-button"
            onClick={() =>
              handleSend()
            }
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
