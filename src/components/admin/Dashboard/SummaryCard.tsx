import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  variant?: "amber" | "blue" | "zinc";
}

const SummaryCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  variant = "zinc",
}: SummaryCardProps) => {
  const variantStyles = {
    amber:
      "bg-main/10 text-main border-main/10 shadow-[0_8px_20px_rgba(250,177,47,0.15)]",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/10 shadow-[0_8px_20px_rgba(37,99,235,0.15)]",
    zinc: "bg-zinc-900/5 text-zinc-900 border-zinc-900/10 shadow-[0_8px_20px_rgba(24,24,27,0.1)]",
  };

  const isDanger = subValue?.includes("BAN") || subValue?.includes("정지");

  return (
    <div className="bg-white p-7 rounded-[28px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-gray-100 flex justify-between items-start group hover:scale-[1.02] transition-all duration-300">
      <div className="flex flex-col gap-1.5">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          {title}
        </p>
        <h3 className="text-[26px] font-black text-gray-900 tracking-tighter tabular-nums leading-none">
          {value}
        </h3>
        {subValue && (
          <div className="flex items-center gap-1.5 mt-3">
            <div
              className={`w-1.5 h-1.5 rounded-full ${isDanger ? "bg-red-500" : "bg-emerald-500"} animate-pulse`}
            />
            <p
              className={`text-[11px] font-bold tracking-tight ${isDanger ? "text-red-500" : "text-gray-400"}`}
            >
              {subValue}
            </p>
          </div>
        )}
      </div>

      <div
        className={`p-3.5 rounded-2xl border transition-all duration-300 ${variantStyles[variant]}`}
      >
        <Icon size={22} strokeWidth={2.5} />
      </div>
    </div>
  );
};

export default SummaryCard;
