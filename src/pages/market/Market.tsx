import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MARKET_TEXT } from "@constant";
import { useUserStore } from "@store/userStore";
import { useTokenBalance } from "@hooks";
import { getMarketClasses, type MarketClassItem } from "@services";

const Market = () => {
    const { gymLocation } = useUserStore();
    const { balance } = useTokenBalance();
    const [activeTab, setActiveTab] = useState(MARKET_TEXT.TABS.ALL);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const [classes, setClasses] = useState<MarketClassItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            try {
                // TODO: searchQuery 및 activeTab 반영 (카테고리 매핑 필요)
                const res = await getMarketClasses({
                    // lat: gymLocation?.lat,
                    // lng: gymLocation?.lng,
                    page: 0
                });
                setClasses(res?.items || []);
            } catch (err) {
                console.error("Failed to fetch classes", err);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, [gymLocation, activeTab]); // searchQuery는 디바운스 등의 처리가 필요할 수 있으므로 일단 탭과 위치변경시에만 호출 (프론트 필터링 가능)

    // 프론트엔드에서 검색어 필터링 (api에서 title 검색을 지원하지 않으므로)
    const filteredClasses = classes.filter(cls => {
        // activeTab 매핑
        let matchesTab = true;
        if (activeTab !== MARKET_TEXT.TABS.ALL) {
            matchesTab = cls.category === activeTab || (activeTab === MARKET_TEXT.TABS.PT && cls.category === 'PT'); // 임시
        }
        const matchesSearch = cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cls.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTab && matchesSearch;
    });

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
                    {loading ? (
                        <div className="text-center py-20 text-gray-400 font-medium">불러오는 중...</div>
                    ) : filteredClasses.length > 0 ? (
                        filteredClasses.map((cls) => (
                            <div
                                key={cls.classId}
                                onClick={() => navigate(`/market/${cls.classId}`)}
                                className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col cursor-pointer active:scale-[0.98] transition-all"
                            >
                                {/* 이미지 영역 */}
                                <div className="h-[160px] relative overflow-hidden bg-gray-200">
                                    {cls.thumbnailFinalObjectKey ? (
                                        <img src={cls.thumbnailFinalObjectKey} alt={cls.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">이미지 없음</div>
                                    )}
                                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                                        {MARKET_TEXT.TICKET.NEW_BADGE}
                                    </div>
                                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
                                        {cls.category}
                                    </div>
                                </div>

                                {/* 텍스트 영역 */}
                                <div className="p-4 flex flex-col gap-2.5">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-[16px] text-gray-800 leading-tight line-clamp-2 break-keep">
                                            {cls.title}
                                        </h3>
                                    </div>

                                    {/* 해시태그 */}
                                    <div className="flex gap-1.5 flex-wrap">
                                        {cls.tags && cls.tags.map(tag => (
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
                                                {cls.distance !== null && cls.distance !== undefined ? (
                                                    <span>{(cls.distance / 1000).toFixed(1)}km</span>
                                                ) : (
                                                    <span>위치 미상</span>
                                                )}
                                            </span>
                                        </div>

                                        {/* 가격 표시 영역 (오른쪽) */}
                                        <div className="flex justify-end items-center gap-1.5">
                                            <div className="w-[18px] h-[18px] rounded-full bg-main flex items-center justify-center text-white text-[10px] font-bold">
                                                {MARKET_TEXT.TICKET.PRICE_UNIT}
                                            </div>
                                            <span className="font-bold text-[17px] text-gray-800">{cls.priceAmount.toLocaleString()}</span>
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
