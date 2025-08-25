import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import { useSocket } from "./SocketContext";

const ChatContext = createContext();
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { socket } = useSocket();
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("userInfo")) || null
  );
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(
    JSON.parse(localStorage.getItem("selectedChat")) || null
  );
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const fetchChats = async () => {
    if (!user) return;
    try {
      const { data } = await API.get("/chat");

      const uniqueChats = [];
      const seenUsers = new Set();

      data.forEach((chat) => {
        if (chat.deletedFor && chat.deletedFor.includes(user._id)) return;

        if (!chat.isGroupChat) {
          const otherUser = chat.users.find((u) => u._id !== user._id);
          if (!seenUsers.has(otherUser._id)) {
            uniqueChats.push(chat);
            seenUsers.add(otherUser._id);
          }
        } else {
          uniqueChats.push(chat);
        }
      });

      setChats(uniqueChats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (chatId) => {
    if (!chatId) return;
    try {
      const { data } = await API.get(`/message/${chatId}`);
      setMessages(data);
      if (socket) socket.emit("join-chat", chatId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessageReceived = useCallback(
    (newMessage) => {
      if (newMessage.content === "joined group") return; // 🚫 ignore system messages

      setMessages((prev) => {
        if (prev.some((m) => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });

      if (selectedChat?._id !== newMessage.chat._id) {
        setNotifications((prev) => [...prev, newMessage]);
        setChats((prev) =>
          prev.map((c) =>
            c._id === newMessage.chat._id
              ? {
                  ...c,
                  unreadCount: (c.unreadCount || 0) + 1,
                  latestMessage: newMessage,
                }
              : c
          )
        );
        toast.info(`New message from ${newMessage.sender.name}`);
      } else {
        // ✅ also update latestMessage for the active chat
        setChats((prev) =>
          prev.map((c) =>
            c._id === newMessage.chat._id
              ? { ...c, latestMessage: newMessage }
              : c
          )
        );
      }
    },
    [selectedChat]
  );

  useEffect(() => {
    if (!socket) return;
    socket.on("message received", handleMessageReceived);
    return () => socket.off("message received", handleMessageReceived);
  }, [socket, handleMessageReceived]);

  useEffect(() => {
    if (user) fetchChats();
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      localStorage.setItem("selectedChat", JSON.stringify(selectedChat));
      fetchMessages(selectedChat._id);
    } else {
      setMessages([]);
      localStorage.removeItem("selectedChat");
    }
  }, [selectedChat]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        messages,
        setMessages,
        fetchMessages,
        fetchChats,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
