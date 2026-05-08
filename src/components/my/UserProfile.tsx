import { useUserStore } from "@store/userStore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/auth/useAuth";
import { CommonModal } from "@components/common";
import { useState } from "react";

export const UserProfile = () => {
  const { user, level } = useUserStore();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user?.nickname?.slice(0, 1).toUpperCase() ?? "?";
  const roleLabel = user?.role === "TRAINER" ? "트레이너" : "일반 회원";

  return (
    <>
      <div className="relative w-full bg-white rounded-[28px] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden animate-fade-slide-up">
        {/* Amber gradient accent top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-main to-amber-300" />

        <div className="p-6">
          <div className="flex items-center justify-between">
            {/* Avatar + info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-main/10 overflow-hidden flex items-center justify-center">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-main">
                      {initials}
                    </span>
                  )}
                </div>
                {/* Level badge */}
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-main text-white text-[10px] font-black flex items-center justify-center shadow-md">
                  {level}
                </div>
              </div>

              <div>
                <div className="text-gray-900 text-[20px] font-black leading-tight tracking-tight">
                  {user?.nickname || "사용자"}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      user?.role === "TRAINER"
                        ? "bg-main/10 text-main"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {roleLabel}
                  </span>
                  <span className="text-[12px] text-gray-400 font-bold">
                    Lv.{level}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => setConfirmOpen(true)}
              className="btn-press w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 border-none flex items-center justify-center transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <CommonModal
          variant="warning"
          title="로그아웃"
          desc="정말 로그아웃 하시겠습니까?"
          confirmLabel="로그아웃"
          cancelLabel="취소"
          onConfirmClick={() => void handleLogout()}
          onCancelClick={() => setConfirmOpen(false)}
        />
      )}
    </>
  );
};
