import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@store/userStore";

/* ── Variant 설정 ─────────────────────────────────── */
const VARIANT_CONFIG = {
  success: {
    accent: "#22C55E",
    bg: "bg-white",
    border: "border-green-100",
    iconBg: "bg-green-50",
    bar: "#22C55E",
    label: "성공",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#22C55E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    actionBg: "bg-green-500 text-white hover:bg-green-600",
  },
  error: {
    accent: "#EF4444",
    bg: "bg-white",
    border: "border-red-100",
    iconBg: "bg-red-50",
    bar: "#EF4444",
    label: "오류",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#EF4444"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    actionBg: "bg-red-500 text-white hover:bg-red-600",
  },
  info: {
    accent: "#3B82F6",
    bg: "bg-white",
    border: "border-blue-100",
    iconBg: "bg-blue-50",
    bar: "#3B82F6",
    label: "알림",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    actionBg: "bg-blue-500 text-white hover:bg-blue-600",
  },
} as const;

const GlobalSnackbar = () => {
  const { snackbar, closeSnackbar } = useUserStore();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const navigate = useNavigate();

  const variant = snackbar.variant ?? "info";
  const config = VARIANT_CONFIG[variant];
  const DURATION_MS = 4000;

  useEffect(() => {
    if (snackbar.isOpen) {
      setVisible(true);
      setProgress(100);

      const startTime = Date.now();
      const tick = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / DURATION_MS) * 100);
        setProgress(remaining);
        if (remaining === 0) clearInterval(tick);
      }, 50);

      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(closeSnackbar, 350);
      }, DURATION_MS);

      return () => {
        clearTimeout(timer);
        clearInterval(tick);
      };
    }
  }, [snackbar.isOpen, closeSnackbar]);

  const hideSnackbar = () => {
    setVisible(false);
    setTimeout(closeSnackbar, 350);
  };

  const handleAction = () => {
    if (!snackbar.action) return;
    navigate(snackbar.action.path);
    hideSnackbar();
  };

  if (!snackbar.isOpen && !visible) return null;

  const portalTarget = document.getElementById("app-root") ?? document.body;

  return createPortal(
    <div
      className={`absolute top-8 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[400px] z-[9999] transition-all duration-350 ease-out ${
        visible
          ? "translate-y-0 opacity-100 scale-100"
          : "-translate-y-5 opacity-0 scale-95"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
    >
      <div
        className={`${config.bg} rounded-2xl overflow-hidden border ${config.border}`}
        style={{
          boxShadow: `0 4px 6px -1px rgba(0,0,0,0.06), 0 16px 40px -8px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.03)`,
        }}
      >
        {/* Accent left bar */}
        <div
          className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
          style={{ background: config.accent }}
        />

        <div className="flex items-start gap-3 px-5 py-4 pl-6">
          {/* Icon */}
          <div
            className={`w-9 h-9 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0`}
          >
            {config.icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p
              className="text-[11px] font-black uppercase tracking-wider mb-0.5"
              style={{ color: config.accent }}
            >
              {config.label}
            </p>
            <p className="text-gray-800 text-[13px] font-semibold leading-snug break-keep">
              {snackbar.message}
            </p>
          </div>

          {/* Close */}
          <button
            id="snackbar-close-btn"
            onClick={hideSnackbar}
            className="shrink-0 w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors border-none mt-0.5"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Action button */}
        {snackbar.action && (
          <div className="px-5 pb-4 pl-6">
            <button
              onClick={handleAction}
              className={`w-full py-2.5 rounded-xl text-[13px] font-bold transition-all ${config.actionBg} border-none`}
            >
              {snackbar.action.label} →
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className="h-[3px] w-full bg-gray-100 overflow-hidden">
          <div
            className="h-full transition-none rounded-full"
            style={{ width: `${progress}%`, background: config.accent }}
          />
        </div>
      </div>
    </div>,
    portalTarget
  );
};

export default GlobalSnackbar;
