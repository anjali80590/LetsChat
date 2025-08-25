import { useState } from "react";
import API from "../../api/api";
import { useChat } from "../../context/ChatContext";
import { useSocket } from "../../context/SocketContext";

export default function FileUpload() {
  const { selectedChat, setMessages } = useChat();
  const { socket } = useSocket();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max size: 10MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data.success) throw new Error(res.data.error || "Upload failed");

   
      const baseUrl = API.defaults.baseURL.replace("/api", "");
      const fileUrl = `${baseUrl}${res.data.filePath}`;

      const { data } = await API.post("/message", {
        chatId: selectedChat._id,
        content: fileUrl,
        isFile: true,
        fileName: res.data.fileName,
      });

      setMessages((prev) => [...prev, data]);
      socket.emit("new message", data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex items-center">
      <label
        className={`
          cursor-pointer p-2 rounded-full transition-colors
          flex items-center justify-center
          w-10 h-10 sm:w-12 sm:h-12
          ${
            isUploading
              ? "bg-gray-300 dark:bg-gray-700"
              : "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
          }
        `}
      >
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={isUploading || !selectedChat}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
        />
        <span className="text-lg sm:text-xl">{isUploading ? "⏳" : "📎"}</span>
      </label>
    </div>
  );
}
