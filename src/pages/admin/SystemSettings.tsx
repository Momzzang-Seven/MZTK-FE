import { useState } from "react";
import { useAdminStore } from "@store/adminStore";
import { useUserStore } from "@store/userStore";
import { CommonButton } from "@components/common";
import { ADMIN_TEXT } from "@constant/admin";

const SystemSettings = () => {
  const { updateAdminPassword, reseedSystem } = useAdminStore();
  const { showSnackbar } = useUserStore();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      showSnackbar(ADMIN_TEXT.SETTINGS.PASSWORD.MSG_REQUIRED);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showSnackbar(ADMIN_TEXT.SETTINGS.PASSWORD.MSG_MISMATCH);
      return;
    }

    setIsLoading(true);
    try {
      await updateAdminPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showSnackbar(ADMIN_TEXT.SETTINGS.PASSWORD.MSG_SUCCESS);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      showSnackbar(ADMIN_TEXT.SETTINGS.PASSWORD.MSG_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReseed = async () => {
    if (!confirm(ADMIN_TEXT.SETTINGS.RECOVERY.CONFIRM_RESEED)) return;

    setIsLoading(true);
    try {
      await reseedSystem();
      showSnackbar(ADMIN_TEXT.SETTINGS.RECOVERY.MSG_SUCCESS);
    } catch {
      showSnackbar(ADMIN_TEXT.SETTINGS.RECOVERY.MSG_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          {ADMIN_TEXT.SETTINGS.TITLE}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {ADMIN_TEXT.SETTINGS.SUBTITLE}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Password Change Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-orange-50 text-main rounded-lg flex items-center justify-center text-sm">
              🔒
            </span>
            {ADMIN_TEXT.SETTINGS.PASSWORD.TITLE}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ADMIN_TEXT.SETTINGS.PASSWORD.LABEL_CURRENT}
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-main transition-all"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ADMIN_TEXT.SETTINGS.PASSWORD.LABEL_NEW}
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-main transition-all"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ADMIN_TEXT.SETTINGS.PASSWORD.LABEL_CONFIRM}
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-main transition-all"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
            <CommonButton
              label={
                isLoading
                  ? ADMIN_TEXT.COMMON.LOADING
                  : ADMIN_TEXT.SETTINGS.PASSWORD.BTN_SUBMIT
              }
              onClick={handlePasswordChange}
              disabled={isLoading}
              className="w-full bg-main text-white py-4 rounded-2xl font-bold shadow-lg shadow-main/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
            />
          </div>
        </div>

        {/* System Recovery Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center text-sm">
              ⚠️
            </span>
            {ADMIN_TEXT.SETTINGS.RECOVERY.TITLE}
          </h3>
          <div className="flex-1 space-y-6">
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-xs text-red-600 font-bold mb-1">
                {ADMIN_TEXT.SETTINGS.RECOVERY.DANGER_ZONE}
              </p>
              <p className="text-[11px] text-red-500 leading-relaxed">
                {ADMIN_TEXT.SETTINGS.RECOVERY.DANGER_DESC}
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-700 mb-1">
                  Reseed 실행
                </h4>
                <p className="text-[10px] text-gray-400">
                  데이터베이스 시드 및 마스터 키를 재발급합니다.
                </p>
                <button
                  onClick={handleReseed}
                  disabled={isLoading}
                  className="mt-4 w-full py-3 bg-white text-red-500 border border-red-200 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                >
                  {ADMIN_TEXT.SETTINGS.RECOVERY.BTN_RESEED}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
