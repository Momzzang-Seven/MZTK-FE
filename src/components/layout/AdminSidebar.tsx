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
  ];

  return (
    <aside className="w-[260px] min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900">몸짱코인</h1>
        <p className="text-sm text-gray-400 mt-1">관리자 패널</p>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all relative ${
                isActive
                  ? "bg-main/15 text-main font-bold"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {isActive && (
                <div className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-main rounded-r-full" />
              )}
              <img src={item.icon} alt={item.label} className="w-6 h-6" />
              <span className="text-lg">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
