import { useEffect, useState } from "react";
import { useAdminStore, useConfirmModalStore, useUserStore } from "@store";
import { ADMIN_TEXT } from "@constant/admin";
import {
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Clock,
  Key,
  X,
  Plus,
  Loader2,
  Inbox,
  User,
} from "lucide-react";

const AdminAccountManagement = () => {
  const {
    adminAccounts = [],
    fetchAccounts,
    addAdminAccount,
    resetPassword,
    isLoading,
  } = useAdminStore();
  const { showSnackbar } = useUserStore();
  const { openConfirm } = useConfirmModalStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ loginId: "", nickname: "" });

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleAddAccount = async () => {
    if (!newAccount.loginId || !newAccount.nickname) return;
    try {
      await addAdminAccount(newAccount);
      setShowAddModal(false);
      setNewAccount({ loginId: "", nickname: "" });
      showSnackbar(ADMIN_TEXT.ACCOUNTS.MSG_CREATE_SUCCESS);
    } catch {
      showSnackbar(ADMIN_TEXT.ACCOUNTS.MSG_CREATE_FAILED);
    }
  };

  const handleResetPassword = (userId: number) => {
    openConfirm({
      title: "Password Reset",
      message: ADMIN_TEXT.ACCOUNTS.CONFIRM_RESET,
      variant: "warning",
      onConfirm: async () => {
        try {
          await resetPassword(userId);
          showSnackbar(ADMIN_TEXT.ACCOUNTS.MSG_RESET_SUCCESS);
        } catch {
          showSnackbar(ADMIN_TEXT.ACCOUNTS.MSG_RESET_FAILED);
        }
      },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Security Infrastructure
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            {ADMIN_TEXT.ACCOUNTS.TITLE}
          </h2>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2.5 bg-zinc-900 text-white px-6 py-3.5 rounded-2xl font-black text-[13px] tracking-widest hover:bg-main transition-all shadow-lg shadow-gray-200 active:scale-95 group"
        >
          <UserPlus
            size={18}
            className="group-hover:scale-110 transition-transform"
          />
          {ADMIN_TEXT.ACCOUNTS.BTN_ADD.toUpperCase()}
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  {ADMIN_TEXT.ACCOUNTS.TABLE.ID}
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  {ADMIN_TEXT.ACCOUNTS.TABLE.NICKNAME}
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  {ADMIN_TEXT.ACCOUNTS.TABLE.ROLE}
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  {ADMIN_TEXT.ACCOUNTS.TABLE.CREATED_AT}
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  {ADMIN_TEXT.ACCOUNTS.TABLE.LAST_LOGIN}
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                  {ADMIN_TEXT.ACCOUNTS.TABLE.MANAGE}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20">
                    <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
                      <Loader2 className="animate-spin text-main" size={32} />
                      <p className="font-black text-[11px] uppercase tracking-widest">
                        Synchronizing Accounts...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : adminAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-gray-200">
                        <Inbox size={32} />
                      </div>
                      <p className="font-black text-gray-400">
                        {ADMIN_TEXT.ACCOUNTS.TABLE.EMPTY}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                adminAccounts.map((account) => (
                  <tr
                    key={account.userId}
                    className="hover:bg-gray-50/50 transition-all group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-sm">
                          <User size={16} strokeWidth={2.5} />
                        </div>
                        <span className="font-black text-[14.5px] text-gray-900 tracking-tight">
                          {account.loginId}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[14px] font-bold text-gray-600">
                      {account.nickname || account.loginId}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex">
                        <span
                          className={`px-3 py-1 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 ${
                            account.isSeed
                              ? "bg-purple-50 text-purple-600 border border-purple-100"
                              : "bg-blue-50 text-blue-600 border border-blue-100"
                          }`}
                        >
                          {account.isSeed ? (
                            <ShieldAlert size={12} />
                          ) : (
                            <ShieldCheck size={12} />
                          )}
                          {account.isSeed ? "SYSTEM" : "ADMIN"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Key size={13} />
                        <span className="text-[13px] font-black tabular-nums tracking-tighter">
                          {account.passwordLastRotatedAt
                            ? new Date(
                                account.passwordLastRotatedAt
                              ).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock size={13} />
                        <span className="text-[12px] font-bold tabular-nums">
                          {account.lastLoginAt
                            ? new Date(account.lastLoginAt).toLocaleString()
                            : "No data"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {!account.isSeed && (
                        <button
                          onClick={() => handleResetPassword(account.userId)}
                          className="px-3 py-1 rounded-xl !text-[10px] font-black leading-none tracking-widest uppercase flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all ml-auto shadow-sm group/btn"
                        >
                          <RotateCcw
                            size={12}
                            strokeWidth={3}
                            className="group-hover/btn:rotate-180 transition-transform duration-500"
                          />
                          PW RESET
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] p-10 w-full max-w-md shadow-[0_40px_100px_rgba(0,0,0,0.3)] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 bg-main/10 rounded-[24px] flex items-center justify-center text-main mb-6">
                <UserPlus size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {ADMIN_TEXT.ACCOUNTS.MODAL.TITLE}
              </h3>
              <p className="text-[13px] font-bold text-gray-400 mt-2">
                새로운 관리자 권한을 부여합니다.
              </p>
            </div>

            <div className="space-y-6 mb-10">
              <div className="group">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  {ADMIN_TEXT.ACCOUNTS.MODAL.LABEL_ID}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-main transition-colors">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:border-main focus:bg-white transition-all text-[15px] font-bold placeholder:text-gray-300"
                    placeholder={ADMIN_TEXT.ACCOUNTS.MODAL.PLACEHOLDER_ID}
                    value={newAccount.loginId}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, loginId: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  {ADMIN_TEXT.ACCOUNTS.MODAL.LABEL_NICKNAME}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-main transition-colors">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:border-main focus:bg-white transition-all text-[15px] font-bold placeholder:text-gray-300"
                    placeholder={ADMIN_TEXT.ACCOUNTS.MODAL.PLACEHOLDER_NICKNAME}
                    value={newAccount.nickname}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, nickname: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4.5 bg-gray-50 text-gray-500 rounded-[20px] font-black text-[13px] tracking-widest hover:bg-gray-100 transition-all uppercase"
              >
                {ADMIN_TEXT.ACCOUNTS.MODAL.BTN_CANCEL}
              </button>
              <button
                onClick={handleAddAccount}
                className="flex-1 py-4.5 bg-main text-white rounded-[20px] font-black text-[13px] tracking-widest shadow-lg shadow-main/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase flex items-center justify-center gap-2"
              >
                <Plus size={18} strokeWidth={3} />
                {ADMIN_TEXT.ACCOUNTS.MODAL.BTN_CREATE}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccountManagement;
