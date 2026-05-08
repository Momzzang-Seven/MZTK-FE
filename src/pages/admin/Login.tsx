import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostLogin } from "@services/auth";
import { useUserStore, useConfirmModalStore } from "@store";
import { ShieldCheck, Lock, User, Loader2 } from "lucide-react";
import { GlobalConfirmModal } from "@components/common/GlobalConfirmModal";

const Login = () => {
  const navigate = useNavigate();
  const { setAccessToken, setUser, clearUser } = useUserStore();
  const { openConfirm } = useConfirmModalStore();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!id || !password) {
      openConfirm({
        title: "Input Required",
        message: "아이디와 비밀번호를 모두 입력해주세요.",
        variant: "info",
        onConfirm: () => {},
        confirmLabel: "OK",
        cancelLabel: "",
      });
      return;
    }

    try {
      setIsLoading(true);
      clearUser();
      const res = await PostLogin({
        provider: "LOCAL_ADMIN",
        loginId: id,
        password: password,
      });

      setAccessToken(res.accessToken);
      setUser(res.userInfo);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin Login Failed:", error);
      openConfirm({
        title: "Authentication Failed",
        message: "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.",
        variant: "error",
        onConfirm: () => {},
        confirmLabel: "RETRY",
        cancelLabel: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 bg-[#09090b] min-h-screen relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-main/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[440px] flex flex-col items-center z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="w-16 h-16 bg-main rounded-[24px] flex items-center justify-center shadow-[0_0_40px_rgba(250,177,47,0.2)] mb-6">
            <span className="text-black font-black text-3xl italic tracking-tighter">
              M
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
            Management Console
          </h1>
          <p className="text-[11px] font-bold text-zinc-500 mt-2 tracking-[0.3em] uppercase">
            Momzzang Admin Suite v2.0
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-zinc-900/50 backdrop-blur-2xl border border-white/5 p-10 rounded-[32px] shadow-[0_40px_80px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-700">
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center text-zinc-600 group-focus-within:text-main transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Admin Identifier"
                className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-[15px] font-bold placeholder:text-zinc-700 focus:outline-none focus:border-main/50 focus:ring-4 focus:ring-main/10 transition-all"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center text-zinc-600 group-focus-within:text-main transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access Credentials"
                className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-[15px] font-bold placeholder:text-zinc-700 focus:outline-none focus:border-main/50 focus:ring-4 focus:ring-main/10 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
              />
            </div>
          </div>

          <div className="mt-10">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-main disabled:bg-zinc-800 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(250,177,47,0.15)] hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <ShieldCheck size={20} />
              )}
              {isLoading ? "AUTHORIZING..." : "SECURE LOGIN"}
            </button>
          </div>

          <div className="mt-8 flex justify-center">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              Authorized Personnel Only
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-10 text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
          &copy; 2026 MZTK FOUNDATION. All Rights Reserved.
        </p>
      </div>
      <GlobalConfirmModal />
    </div>
  );
};

export default Login;
