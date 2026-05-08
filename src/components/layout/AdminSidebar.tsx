import { Link, useLocation } from "react-router-dom";

export const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      label: "대시보드",
      path: "/admin/dashboard",
      icon: "/icon/adminDashboard.svg",
    },
    {
      label: "사용자",
      path: "/admin/users",
      icon: "/icon/adminUser.svg",
    },
    {
      label: "게시글",
      path: "/admin/posts",
      icon: "/icon/adminBoard.svg",
    },
    {
      label: "관리자 계정",
      path: "/admin/accounts",
      icon: "/icon/adminUser.svg",
    },
    {
      label: "트랜잭션",
      path: "/admin/token-logs",
      icon: "/icon/adminToken.svg",
    },
    {
      label: "Web3 관리",
      path: "/admin/web3",
      icon: "/icon/adminBoard.svg",
    },
    {
      label: "시스템 설정",
      path: "/admin/settings",
      icon: "/icon/adminUser.svg", // Using existing icon for now
    },
  ];

  return (
    <aside className="w-[280px] min-h-screen bg-white border-r border-gray-100 flex flex-col shadow-xl shadow-gray-500/5">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-main rounded-lg flex items-center justify-center text-white font-black text-xl italic">
            M
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
            MOMZZANG
          </h1>
        </div>
        <p className="text-[10px] font-black text-main bg-orange-50 w-fit px-2 py-0.5 rounded uppercase tracking-widest ml-11">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all relative group ${
                isActive
                  ? "bg-main text-white font-bold shadow-lg shadow-main/20 scale-[1.02]"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <div
                className={`p-2 rounded-lg transition-colors ${isActive ? "bg-white/20" : "bg-gray-50 group-hover:bg-white shadow-sm"}`}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`w-5 h-5 ${isActive ? "brightness-0 invert" : ""}`}
                />
              </div>
              <span className="text-[16px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
