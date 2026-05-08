import { useAdminStore, type AdminUser } from "@store/adminStore";
import { useUserStore } from "@store/userStore";
import { ADMIN_TEXT } from "@constant/admin";
import {
  Ban,
  CheckCircle2,
  UserCheck,
  ShieldAlert,
  Inbox,
  Loader2,
} from "lucide-react";

const UserTable = () => {
  const { filteredUsers, isLoading, banUser, unbanUser } = useAdminStore();
  const { showSnackbar } = useUserStore();

  const handleBanUser = async (userId: number) => {
    try {
      await banUser(userId);
      showSnackbar(ADMIN_TEXT.USER.MSG_BAN_SUCCESS);
    } catch {
      showSnackbar(ADMIN_TEXT.USER.MSG_BAN_FAILED);
    }
  };

  const handleUnbanUser = async (userId: number) => {
    try {
      await unbanUser(userId);
      showSnackbar(ADMIN_TEXT.USER.MSG_UNBAN_SUCCESS);
    } catch {
      showSnackbar(ADMIN_TEXT.USER.MSG_UNBAN_FAILED);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-[28px] border border-gray-100 p-20 flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="animate-spin text-main" size={32} />
        <p className="font-black text-sm uppercase tracking-widest">
          {ADMIN_TEXT.COMMON.LOADING}
        </p>
      </div>
    );
  }

  if (!filteredUsers || filteredUsers.length === 0) {
    return (
      <div className="bg-white rounded-[28px] border border-gray-100 p-20 flex flex-col items-center justify-center gap-6 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-gray-300">
          <Inbox size={32} />
        </div>
        <div>
          <p className="font-black text-gray-500">
            {ADMIN_TEXT.COMMON.NO_RESULT}
          </p>
          <p className="text-xs font-bold text-gray-300 mt-1 uppercase tracking-widest">
            {ADMIN_TEXT.ACCOUNTS.TABLE.EMPTY}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {[
                ADMIN_TEXT.USER.TABLE.USER,
                ADMIN_TEXT.USER.TABLE.EMAIL,
                ADMIN_TEXT.USER.TABLE.JOIN_DATE,
                ADMIN_TEXT.USER.TABLE.STATUS,
                ADMIN_TEXT.USER.TABLE.ACTIVITY,
                ADMIN_TEXT.USER.TABLE.MANAGE,
              ].map((header, index) => (
                <th
                  key={index}
                  className="py-5 px-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((user: AdminUser) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50/50 transition-all duration-200 group"
              >
                <td className="py-5 px-8">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-[15px] font-black shadow-lg shadow-gray-200 shrink-0 relative"
                      style={{ backgroundColor: user.profileColor }}
                    >
                      {user.nickname.charAt(0)}
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${user.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"}`}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-black text-[14.5px] text-gray-900 tracking-tight">
                        {user.nickname}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest uppercase ${
                            user.role === "TRAINER"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-orange-50 text-main"
                          }`}
                        >
                          {user.role === "TRAINER"
                            ? ADMIN_TEXT.COMMON.FILTER.TRAINER
                            : ADMIN_TEXT.COMMON.FILTER.MEMBER}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-8">
                  <span className="text-[13.5px] font-bold text-gray-500 tracking-tight">
                    {user.email}
                  </span>
                </td>
                <td className="py-5 px-8">
                  <span className="text-[13px] font-black text-gray-400 tabular-nums tracking-tighter">
                    {user.joinDate}
                  </span>
                </td>
                <td className="py-5 px-8">
                  <div className="flex">
                    <span
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-black tracking-widest flex items-center gap-1.5
                        ${
                          user.status === "ACTIVE"
                            ? "text-emerald-600 bg-emerald-50/50 border border-emerald-100"
                            : "text-red-500 bg-red-50/50 border border-red-100"
                        }`}
                    >
                      {user.status === "ACTIVE" ? (
                        <UserCheck size={12} />
                      ) : (
                        <ShieldAlert size={12} />
                      )}
                      {user.status === "ACTIVE"
                        ? ADMIN_TEXT.COMMON.FILTER.ACTIVE
                        : ADMIN_TEXT.COMMON.FILTER.BANNED}
                    </span>
                  </div>
                </td>
                <td className="py-5 px-8">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-400 w-12">
                        POSTS
                      </span>
                      <span className="text-[13px] font-black text-gray-900">
                        {user.postCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-400 w-12">
                        COMM
                      </span>
                      <span className="text-[13px] font-black text-gray-900">
                        {user.commentCount}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-8">
                  <div className="flex items-center gap-2">
                    {user.status === "ACTIVE" ? (
                      <button
                        onClick={() => void handleBanUser(user.id)}
                        className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm group/btn"
                        title={ADMIN_TEXT.USER.BTN_BAN}
                      >
                        <Ban
                          size={18}
                          strokeWidth={2.5}
                          className="group-hover/btn:scale-110 transition-transform"
                        />
                      </button>
                    ) : (
                      <button
                        onClick={() => void handleUnbanUser(user.id)}
                        className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 group/btn"
                        title={ADMIN_TEXT.USER.BTN_UNBAN}
                      >
                        <CheckCircle2
                          size={18}
                          strokeWidth={2.5}
                          className="group-hover/btn:scale-110 transition-transform"
                        />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
