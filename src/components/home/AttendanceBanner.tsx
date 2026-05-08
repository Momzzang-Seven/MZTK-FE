import { useUserStore } from "@store";

export const AttendanceBanner = () => {
  const { attendanceStreak, weeklyAttendance } = useUserStore();
  const maxStreak = 7;
  const attendedCount = weeklyAttendance?.attendedCount ?? attendanceStreak;
  const remainingDays = maxStreak - attendedCount;

  return (
    <div className="w-full bg-[#FFC107] rounded-[20px] p-5 text-white shadow-md relative overflow-hidden flex items-center justify-between">
      {/* Left: Big Arrow Icon */}
      <div className="shrink-0 mr-4">
        <img
          src="/icon/arrow_chart.svg"
          alt="trend"
          width={40}
          height={40}
          className="brightness-0 invert transform scale-110"
        />
      </div>

      {/* Right: Content */}
      <div className="flex flex-col flex-1 items-start gap-2">
        <span className="font-bold text-[16px] tracking-tight">
          이번 주 출석 챌린지
        </span>

        {/* Streak Dots */}
        <div className="flex gap-1.5">
          {[...Array(maxStreak)].map((_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white/40 ${
                i < attendedCount
                  ? "bg-white text-[#FFC107]"
                  : "bg-transparent text-white"
              }`}
            >
              {i < attendedCount && (
                <img
                  src="/icon/check.svg"
                  alt="checked"
                  width={14}
                  height={14}
                />
              )}
            </div>
          ))}
        </div>

        <p className="text-[12px] font-bold opacity-90">
          {attendedCount < 7
            ? `${remainingDays}일만 더 인증하면 100EXP 추가 보상!`
            : "이번 주 목표 달성 완료! 🎉"}
        </p>
      </div>
    </div>
  );
};

export default AttendanceBanner;
