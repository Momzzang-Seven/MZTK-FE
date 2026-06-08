import { createPortal } from "react-dom";
import DOMPurify from "dompurify";
import { AlertCircle, XCircle, Info, CheckCircle2 } from "lucide-react";

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
  placement?: "center" | "bottom";
}

const VARIANT_CONFIG = {
  warning: {
    iconBg: "bg-amber-50",
    icon: (
      <AlertCircle size={28} className="text-amber-500" strokeWidth={2.5} />
    ),
    confirmBg: "bg-main text-white hover:brightness-95",
    accent: "#FAB12F",
  },
  error: {
    iconBg: "bg-red-50",
    icon: <XCircle size={28} className="text-red-500" strokeWidth={2.5} />,
    confirmBg: "bg-red-500 text-white hover:bg-red-600",
    accent: "#EF4444",
  },
  info: {
    iconBg: "bg-blue-50",
    icon: <Info size={28} className="text-blue-500" strokeWidth={2.5} />,
    confirmBg: "bg-blue-500 text-white hover:bg-blue-600",
    accent: "#3B82F6",
  },
  success: {
    iconBg: "bg-green-50",
    icon: (
      <CheckCircle2 size={28} className="text-green-500" strokeWidth={2.5} />
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
  placement,
}: CommonModalProps) => {
  const config = VARIANT_CONFIG[variant];

  const isAdmin = window.location.pathname.startsWith("/admin");
  const fullWidth = providedFullWidth ?? isAdmin;

  const portalTarget = document.getElementById("app-root") ?? document.body;

  const isBottomSheet = placement
    ? placement === "bottom"
    : !!children && !title;

  return createPortal(
    <div
      className={`z-[9990] fixed top-0 left-1/2 -translate-x-1/2 w-full h-dvh bg-black/40 backdrop-blur-xl flex flex-col items-center px-6 transition-all duration-500 animate-in fade-in ${
        isBottomSheet ? "justify-end pb-0 px-0" : "justify-center"
      } ${fullWidth ? "" : "max-w-[450px]"}`}
      onClick={onCancelClick}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.15)] animate-in duration-500 ease-out ${
          isBottomSheet
            ? "rounded-t-[40px] px-8 pt-4 pb-12 slide-in-from-bottom-full"
            : "max-w-[360px] rounded-[40px] overflow-hidden zoom-in-95 p-8"
        }`}
      >
        {/* Handle Bar for Bottom Sheet */}
        {isBottomSheet && (
          <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
        )}

        <div className={isBottomSheet ? "" : "flex flex-col items-center"}>
          {/* Icon Area - Only for Standard Modal */}
          {!children && (
            <div
              className={`w-16 h-16 ${config.iconBg} rounded-[24px] flex items-center justify-center mb-6 shadow-sm`}
            >
              {config.icon}
            </div>
          )}

          {/* Title */}
          {title && (
            <h2 className="text-gray-900 text-[20px] font-black tracking-tight mb-3 leading-tight text-center">
              {title}
            </h2>
          )}

          {/* Desc */}
          {desc && (
            <p
              className="text-gray-500 text-[14px] font-medium leading-relaxed text-center px-2"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(desc) }}
            />
          )}

          {/* Custom Content */}
          {children && <div className="w-full">{children}</div>}
        </div>

        {/* Action Buttons */}
        {(confirmLabel || cancelLabel) && (
          <div className={`flex gap-3 ${isBottomSheet ? "mt-8" : "mt-8"}`}>
            {cancelLabel && (
              <button
                onClick={onCancelClick}
                className="flex-1 py-4.5 px-2 rounded-[22px] bg-gray-50 text-gray-500 text-[14px] font-black active:scale-95 transition-all hover:bg-gray-100"
              >
                {cancelLabel}
              </button>
            )}
            {confirmLabel && (
              <button
                onClick={onConfirmClick}
                className={`flex-1 py-4.5 px-2 rounded-[22px] text-[14px] font-black active:scale-95 transition-all shadow-lg shadow-black/5 ${config.confirmBg}`}
              >
                {confirmLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    portalTarget
  );
};
