import {
  AttendanceBanner,
  LeaderboardBanner,
  LevelProgress,
  AuthActionButtons,
  AuthChoiceModal,
} from "@components/home";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@store/userStore";

const Home = () => {
  const { gymLocation } = useUserStore();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleExerciseAuth = () => {
    setIsAuthModalOpen(true);
  };

  const handleLocationAuth = () => {
    if (gymLocation) {
      navigate("/verify");
    } else {
      navigate("/location-register");
    }
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
      <AuthActionButtons
        onExerciseClick={handleExerciseAuth}
        onLocationClick={handleLocationAuth}
      />

      {/* Auth Method Selection Modal */}
      <AuthChoiceModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default Home;
