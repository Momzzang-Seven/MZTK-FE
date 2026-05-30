import { useState } from "react";

export const useTrainerStatus = () => {
  const [isRestricted, setIsRestricted] = useState(false);
  const [isAppealing, setIsAppealing] = useState(false);

  const handleAppeal = async () => {
    if (isAppealing) return;

    setIsAppealing(true);
    try {
      setIsRestricted(false);
    } catch (error) {
      console.error("Failed to appeal:", error);
      throw error;
    } finally {
      setIsAppealing(false);
    }
  };

  return {
    isRestricted,
    handleAppeal,
    isAppealing,
  };
};
