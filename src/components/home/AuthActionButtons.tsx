import { useUserStore } from "@store";
import { HOME_TEXT } from "@constant/home";
import { CommonButton } from "@components/common";
import { getKstDateString } from "@utils/time";

interface AuthActionButtonsProps {
    onExerciseClick: () => void;
}

export const AuthActionButtons = ({ onExerciseClick }: AuthActionButtonsProps) => {
    const { checkAttendance, hasAttendedToday, lastExerciseDate, analysisStatus } = useUserStore();
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

    const handleAttendance = async () => {
        await checkAttendance();
    };

    const activeStyle = "bg-[#FFC107] text-white shadow-lg active:scale-95 border-none cursor-pointer";
    const inactiveStyle = "!bg-white border-2 border-dashed border-gray-300 text-gray-400 cursor-default";

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Attendance Button */}
            <CommonButton
                ariaLabel="출석 인증"
                onClick={isAttended ? undefined : handleAttendance}
                className={`w-full !justify-start gap-4 p-5 rounded-[20px] transition-all text-left ${isAttended ? inactiveStyle : activeStyle}`}
                bgColor=" " // Override default
                textColor=" " // Override default
                padding="p-5"
                label={
                    <div className="flex flex-col items-start gap-0.5">
                        <div className="font-bold text-[17px]">
                            {isAttended ? HOME_TEXT.ATTENDANCE.DONE_TITLE : HOME_TEXT.ATTENDANCE.YET_TITLE}
                        </div>
                        <div className={`text-[12px] font-medium ${isAttended ? "opacity-70" : "opacity-90"}`}>
                            {isAttended ? HOME_TEXT.ATTENDANCE.DONE_DESC : HOME_TEXT.ATTENDANCE.YET_DESC}
                        </div>
                    </div>
                }
                icon={
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${isAttended ? "bg-transparent" : "bg-white/25"}`}>
                        <img
                            src="/icon/clock.svg"
                            alt="clock"
                            className={`w-6 h-6 ${isAttended ? "brightness-0 opacity-40" : "brightness-0 invert"}`}
                        />
                    </div>
                }
            />

            {/* Exercise Button */}
            <CommonButton
                ariaLabel="운동 인증"
                onClick={isExerciseLocked ? undefined : onExerciseClick}
                disabled={isExerciseLocked}
                className={`w-full !justify-start gap-4 p-5 rounded-[20px] transition-all text-left ${isExerciseLocked ? inactiveStyle : activeStyle}`}
                bgColor=" " // Override default
                textColor=" " // Override default
                padding="p-5"
                label={
                    <div className="flex flex-col items-start gap-0.5">
                        <div className="font-bold text-[17px]">
                            {exerciseTitle}
                        </div>
                        <div className={`text-[12px] font-medium ${isExerciseLocked ? "opacity-70" : "text-white/90"}`}>
                            {exerciseDesc}
                        </div>
                    </div>
                }
                icon={
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${isExerciseLocked ? "bg-transparent" : "bg-white/25"}`}>
                        <img
                            src="/icon/dumbell.svg"
                            alt="dumbell"
                            className={`w-6 h-6 ${isExerciseLocked ? "brightness-0 opacity-40" : "brightness-0 invert"}`}
                        />
                    </div>
                }
            />
        </div>
    );
};

export default AuthActionButtons;

