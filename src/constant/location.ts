export const LOCATION_CONSTANTS = {
  DEFAULT_CENTER: { lat: 37.5665, lng: 126.978 },
  DEFAULT_ZOOM: 17,
  ANIMATION_DURATION: 2000,
  VERIFICATION_RADIUS: 20,
};

export const UI_TEXT = {
  HEADER_TITLE: "위치 등록하기",
  HEADER_TIP: "Tip. 지도를 움직여 헬스장 위치를 맞춰주세요 (반경 20m)",
  PHRASE_REGISTER_LOC: "등록 위치",
  PHRASE_SELECT_LOC: "위치를 선택해주세요",
  REGISTER_BTN: "여기로 등록할게요!",
  REGISTERING_BTN: "등록 중...",
  LOADING_TITLE: "위치 등록중...",
  LOADING_DESC: "조금만 기다려주세요!",
  MY_LOCATION_TOOLTIP: "현위치",
};

export const VERIFY_TEXT = {
  TITLE: "위치 인증하기",
  DISTANCE_PREFIX: "현재 헬스장까지 거리: ",
  DISTANCE_UNIT: "m",
  WARNING_OUT_OF_RANGE: "인증 반경(20m)을 벗어났습니다",
  BTN_VERIFY: "위치 인증하기",
  BTN_MOVE_TO_RANGE: "인증 위치로 이동해주세요",
  MODAL_PERM_TITLE: "위치 권한을 허용해주세요",
  MODAL_PERM_DESC: "서비스 이용을 위해 위치 정보 접근 권한이 필요합니다.",
  MODAL_RETRY: "다시 시도하기",
  MODAL_REG_DESC:
    "<span class='text-lg font-bold'>등록된 운동 위치가 없어요.<br/>등록하시겠어요?</span>",
  MODAL_REG_CONFIRM: "운동 위치 등록하기",
  MODAL_FAIL_TITLE: "위치 인증에 실패했어요",
  SUCCESS_TITLE: "오늘도 운동 성공!",
  SUCCESS_XP: "+100EXP",
};
