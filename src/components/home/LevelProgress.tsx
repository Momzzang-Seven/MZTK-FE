import { useUserStore } from "@store";
import { useEffect, useState } from "react";

export const LevelProgress = () => {
    const { level, xp, maxXp, levelUp } = useUserStore();
    const [animatedXp, setAnimatedXp] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedXp(xp), 100);
        return () => clearTimeout(timer);
    }, [xp]);

    const percentage = Math.min((animatedXp / maxXp) * 100, 100);
    const isLevelUpAvailable = xp >= maxXp;

    const handleLevelUp = async () => {
        const result = await levelUp();
        if (result.success) {
            alert(result.message);
        } else {
            alert(result.message);
        }
    };

    const radius = 95; // Adjusted for smaller size
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-[230px] h-[230px] flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx="115"
                    cy="115"
                    r={radius}
                    stroke="#f3f4f6"
                    strokeWidth="14"
                    fill="transparent"
                    strokeLinecap="round"
                />
                {/* Progress Circle */}
                <circle
                    cx="115"
                    cy="115"
                    r={radius}
                    stroke="#FAB12F"
                    strokeWidth="14"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isLevelUpAvailable ? (
                    <button
                        onClick={handleLevelUp}
                        className="animate-bounce bg-[#FAB12F] text-white font-bold leading-none px-6 py-4 rounded-full shadow-xl hover:bg-[#E59E20] transition-colors text-2xl"
                    >
                        레벨업!
                    </button>
                ) : (
                    <>
                        <div className="text-gray-400 text-xs font-medium mb-1">현재 레벨</div>
                        <div className="text-[#FAB12F] text-5xl font-bold font-gmarket">Lv.{level}</div>
                        <div className="text-gray-300 text-[11px] mt-2 font-medium">{xp} / {maxXp} EXP</div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LevelProgress;
