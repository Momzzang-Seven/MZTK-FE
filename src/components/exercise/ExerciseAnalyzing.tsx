import Lottie from "lottie-react";
import runnerAnimation from "@assets/runner.json";
import { EXERCISE_TEXT } from "@constant/exercise";

export const ExerciseAnalyzing = () => {
  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFDFD] items-center justify-center px-6 gap-8 animate-fade-in">
      {/* Decorative blob */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-main opacity-[0.06] blur-[80px] rounded-full pointer-events-none" />

      {/* Lottie */}
      <div className="w-72 h-72 relative">
        <Lottie animationData={runnerAnimation} loop />
      </div>

      {/* Status card */}
      <div className="w-full bg-white rounded-[28px] border border-gray-100 shadow-xl shadow-gray-100/50 p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-main animate-pulse" />
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            AI 분석 중
          </span>
        </div>
        <p className="text-gray-900 font-black text-[22px] leading-snug tracking-tight">
          {EXERCISE_TEXT.ANALYZING_TITLE_1}
          <br />
          <span className="text-main">{EXERCISE_TEXT.ANALYZING_TITLE_2}</span>
        </p>
        <p className="text-gray-400 text-[13px] font-bold mt-3">
          잠시만 기다려 주세요. 보통 5~10초 소요됩니다.
        </p>

        {/* Animated progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-5">
          <div
            className="h-full bg-main rounded-full"
            style={{
              animation: "analyzing-bar 3s ease-in-out infinite",
              width: "60%",
            }}
          />
        </div>
      </div>
    </div>
  );
};
