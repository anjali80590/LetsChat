import { useState } from "react";
import API from "../../api/api";
import { useChat } from '../../context/ChatContext'; 
import { useSocket } from "../../context/SocketContext";
import FileUpload from "./FileUpload";
import Picker from "emoji-picker-react";

export default function MessageInput() {
  const { selectedChat, setChats, setSelectedChat, chats } = useChat(); 
  const { socket } = useSocket();
  const [content, setContent] = useState("");
  const [viewOnce, setViewOnce] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedChat) return;

    try {
      const { data } = await API.post("/message", {
        chatId: selectedChat._id,
        content,
        viewOnce,
      });

      setSelectedChat((prev) =>
        prev ? { ...prev, messages: [...(prev.messages || []), data] } : prev
      );

      socket.emit("new message", data);

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, latestMessage: data }
            : chat
        )
      );

      setContent("");
      setViewOnce(false);
    } catch (err) {
      console.error(err);
    }
  };

  const onEmojiClick = (emojiObject) =>
    setContent((prev) => prev + emojiObject.emoji);

  return (
    <div className="p-2 sm:p-3 border-t bg-white dark:bg-gray-800">
      <div className="hidden lg:flex items-center gap-2 flex-wrap">
        <FileUpload className="w-8 h-8 sm:w-10 sm:h-10" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-2xl p-1"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-14 left-0 z-50 max-w-xs sm:max-w-sm">
              <Picker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>

        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 transition-colors w-full"
        />

        <label className="flex items-center gap-1 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={viewOnce}
            onChange={() => setViewOnce(!viewOnce)}
          />
          View Once
        </label>

        <button
          onClick={sendMessage}
          disabled={!content.trim()}
          className="bg-blue-500 dark:bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:dark:bg-blue-400 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>


      <div className="flex flex-col lg:hidden gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <FileUpload className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="text-xl sm:text-2xl p-1"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-14 left-0 z-50 sm:left-4 max-w-xs sm:max-w-sm">
                <Picker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>

          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 transition-colors w-full"
          />
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <label className="flex items-center gap-1 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={viewOnce}
              onChange={() => setViewOnce(!viewOnce)}
            />
            View Once
          </label>

          <button
            onClick={sendMessage}
            disabled={!content.trim()}
            className="bg-blue-500 dark:bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:dark:bg-blue-400 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
