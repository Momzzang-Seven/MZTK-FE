import { useUserStore } from "@store";

export const AttendanceBanner = () => {
  const attendanceStreak = useUserStore((state) => state.attendanceStreak);
  const weeklyAttendance = useUserStore((state) => state.weeklyAttendance);
  const hasAttendedToday = useUserStore((state) => state.hasAttendedToday);
  const checkAttendance = useUserStore((state) => state.checkAttendance);
  const maxStreak = 7;
  const attendedCount = weeklyAttendance?.attendedCount ?? attendanceStreak;
  const done = attendedCount >= maxStreak;
  const isAttended = hasAttendedToday;

  return (
    <div
      className="flex-1 bg-white rounded-[28px] p-5 border border-gray-100 shadow-xl shadow-gray-100/50 animate-fade-slide-up card-hover flex flex-col justify-between h-40 overflow-hidden relative"
      style={{ animationDelay: "0.15s" }}
    >
      {/* Background Decor */}
      <div className="absolute top-[-10px] left-[-10px] w-12 h-12 bg-main/5 rounded-full blur-xl" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shadow-sm">
            {/* Lucide: Flame */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FAB12F"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </div>
          <div className="flex gap-1">
            {[...Array(maxStreak)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-3 rounded-full transition-all duration-500 ${
                  i < attendedCount ? "bg-main" : "bg-gray-100"
                }`}
              />
            ))}
          </div>
        </div>

        <h4 className="text-gray-900 text-sm font-black leading-tight">
          출석 챌린지
        </h4>
        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
          {done ? "Reward Claimed" : `${maxStreak - attendedCount} Days Left`}
        </p>
      </div>

      <div className="flex items-end justify-between mt-2">
        <span className="text-2xl font-black text-gray-900 font-gmarket">
          {attendedCount}
          <span className="text-xs text-gray-400 ml-0.5">/7</span>
        </span>

        <button
          onClick={isAttended ? undefined : () => void checkAttendance()}
          className={`btn-press w-9 h-9 rounded-xl flex items-center justify-center border-none transition-all ${
            isAttended
              ? "bg-gray-50 text-gray-300 cursor-default"
              : "bg-main text-white shadow-lg shadow-main/30"
          }`}
        >
          {isAttended ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default AttendanceBanner;
