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
  const fileInputRef=useRef(null)
  const inputRef=useRef(null)
  const [selectedImage,setSelectedImage]=useState(null)
  const [imagePreview,setImagePreview]=useState("")
  const [isPreviewOpen,setIsPreviewOpen]=useState(false)
  const imageDialogRef = useRef(null);

  useEffect(() => {
    const dialog = imageDialogRef.current;
    if (!dialog) return;

    if (isPreviewOpen && imagePreview) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isPreviewOpen, imagePreview]);

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
  const handleImageChange=(e)=>{
    try{
      const file=e.target?.files[0]
      if(!file){
        return 
      }
       if (!file.type.startsWith("image/")) {
    alert("Please select an image.");
    e.target.value = "";
    return;
  }
  setSelectedImage(file)
  const reader=new FileReader()
  reader.onload=()=>setImagePreview(reader.result)
  reader.readAsDataURL(file)
    inputRef.current.focus()

    }
    catch(err){
      console.log(err)
    }
  }
const removeImage=()=>{
  setIsPreviewOpen(false);
  setSelectedImage(null)
  setImagePreview("")
  if(fileInputRef.current){
    fileInputRef.current.value=""
  }
}

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
    const formData=new FormData()
    formData.append("message",submittedMessage)
    formData.append("threadId",currentThreadId)
    if(selectedImage){
      formData.append("image",selectedImage)
    }

      const response = await api.post(
        "/thread/addMessage",
        formData,
        config
      );
      

        setMessages(
          response.data.thread.messages)
          removeImage()

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

      <dialog
        ref={imageDialogRef}
        className="image-dialog"
        aria-label="Attached image preview"
        onClose={() => setIsPreviewOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsPreviewOpen(false);
        }}
      >
        <button
          type="button"
          className="image-dialog-close"
          onClick={() => setIsPreviewOpen(false)}
          aria-label="Close image preview"
          autoFocus
        >
          &times;
        </button>
        {imagePreview && <img src={imagePreview} alt="Enlarged attachment" />}
      </dialog>


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
          {imagePreview && (
  <div className="image-preview">
   <button
    type="button"
    className="preview-open"
    onClick={() => setIsPreviewOpen(true)}
    aria-label="Enlarge attached image"
  >
    <img src={imagePreview} alt="Selected attachment" />
  </button>

  <button
    type="button"
    className="preview-remove"
    onClick={removeImage}
    aria-label="Remove image"
  >
    &times;
  </button>

  </div>
)}
          <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          hidden/>
          <button
  type="button"
  className="attach-button"
  onClick={() => fileInputRef.current?.click()}
  disabled={isSending}
  aria-label="Add image"
>
  +
</button>

         
          <textarea
          ref={inputRef}
          rows={1}
          aria-label="Message"
          placeholder="Type a message..."
          value={message}
          onChange={e=>setMessage(e.target.value)}
          onKeyDown={(e)=>{
            if(e.key=="Enter" && !e.shiftKey){
              e.preventDefault()
              handleKeyDown(e)
            }
          }}></textarea>


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
