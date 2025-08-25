


import { useEffect } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import API from "../../api/api";
import { toast } from "react-toastify";

export default function ChatList() {
  const {
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    notifications,
    setNotifications,
  } = useChat();

  const { user } = useAuth();
  const { socket } = useSocket();

  // 🔹 Fetch all chats on component mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await API.get("/chat"); // adjust endpoint if needed
        setChats(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load chats");
      }
    };

    fetchChats();
  }, [setChats]);

  // 🔹 Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (newMessage) => {
      if (newMessage.content === "joined group") return;

      setChats((prevChats) => {
        const updatedChats = prevChats.map((chat) =>
          chat._id === newMessage.chat._id
            ? { ...chat, latestMessage: newMessage }
            : chat
        );

        const chatExists = updatedChats.some(
          (chat) => chat._id === newMessage.chat._id
        );

        if (!chatExists) {
          return [newMessage.chat, ...updatedChats];
        }

        return updatedChats.sort(
          (a, b) =>
            new Date(b.latestMessage?.createdAt).getTime() -
            new Date(a.latestMessage?.createdAt).getTime()
        );
      });
    };

    socket.on("message received", handleMessage);
    return () => socket.off("message received", handleMessage);
  }, [socket, setChats]);

  // 🔹 Helpers
  const getChatDisplayName = (chat) => {
    if (!chat) return "Unknown Chat";
    if (chat.isGroupChat) return chat.chatName || "Unnamed Group";
    const otherUser = chat.users?.find((u) => u._id !== user?._id);
    return otherUser ? otherUser.name : "Unknown User";
  };

  const getLastMessagePreview = (chat) => {
    const lastMsg =
      chat.messages?.[chat.messages.length - 1] || chat.latestMessage;
    if (!lastMsg) return "No messages yet";
    if (lastMsg.isFile) return "📎 File";
    if (lastMsg.content === "joined group") return "";

    let prefix = "";
    if (chat.isGroupChat && lastMsg.sender) {
      prefix =
        lastMsg.sender._id === user._id ? "You: " : `${lastMsg.sender.name}: `;
    }

    const content = lastMsg.content || "";
    return (
      prefix +
      (content.length > 30 ? `${content.substring(0, 30)}...` : content)
    );
  };

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 60%, 50%)`;
  };

  const deleteChat = async (chatId) => {
    try {
      await API.delete(`/chat/${chatId}`);
      setChats((prev) => prev.filter((c) => c._id !== chatId));

      if (selectedChat?._id === chatId) setSelectedChat(null);

      setNotifications((prev) => prev.filter((n) => n.chat._id !== chatId));

      toast.success("Chat deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete chat");
    }
  };

  if (!chats || chats.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No chats yet. Start a conversation!
      </div>
    );
  }

  // 🔹 Remove duplicate one-on-one chats
  const filteredChats = [];
  const seenUsers = new Set();

  chats.forEach((chat) => {
    if (!chat.isGroupChat) {
      const otherUser = chat.users.find((u) => u._id !== user._id);
      if (!seenUsers.has(otherUser._id)) {
        filteredChats.push(chat);
        seenUsers.add(otherUser._id);
      }
    } else {
      filteredChats.push(chat);
    }
  });

  return (
    <div className="overflow-y-auto h-full">
      {filteredChats.map((chat) => {
        const displayName = getChatDisplayName(chat);
        const unreadCount = notifications.filter(
          (n) => n.chat._id.toString() === chat._id.toString()
        ).length;

        return (
          <div
            key={chat._id}
            className={`p-3 sm:p-4 border-b cursor-pointer flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg mb-1 ${
              selectedChat?._id?.toString() === chat._id?.toString()
                ? "bg-blue-50 dark:bg-blue-600/30"
                : "bg-white dark:bg-gray-800"
            }`}
            onClick={() => {
              setSelectedChat(chat);
              setNotifications((prev) =>
                prev.filter(
                  (n) => n.chat._id.toString() !== chat._id.toString()
                )
              );
              setChats((prev) =>
                prev.map((c) =>
                  c._id === chat._id ? { ...c, unreadCount: 0 } : c
                )
              );
            }}
          >
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
              style={{ backgroundColor: stringToColor(displayName) }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-800 dark:text-gray-100 truncate text-sm sm:text-base">
                {displayName}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300 truncate">
                {getLastMessagePreview(chat)}
              </p>
            </div>

            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-500 text-white rounded-full text-xs sm:text-sm flex-shrink-0">
                {unreadCount}
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteChat(chat._id);
              }}
              className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
              title="Delete Chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}






