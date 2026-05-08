import Lottie from "lottie-react";
import runnerAnimation from "@assets/runner.json";
import { EXERCISE_TEXT } from "@constant/exercise";

export const ExerciseAnalyzing = () => {
  return (
    <div className="flex flex-col flex-1 items-center justify-center animate-fade-in h-[60vh]">
      <div className="w-80 h-80 mb-6">
        <Lottie animationData={runnerAnimation} loop={true} />
      </div>

      <p className="text-main font-bold text-3xl text-center leading-tight">
        {EXERCISE_TEXT.ANALYZING_TITLE_1}
        <br />
        {EXERCISE_TEXT.ANALYZING_TITLE_2}
      </p>
    </div>
  );
};
