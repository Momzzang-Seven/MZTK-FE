import { api } from "./client";
import type {
  CheckInResponse,
  AttendanceStatus,
  WeeklyAttendance,
} from "../types/attendance";

/**
 * 출석 관련 API 서비스
 */
export const attendanceService = {
  /**
   * 출석 체크 (체크인) 수행
   */
  async checkIn(): Promise<CheckInResponse> {
    const response = await api.post("/users/me/attendance");
    return response.data.data;
  },

  /**
   * 오늘 출석 여부 및 현재 연속 출석 일수 조회
   */
  async getStatus(): Promise<AttendanceStatus> {
    const response = await api.get("/users/me/attendance/status");
    return response.data.data;
  },

  /**
   * 최근 1주일간의 출석 기록 조회
   */
  async getWeekly(): Promise<WeeklyAttendance> {
    const response = await api.get("/users/me/attendance/weekly");
    return response.data.data;
  },
};
