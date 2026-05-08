import { useState } from "react";
import { useAdminStore } from "@store/adminStore";
import { useUserStore } from "@store/userStore";
import { ADMIN_TEXT } from "@constant/admin";
import {
  LockKeyhole,
  AlertTriangle,
  Settings,
  Database,
  ShieldCheck,
  ChevronRight,
  Loader2,
} from "lucide-react";

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
    <div className="max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          System Configuration
        </span>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Settings size={20} className="text-gray-400" />
          {ADMIN_TEXT.SETTINGS.TITLE}
        </h2>
        <p className="text-[13px] font-bold text-gray-400">
          {ADMIN_TEXT.SETTINGS.SUBTITLE}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Password Change Card */}
        <div className="bg-white p-10 rounded-[28px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200">
                <LockKeyhole size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                  {ADMIN_TEXT.SETTINGS.PASSWORD.TITLE}
                </h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  Authentication Security
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <div className="group">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                {ADMIN_TEXT.SETTINGS.PASSWORD.LABEL_CURRENT}
              </label>
              <input
                type="password"
                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:border-main focus:bg-white transition-all text-[15px] font-bold"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>
            <div className="group">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                {ADMIN_TEXT.SETTINGS.PASSWORD.LABEL_NEW}
              </label>
              <input
                type="password"
                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:border-main focus:bg-white transition-all text-[15px] font-bold"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>
            <div className="group">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                {ADMIN_TEXT.SETTINGS.PASSWORD.LABEL_CONFIRM}
              </label>
              <input
                type="password"
                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:border-main focus:bg-white transition-all text-[15px] font-bold"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={isLoading}
            className="w-full mt-10 py-4.5 bg-zinc-900 text-white rounded-[20px] font-black text-[13px] tracking-widest hover:bg-main transition-all shadow-lg shadow-gray-200 active:scale-95 flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <ShieldCheck size={18} />
            )}
            {isLoading ? "PROCESSING..." : "UPDATE CREDENTIALS"}
          </button>
        </div>

        {/* System Recovery Card */}
        <div className="bg-white p-10 rounded-[28px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-50">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                  {ADMIN_TEXT.SETTINGS.RECOVERY.TITLE}
                </h3>
                <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest mt-0.5 italic">
                  Critical System Action
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100/50">
              <div className="flex items-center gap-2 mb-3 text-red-600">
                <AlertTriangle size={14} strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {ADMIN_TEXT.SETTINGS.RECOVERY.DANGER_ZONE}
                </span>
              </div>
              <p className="text-[12.5px] font-bold text-red-500 leading-relaxed">
                {ADMIN_TEXT.SETTINGS.RECOVERY.DANGER_DESC}
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-gray-50/50 rounded-[24px] border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                    <Database size={18} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-black text-gray-800 tracking-tight leading-none">
                      Reseed System Data
                    </h4>
                    <p className="text-[11px] font-bold text-gray-400 mt-1">
                      데이터베이스 시드 및 마스터 키를 재발급합니다.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReseed}
                  disabled={isLoading}
                  className="w-full py-4 bg-white text-red-500 border border-red-100 rounded-xl font-black text-[11px] tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 uppercase group"
                >
                  {ADMIN_TEXT.SETTINGS.RECOVERY.BTN_RESEED}
                  <ChevronRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
              System Version 2.0.4 - MZTK Cloud Infrastructure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
