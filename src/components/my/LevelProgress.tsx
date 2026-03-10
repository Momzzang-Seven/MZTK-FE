import { MySectionCard } from "./MySectionCard";
import { useUserStore } from "@store/userStore";

export const LevelProgress = () => {
  const { level, xp, maxXp } = useUserStore();

  return (
    <MySectionCard>
      <div className="flex flex-row justify-between w-full">
        <div className="title">EXP & 레벨</div>
        <div className="rounded-full bg-main text-white py-1 px-3">
          LV {level}
        </div>
      </div>
      {/* current xp */}
      <div className="flex flex-row justify-between w-full label text-grey-deep">
        <div>현재 EXP</div>
        <div>{xp.toLocaleString()} EXP</div>
      </div>
      {/* progress bar */}
      <div className="w-full bg-grey-pale rounded-full h-4">
        <div
          className="bg-gradient-to-r from-main to-sub h-4 rounded-full"
          style={{ width: `${Math.min((xp / maxXp) * 100, 100)}%` }}
        />
      </div>
      {/* goal xp */}
      <div className="flex flex-row justify-between w-full label text-grey-deep">
        <div>목표 EXP</div>
        <div className="font-bold text-black">{maxXp.toLocaleString()} EXP</div>
      </div>
    </MySectionCard>
  );
};
