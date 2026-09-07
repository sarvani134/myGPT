import React, { useState, useContext, useRef, useEffect } from "react";
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
  const [sendError, setSendError] = useState("");
  const sendingRef = useRef(false);
  const messagesEndRef = useRef(null);

  const {
    threadId,
    setThreadId,
    messages,
    setMessages,
    isSending,
    setIsSending
  } = useContext(MyContext);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, isSending]);

  const handleSend = async () => {

    if (message.trim() === "" || sendingRef.current) return;

    const submittedMessage = message.trim();
    sendingRef.current = true;
    setIsSending(true);
    setSendError("");
    setMessages((previous) => [...previous, { role: "user", content: submittedMessage }]);
    setMessage("");
    let currentThreadId = threadId;

    try {
      const token = await getAccessTokenSilently();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

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
          message: submittedMessage,
          threadId: currentThreadId
        },
        config
      );
      

        setMessages(
          response.data.thread.messages)

    } catch (err) {

      console.log(err);
      setSendError({ threadId: currentThreadId, text: "Couldn't get a reply. Your message may have been saved. Check this chat before sending again." });

    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }

  };


  const handleKeyDown = (e) => {

    if (e.key === "Enter" && !e.nativeEvent.isComposing) {

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

            {isSending && (
              <div className="message assistant thinking-indicator" role="status" aria-live="polite">
                <span>Thinking</span>
                <span className="thinking-dots" aria-hidden="true">
                  <span /><span /><span />
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />

          </div>

        )}


        {/* Message Input */}

        {sendError && sendError.threadId === threadId && <p className="chat-error" role="alert">{sendError.text}</p>}

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
            disabled={isSending || message.trim() === ""}
            aria-label={isSending ? "Waiting for response" : "Send message"}
          >

            <i className="fa-solid fa-arrow-up"></i>

          </button>

        </div>

      </div>

    </div>

  );

}

export default ChatWindow;
