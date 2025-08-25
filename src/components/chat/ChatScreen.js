import { useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import Message from "./Message";
import MessageInput from "./MessageInput";

export default function ChatScreen() {
  const { selectedChat, messages } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 transition-colors">
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

      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 border-b flex items-center shadow-md">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full mr-3 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
          {selectedChat.chatName.charAt(0).toUpperCase()}
        </div>
        <div className="truncate">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
            {selectedChat.chatName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 truncate">
            {selectedChat.isGroupChat
              ? `${selectedChat.users.length} participants`
              : "Direct message"}
          </p>
        </div>
      </div>

 
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-gray-50 dark:bg-gray-900 transition-colors">
        {messages.length === 0 ? (
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
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <Message key={message._id || message.tempId} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>


      <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t p-2 sm:p-4">
        <MessageInput />
      </div>
    </div>
  );
}
