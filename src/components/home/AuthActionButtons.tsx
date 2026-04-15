import { useUserStore } from "@store";
import { useEffect, useState } from "react";
import { HOME_TEXT } from "@constant/home";
import { CommonButton } from "@components/common";

interface AuthActionButtonsProps {
    onExerciseClick: () => void;
}

export const AuthActionButtons = ({ onExerciseClick }: AuthActionButtonsProps) => {
    const { checkAttendance, hasAttendedToday, lastExerciseDate } = useUserStore();
    const [isAttended, setIsAttended] = useState(false);
    const [isExerciseDone, setIsExerciseDone] = useState(false);

    useEffect(() => {
        setIsAttended(hasAttendedToday);
        const today = new Date().toISOString().split("T")[0];
        setIsExerciseDone(lastExerciseDate === today);
    }, [hasAttendedToday, lastExerciseDate]);

    const handleAttendance = async () => {
        const result = await checkAttendance();
        if (result.success) {
            alert(result.message);
        } else {
            alert(result.message);
        }
    };

    const activeStyle = "bg-[#FFC107] text-white shadow-lg active:scale-95 border-none cursor-pointer";
    const inactiveStyle = "!bg-white border-2 border-dashed border-gray-300 text-gray-400 cursor-default";

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Attendance Button */}
            <CommonButton
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
                onClick={isExerciseDone ? undefined : onExerciseClick}
                className={`w-full !justify-start gap-4 p-5 rounded-[20px] transition-all text-left ${isExerciseDone ? inactiveStyle : activeStyle}`}
                bgColor=" " // Override default
                textColor=" " // Override default
                padding="p-5"
                label={
                    <div className="flex flex-col items-start gap-0.5">
                        <div className="font-bold text-[17px]">
                            {isExerciseDone ? HOME_TEXT.EXERCISE.DONE_TITLE : HOME_TEXT.EXERCISE.YET_TITLE}
                        </div>
                        <div className={`text-[12px] font-medium ${isExerciseDone ? "opacity-70" : "text-white/90"}`}>
                            {isExerciseDone ? HOME_TEXT.EXERCISE.DONE_DESC : HOME_TEXT.EXERCISE.YET_DESC}
                        </div>
                    </div>
                }
                icon={
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${isExerciseDone ? "bg-transparent" : "bg-white/25"}`}>
                        <img
                            src="/icon/dumbell.svg"
                            alt="dumbell"
                            className={`w-6 h-6 ${isExerciseDone ? "brightness-0 opacity-40" : "brightness-0 invert"}`}
                        />
                    </div>
                }
            />
        </div>
    );
};

export default AuthActionButtons;

