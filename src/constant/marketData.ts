export const DUMMY_DETAILS: Record<string, any> = {
    "1": {
        id: "1",
        title: "1:1 집중 웨이트 트레이닝",
        category: "PT/헬스",
        trainerName: "김근육 트레이너",
        price: 350,
        rating: "4.9",
        reviewCount: 128,
        capacity: 1, // 정원
        images: [
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop"
        ],
        tags: ["체형 교정", "다이어트", "퍼스널 트레이닝"],
        description: "개개인의 체형과 근력 상태를 분석하여 최적의 방향으로 웨이트 트레이닝을 진행합니다. 초보자도 부상 없이 빠르고 정확하게 자극을 느낄 수 있도록 밀착 코칭합니다.",
        features: ["철저한 1:1 체형 분석 및 평가", "개인 맞춤형 식단 가이드 제공", "수업 외 카카오톡 밀착 코칭"],
        duration: "50분",
        supplies: "실내용 개인 선호 운동화, 편한 운동복",
        operatingDays: ["월", "수", "금"],
        operatingTimes: {
            월: ["09:00", "13:00", "18:00"],
            수: ["09:00", "13:00", "18:00"],
            금: ["09:00", "10:00", "11:00"],
        },
        location: "서울 역삼동",
        address: "서울특별시 강남구 테헤란로 123 4층",
        phone: "02-1234-5678",
        sns: { insta: "@muscle_kim" }
    },
    "2": {
        id: "2",
        title: "체형 교정 & 코어 강화 소그룹 PT (정원 4명)",
        category: "요가/필라테스",
        trainerName: "이유연 강사",
        price: 180,
        rating: "4.8",
        reviewCount: 85,
        capacity: 4, // 정원 4명
        images: [
            "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop"
        ],
        tags: ["바른 자세", "코어 강화", "통증 완화"],
        description: "현대인의 고질적인 거북목, 라운드 숄더 개선을 위한 소그룹 수업입니다. 4인 이하의 그룹으로 진행되어 합리적인 가격에 섬세한 코칭을 받을 수 있습니다.",
        features: ["기본 코어 근육 강화 훈련", "잘못된 생활 습관 및 체형 교정", "그룹이지만 꼼꼼한 개별 자세 확인"],
        duration: "50분",
        supplies: "요가복 또는 신축성 있는 운동복 (양말 불필요)",
        operatingDays: ["화", "목", "토"],
        operatingTimes: {
            화: ["10:00", "14:00", "19:00"],
            목: ["10:00", "14:00", "19:00"],
            토: ["09:00", "11:00", "13:00"],
        },
        location: "서울 논현동",
        address: "서울특별시 강남구 강남대로 456 2층",
        phone: "02-9876-5432",
        sns: { insta: "@flex_lee" }
    },
    "3": {
        id: "3",
        title: "바디프로필 준비반 (식단 밀착 관리 포함)",
        category: "PT/헬스",
        trainerName: "박태환 강사",
        price: 500,
        rating: "5.0",
        reviewCount: 42,
        capacity: 2, // 정원 2명
        images: [
            "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop"
        ],
        tags: ["바디프로필", "식단관리", "근육량 증가"],
        description: "목표가 확실한 분들을 위한 바디프로필 전용 클래스입니다. 단기간 내에 최상의 근육 데피니션을 끌어내기 위한 강력한 운동 프로그램과 수분/식단 관리가 병행됩니다.",
        features: ["주차별 체지방량 모니터링", "D-Day 수분/밴딩/로딩 스케줄 관리", "스튜디오 촬영 시 펌핑 어시스트"],
        duration: "60분",
        supplies: "개인 운동화, 세면도구, 강한 의지",
        operatingDays: ["월", "화", "수", "목", "금"],
        operatingTimes: {
            월: ["06:00", "12:00", "18:00", "20:00"],
            화: ["06:00", "12:00", "18:00", "20:00"],
            수: ["06:00", "12:00", "18:00", "20:00"],
            목: ["06:00", "12:00", "18:00", "20:00"],
            금: ["06:00", "12:00", "18:00", "20:00"],
        },
        location: "서울 신사동",
        address: "서울특별시 강남구 도산대로 789 B1",
        phone: "02-5555-7777",
        sns: { insta: "@park_bodyprofile" }
    }
};
