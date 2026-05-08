import {
  AttendanceBanner,
  LeaderboardBanner,
  LevelProgress,
  AuthActionButtons,
  AuthChoiceModal,
} from "@components/home";
import { useEffect, useState } from "react";
import { useUserStore } from "@store/userStore";

const Home = () => {
  const { initAttendance, initLevel, initLocation, initWorkoutCompletion } =
    useUserStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    initAttendance();
    initLevel();
    initLocation();
    initWorkoutCompletion();
  }, [initAttendance, initLevel, initLocation, initWorkoutCompletion]);

  const handleExerciseAuth = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white px-5 pt-6 pb-20 overflow-y-auto gap-5 relative">
      {/* 1. Banners */}
      <div className="flex flex-col gap-4">
        <AttendanceBanner />
        <LeaderboardBanner />
      </div>

      {/* 2. Level Progress (Center) */}
      <div className="w-full flex justify-center -mt-4">
        <LevelProgress />
      </div>

      {/* 3. Action Buttons (Bottom) */}
      <AuthActionButtons onExerciseClick={handleExerciseAuth} />

      {/* Auth Method Selection Modal */}
      <AuthChoiceModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default Home;
