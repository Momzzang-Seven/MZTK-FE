import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MARKET_TEXT } from "@constant";
import { useTokenBalance } from "@hooks";
import { getMarketClasses, type MarketClassItem } from "@services";
import { useUserStore } from "@store/userStore";

const IMAGE_BASE_URL =
    (import.meta.env.VITE_IMAGE_BASE_URL as string | undefined) ||
    "https://mztk-bucket.s3.ap-northeast-2.amazonaws.com/";
const PLACEHOLDER_IMAGE = "/icon/gallery.svg";

const buildMarketplaceImageUrl = (objectKey: string | null) => {
    if (!objectKey) {
        return PLACEHOLDER_IMAGE;
    }

    if (/^https?:\/\//.test(objectKey)) {
        return objectKey;
    }

    const normalizedBase = IMAGE_BASE_URL.endsWith("/") ? IMAGE_BASE_URL : `${IMAGE_BASE_URL}/`;
    const normalizedKey = objectKey.startsWith("/") ? objectKey.slice(1) : objectKey;

    return `${normalizedBase}${normalizedKey}`;
};

const formatCategory = (category: string) => {
    switch (category) {
        case "PT":
            return "PT/헬스";
        case "PILATES":
            return "필라테스";
        case "YOGA":
            return "요가";
        case "GOLF":
            return "골프";
        case "TENNIS":
            return "테니스";
        case "CROSSFIT":
            return "크로스핏";
        case "BOXING":
            return "복싱";
        case "DANCE":
            return "댄스";
        case "REHABILITATION":
            return "재활";
        default:
            return "기타";
    }
};

const formatBalance = (balance: string) => {
    const numericBalance = Number(balance);
    return Number.isFinite(numericBalance) ? numericBalance.toLocaleString() : balance;
};

const matchesCategoryTab = (category: string, activeTab: string) => {
    if (activeTab === MARKET_TEXT.TABS.ALL) {
        return true;
    }

    if (activeTab === MARKET_TEXT.TABS.PT) {
        return category === "PT";
    }

    if (activeTab === MARKET_TEXT.TABS.PILATES) {
        return category === "PILATES" || category === "YOGA";
    }

    if (activeTab === MARKET_TEXT.TABS.GOLF) {
        return category === "GOLF" || category === "TENNIS";
    }

    return formatCategory(category).includes(activeTab);
};

const Market = () => {
    const { gymLocation } = useUserStore();
    const { balance } = useTokenBalance();
    const [activeTab, setActiveTab] = useState(MARKET_TEXT.TABS.ALL);
    const [searchQuery, setSearchQuery] = useState("");
    const [classes, setClasses] = useState<MarketClassItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const navigate = useNavigate();

    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const loadClasses = async () => {
            try {
                setIsLoading(true);
                const response = await getMarketClasses({
                    lat: gymLocation?.lat,
                    lng: gymLocation?.lng,
                    page: 0,
                });

                if (!isMounted) return;

                setClasses(response.items ?? []);
                setLoadError("");
            } catch (error) {
                console.error("Failed to load marketplace classes", error);
                if (!isMounted) return;
                setLoadError("클래스 목록을 불러오지 못했습니다.");
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadClasses();

        return () => {
            isMounted = false;
        };
    }, [gymLocation?.lat, gymLocation?.lng]);

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
        const walk = (x - startX) * 1.5;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const filteredClasses = classes
        .filter((cls) => {
            const matchesTab = matchesCategoryTab(cls.category, activeTab);
            const normalizedQuery = searchQuery.trim().toLowerCase();
            const tags = cls.tags ?? [];
            const matchesSearch =
                normalizedQuery.length === 0 ||
                cls.title.toLowerCase().includes(normalizedQuery) ||
                tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

            return matchesTab && matchesSearch;
        })
        .sort(
            (a, b) =>
                (a.distance ?? Number.MAX_SAFE_INTEGER) -
                (b.distance ?? Number.MAX_SAFE_INTEGER)
        );

    return (
        <div className="flex flex-col h-full bg-gray-50 min-h-screen">
            <div className="flex-1 overflow-y-auto pb-24">
                <div className="bg-main/10 px-5 pt-10 pb-6 flex flex-col gap-2 relative">
                    <h1 className="text-2xl font-bold border-b-2 border-main w-fit pb-1 border-opacity-30">운동 클래스 찾기</h1>
                    <p className="text-gray-600 text-sm font-medium leading-relaxed">원하는 운동 클래스를 찾아<br />지금 바로 시작해 보세요.</p>

                    <div className="absolute top-10 right-5 bg-main text-white px-4 py-2 rounded-2xl shadow-md flex items-center gap-2 active:scale-95 transition-transform cursor-pointer select-none">
                        <img src="/icon/token.svg" alt="token" className="w-5 h-5 brightness-0 invert drop-shadow-sm" />
                        <span className="font-bold text-[17px] tabular-nums tracking-wide mt-[1px]">
                            {formatBalance(balance)}
                        </span>
                    </div>
                </div>

                <div className="px-5 mt-4 mb-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center px-4 py-3 focus-within:ring-2 focus-within:ring-main/20 focus-within:border-transparent transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400 mr-2">
                            <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 22L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <input
                            type="text"
                            placeholder="원하는 클래스나 태그를 검색해 보세요."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-gray-400 font-medium text-gray-800"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 font-bold ml-2">×</button>
                        )}
                    </div>
                </div>

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
                                className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all shadow-sm flex-shrink-0 border border-transparent pointer-events-auto ${activeTab === tab ? "bg-gray-800 text-white" : "bg-white text-gray-500 !border-gray-200"}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-5 py-2 flex flex-col gap-4">
                    {loadError && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                            {loadError}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="py-20 flex items-center justify-center text-gray-400 font-medium">
                            클래스 목록을 불러오는 중입니다...
                        </div>
                    ) : filteredClasses.length > 0 ? (
                        filteredClasses.map((cls) => (
                            <div
                                key={cls.classId}
                                onClick={() => navigate(`/market/${cls.classId}`)}
                                className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col cursor-pointer active:scale-[0.98] transition-all"
                            >
                                <div className="h-[160px] relative overflow-hidden bg-gray-200">
                                    <img
                                        src={buildMarketplaceImageUrl(cls.thumbnailFinalObjectKey)}
                                        alt={cls.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                                        {MARKET_TEXT.TICKET.NEW_BADGE}
                                    </div>
                                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
                                        {formatCategory(cls.category)}
                                    </div>
                                </div>

                                <div className="p-4 flex flex-col gap-2.5">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-[16px] text-gray-800 leading-tight line-clamp-2 break-keep">
                                            {cls.title}
                                        </h3>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">
                                            {cls.durationMinutes}분 수업
                                        </span>
                                        <div className="text-xs font-bold text-gray-400">
                                            클래스 #{cls.classId}
                                        </div>
                                    </div>

                                    <div className="flex gap-1.5 flex-wrap">
                                        {(cls.tags ?? []).map((tag) => (
                                            <span key={tag} className="text-[10px] font-bold text-main bg-main/10 px-2 py-1 rounded">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="h-[1px] w-full bg-gray-100 my-1"></div>

                                    <div className="flex justify-between items-center w-full">
                                        <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" className="fill-main" />
                                            </svg>
                                            <span className="text-[12px] font-bold tracking-tight mt-[1px]">
                                                {cls.distance != null ? "내 위치 기준" : "위치 정보 없음"}
                                                {cls.distance != null && (
                                                    <span className="text-gray-400 font-medium ml-1">
                                                        ({(cls.distance / 1000).toFixed(1)}km)
                                                    </span>
                                                )}
                                            </span>
                                        </div>

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
