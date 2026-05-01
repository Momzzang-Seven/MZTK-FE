export const TRAINER_DASHBOARD_TEXT = {
    TITLE: "트레이너 센터",
    GREETING: (name: string) => `안녕하세요, 트레이너 ${name}님`,
    MENU_GROUPS: [
        {
            groupName: "클래스 관리",
            items: [
                { title: "클래스 등록하기", icon: "/icon/dumbell.svg", path: "/trainer/register-ticket", bgClass: "bg-main", filterClass: "brightness-200" },
                { title: "내 클래스 목록", icon: "/icon/paste.svg", path: "/trainer/list", bgClass: "bg-main", filterClass: "brightness-200" },
            ]
        },
        {
            groupName: "예약 및 후기",
            items: [
                { title: "예약 확인하기", icon: "/icon/clock.svg", path: "/trainer/reservations", bgClass: "bg-main", filterClass: "brightness-200" },
                { title: "후기 보기", icon: "/icon/comment.svg", path: "/trainer/reviews", bgClass: "bg-main", filterClass: "brightness-200" },
            ]
        },
        {
            groupName: "매장 관리",
            items: [
                { title: "매장 및 클래스 장소 등록/수정", icon: "/icon/pin.svg", path: "/trainer/store-register", bgClass: "bg-main", filterClass: "brightness-200" },
            ]
        }
    ],
    CREATE_BUTTON: "새로운 클래스 등록하기",
};

export const CREATE_TICKET_TEXT = {
    TITLE: "클래스 등록",
    LABELS: {
        TITLE: "클래스 제목",
        CATEGORY: "카테고리",
        PRICE: "1회당 가격 (MZTK)",
        CAPACITY: "정원 (명)",
        DESC: "프로그램 상세 소개",
        FEATURES: "프로그램 특징 (선택)",
        DURATION: "수업 시간",
        SUPPLIES: "준비물",
        OPERATING_DAYS: "운영 요일",
        OPERATING_DAYS_DESC: "클래스를 운영하는 요일을 모두 선택해 주세요.",
        OPERATING_HOURS: "클래스 시간",
        OPERATING_HOURS_DESC: "선택한 요일의 클래스 시작 시간을 추가해 주세요.",
        TIMES: "수업 가능 시간 선택",
        IMAGE: "대표 이미지",
    },
    PLACEHOLDERS: {
        TITLE: "예) 1:1 집중 웨이트 트레이닝",
        PRICE: "예) 500",
        CAPACITY: "예) 4",
        DESC: "프로그램에 대해 자세히 설명해주세요",
        FEATURE: "예) 체형 분석 및 맞춤형 식단 제공",
        DURATION: "예) 50분",
        SUPPLIES: "예) 실내용 운동화, 개인 텀블러",
        TIMES: "예) 18:00 (입력 후 추가)",
    },
    SUBMIT: "등록하기",
};

export const EDIT_TICKET_TEXT = {
    TITLE: "클래스 수정",
    SUBMIT: "수정 완료",
};
