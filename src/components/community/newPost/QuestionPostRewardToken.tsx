import { Coins, ChevronRight } from "lucide-react";

interface QuestionPostRewardTokenProps {
  rewardToken: number;
  onClick?: () => void;
  hint?: string;
  tone?: "default" | "warning";
}

const QuestionPostRewardToken = ({
  rewardToken,
  onClick,
  hint = "답변 채택 시 지급될 토큰",
  tone = "default",
}: QuestionPostRewardTokenProps) => {
  const isWarning = tone === "warning";

  return (
    <div
      className={`group relative flex flex-row rounded-[24px] p-5 w-full h-24 items-center justify-between text-white cursor-pointer shadow-[0_20px_40px_rgba(250,177,47,0.3)] active:scale-[0.98] transition-all overflow-hidden ${
        isWarning
          ? "bg-gradient-to-br from-red-500 to-orange-500"
          : "bg-gradient-to-br from-main to-orange-400"
      }`}
      onClick={onClick}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

      <div className="relative z-10 flex flex-row gap-x-4 items-center">
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
          <Coins size={24} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-black tracking-tight opacity-90 uppercase">
            Reward MZTK
          </span>
          <span className="text-[12px] font-medium opacity-70">{hint}</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-row gap-x-3 items-center">
        <div className="flex flex-col items-end">
          <span className="text-3xl font-black">{rewardToken}</span>
        </div>
        <ChevronRight
          size={20}
          className="opacity-50 group-hover:translate-x-1 transition-transform"
          strokeWidth={3}
        />
      </div>
    </div>
  );
};

export default QuestionPostRewardToken;
