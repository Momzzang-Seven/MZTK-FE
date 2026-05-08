import { Link, useLocation } from "react-router-dom";
import { useAdminStore } from "@store";
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

export const AdminSidebar = () => {
  const location = useLocation();
  const { selectedChainId, setSelectedChainId } = useAdminStore();

  const networks = [
    {
      id: "11155420",
      name: "OPT",
      fullName: "Optimism Sepolia",
      color: "bg-red-500",
    },
    {
      id: "84532",
      name: "BASE",
      fullName: "Base Sepolia",
      color: "bg-blue-500",
    },
  ];

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
    <aside className="w-[280px] min-h-screen bg-[#09090b] border-r border-white/5 flex flex-col z-50 shadow-[20px_0_40px_rgba(0,0,0,0.2)]">
      {/* Brand Header */}
      <div className="p-10">
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
      <nav className="flex-1 px-4 py-4 space-y-1.5">
        <div className="px-6 mb-4">
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
              className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group ${
                isActive
                  ? "bg-white/5 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-4">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors duration-300 ${isActive ? "text-main" : "text-zinc-600 group-hover:text-zinc-400"}`}
                />
                <span
                  className={`text-[15px] font-bold tracking-tight ${isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}
                >
                  {item.label}
                </span>
              </div>

              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-main shadow-[0_0_8px_rgba(250,177,47,0.8)] animate-pulse" />
              )}
              {!isActive && (
                <ChevronRight
                  size={14}
                  className="text-zinc-800 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Network Switcher & Status */}
      <div className="p-6 mt-auto space-y-3">
        <div className="bg-zinc-900/50 rounded-[24px] p-1.5 border border-white/5 flex gap-1">
          {networks.map((net) => (
            <button
              key={net.id}
              onClick={() => setSelectedChainId(net.id)}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-[18px] transition-all duration-300 ${
                selectedChainId === net.id
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${selectedChainId === net.id ? net.color : "bg-zinc-800"}`}
                />
                <span className="text-[10px] font-black tracking-widest">
                  {net.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="px-5 py-4 bg-zinc-900/30 rounded-[20px] border border-white/5">
          <div className="flex items-center gap-3">
            <Server size={14} className="text-main opacity-50" />
            <span className="text-[11px] font-bold text-zinc-400">
              {networks.find((n) => n.id === selectedChainId)?.fullName}
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
