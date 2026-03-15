import { useUserStore } from "@store/userStore";
import { useNavigate } from "react-router-dom";

export const UserProfile = () => {
  const { user, level, clearUser } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      clearUser();
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-row justify-between items-center w-full">
      <div className="flex flex-row items-center gap-x-4">
        {/* Avatar */}
        <div className="rounded-full bg-main w-14 h-14 overflow-hidden flex items-center justify-center shrink-0">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-main" />
          )}
        </div>

        {/* User Info */}
        <div className="flex flex-col">
          <div className="text-xl font-bold text-gray-800 leading-tight">
            {user?.nickname || "사용자"}
          </div>
          <div className="body text-grey-main">Lv.{level}</div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="text-grey-main label border-none bg-transparent underline cursor-pointer p-0 font-normal mr-5"
      >
        로그아웃
      </button>
    </div>
  );
};
