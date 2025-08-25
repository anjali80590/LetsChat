import { useEffect, useRef, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import Message from "./Message";
import MessageInput from "./MessageInput";
import API from "../../api/api";
import { toast } from "react-toastify";

export default function ChatWindow() {
  const { selectedChat, messages } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [localMessages, setLocalMessages] = useState([]);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages, selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, selectedChat]);

  const handleDeleteMessage = (deletedMessageId) => {
    setLocalMessages((prev) =>
      prev.filter((msg) => msg._id !== deletedMessageId)
    );
  };

  const getChatDisplayName = () => {
    if (!selectedChat) return "";
    if (selectedChat.isGroupChat) return selectedChat.chatName || "Group Chat";
    const otherUser = selectedChat.users?.find((u) => u && u._id !== user?._id);
    return otherUser?.name || "Unknown User";
  };

  const getChatSubtitle = () => {
    if (!selectedChat) return "";
    return selectedChat.isGroupChat
      ? `${selectedChat.users?.length || 0} participant(s)`
      : "Direct message";
  };

  const getAvatarInitials = () => {
    const name = getChatDisplayName();
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 60%, 50%)`;
  };

  const handleShareChat = async () => {
    if (!selectedChat?._id) return;

    try {
      const { data } = await API.post(
        `/chat/generate-link/${selectedChat._id}`
      );

      navigator.clipboard.writeText(data.link);
      toast.success("Group link copied!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate chat link");
    }
  };

  const formatDateHeading = (dateString) => {
    const msgDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (
      msgDate.getDate() === today.getDate() &&
      msgDate.getMonth() === today.getMonth() &&
      msgDate.getFullYear() === today.getFullYear()
    )
      return "Today";

    if (
      msgDate.getDate() === yesterday.getDate() &&
      msgDate.getMonth() === yesterday.getMonth() &&
      msgDate.getFullYear() === yesterday.getFullYear()
    )
      return "Yesterday";

    return msgDate.toLocaleDateString();
  };

  const groupedMessages = localMessages.reduce((acc, message) => {
    const dateHeading = formatDateHeading(message.createdAt);
    if (!acc[dateHeading]) acc[dateHeading] = [];
    acc[dateHeading].push(message);
    return acc;
  }, {});

  if (!selectedChat || !selectedChat.users) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center p-8">
          <div className="text-6xl mb-4 animate-bounce">💬</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Select a chat to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 border-b flex items-center justify-between shadow-sm transition-colors duration-300">
        <div className="flex items-center flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-full mr-3 flex items-center justify-center text-white font-semibold flex-shrink-0"
            style={{ backgroundColor: stringToColor(getChatDisplayName()) }}
          >
            {getAvatarInitials()}
          </div>
          <div className="truncate">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
              {getChatDisplayName()}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {getChatSubtitle()}
            </p>
          </div>
        </div>

        {selectedChat.isGroupChat && (
          <button
            onClick={handleShareChat}
            className="ml-2 px-2 sm:px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs sm:text-sm flex-shrink-0"
          >
            Share
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {localMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <div className="text-4xl mb-2 animate-pulse">👋</div>
              <p>No messages yet</p>
              <p className="text-sm mt-1">
                Send a message to start the conversation
              </p>
            </div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateHeading, msgs]) => (
            <div key={dateHeading} className="space-y-3 sm:space-y-4">
              <div className="text-center text-gray-400 dark:text-gray-500 text-sm my-2">
                {dateHeading}
              </div>
              {msgs.map((message) => (
                <Message
                  key={message._id || message.tempId}
                  message={message}
                  onDelete={handleDeleteMessage}
                />
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t p-2 sm:p-4">
        <MessageInput />
      </div>
    </div>
  );
}
