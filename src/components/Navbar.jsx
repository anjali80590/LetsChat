import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();

  return (
    <nav className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex items-center justify-between shadow flex-wrap">
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full text-xl">
          💬
        </span>
        <span className="text-2xl font-extrabold text-gray-800 dark:text-white whitespace-nowrap">
          Lets<span className="text-blue-600 dark:text-purple-400">Chat</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 justify-end mt-2 sm:mt-0">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:ring-2 hover:ring-purple-400 transition flex-shrink-0"
        >
          {darkMode ? "🌙" : "☀️"}
        </button>

        <span className={`font-medium text-sm sm:text-base truncate`}>
          {" "}
          Welcome,
        </span>
        <span
          className={`font-medium text-sm sm:text-base truncate ${
            darkMode ? "text-purple-400" : "text-blue-600"
          }`}
        >
          {user?.name || "User"}
        </span>

        <button
          onClick={logout}
          className="bg-red-500 dark:bg-red-600 text-white px-3 py-1 rounded hover:bg-red-600 dark:hover:bg-red-700 transition-colors text-sm sm:text-base font-medium shadow-sm flex-shrink-0"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
