import { useState, useEffect, useRef } from "react";
import API from "../../api/api";
import { useChat } from "../../context/ChatContext";

export default function StartChat() {
  const { chats, setChats, setSelectedChat } = useChat();
  const [users, setUsers] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get("/user/all");
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const accessChat = async (userId) => {
    try {
      const { data } = await API.post("/chat", { userId });
      setSelectedChat(data);
      if (!chats.some((c) => c._id === data._id)) setChats([data, ...chats]);
      setDropdownOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full flex items-center justify-between p-3 border rounded-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base shadow-sm"
      >
        <span>Select user to chat</span>
        <span className="text-gray-400 dark:text-gray-300">
          {dropdownOpen ? "▲" : "▼"}
        </span>
      </button>

      {dropdownOpen && (
        <div className="absolute top-full left-0 w-full max-h-60 sm:max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border rounded shadow-lg z-10 transition-colors">
          {users.map((u) => (
            <button
              key={u._id}
              onClick={() => accessChat(u._id)}
              className="w-full text-left px-4 py-2 sm:py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base rounded"
            >
              {u.name}{" "}
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                ({u.email})
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
