import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";

export default function Message({ message, onDelete }) {
  const { user } = useAuth();
  const { selectedChat } = useChat();
  const navigate = useNavigate();
  const messageRef = useRef(null);
  const [imageError, setImageError] = useState(false);
  const [hideContent, setHideContent] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const isOwn = useMemo(
    () => message?.sender?._id === user?._id,
    [message?.sender?._id, user?._id]
  );

  const isFile = useMemo(() => {
    return (
      message?.isFile ||
      message?.content?.includes("/uploads/") ||
      message?.content?.includes("letschat-backend-ryk4.onrender.com")
    );
  }, [message?.isFile, message?.content]);

  const fileName = useMemo(() => {
    if (!isFile) return null;
    return (
      message?.fileName ||
      message?.content?.split("/").pop()?.split("?")[0] ||
      "file"
    );
  }, [isFile, message?.fileName, message?.content]);

  const isImage = useMemo(() => {
    return fileName?.match(/\.(jpeg|jpg|gif|png|bmp|webp|svg)$/i);
  }, [fileName]);


  useEffect(() => {
    if (!message || !user?._id) return;

    let timer;
    if (message.viewOnce && !message.viewedBy?.includes(user._id)) {
      API.put(`/message/viewed/${message._id}`, { userId: user._id }).catch(
        (err) => console.error(err)
      );
      timer = setTimeout(() => setHideContent(true), 5000);
    } else if (message.viewOnce && message.viewedBy?.includes(user._id)) {
      setHideContent(true);
    }

    return () => clearTimeout(timer);
  }, [message, user?._id]);


  useEffect(() => {
    if (!message || !messageRef.current || hideContent || isFile) return;

    const text = message.content;
    const formattedText = DOMPurify.sanitize(
      text.replace(/(https?:\/\/[^\s]+|\/join\/[a-zA-Z0-9]+)/g, (url) => {
        const href = url.startsWith("/join/")
          ? `${window.location.origin}${url}`
          : url;
        return `<a href="${href}" class="text-blue-500 underline cursor-pointer break-words hover:text-blue-700">${url}</a>`;
      })
    );

    messageRef.current.innerHTML = formattedText;
  }, [message, hideContent, isFile]);


  if (!message || message.content === "joined group") {
    return null;
  }

  const getIcon = () => {
    if (isImage) return "🖼️";
    if (fileName?.endsWith(".pdf")) return "📄";
    if (fileName?.endsWith(".doc") || fileName?.endsWith(".docx")) return "📝";
    return "📎";
  };

  const getFileUrl = () => {
    if (!message?.content) return "";

    if (message.content.startsWith("http")) {
      return message.content;
    }

    const baseUrl = API.defaults.baseURL.replace("/api", "");
    return `${baseUrl}${message.content}`;
  };

  const handleLinkClick = (e) => {
    if (e.target.tagName === "A") {
      e.preventDefault();
      const href = e.target.getAttribute("href");
      if (href.includes("/join/")) {
        navigate(href.replace(window.location.origin, ""));
      } else {
        window.open(href, "_blank", "noopener,noreferrer");
      }
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await API.delete(`/message/${message._id}`);
      if (onDelete) onDelete(message._id);
      toast.success("Message deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyGroupLink = () => {
    const groupLink = `${window.location.origin}/join/${selectedChat?._id}`;
    navigator.clipboard
      .writeText(groupLink)
      .then(() => toast.success("Group link copied!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const shareGroup = async () => {
    const groupLink = `${window.location.origin}/join/${selectedChat?._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${selectedChat?.chatName || "our group"}`,
          text: `Join ${selectedChat?.chatName || "our group"} on Let's Chat!`,
          url: groupLink,
        });
        toast.success("Group shared successfully!");
      } catch (err) {
        if (err.name !== "AbortError") copyGroupLink();
      }
    } else {
      copyGroupLink();
    }
  };

  const handleImageClick = () => {
    if (isImage && !imageError) setShowImageModal(true);
  };

  return (
    <>
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
        <div className="flex flex-col max-w-full sm:max-w-xs md:max-w-sm lg:max-w-md">
          {!isOwn && selectedChat?.isGroupChat && (
            <span className="text-xs sm:text-[0.65rem] text-gray-500 dark:text-gray-400 mb-1 ml-1 break-words">
              {message?.sender?.name || "Unknown"}
            </span>
          )}

          <div
            className={`px-3 sm:px-4 py-2 rounded-lg break-words bg-clip-padding ${
              isOwn
                ? "bg-blue-500 text-white dark:bg-blue-600"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
            } text-xs sm:text-sm relative`}
          >
            {message.viewOnce && hideContent ? (
              <div className="flex items-center gap-2">
                <span>👁️</span>
                <p className="whitespace-pre-wrap italic">
                  View once message hidden
                </p>
              </div>
            ) : isFile ? (
              <div className="mb-1">
                {isImage && !imageError ? (
                  <>
                    <img
                      src={getFileUrl()}
                      alt={fileName}
                      onError={() => setImageError(true)}
                      className="max-w-full max-h-52 sm:max-h-64 rounded object-contain mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                      loading="lazy"
                      onClick={handleImageClick}
                    />
                    <a
                      href={getFileUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={fileName}
                      className="text-xs underline flex items-center gap-1 break-words hover:text-blue-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {getIcon()} {fileName}
                    </a>
                  </>
                ) : (
                  <a
                    href={getFileUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={fileName}
                    className="flex items-center gap-1 underline text-xs sm:text-sm break-words hover:text-blue-400"
                  >
                    {getIcon()} {fileName}
                  </a>
                )}
              </div>
            ) : (
              <div
                ref={messageRef}
                className="whitespace-pre-wrap break-words text-xs sm:text-sm"
                onClick={handleLinkClick}
              >
                {message.content}
              </div>
            )}

            <div className="flex items-center justify-between mt-1">
              <span
                className={`text-[0.6rem] sm:text-xs ${
                  isOwn
                    ? "text-blue-100 dark:text-blue-200"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {message.createdAt &&
                  new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </span>

              {isOwn && (
                <div className="flex items-center gap-2">
                  {selectedChat?.isGroupChat && (
                    <button
                      onClick={shareGroup}
                      className="text-green-400 hover:text-green-600 transition-colors"
                      title="Share group link"
                    >
                      🔗
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Delete message"
                  >
                    {isDeleting ? "Deleting..." : "🗑️"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={getFileUrl()}
              alt={fileName}
              className="max-w-full max-h-screen object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white bg-red-600 rounded-full p-2 hover:bg-red-700"
              onClick={() => setShowImageModal(false)}
            >
              ❌
            </button>
          </div>
        </div>
      )}
    </>
  );
}
