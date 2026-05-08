type HeaderByPathType = {
  label: string;
  path: string;
};

export const headerByPath: HeaderByPathType[] = [
  {
    label: "위치 인증하기",
    path: "/verify",
  },
  {
    label: "운동 인증하기",
    path: "/verify/health",
  },
  { label: "리더보드", path: "/leaderboard" },
  {
    label: "새 게시물",
    path: "/community/free/new",
  },
  {
    label: "새 질문",
    path: "/community/question/new",
  },
  {
    label: "답변 쓰기",
    path: "/community/answer/new",
  },
  {
    label: "게시물 수정",
    path: "/community/free/edit",
  },
  {
    label: "질문 수정",
    path: "/community/question/edit",
  },
  {
    label: "답변 수정",
    path: "/community/answer/edit",
  },
  {
    label: "댓글",
    path: "/community/free",
  },
  {
    label: "대기 중인 게시물",
    path: "/community/local-posts",
  },
  {
    label: "예약/수강 내역",
    path: "/market/reservations",
  },
  {
    label: "운동 클래스 찾기",
    path: "/market",
  },
  {
    label: "후기 작성",
    path: "/market/review",
  },
];

export const adminHeaderByPath: HeaderByPathType[] = [
  {
    label: "대시보드",
    path: "/admin/dashboard",
  },
  {
    label: "사용자 관리",
    path: "/admin/users",
  },
  {
    label: "MZTK 지급 기록",
    path: "/admin/token-logs",
  },
  {
    label: "게시판 관리",
    path: "/admin/posts",
  },
];
