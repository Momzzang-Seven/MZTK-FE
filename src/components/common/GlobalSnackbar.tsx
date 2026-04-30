import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@store/userStore";

const GlobalSnackbar = () => {
  const { snackbar, closeSnackbar } = useUserStore();
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const messageLines = snackbar.message.includes("!")
    ? snackbar.message
        .split("!")
        .map((line, i, lines) => {
          const trimmedLine = line.trim();
          return i < lines.length - 1 ? `${trimmedLine}!` : trimmedLine;
        })
        .filter(Boolean)
    : [snackbar.message];

  useEffect(() => {
    if (snackbar.isOpen) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(closeSnackbar, 300);
      }, 5000); // Show for 5 seconds to give time to click
      return () => clearTimeout(timer);
    }
  }, [snackbar.isOpen, closeSnackbar]);

  const hideSnackbar = () => {
    setVisible(false);
    setTimeout(closeSnackbar, 300);
  };

  const handleAction = () => {
    if (!snackbar.action) {
      return;
    }

    navigate(snackbar.action.path);
    hideSnackbar();
  };

  if (!snackbar.isOpen && !visible) return null;

  return createPortal(
    <div
      className={`fixed top-32 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[400px] z-50 transition-all duration-500 ease-in-out ${visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
    >
      <div className="bg-[#FAB12F] rounded-2xl p-5 shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Close Button X (Optional, but good for UX) */}
        <button
          onClick={hideSnackbar}
          className="absolute top-2 right-3 text-white/80 hover:text-white text-xl font-bold"
        >
          &times;
        </button>

        <p className="text-gray-900 font-bold text-sm mb-1 leading-tight">
          {messageLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </p>

        {snackbar.action && (
          <button
            onClick={handleAction}
            className="mt-3 bg-white text-gray-900 text-sm font-bold py-3 px-6 rounded-full shadow-sm hover:bg-gray-50 active:scale-95 transition-transform w-full"
          >
            » {snackbar.action.label}
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default GlobalSnackbar;
