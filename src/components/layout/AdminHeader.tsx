import { adminHeaderByPath } from "@constant";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "@store/userStore";

export const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearUser } = useUserStore();

  const currentHeader = adminHeaderByPath.find(
    (item) => item.path === location.pathname
  );

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      clearUser();
      navigate("/login");
    }
  };

  return (
    <header className="h-20 bg-white border-b border-gray-50 flex items-center justify-between px-10 w-full">
      <h2 className="text-2xl font-bold text-gray-800">
        {currentHeader ? currentHeader.label : "대시보드"}
      </h2>

      <button
        onClick={handleLogout}
        className="text-gray-400 hover:text-gray-800 transition-colors font-medium"
      >
        로그아웃
      </button>
    </header>
  );
};
