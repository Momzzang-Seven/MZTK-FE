import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MARKET_TEXT } from "@constant";
import { useUserStore } from "@store/userStore";
import { getDistanceFromLatLonInMeters } from "@utils";
import { useTokenBalance } from "@hooks";

// 임시 더미 데이터 (마켓 클래스 목록)
const DUMMY_CLASSES = [
    {
        id: 1,
        title: "1:1 집중 웨이트 트레이닝",
        category: "PT/헬스",
        trainerName: "김근육 트레이너",
        price: "350",
        rating: "4.9",
        reviewCount: 128,
        images: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"],
        location: "서울 역삼동",
        lat: 37.498,
        lng: 127.032,
        capacity: 1,
        tags: ["체형 교정", "다이어트", "퍼스널 트레이닝"]
    },
    {
        id: 2,
        title: "체형 교정 & 코어 강화 소그룹 PT (정원 4명)",
        category: "요가/필라테스",
        trainerName: "이유연 강사",
        price: "180",
        rating: "4.8",
        reviewCount: 85,
        images: ["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop"],
        location: "서울 논현동",
        lat: 37.511,
        lng: 127.033,
        capacity: 4,
        tags: ["바른 자세", "코어 강화", "통증 완화"]
    },
    {
        id: 3,
        title: "바디프로필 준비반 (식단 밀착 관리 포함)",
        category: "PT/헬스",
        trainerName: "박태환 강사",
        price: "500",
        rating: "5.0",
        reviewCount: 42,
        images: ["https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop"],
        location: "서울 신사동",
        lat: 37.524,
        lng: 127.022,
        capacity: 2,
        tags: ["바디프로필", "식단관리", "근육량 증가"]
    },
];

const Market = () => {
    const { gymLocation } = useUserStore();
    const { balance } = useTokenBalance();
    const [activeTab, setActiveTab] = useState(MARKET_TEXT.TABS.ALL);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    // 드래그 스크롤 관련 상태 및 ref
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // 스크롤 속도
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    // 필터링 및 거리순 정렬 로직
    const filteredClasses = DUMMY_CLASSES.filter(cls => {
        const matchesTab = activeTab === MARKET_TEXT.TABS.ALL ? true : cls.category.includes(activeTab);
        const matchesSearch = cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cls.trainerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cls.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTab && matchesSearch;
    }).map(cls => {
        // [수정] 사용자의 등록된 위치(gymLocation)가 없는 경우 기본값(강남역)을 사용하여 테스트할 수 있도록 처리
        const userLat = gymLocation?.lat || 37.4979;
        const userLng = gymLocation?.lng || 127.0276;
        const distance = getDistanceFromLatLonInMeters(userLat, userLng, cls.lat, cls.lng);

        return { ...cls, distance };
    }).sort((a, b) => a.distance - b.distance);

    return (
        <div className="flex flex-col h-full bg-gray-50 min-h-screen">
            <div className="flex-1 overflow-y-auto pb-24">
                {/* 상단 배너 섹션 */}
                <div className="bg-main/10 px-5 pt-10 pb-6 flex flex-col gap-2 relative">
                    <h1 className="text-2xl font-bold border-b-2 border-main w-fit pb-1 border-opacity-30">운동 클래스 찾기</h1>
                    <p className="text-gray-600 text-sm font-medium leading-relaxed">마음에 드는 운동 클래스를 찾아<br />지금 바로 시작해 보세요!</p>

                    {/* 잔여 MZT 표시 (우측 배치) */}
                    <div className="absolute top-10 right-5 bg-main text-white px-4 py-2 rounded-2xl shadow-md flex items-center gap-2 active:scale-95 transition-transform cursor-pointer select-none">
                        <img src="/icon/token.svg" alt="token" className="w-5 h-5 brightness-0 invert drop-shadow-sm" />
                        <span className="font-bold text-[17px] tabular-nums tracking-wide mt-[1px]">
                            {balance.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* 검색 바 */}
                <div className="px-5 mt-4 mb-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center px-4 py-3 focus-within:ring-2 focus-within:ring-main/20 focus-within:border-transparent transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400 mr-2">
                            <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 22L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <input
                            type="text"
                            placeholder="원하는 클래스와 트레이너를 검색해보세요"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-gray-400 font-medium text-gray-800"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 font-bold ml-2">✕</button>
                        )}
                    </div>
                </div>

                {/* 카테고리 탭 */}
                <div
                    ref={scrollRef}
                    className="w-full overflow-x-auto scrollbar-hide sticky top-0 bg-gray-50 z-10 cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >
                    <div className="flex gap-2 px-5 py-4 w-max pointer-events-none">
                        {[MARKET_TEXT.TABS.ALL, MARKET_TEXT.TABS.PT, MARKET_TEXT.TABS.PILATES, MARKET_TEXT.TABS.GOLF].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all shadow-sm flex-shrink-0 border border-transparent pointer-events-auto
                                    ${activeTab === tab ? "bg-gray-800 text-white" : "bg-white text-gray-500 !border-gray-200"}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 클래스 목록 */}
                <div className="px-5 py-2 flex flex-col gap-4">
                    {filteredClasses.length > 0 ? (
                        filteredClasses.map((cls) => (
                            <div
                                key={cls.id}
                                onClick={() => navigate(`/market/${cls.id}`)}
                                className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col cursor-pointer active:scale-[0.98] transition-all"
                            >
                                {/* 이미지 영역 */}
                                <div className="h-[160px] relative overflow-hidden bg-gray-200">
                                    <img src={cls.images?.[0] || ""} alt={cls.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                                        {MARKET_TEXT.TICKET.NEW_BADGE}
                                    </div>
                                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
                                        {cls.category}
                                    </div>
                                </div>

                                {/* 텍스트 영역 */}
                                <div className="p-4 flex flex-col gap-2.5">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md border border-green-200">
                                            {cls.capacity === 1 ? '👤 1:1 레슨' : `👥 정원 ${cls.capacity}명`}
                                        </span>

                                    </div>
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-[16px] text-gray-800 leading-tight line-clamp-2 break-keep">
                                            {cls.title}
                                        </h3>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">{cls.trainerName}</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-yellow-400 text-xs">{MARKET_TEXT.TICKET.RATING}</span>
                                            <span className="text-xs font-bold text-gray-800">{cls.rating}</span>
                                            <span className="text-xs text-gray-400">({cls.reviewCount})</span>
                                        </div>
                                    </div>

                                    {/* 해시태그 */}
                                    <div className="flex gap-1.5 flex-wrap">
                                        {cls.tags.map(tag => (
                                            <span key={tag} className="text-[10px] font-bold text-main bg-main/10 px-2 py-1 rounded">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="h-[1px] w-full bg-gray-100 my-1"></div>

                                    <div className="flex justify-between items-center w-full">
                                        {/* 위치 및 거리 표시 영역 (왼쪽) */}
                                        <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" className="fill-main" />
                                            </svg>
                                            <span className="text-[12px] font-bold tracking-tight mt-[1px]">
                                                {cls.location}
                                                {cls.distance !== Infinity && (
                                                    <span className="text-gray-400 font-medium ml-1">
                                                        ({(cls.distance / 1000).toFixed(1)}km)
                                                    </span>
                                                )}
                                            </span>
                                        </div>

                                        {/* 가격 표시 영역 (오른쪽) */}
                                        <div className="flex justify-end items-center gap-1.5">
                                            <div className="w-[18px] h-[18px] rounded-full bg-main flex items-center justify-center text-white text-[10px] font-bold">
                                                {MARKET_TEXT.TICKET.PRICE_UNIT}
                                            </div>
                                            <span className="font-bold text-[17px] text-gray-800">{cls.price}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <img src="/icon/search.svg" alt="empty" className="w-8 h-8 opacity-30" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-gray-700 mb-1">{MARKET_TEXT.EMPTY_STATE.TITLE}</h3>
                                <p className="text-sm text-gray-400 whitespace-pre-line">{MARKET_TEXT.EMPTY_STATE.DESC}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Market;
