import { createPortal } from "react-dom";
import DOMPurify from "dompurify";

interface CommonModalProps {
  title?: string;
  desc?: string;
  confirmLabel?: string;
  onConfirmClick?: () => void;
  cancelLabel?: string;
  onCancelClick?: () => void;
  /** icon variant — controls the header visual */
  variant?: "warning" | "error" | "info" | "success";
  children?: React.ReactNode;
  /** If true, ignores the mobile max-width constraint for the overlay background */
  fullWidth?: boolean;
}

const VARIANT_CONFIG = {
  warning: {
    iconBg: "bg-amber-50",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FAB12F"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
    confirmBg: "bg-main text-white hover:brightness-95",
    accent: "#FAB12F",
  },
  error: {
    iconBg: "bg-red-50",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#EF4444"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    ),
    confirmBg: "bg-red-500 text-white hover:bg-red-600",
    accent: "#EF4444",
  },
  info: {
    iconBg: "bg-blue-50",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
    confirmBg: "bg-blue-500 text-white hover:bg-blue-600",
    accent: "#3B82F6",
  },
  success: {
    iconBg: "bg-green-50",
    icon: (
      <svg
        width="28"
        height="28"
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
    confirmBg: "bg-green-500 text-white hover:bg-green-600",
    accent: "#22C55E",
  },
} as const;

export const CommonModal = ({
  title,
  desc,
  confirmLabel,
  onConfirmClick,
  cancelLabel,
  onCancelClick,
  variant = "warning",
  children,
  fullWidth: providedFullWidth,
}: CommonModalProps) => {
  const config = VARIANT_CONFIG[variant];

  const isAdmin = window.location.pathname.startsWith("/admin");
  const fullWidth = providedFullWidth ?? isAdmin;

  const portalTarget = document.getElementById("app-root") ?? document.body;

  return createPortal(
    <div
      className={`z-[9990] fixed top-0 left-1/2 -translate-x-1/2 w-full h-full bg-black/40 backdrop-blur-[2px] flex flex-col justify-center items-center px-6 animate-scale-in ${
        fullWidth ? "" : "max-w-[450px]"
      }`}
    >
      <div
        className="w-full max-w-[360px] bg-white rounded-[28px] overflow-hidden shadow-2xl"
        style={{
          boxShadow:
            "0 24px 60px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        {/* Top accent line */}
        <div className="h-1 w-full" style={{ background: config.accent }} />

        <div className="p-7">
          {/* Icon */}
          <div
            className={`w-14 h-14 ${config.iconBg} rounded-2xl flex items-center justify-center mb-5`}
          >
            {config.icon}
          </div>

          {/* Title */}
          {title && (
            <h2 className="text-gray-900 text-[18px] font-black tracking-tight mb-2 leading-snug">
              {title}
            </h2>
          )}

          {/* Desc */}
          {desc && (
            <p
              className="text-gray-500 text-[13px] font-medium leading-relaxed"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(desc) }}
            />
          )}

          {/* Children */}
          {children && <div className="mt-4">{children}</div>}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-50 mx-7" />

        {/* Actions */}
        <div className="flex gap-2.5 p-5">
          {cancelLabel && (
            <button
              onClick={onCancelClick}
              className="flex-1 py-3.5 px-2 rounded-2xl border-none bg-gray-100 text-gray-700 text-[13px] font-black hover:bg-gray-200 transition-colors btn-press whitespace-nowrap"
            >
              {cancelLabel}
            </button>
          )}
          {confirmLabel && (
            <button
              onClick={onConfirmClick}
              className={`flex-1 py-3.5 px-2 rounded-2xl border-none text-[13px] font-black transition-all btn-press whitespace-nowrap ${config.confirmBg}`}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>,
    portalTarget
  );
};
