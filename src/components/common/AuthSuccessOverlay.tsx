import { useEffect, useState } from "react";
import { CheckCircle2, Award, Zap, ArrowRight } from "lucide-react";

interface AuthSuccessOverlayProps {
  title: string;
  subTitle?: string;
  rewardXp: number;
  onClose: () => void;
}

export const AuthSuccessOverlay = ({
  title,
  subTitle,
  rewardXp,
  onClose,
}: AuthSuccessOverlayProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-[200] bg-white flex flex-col items-center justify-between p-8 pb-14 text-center animate-in fade-in duration-500 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[40%] bg-main/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {/* Animated Badge */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-main/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative w-32 h-32 bg-main rounded-[40px] flex items-center justify-center shadow-2xl shadow-main/40 animate-scale-in">
            <CheckCircle2 size={64} className="text-white" />
          </div>

          {/* Floating Particle Icons */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce delay-100">
            <Award size={24} className="text-main" />
          </div>
          <div className="absolute -bottom-2 -left-6 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce delay-300">
            <Zap size={20} className="text-amber-500" />
          </div>
        </div>

        {/* Text Section */}
        <div className="space-y-3 mb-10 max-w-[280px]">
          <h2 className="text-[32px] font-black text-gray-900 tracking-tight leading-tight">
            {title}
          </h2>
          {subTitle && (
            <p className="text-[15px] font-bold text-gray-400 leading-relaxed whitespace-pre-line">
              {subTitle}
            </p>
          )}
        </div>

        {/* Reward Card */}
        <div className="w-full bg-gray-50/50 rounded-[32px] p-6 border border-gray-100 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-main/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">
            Verification Reward
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-black text-main tabular-nums tracking-tighter">
              +{rewardXp}
            </span>
            <span className="text-xl font-black text-main/60 uppercase">
              XP
            </span>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="w-full space-y-6">
        {/* Auto Redirect Progress */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
            <div
              className="h-full bg-main transition-all duration-100 linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            Redirecting to home
          </span>
        </div>

        <button
          onClick={onClose}
          className="btn-press w-full py-5 bg-gray-900 text-white rounded-[24px] font-black text-[16px] flex items-center justify-center gap-3 shadow-2xl shadow-black/10 border-none"
        >
          확인
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Confetti-like elements (CSS Only) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-main/20 animate-ping"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
