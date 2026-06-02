import { useEffect, useState } from "react";
import {
  CurrentTkn,
  LevelProgress,
  LevelReward,
  TokenActionButtons,
  UserProfile,
} from "@components/my";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@store";
import { CommonModal } from "@components/common";
import { getKoreanErrorMessageFromError } from "@constant";
import { INQUIRY_FORM_URL } from "@constant/inquiry";
import { PostWithdraw } from "@services/auth";

const ACTIVITY_BUTTONS = [
  {
    label: "내가 쓴 글",
    tab: "written",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
      </svg>
    ),
  },
  {
    label: "좋아요",
    tab: "liked",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
      </svg>
    ),
  },
  {
    label: "댓글 단 글",
    tab: "commented",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
] as const;

const My = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const initLevel = useUserStore((state) => state.initLevel);
  const updateRole = useUserStore((state) => state.updateRole);
  const clearUser = useUserStore((state) => state.clearUser);
  const showSnackbar = useUserStore((state) => state.showSnackbar);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const isTrainer = user?.role === "TRAINER";
  const targetRole = isTrainer ? "USER" : "TRAINER";
  const targetRoleLabel = isTrainer ? "일반 회원" : "트레이너";

  useEffect(() => {
    void initLevel();
  }, [initLevel]);

  const handleRoleSwitch = async () => {
    if (isChangingRole) return;
    setIsChangingRole(true);
    try {
      await updateRole(targetRole);
      setIsSwitchModalOpen(true);
    } catch {
      showSnackbar("역할 변경에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleConfirmLogout = () => {
    clearUser();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    initLevel();
  }, [initLevel]);
  const closeWithdrawModal = () => {
    if (isWithdrawing) return;
    setIsWithdrawModalOpen(false);
    setWithdrawError("");
  };

  const handleWithdraw = async () => {
    if (isWithdrawing) return;

    setIsWithdrawing(true);
    setWithdrawError("");

    try {
      await PostWithdraw();
      clearUser();
      showSnackbar("회원탈퇴가 완료되었습니다.", { variant: "success" });
      navigate("/login", { replace: true });
    } catch (error) {
      setWithdrawError(
        getKoreanErrorMessageFromError(
          error,
          "회원탈퇴에 실패했습니다. 다시 시도해 주세요."
        )
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFDFD] pb-28">
      {/* ── Header bg ── */}
      <div className="relative pt-12 pb-20 px-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-main opacity-[0.07] blur-[60px] rounded-full pointer-events-none" />
        <p className="text-gray-400 text-xs font-black tracking-widest uppercase mb-1">
          My Profile
        </p>
        <h1 className="text-gray-900 text-2xl font-black tracking-tight">
          마이페이지
        </h1>
      </div>

      {/* ── Stacked cards ── */}
      <div className="flex flex-col gap-4 px-5 -mt-12 relative z-10">
        {/* Profile */}
        <UserProfile />

        {/* Role switch + location change */}
        <div
          className="bg-white rounded-[28px] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden animate-fade-slide-up"
          style={{ animationDelay: "0.05s" }}
        >
          {/* Role row */}
          <div className="flex flex-col gap-3 px-5 py-4 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  현재 역할
                </span>
                <span
                  className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                    isTrainer
                      ? "bg-main/10 text-main"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isTrainer ? "TRAINER" : "USER"}
                </span>
              </div>
              {/* Arrow indicator */}
              <div className="flex items-center gap-1.5 text-gray-300">
                <span className="text-[11px] font-bold">{targetRoleLabel}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>

            <button
              id="role-switch-btn"
              onClick={() => void handleRoleSwitch()}
              disabled={isChangingRole}
              className={`btn-press w-full flex items-center justify-center gap-2.5 py-3 rounded-[18px] border-none font-black text-[14px] transition-all ${
                isChangingRole
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : isTrainer
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-main/8 text-main hover:bg-main/15"
              }`}
            >
              {isChangingRole ? (
                <>
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  역할 변경 중...
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 2l4 4-4 4" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="m7 22-4-4 4-4" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                  {targetRoleLabel}으로 전환하기
                </>
              )}
            </button>
          </div>

          {/* Location row */}
          <button
            onClick={() =>
              navigate("/location-register", { state: { from: "my" } })
            }
            className="btn-press w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-none bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[11px] text-gray-400 font-black uppercase tracking-wider">
                  인증 위치
                </p>
                <p className="text-gray-900 font-black text-[13px]">
                  위치 변경하기
                </p>
              </div>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Token balance */}
        <div
          className="animate-fade-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <CurrentTkn />
        </div>

        {/* Token action mini-cards */}
        <div
          className="animate-fade-slide-up"
          style={{ animationDelay: "0.15s" }}
        >
          <TokenActionButtons />
        </div>

        {/* XP progress */}
        <LevelProgress />

        {/* Level reward */}
        <div
          className="animate-fade-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <LevelReward />
        </div>

        {/* Community activity */}
        <div
          className="bg-white rounded-[28px] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden animate-fade-slide-up"
          style={{ animationDelay: "0.25s" }}
        >
          <div className="px-5 pt-5 pb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Activity
            </p>
            <h2 className="text-gray-900 font-black text-[16px] mt-0.5">
              내 커뮤니티 활동
            </h2>
          </div>
          {ACTIVITY_BUTTONS.map(({ label, tab, icon }, i) => (
            <div key={tab}>
              <button
                onClick={() => navigate(`/my/activity/${tab}`)}
                className="btn-press w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-none bg-transparent"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-main/8 flex items-center justify-center text-main">
                    {icon}
                  </div>
                  <span className="text-gray-800 font-black text-[14px]">
                    {label}
                  </span>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              {i < ACTIVITY_BUTTONS.length - 1 && (
                <div className="h-px bg-gray-50 mx-5" />
              )}
            </div>
          ))}
        </div>

        {/* Account withdrawal */}
        <div
          className="bg-white rounded-[28px] border border-red-100 shadow-xl shadow-gray-100/50 overflow-hidden animate-fade-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <button
            type="button"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="btn-press w-full flex items-center justify-between px-5 py-4 hover:bg-red-50/40 transition-colors border-none bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[11px] text-red-300 font-black uppercase tracking-wider">
                  Account
                </p>
                <p className="text-red-500 font-black text-[13px]">회원탈퇴</p>
              </div>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F87171"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Support link */}
        <p className="text-center text-[12px] text-gray-400 font-bold pb-4">
          지급 오류 또는 지연 관련 문의는{" "}
          <span
            onClick={() => window.open(INQUIRY_FORM_URL, "_blank")}
            className="text-main font-black underline underline-offset-2 cursor-pointer"
          >
            다음 링크
          </span>
          를 이용해 주세요.
        </p>
      </div>

      {isSwitchModalOpen && (
        <CommonModal
          title="역할 변경 안내"
          desc="원활한 접속 및 캐시 정리를 위해<br/>재로그인이 필요합니다.<br/>확인을 누르면 로그인 화면으로 이동합니다."
          confirmLabel="확인"
          onConfirmClick={handleConfirmLogout}
        />
      )}

      {isWithdrawModalOpen && (
        <CommonModal
          title="회원탈퇴"
          desc="정말 탈퇴하시겠습니까?<br/>탈퇴 후 계정 정보는 복구할 수 없습니다."
          variant="error"
        >
          <div className="mt-5 space-y-4">
            {withdrawError && (
              <p className="text-[12px] font-bold text-red-500 leading-relaxed">
                {withdrawError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeWithdrawModal}
                disabled={isWithdrawing}
                className="flex-1 py-4 rounded-[22px] bg-gray-50 text-gray-500 text-[14px] font-black disabled:opacity-60"
              >
                아니요
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleWithdraw();
                }}
                disabled={isWithdrawing}
                className="flex-1 py-4 rounded-[22px] bg-red-500 text-white text-[14px] font-black shadow-lg shadow-red-100 disabled:opacity-60"
              >
                {isWithdrawing ? "처리 중..." : "네"}
              </button>
            </div>
          </div>
        </CommonModal>
      )}
    </div>
  );
};

export default My;
