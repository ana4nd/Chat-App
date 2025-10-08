import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { messages, sendMessage, getMessages, selectedUser, setSelectedUser } =
    useContext(ChatContext);
  const { authUser, onlineUser } = useContext(AuthContext);

  const scrollEnd = useRef();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false); // ✅ prevent double send

  // ✅ Send text message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (sending) return; // prevent multiple sends
    if (!input.trim()) return;

    try {
      setSending(true);
      await sendMessage({ text: input.trim() });
      setInput("");
    } catch (err) {
      console.error("Send message failed:", err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // ✅ Handle enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ✅ Send image message
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setSending(true);
        await sendMessage({ image: reader.result });
      } catch (err) {
        toast.error("Failed to send image");
      } finally {
        setSending(false);
        e.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  // ✅ Load messages when user selected
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // ✅ Auto scroll to bottom
  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt="profile"
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUser.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="back"
          className="md:hidden max-w-7 cursor-pointer"
        />
        <img
          src={assets.help_icon}
          alt="help"
          className="max-md:hidden max-w-5"
        />
      </div>

      {/* Chat Area */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-auto p-3 pb-6 space-y-3">
        {messages.map((msg, index) => {
          const isMyMessage =
            msg.senderId?.toString() === authUser?._id?.toString();

          return (
            <div
              key={index}
              className={`flex items-end gap-2 ${
                isMyMessage ? "justify-end" : "justify-start"
              }`}
            >
              {!isMyMessage && (
                <div className="text-center text-xs mr-2">
                  <img
                    src={selectedUser?.profilePic || assets.avatar_icon}
                    alt="avatar"
                    className="w-7 rounded-full"
                  />
                </div>
              )}

              {msg.image ? (
                <img
                  src={msg.image}
                  alt="sent"
                  className={`max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-2 ${
                    isMyMessage
                      ? "bg-voilet-500/30 rounded-br-none"
                      : "bg-gray-700/30 rounded-bl-none"
                  }`}
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-2 break-all text-white ${
                    isMyMessage
                      ? "bg-voilet-500/30 rounded-br-none"
                      : "bg-gray-700/30 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </p>
              )}

              {isMyMessage && (
                <div className="text-center text-xs ml-2">
                  <img
                    src={authUser?.profilePic || assets.avatar_icon}
                    alt="avatar"
                    className="w-7 rounded-full"
                  />
                </div>
              )}
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* Message Input */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-black/40 backdrop-blur-md">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="upload"
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt="send"
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
