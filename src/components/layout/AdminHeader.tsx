import { adminHeaderByPath } from "@constant";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "@store/userStore";
import { Bell, LogOut, User } from "lucide-react";
import { useState } from "react";
import { CommonModal } from "@components/common";
import { useConfirmModalStore } from "@store";

export const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearUser } = useUserStore();
  const { openConfirm } = useConfirmModalStore();
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  const currentHeader = adminHeaderByPath.find(
    (item) => item.path === location.pathname
  );

  const handleComingSoon = () => {
    setIsComingSoonOpen(true);
  };

  const handleLogout = () => {
    openConfirm({
      title: "Logout",
      message: "로그아웃 하시겠습니까?",
      variant: "warning",
      onConfirm: () => {
        clearUser();
        navigate("/admin");
      },
    });
  };

  return (
    <header className="sticky top-0 z-40 flex min-h-20 w-full flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-white/80 px-4 py-4 backdrop-blur-md lg:h-20 lg:flex-nowrap lg:px-10 lg:py-0">
      <div className="flex items-center gap-4">
        <div className="h-8 w-1 bg-main rounded-full" />
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Management Console
          </span>
          <h2 className="text-lg font-black text-gray-900 tracking-tight lg:text-xl">
            {currentHeader ? currentHeader.label : "대시보드"}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
        <button
          onClick={handleComingSoon}
          className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <Bell size={20} />
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="hidden h-8 w-[1px] bg-gray-100 sm:block" />

        <div className="hidden items-center gap-4 group cursor-pointer sm:flex">
          <div className="flex flex-col items-end">
            <span className="text-sm font-black text-gray-900 leading-none">
              Super Admin
            </span>
            <span className="text-[10px] font-bold text-emerald-500 mt-1">
              Online
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-lg shadow-gray-200 group-hover:scale-105 transition-transform">
            <User size={18} strokeWidth={2.5} />
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="로그아웃"
        >
          <LogOut size={20} />
        </button>
      </div>
      {isComingSoonOpen && (
        <CommonModal
          variant="info"
          title="Service Notice"
          desc="준비 중인 페이지입니다."
          confirmLabel="OK"
          onConfirmClick={() => setIsComingSoonOpen(false)}
        />
      )}
    </header>
  );
};
