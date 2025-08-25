import { useState, useEffect } from "react";
import API from "../../api/api";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function GroupManagement() {
  const { selectedChat, setSelectedChat, setChats, fetchChats } = useChat();
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingOps, setLoadingOps] = useState({});
  const [groupName, setGroupName] = useState(""); // controlled group name input

  const isAdmin = selectedChat?.groupAdmin?._id === user?._id;

  useEffect(() => {
    if (show && selectedChat) {
      fetchUsers();
      setGroupName(selectedChat.chatName || "");
    }
  }, [show, selectedChat]);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/user/all");
      setAllUsers(
        data.filter((u) => !selectedChat.users.some((m) => m._id === u._id))
      );
    } catch (err) {
      toast.error("Failed to fetch users");
    }
  };

  const renameGroup = async () => {
    if (!groupName.trim()) return toast.error("Enter group name");
    if (!isAdmin) return toast.error("Only admin can rename");

    setLoadingOps((prev) => ({ ...prev, rename: true }));
    try {
      const { data } = await API.put("/chat/rename", {
        chatId: selectedChat._id,
        chatName: groupName,
      });
      setSelectedChat(data);
      await fetchChats();
      toast.success("Group renamed successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Rename failed");
    } finally {
      setLoadingOps((prev) => ({ ...prev, rename: false }));
    }
  };

  const addRemoveUser = async (userId, action) => {
    setLoadingOps((prev) => ({ ...prev, [userId]: true }));
    try {
      const { data } = await API.put(`/chat/${action}`, {
        chatId: selectedChat._id,
        userId,
      });

      if (action === "groupremove" && userId === user._id) {
        setChats((prev) => prev.filter((c) => c._id !== selectedChat._id));
        setSelectedChat(null);
        toast.success("You left the group");
        return;
      }

      setSelectedChat(data);
      await fetchChats();
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setLoadingOps((prev) => ({ ...prev, [userId]: false }));
    }
  };



  if (!selectedChat || !selectedChat.isGroupChat) return null;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full max-w-full border-b">
      <div className="flex justify-between items-center flex-wrap mb-3">
        <h3 className="font-semibold text-lg sm:text-xl">Group Management</h3>
        <button
          onClick={() => setShow(!show)}
          className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm sm:text-base transition-colors mt-2 sm:mt-0"
        >
          {show ? "Hide" : "Manage"}
        </button>
      </div>

      {show && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={!isAdmin} // only admin can type
              className={`flex-1 min-w-[150px] p-2 border rounded 
      ${
        isAdmin
          ? "bg-gray-100 dark:bg-gray-700"
          : "bg-gray-200 dark:bg-gray-600 cursor-not-allowed"
      }
      border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base`}
            />

            {isAdmin && (
              <button
                onClick={renameGroup}
                disabled={loadingOps.rename}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                {loadingOps.rename ? "Renaming..." : "Change Name"}
              </button>
            )}
          </div>

          {isAdmin && allUsers.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-sm sm:text-base">
                Add Users
              </h4>
              <div className="max-h-40 sm:max-h-48 overflow-y-auto border rounded p-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                {allUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex justify-between items-center p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-sm sm:text-base"
                  >
                    <span className="truncate">{u.name}</span>
                    <button
                      onClick={() => addRemoveUser(u._id, "groupadd")}
                      disabled={loadingOps[u._id]}
                      className="text-green-500 hover:text-green-600 transition-colors text-xs sm:text-sm"
                    >
                      {loadingOps[u._id] ? "Adding..." : "Add"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2 text-sm sm:text-base">Members</h4>
            <div className="max-h-40 sm:max-h-48 overflow-y-auto border rounded p-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
              {selectedChat.users.map((member) => (
                <div
                  key={member._id}
                  className="flex justify-between items-center p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-sm sm:text-base"
                >
                  <span className="truncate">
                    {member.name} {member._id === user._id && "(You)"}{" "}
                    {member._id === selectedChat.groupAdmin?._id && "(Admin)"}
                  </span>
                  {member._id !== user._id && isAdmin && (
                    <button
                      onClick={() => addRemoveUser(member._id, "groupremove")}
                      disabled={loadingOps[member._id]}
                      className="text-red-500 hover:text-red-600 transition-colors text-xs sm:text-sm"
                    >
                      {loadingOps[member._id] ? "Removing..." : "Remove"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => addRemoveUser(user._id, "groupremove")}
            disabled={loadingOps[user._id]}
            className="w-full bg-red-500 dark:bg-red-600 text-white py-2 rounded hover:bg-red-600 dark:hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            {loadingOps[user._id] ? "Leaving..." : "Leave Group"}
          </button>
        </div>
      )}
    </div>
  );
}
