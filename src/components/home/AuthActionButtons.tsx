import { useUserStore } from "@store";
import { HOME_TEXT } from "@constant/home";
import { getKstDateString } from "@utils/time";

interface AuthActionButtonsProps {
  onExerciseClick: () => void;
}

export const AuthActionButtons = ({
  onExerciseClick,
}: AuthActionButtonsProps) => {
  const hasAttendedToday = useUserStore((state) => state.hasAttendedToday);
  const lastExerciseDate = useUserStore((state) => state.lastExerciseDate);
  const analysisStatus = useUserStore((state) => state.analysisStatus);
  const checkAttendance = useUserStore((state) => state.checkAttendance);

  const today = getKstDateString();
  const isAttended = hasAttendedToday;
  const isExerciseDone = lastExerciseDate === today;
  const isExerciseAnalyzing = analysisStatus === "analyzing";
  const isExerciseLocked = isExerciseDone || isExerciseAnalyzing;

  const exerciseTitle = isExerciseAnalyzing
    ? HOME_TEXT.EXERCISE.ANALYZING_TITLE
    : isExerciseDone
      ? HOME_TEXT.EXERCISE.DONE_TITLE
      : HOME_TEXT.EXERCISE.YET_TITLE;

  const exerciseDesc = isExerciseAnalyzing
    ? HOME_TEXT.EXERCISE.ANALYZING_DESC
    : isExerciseDone
      ? HOME_TEXT.EXERCISE.DONE_DESC
      : HOME_TEXT.EXERCISE.YET_DESC;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ── 1. Attendance Button ── */}
      <div
        className={`animate-fade-slide-up group`}
        style={{ animationDelay: "0.25s" }}
      >
        <button
          onClick={isAttended ? undefined : () => void checkAttendance()}
          disabled={isAttended}
          className={`relative w-full flex items-center p-5 rounded-[28px] text-left transition-all duration-300 border ${
            isAttended
              ? "bg-gray-50 border-gray-100 cursor-default"
              : "bg-white border-gray-100 shadow-xl shadow-gray-100/30 card-hover cursor-pointer"
          }`}
        >
          {/* Icon Box */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mr-4 transition-transform group-hover:scale-110 ${
              isAttended ? "bg-gray-100" : "bg-orange-50 shadow-sm"
            }`}
          >
            {isAttended ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
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
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4
              className={`text-[15px] font-black tracking-tight ${isAttended ? "text-gray-400" : "text-gray-900"}`}
            >
              {isAttended
                ? HOME_TEXT.ATTENDANCE.DONE_TITLE
                : HOME_TEXT.ATTENDANCE.YET_TITLE}
            </h4>
            <p
              className={`text-[11px] font-bold mt-0.5 tracking-wide uppercase ${isAttended ? "text-gray-300" : "text-gray-400"}`}
            >
              {isAttended
                ? HOME_TEXT.ATTENDANCE.DONE_DESC
                : HOME_TEXT.ATTENDANCE.YET_DESC}
            </p>
          </div>

          {isAttended ? (
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D1D5DB"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white text-xs font-black shadow-md">
              CHECK
            </div>
          )}
        </button>
      </div>

      {/* ── 2. Exercise Button ── */}
      <div
        className="animate-fade-slide-up group"
        style={{ animationDelay: "0.3s" }}
      >
        <button
          aria-label="운동 인증"
          onClick={isExerciseLocked ? undefined : onExerciseClick}
          disabled={isExerciseLocked}
          className={`relative w-full flex items-center p-5 rounded-[28px] text-left transition-all duration-300 border ${
            isExerciseLocked
              ? "bg-gray-50 border-gray-100 cursor-default"
              : "bg-white border-gray-100 shadow-xl shadow-gray-100/30 card-hover cursor-pointer"
          }`}
        >
          {/* Icon Box */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mr-4 transition-transform group-hover:scale-110 ${
              isExerciseLocked
                ? "bg-gray-100"
                : "bg-main shadow-lg shadow-main/20"
            }`}
          >
            {isExerciseAnalyzing ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-spin-slow"
              >
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M4.93 4.93l2.83 2.83" />
                <path d="M16.24 16.24l2.83 2.83" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
                <path d="M4.93 19.07l2.83-2.83" />
                <path d="M16.24 7.76l2.83-2.83" />
              </svg>
            ) : isExerciseDone ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4
              className={`text-[15px] font-black tracking-tight ${
                isExerciseLocked ? "text-gray-400" : "text-gray-900"
              }`}
            >
              {exerciseTitle}
            </h4>
            <p
              className={`text-[11px] font-bold mt-0.5 tracking-wide uppercase ${
                isExerciseLocked ? "text-gray-300" : "text-main"
              }`}
            >
              {exerciseDesc}
            </p>
          </div>

          {isExerciseDone ? (
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D1D5DB"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          ) : isExerciseAnalyzing ? (
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-main border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white text-xs font-black shadow-md">
              GO
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default AuthActionButtons;
