import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldCheck,
  Coins,
  Globe,
  Settings,
  ChevronRight,
  Server,
} from "lucide-react";
import { BASE_NETWORK_NAME } from "@utils";

export const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      label: "대시보드",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "사용자 관리",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "게시글 관리",
      path: "/admin/posts",
      icon: FileText,
    },
    {
      label: "관리자 계정",
      path: "/admin/accounts",
      icon: ShieldCheck,
    },
    {
      label: "토큰 내역",
      path: "/admin/token-logs",
      icon: Coins,
    },
    {
      label: "Web3 설정",
      path: "/admin/web3",
      icon: Globe,
    },
    {
      label: "시스템 설정",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="z-50 flex w-full shrink-0 flex-col bg-[#09090b] shadow-[0_12px_30px_rgba(0,0,0,0.18)] lg:min-h-dvh lg:w-[280px] lg:border-r lg:border-white/5 lg:shadow-[20px_0_40px_rgba(0,0,0,0.2)]">
      {/* Brand Header */}
      <div className="p-4 lg:p-10">
        <Link to="/admin/dashboard" className="flex items-center gap-3.5 group">
          <div className="w-9 h-9 bg-main rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,177,47,0.3)] group-hover:scale-105 transition-transform duration-300">
            <span className="text-black font-black text-xl italic tracking-tighter">
              M
            </span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-white tracking-tight leading-none">
              MOMZZANG
            </h1>
            <span className="text-[10px] font-bold text-main mt-1 tracking-[0.2em] uppercase opacity-80">
              Admin Suite
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex gap-2 overflow-x-auto px-3 pb-4 lg:block lg:flex-1 lg:space-y-1.5 lg:overflow-visible lg:px-4 lg:py-4">
        <div className="hidden px-6 mb-4 lg:block">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
            General Management
          </p>
        </div>

        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex shrink-0 items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 group lg:px-6 lg:py-4 ${
                isActive
                  ? "bg-white/5 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-3 lg:gap-4">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors duration-300 ${isActive ? "text-main" : "text-zinc-600 group-hover:text-zinc-400"}`}
                />
                <span
                  className={`whitespace-nowrap text-[13px] font-bold tracking-tight lg:text-[15px] ${isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}
                >
                  {item.label}
                </span>
              </div>

              {isActive && (
                <div className="ml-3 h-1.5 w-1.5 rounded-full bg-main shadow-[0_0_8px_rgba(250,177,47,0.8)] animate-pulse lg:ml-0" />
              )}
              {!isActive && (
                <ChevronRight
                  size={14}
                  className="hidden text-zinc-800 opacity-0 transition-all -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 lg:block"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Network Status */}
      <div className="mt-auto hidden space-y-3 p-6 lg:block">
        <div className="px-5 py-4 bg-zinc-900/30 rounded-[20px] border border-white/5">
          <div className="flex items-center gap-3">
            <Server size={14} className="text-main opacity-50" />
            <span className="text-[11px] font-bold text-zinc-400">
              {BASE_NETWORK_NAME}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[9px] text-zinc-600 font-mono">
              RPC Status
            </span>
            <span className="text-[9px] text-emerald-500 font-black tracking-widest">
              STABLE
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
