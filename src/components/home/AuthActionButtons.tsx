import { useUserStore } from "@store";
import { getKstDateString } from "@utils/time";
import {
  Calendar,
  Zap,
  CheckCircle2,
  ChevronRight,
  Loader2,
  PartyPopper,
  Trophy,
  Flame,
} from "lucide-react";

interface AuthActionButtonsProps {
  onExerciseClick: () => void;
}

export const AuthActionButtons = ({
  onExerciseClick,
}: AuthActionButtonsProps) => {
  const hasAttendedToday = useUserStore((state) => state.hasAttendedToday);
  const lastAttendanceRewardedXp = useUserStore(
    (state) => state.lastAttendanceRewardedXp
  );
  const lastExerciseDate = useUserStore((state) => state.lastExerciseDate);
  const analysisStatus = useUserStore((state) => state.analysisStatus);
  const checkAttendance = useUserStore((state) => state.checkAttendance);

  const today = getKstDateString();
  const isAttended = hasAttendedToday;
  const isExerciseDone = lastExerciseDate === today;
  const isExerciseAnalyzing = analysisStatus === "analyzing";
  const isExerciseLocked = isExerciseDone || isExerciseAnalyzing;
  const attendanceRewardText =
    lastAttendanceRewardedXp && lastAttendanceRewardedXp > 0
      ? `${lastAttendanceRewardedXp} XP를 획득했어요`
      : "출석 보상을 획득했어요";

  return (
    <div className="w-full flex flex-col gap-4 font-pretendard">
      {/* ── 1. Attendance Button ── */}
      <div
        className="animate-fade-slide-up group"
        style={{ animationDelay: "0.25s" }}
      >
        <button
          onClick={isAttended ? undefined : () => void checkAttendance()}
          disabled={isAttended}
          className={`relative w-full flex items-center p-6 rounded-[24px] text-left transition-all duration-500 border overflow-hidden ${
            isAttended
              ? "bg-main border-main shadow-[0_20px_50px_rgba(255,107,0,0.3)] cursor-default"
              : "bg-white border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(255,107,0,0.12)] hover:border-main/20 cursor-pointer active:scale-[0.98]"
          }`}
        >
          {isAttended && (
            <div className="absolute top-[-20px] right-[-20px] opacity-10 animate-pulse">
              <PartyPopper size={120} className="text-white" />
            </div>
          )}

          <div className="flex items-center flex-1 relative z-10">
            <div
              className={`w-14 h-14 rounded-[24px] flex items-center justify-center shrink-0 mr-5 transition-all duration-500 ${
                isAttended
                  ? "bg-white/20 backdrop-blur-md"
                  : "bg-gradient-to-br from-orange-400 to-main shadow-[0_10px_20px_rgba(255,107,0,0.2)] group-hover:rotate-6"
              }`}
            >
              {isAttended ? (
                <Trophy size={24} className="text-white" />
              ) : (
                <Calendar size={24} className="text-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className={`text-[17px] font-black tracking-tight ${isAttended ? "text-white" : "text-gray-900"}`}
                >
                  {isAttended ? "출석 체크 완료!" : "오늘의 첫 발걸음"}
                </h4>
              </div>
              <p
                className={`text-[12px] font-bold tracking-wide ${isAttended ? "text-white/80" : "text-gray-400"}`}
              >
                {isAttended
                  ? attendanceRewardText
                  : "가볍게 출석하고 시작해볼까요?"}
              </p>
            </div>
          </div>

          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 relative z-10 ${
              isAttended
                ? "bg-white/10 text-white"
                : "bg-gray-900 text-white shadow-lg group-hover:translate-x-1"
            }`}
          >
            {isAttended ? (
              <CheckCircle2 size={20} strokeWidth={3} />
            ) : (
              <ChevronRight size={20} strokeWidth={3} />
            )}
          </div>
        </button>
      </div>

      {/* ── 2. Exercise Button ── */}
      <div
        className="animate-fade-slide-up group"
        style={{ animationDelay: "0.3s" }}
      >
        <button
          onClick={isExerciseLocked ? undefined : onExerciseClick}
          disabled={isExerciseLocked}
          className={`relative w-full flex items-center p-6 rounded-[24px] text-left transition-all duration-500 border overflow-hidden ${
            isExerciseDone
              ? "bg-main border-main shadow-[0_20px_50px_rgba(255,107,0,0.3)] cursor-default"
              : isExerciseAnalyzing
                ? "bg-gray-50 border-gray-100 cursor-default"
                : "bg-white border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(255,107,0,0.12)] hover:border-main/20 cursor-pointer active:scale-[0.98]"
          }`}
        >
          {isExerciseDone && (
            <div className="absolute top-[-20px] right-[-20px] opacity-15 animate-pulse">
              <Flame size={120} className="text-white fill-white" />
            </div>
          )}

          <div className="flex items-center flex-1 relative z-10">
            <div
              className={`w-14 h-14 rounded-[22px] flex items-center justify-center shrink-0 mr-5 transition-all duration-500 ${
                isExerciseAnalyzing
                  ? "bg-amber-400 shadow-[0_10px_20px_rgba(251,191,36,0.2)]"
                  : isExerciseDone
                    ? "bg-white/20 backdrop-blur-md"
                    : "bg-gradient-to-br from-amber-400 via-orange-500 to-main shadow-[0_10px_25px_rgba(255,107,0,0.3)] group-hover:scale-110 group-hover:rotate-12"
              }`}
            >
              {isExerciseAnalyzing ? (
                <Loader2 size={24} className="text-white animate-spin" />
              ) : isExerciseDone ? (
                <CheckCircle2 size={24} className="text-white" />
              ) : (
                <Zap
                  size={24}
                  className="text-white fill-white animate-pulse"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className={`text-[17px] font-black tracking-tight ${isExerciseDone ? "text-white" : isExerciseAnalyzing ? "text-gray-400" : "text-gray-900"}`}
                >
                  {isExerciseAnalyzing
                    ? "운동 분석 중..."
                    : isExerciseDone
                      ? "오운완! 성공적입니다"
                      : "열정의 기록, 운동 인증"}
                </h4>
              </div>
              <p
                className={`text-[12px] font-bold tracking-wide ${
                  isExerciseDone
                    ? "text-white/80"
                    : isExerciseAnalyzing
                      ? "text-amber-500"
                      : "text-main"
                }`}
              >
                {isExerciseAnalyzing
                  ? "데이터를 꼼꼼히 확인하고 있어요"
                  : isExerciseDone
                    ? "오늘의 운동 보상을 획득했어요 🔥"
                    : "지금 바로 운동을 인증하고 토큰을 받으세요"}
              </p>
            </div>
          </div>

          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 relative z-10 ${
              isExerciseDone
                ? "bg-white/10 text-white"
                : isExerciseAnalyzing
                  ? "bg-amber-50 text-amber-500"
                  : "bg-gray-900 text-white shadow-lg group-hover:translate-x-1"
            }`}
          >
            {isExerciseDone ? (
              <CheckCircle2 size={20} strokeWidth={3} />
            ) : isExerciseAnalyzing ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <ChevronRight size={20} strokeWidth={3} />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default AuthActionButtons;
