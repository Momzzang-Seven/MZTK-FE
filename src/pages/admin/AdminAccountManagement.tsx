import { useEffect, useState } from "react";
import { useAdminStore } from "@store/adminStore";
import { useUserStore } from "@store/userStore";
import { CommonButton } from "@components/common";
import { ADMIN_TEXT } from "@constant/admin";

const AdminAccountManagement = () => {
  const {
    adminAccounts = [],
    fetchAccounts,
    addAdminAccount,
    resetPassword,
    isLoading,
  } = useAdminStore();
  const { showSnackbar } = useUserStore();

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

  const handleResetPassword = async (userId: number) => {
    if (!confirm(ADMIN_TEXT.ACCOUNTS.CONFIRM_RESET)) return;
    try {
      await resetPassword(userId);
      showSnackbar(ADMIN_TEXT.ACCOUNTS.MSG_RESET_SUCCESS);
    } catch {
      showSnackbar(ADMIN_TEXT.ACCOUNTS.MSG_RESET_FAILED);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {ADMIN_TEXT.ACCOUNTS.TITLE}
        </h2>
        <CommonButton
          label={ADMIN_TEXT.ACCOUNTS.BTN_ADD}
          className="bg-main text-white px-4 py-2 rounded-xl font-bold"
          onClick={() => setShowAddModal(true)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm font-bold">
            <tr>
              <th className="px-6 py-4">{ADMIN_TEXT.ACCOUNTS.TABLE.ID}</th>
              <th className="px-6 py-4">
                {ADMIN_TEXT.ACCOUNTS.TABLE.NICKNAME}
              </th>
              <th className="px-6 py-4">{ADMIN_TEXT.ACCOUNTS.TABLE.ROLE}</th>
              <th className="px-6 py-4">
                {ADMIN_TEXT.ACCOUNTS.TABLE.CREATED_AT}
              </th>
              <th className="px-6 py-4">
                {ADMIN_TEXT.ACCOUNTS.TABLE.LAST_LOGIN}
              </th>
              <th className="px-6 py-4 text-right">
                {ADMIN_TEXT.ACCOUNTS.TABLE.MANAGE}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-400"
                >
                  {ADMIN_TEXT.COMMON.LOADING}
                </td>
              </tr>
            ) : adminAccounts.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-400"
                >
                  {ADMIN_TEXT.ACCOUNTS.TABLE.EMPTY}
                </td>
              </tr>
            ) : (
              adminAccounts.map((account) => (
                <tr
                  key={account.userId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {account.loginId}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {account.nickname || account.loginId}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold ${account.isSeed ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}
                    >
                      {account.isSeed ? "SYSTEM" : "ADMIN"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {account.passwordLastRotatedAt
                      ? new Date(
                          account.passwordLastRotatedAt
                        ).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {account.lastLoginAt
                      ? new Date(account.lastLoginAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!account.isSeed && (
                      <button
                        onClick={() => handleResetPassword(account.userId)}
                        className="text-xs text-red-500 hover:underline font-bold"
                      >
                        {ADMIN_TEXT.ACCOUNTS.MSG_RESET_SUCCESS.split(" ")[0]}{" "}
                        초기화
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-fadeIn">
            <h3 className="text-xl font-bold mb-6">
              {ADMIN_TEXT.ACCOUNTS.MODAL.TITLE}
            </h3>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {ADMIN_TEXT.ACCOUNTS.MODAL.LABEL_ID}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-main transition-all"
                  placeholder={ADMIN_TEXT.ACCOUNTS.MODAL.PLACEHOLDER_ID}
                  value={newAccount.loginId}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, loginId: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {ADMIN_TEXT.ACCOUNTS.MODAL.LABEL_NICKNAME}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-main transition-all"
                  placeholder={ADMIN_TEXT.ACCOUNTS.MODAL.PLACEHOLDER_NICKNAME}
                  value={newAccount.nickname}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, nickname: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                {ADMIN_TEXT.ACCOUNTS.MODAL.BTN_CANCEL}
              </button>
              <button
                onClick={handleAddAccount}
                className="flex-1 py-4 bg-main text-white rounded-2xl font-bold shadow-lg shadow-main/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
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
