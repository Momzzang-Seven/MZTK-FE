export interface CheckInResponse {
  success: boolean;
  attendedDate: string; // LocalDate (ISO 8601)
  grantedXp: number;
  bonusXp: number;
  streakDays: number;
  message: string;
}

export interface AttendanceStatus {
  today: string; // LocalDate (ISO 8601)
  hasAttendedToday: boolean;
  streakCount: number;
}

export interface WeeklyAttendance {
  range: {
    from: string;
    to: string;
  };
  attendedDates: string[]; // List<LocalDate>
  attendedCount: number;
}
