import Lottie from "lottie-react";
import runnerAnimation from "@assets/runner.json";

export const OnboardingAnimation = () => {
  return (
    <div className="flex-1 flex justify-center items-center">
      <div className="w-80 h-80">
        <Lottie animationData={runnerAnimation} loop={true} />
      </div>
    </div>
  );
};
