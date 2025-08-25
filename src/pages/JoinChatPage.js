

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import API from "../api/api";
import { toast } from "react-toastify";

export default function JoinChatPage() {
  const { linkId } = useParams(); 
  const { user } = useAuth();
  const { setSelectedChat, setChats } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    const joinChat = async () => {
      if (!user) {
        toast.info("Please login to join the chat");
        navigate("/login");
        return;
      }

      try {
        const { data } = await API.get(`/chat/join/${linkId}`);
        setChats((prev) => {
          const exists = prev.find((c) => c._id === data._id);
          if (!exists) return [data, ...prev];
          return prev.map((c) => (c._id === data._id ? data : c));
        });

        setSelectedChat(data);

        toast.success(`Joined group: ${data.chatName}`);
        navigate("/"); 
      } catch (err) {
        console.error(err);
        toast.error(
          err.response?.data?.message || "Failed to join chat. Invalid link."
        );
        navigate("/");
      }
    };

    joinChat();
  }, [linkId, user, navigate, setSelectedChat, setChats]);

  return (
    <div className="flex items-center justify-center h-screen text-gray-700 dark:text-gray-300">
      Joining chat...
    </div>
  );
}
