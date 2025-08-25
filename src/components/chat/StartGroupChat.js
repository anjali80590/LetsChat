import { useState, useEffect } from "react";
import API from "../../api/api";
import { useChat } from "../../context/ChatContext";
import { ToastContainer, toast } from "react-toastify";
export default function StartGroupChat() {
  const { chats, setChats } = useChat();
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get("/user/all");
        setAllUsers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };
  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      toast.error("Enter group name and select users"); 
      return;
    }
    try {
      const { data } = await API.post("/chat/group", {
        name: groupName,
        users: selectedUsers,
      });
      setChats([data, ...chats]);
      setGroupName("");
      setSelectedUsers([]);
      toast.success("Group created successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create group"); 
    }
  };

  return (
    <div className="p-3 border-b bg-gray-50 dark:bg-gray-800 rounded transition-colors w-full space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 w-full sm:w-auto"
        />
        <button
          onClick={createGroup}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded hover:from-blue-600 hover:to-purple-600 transition-colors font-medium w-full sm:w-auto"
        >
          Create Group
        </button>
      </div>
      <div className="max-h-40 overflow-y-auto border rounded p-2 bg-white dark:bg-gray-700 transition-colors">
        {allUsers.map((u) => (
          <label
            key={u._id}
            className="flex items-center gap-2 mb-1 text-gray-900 dark:text-gray-100 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedUsers.includes(u._id)}
              onChange={() => toggleUser(u._id)}
              className="h-4 w-4 text-blue-600 rounded flex-shrink-0"
            />
            <span className="text-sm truncate">
              {u.name} ({u.email})
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
