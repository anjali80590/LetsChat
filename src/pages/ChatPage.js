import { useTheme } from "../context/ThemeContext";
import StartChat from "../components/chat/StartChat";
import StartGroupChat from "../components/chat/StartGroupChat";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import GroupManagement from "../components/chat/GroupManagement";
import { useState } from "react";
import Navbar from "../components/Navbar";

export default function ChatPage() {
  const { darkMode } = useTheme();
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`
            fixed inset-y-0 left-0 z-30 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out
            ${showSidebar ? "translate-x-0" : "-translate-x-full"} 
            w-[70%] sm:w-[50%] lg:w-[30%] lg:relative lg:translate-x-0
          `}
        >
          <div className="p-3 space-y-3 border-b bg-white dark:bg-gray-800 flex-shrink-0">
            <StartChat />
            <StartGroupChat />
          </div>

          <div className="flex-1 overflow-y-auto">
            <ChatList />
          </div>
        </div>

        {showSidebar && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-20 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        <div className="flex-1 flex flex-col lg:w-[70%] overflow-hidden">
          <div className="lg:hidden p-3 flex items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button
              className="text-gray-800 dark:text-gray-200 text-2xl mr-3"
              onClick={() => setShowSidebar(true)}
            >
              ☰
            </button>
          </div>

          <div className="overflow-y-auto border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <GroupManagement />
          </div>

          <div className="flex-1 overflow-y-auto">
            <ChatWindow />
          </div>
        </div>
      </div>
    </div>
  );
}
