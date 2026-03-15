import { useState, useEffect, useCallback } from "react";
import { attendanceService } from "@/services/attendance";
import type { 
  AttendanceStatus, 
  WeeklyAttendance, 
  CheckInResponse 
} from "@/types/attendance";

/**
 * 출석 관련 기능을 관리하는 커스텀 훅
 */
export const useAttendance = () => {
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [weekly, setWeekly] = useState<WeeklyAttendance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 출석 상태 및 기록 조회
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statusRes, weeklyRes] = await Promise.all([
        attendanceService.getStatus(),
        attendanceService.getWeekly()
      ]);
      setStatus(statusRes);
      setWeekly(weeklyRes);
    } catch (err) {
      console.error("출석 정보 조회 실패:", err);
      setError("출석 정보를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 출석 체크(체크인) 수행
   */
  const checkIn = async (): Promise<CheckInResponse | null> => {
    try {
      const result = await attendanceService.checkIn();
      // 출석 성공 후 데이터 최신화
      await fetchData();
      return result;
    } catch (err: any) {
      console.error("출석 체크 실패:", err);
      const message = err.response?.data?.message || "출석 체크에 실패했습니다.";
      setError(message);
      return null;
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    status,
    weekly,
    loading,
    error,
    checkIn,
    refresh: fetchData
  };
};
