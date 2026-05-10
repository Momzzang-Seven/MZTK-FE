import {
  AttendanceBanner,
  LeaderboardBanner,
  LevelProgress,
  AuthActionButtons,
  AuthChoiceModal,
} from "@components/home";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@store/userStore";
import { CommonModal } from "@components/common";
import { Trophy, Sparkles } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const initAttendance = useUserStore((state) => state.initAttendance);
  const initLevel = useUserStore((state) => state.initLevel);
  const initLocation = useUserStore((state) => state.initLocation);
  const initWorkoutCompletion = useUserStore(
    (state) => state.initWorkoutCompletion
  );
  const user = useUserStore((state) => state.user);
  const attendanceResult = useUserStore((state) => state.attendanceResult);
  const clearAttendanceResult = useUserStore(
    (state) => state.clearAttendanceResult
  );

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    initAttendance();
    initLevel();
    initLocation();
    initWorkoutCompletion();
  }, [initAttendance, initLevel, initLocation, initWorkoutCompletion]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] overflow-y-auto pb-28">
      {/* ── Attendance Success Modal ── */}
      {attendanceResult && (
        <CommonModal onCancelClick={clearAttendanceResult}>
          <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
              <div className="absolute -top-4 -right-4 animate-bounce">
                <Sparkles className="text-main" size={28} />
              </div>
              <div className="w-24 h-24 bg-main/10 rounded-[32px] flex items-center justify-center shadow-xl shadow-main/10 ring-4 ring-white">
                <Trophy size={48} className="text-main" strokeWidth={2.5} />
              </div>
            </div>

            <div className="text-center flex flex-col gap-2">
              <h3 className="text-[22px] font-black text-gray-900 tracking-tight leading-tight">
                오늘의 첫 발걸음 성공!
              </h3>
              <p className="text-[14px] font-bold text-gray-400">
                꾸준한 출석이 가장 강력한 무기입니다.
              </p>
            </div>

            <div className="w-full bg-gray-50 rounded-[28px] p-6 flex flex-col gap-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-black text-gray-400 uppercase tracking-wider">
                  Earned XP
                </span>
                <span className="text-[18px] font-black text-main">
                  +{attendanceResult.rewardedXp} XP
                </span>
              </div>
              <div className="h-px bg-gray-200/50 w-full" />
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-black text-gray-400 uppercase tracking-wider">
                  Streak
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[18px] font-black text-gray-900">
                    {attendanceResult.streakDays}
                  </span>
                  <span className="text-[14px] font-bold text-gray-400">
                    일 연속
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={clearAttendanceResult}
              className="w-full py-4.5 bg-gray-900 text-white rounded-[22px] text-[15px] font-black shadow-xl shadow-black/10 active:scale-95 transition-all mt-2"
            >
              운동하러 가기
            </button>
          </div>
        </CommonModal>
      )}

      {/* ── Header Section ── */}
      <div className="relative pt-12 pb-24 px-6 overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-main opacity-[0.08] blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute top-[80px] left-[-60px] w-72 h-72 bg-main opacity-[0.05] blur-[80px] rounded-full pointer-events-none" />

        <div
          className="relative animate-fade-slide-up"
          style={{ animationDelay: "0s" }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-gray-400 text-xs font-bold tracking-wider uppercase opacity-80">
                Welcome back
              </p>
              <div className="flex items-start gap-2 mt-1">
                <h1 className="text-gray-900 text-2xl font-black leading-tight">
                  {user?.nickname || "트레이니"}님, <br />
                  오늘도{" "}
                  <span className="text-main underline decoration-main/20 underline-offset-4">
                    득근
                  </span>
                  하세요!
                </h1>
                <div className="mt-8">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FAB12F"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Premium Notification Bell Button */}
            <button
              onClick={() => navigate("/notifications")}
              className="btn-press relative w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-md shadow-xl shadow-gray-200/50 border border-white flex items-center justify-center shrink-0 group hover:scale-105 transition-all duration-300"
            >
              {/* Pulsing Notification Dot */}
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white z-10 animate-pulse-red" />

              {/* Refined Lucide: Bell */}
              <div className="relative">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111827"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-80 group-hover:opacity-100 group-hover:rotate-[15deg] transition-all duration-300"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content Section (Floating upwards) ── */}
      <div className="flex flex-col gap-6 px-6 -mt-16 relative z-10">
        {/* 1. Level Progress (The Hero Card) */}
        <div className="animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <LevelProgress />
        </div>

        {/* 2. Quick Stats Row */}
        <div className="flex gap-4">
          <AttendanceBanner />
          <LeaderboardBanner />
        </div>

        {/* 3. Today's Mission Section */}
        <div
          className="mt-2 flex flex-col gap-4 animate-fade-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center justify-between px-1">
            <h2 className="text-gray-900 text-lg font-extrabold tracking-tight">
              오늘의 미션
            </h2>
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-[10px] text-gray-500 font-black uppercase">
                2 To-do
              </span>
            </div>
          </div>

          <AuthActionButtons onExerciseClick={() => setIsAuthModalOpen(true)} />
        </div>
      </div>

      {/* Modal */}
      <AuthChoiceModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default Home;
