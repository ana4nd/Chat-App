import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios, authUser } = useContext(AuthContext);

  // ✅ Always attach token to axios headers
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && axios) {
      axios.defaults.headers.common["token"] = token;
    }
  }, [axios]);

  // ✅ Get all users
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/user");

      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      } else {
        setUsers([]);
        toast.error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      setUsers([]);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Get messages for selected user
  const getMessages = async (userId) => {
    if (!userId) return;
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);

      if (data.success) {
        setMessages(data.messages);
      } else {
        toast.error(data.message || "Failed to fetch messages");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Send a message (text or image)
  const sendMessage = async (messageData) => {
    if (!selectedUser) return toast.error("No user selected");

    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      if (data.success) {
        // ✅ Add instantly for fast UI (avoid lag)
        setMessages((prev) => [...prev, data.message]);
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Listen for new incoming messages (socket)
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.off("newMessage"); // prevent duplicate listeners

    socket.on("newMessage", (newMessage) => {
      console.log("📩 Received newMessage:", newMessage);

      // 🚫 Skip if message is sent by the logged-in user (prevents double)
      if (newMessage.senderId === authUser?._id) return;

      // ✅ If the current chat is open, show immediately
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, newMessage]);
      } else {
        // ✅ Otherwise increase unseen count
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    });
  };

  useEffect(() => {
    subscribeToMessages();
    return () => socket?.off("newMessage");
  }, [socket, selectedUser, authUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
