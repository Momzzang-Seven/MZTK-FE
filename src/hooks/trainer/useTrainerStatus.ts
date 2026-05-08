import { useState, useEffect } from "react";
import { getTrainerStatus, postTrainerAppeal } from "@services";

export const useTrainerStatus = () => {
  const [isRestricted, setIsRestricted] = useState(false);
  const [isAppealing, setIsAppealing] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await getTrainerStatus();
        // Assuming the API returns { isRestricted: boolean }
        if (res.isRestricted) {
          setIsRestricted(true);
        }
      } catch (error) {
        // If API fails or doesn't exist, we might want to handle it.
        // For now, we'll just log it.
        console.error("Failed to fetch trainer status:", error);
      }
    };

    checkStatus();
  }, []);

  const handleAppeal = async () => {
    if (isAppealing) return;

    setIsAppealing(true);
    try {
      await postTrainerAppeal("이의 신청합니다.");
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
