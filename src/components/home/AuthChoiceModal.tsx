import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { HOME_TEXT } from "@constant/home";

interface AuthChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AUTH_OPTIONS = [
  {
    key: "location",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#F97316"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: HOME_TEXT.MODAL.LOCATION,
    desc: "등록된 위치 근처에서 인증",
    path: "/verify",
    iconBg: "bg-orange-50",
  },
  {
    key: "exercise",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FAB12F"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    ),
    label: HOME_TEXT.MODAL.EXERCISE,
    desc: "운동 사진을 찍어서 인증",
    path: "/exercise-auth",
    iconBg: "bg-yellow-50",
  },
  {
    key: "record",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
        <path d="M9 8h6" />
      </svg>
    ),
    label: HOME_TEXT.MODAL.RECORD,
    desc: "운동 기록으로 인증",
    path: "/record-auth",
    iconBg: "bg-amber-50",
  },
] as const;

export const AuthChoiceModal = ({ isOpen, onClose }: AuthChoiceModalProps) => {
  const navigate = useNavigate();
  const portalTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // 앱 컨테이너 안에만 오버레이가 적용되도록 포털 타겟 설정
    portalTargetRef.current =
      document.getElementById("app-root") ?? document.body;
  }, []);

  if (!isOpen) return null;

  const target = portalTargetRef.current ?? document.body;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return createPortal(
    <div className="absolute inset-0 z-[9999] flex items-end justify-center animate-scale-in">
      {/* Backdrop — stays inside app-root */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="relative w-full bg-white rounded-t-[36px] px-6 pt-5 pb-12 z-10 shadow-2xl">
        {/* Handle */}
        <div className="w-12 h-1.5 rounded-full bg-gray-100 mx-auto mb-6" />

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-gray-900 font-black text-[20px] tracking-tight">
            {HOME_TEXT.MODAL.TITLE}
          </h2>
          <p className="text-gray-400 text-[12px] font-bold mt-1 uppercase tracking-wide">
            Choose your verification method
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {AUTH_OPTIONS.map(({ key, icon, label, desc, path, iconBg }) => (
            <button
              key={key}
              aria-label={label}
              onClick={() => handleSelect(path)}
              className="btn-press w-full flex items-center gap-5 bg-gray-50/50 hover:bg-gray-50 rounded-[28px] p-4 text-left border border-transparent hover:border-gray-100 transition-all duration-200 group"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
              >
                {icon}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-gray-900 font-black text-[15px] tracking-tight">
                  {label}
                </span>
                <span className="text-gray-400 text-[11px] font-bold mt-0.5">
                  {desc}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-50">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-2 text-gray-300 text-[13px] font-black uppercase tracking-widest bg-transparent border-none hover:text-gray-400 transition-colors"
        >
          Close
        </button>
      </div>
    </div>,
    target
  );
};

export default AuthChoiceModal;
