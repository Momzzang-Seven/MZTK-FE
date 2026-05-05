export const ADMIN_TEXT = {
  COMMON: {
    SEARCH: "검색",
    LOADING: "데이터를 불러오는 중입니다...",
    NO_RESULT: "검색 결과가 없습니다.",
    FILTER: {
      ALL: "전체 상태",
      ACTIVE: "활동",
      BANNED: "정지",
      POSTING: "게시 중", // For posts
      DELETED: "삭제됨", // For posts
      TRAINER: "트레이너",
      MEMBER: "회원",
      ALL_ROLES: "전체 역할",
    },
  },
  USER: {
    TITLE_TOTAL: "총 사용자",
    TITLE_BANNED: "정지된 사용자",
    SEARCH_PLACEHOLDER: "사용자의 ID 혹은 닉네임을 검색하세요",
    TABLE: {
      USER: "사용자",
      EMAIL: "이메일",
      JOIN_DATE: "가입일",
      STATUS: "상태",
      ACTIVITY: "활동",
      MANAGE: "관리",
    },
    BTN_BAN: "정지",
    BTN_UNBAN: "해제",
    MSG_BAN_SUCCESS: "사용자를 정지했습니다.",
    MSG_UNBAN_SUCCESS: "사용자 정지를 해제했습니다.",
    MSG_BAN_FAILED: "사용자 정지에 실패했습니다.",
    MSG_UNBAN_FAILED: "사용자 정지 해제에 실패했습니다.",
  },
  POST: {
    SEARCH_PLACEHOLDER: "포스트 혹은 댓글 내용을 검색하세요",
    BTN_DELETE_POST: "게시글 삭제",
    BTN_RESTORE_POST: "게시글 복구",
    BTN_DELETE_COMMENT: "삭제",
    BTN_RESTORE_COMMENT: "복구",
    LABEL_COMMENT: "댓글",
    LABEL_DELETED_COMMENT: "삭제된 댓글",
    BTN_COMMENT_FOLD: "댓글 접기",
    BTN_COMMENT_MORE: "댓글 더보기",
    MSG_NO_MORE_POSTS: "더 이상 표시할 게시글이 없습니다.",
    REASONS: [
      "부적절한 내용",
      "저작권 위반",
      "스팸/광고",
      "어뷰징/무의미한 도배",
      "기타",
    ],
    MODAL: {
      TITLE: "정말로 %TYPE%을 삭제하시겠어요?", // Placeholder for formatted string
      SELECT_REASON: "이유를 선택해주세요",
      BTN_CANCEL: "취소",
      BTN_DELETE: "삭제",
    },
  },
};
