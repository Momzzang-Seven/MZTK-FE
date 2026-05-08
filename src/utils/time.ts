export const calculateEndTime = (
  startTime: string,
  durationStr: string
): string => {
  if (!startTime || !durationStr) return startTime;

  let minutes = 0;

  // "1시간 30분", "50분", "2시간" 등의 형식 파싱
  const hourMatch = durationStr.match(/(\d+)\s*시간/);
  if (hourMatch) minutes += parseInt(hourMatch[1], 10) * 60;

  const minMatch = durationStr.match(/(\d+)\s*분/);
  if (minMatch) minutes += parseInt(minMatch[1], 10);

  // 만약 "시간"이나 "분"이라는 단어 없이 숫자만 있다면 분으로 취급
  if (minutes === 0) {
    const pureNumber = parseInt(durationStr.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(pureNumber) && pureNumber > 0) {
      minutes = pureNumber;
    }
  }

  // 시간을 못 얻으면 그대로 시작시간만 반환
  if (minutes === 0) return startTime;

  const [startHourStr, startMinStr] = startTime.split(":");
  const startHour = parseInt(startHourStr, 10);
  const startMin = parseInt(startMinStr, 10);

  if (isNaN(startHour) || isNaN(startMin)) return startTime;

  const totalEndMin = startHour * 60 + startMin + minutes;
  const endHour = Math.floor(totalEndMin / 60) % 24;
  const endMin = totalEndMin % 60;

  return `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
};

export const getKstDateString = (date = new Date()): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
};
