import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  if (!objectKey) return PLACEHOLDER_IMAGE;
  if (/^https?:\/\//.test(objectKey)) return objectKey;
  const normalizedBase = IMAGE_BASE_URL.endsWith("/")
    ? IMAGE_BASE_URL
    : `${IMAGE_BASE_URL}/`;
  const normalizedKey = objectKey.startsWith("/")
    ? objectKey.slice(1)
    : objectKey;
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
    case "CROSSFIT":
      return "크로스핏";
    case "BOXING":
      return "복싱";
    case "DANCE":
      return "댄스";
    case "REHABILITATION":
      return "재활";
    case "OTHER":
      return "기타";
    default:
      return "기타";
  }
};

const matchesCategoryTab = (category: string, activeTab: string) => {
  if (activeTab === MARKET_TEXT.TABS.ALL) return true;
  if (activeTab === MARKET_TEXT.TABS.PT) return category === "PT";
  if (activeTab === MARKET_TEXT.TABS.PILATES) return category === "PILATES";
  if (activeTab === MARKET_TEXT.TABS.YOGA) return category === "YOGA";
  if (activeTab === MARKET_TEXT.TABS.CROSSFIT) return category === "CROSSFIT";
  return formatCategory(category).includes(activeTab);
};

const getCategoryParam = (activeTab: string) => {
  if (activeTab === MARKET_TEXT.TABS.PT) return "PT";
  if (activeTab === MARKET_TEXT.TABS.PILATES) return "PILATES";
  if (activeTab === MARKET_TEXT.TABS.YOGA) return "YOGA";
  if (activeTab === MARKET_TEXT.TABS.CROSSFIT) return "CROSSFIT";
  return undefined;
};

const mergeUniqueClasses = (items: MarketClassItem[]) =>
  Array.from(new Map(items.map((item) => [item.classId, item])).values());

const Market = () => {
  const gymLocation = useUserStore((state) => state.gymLocation);
  const { balance } = useTokenBalance();
  const [activeTab, setActiveTab] = useState(MARKET_TEXT.TABS.ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [classes, setClasses] = useState<MarketClassItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  const [loadError, setLoadError] = useState("");
  const navigate = useNavigate();

  const scrollRef = useRef<HTMLDivElement>(null);
  const pageScrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestSeqRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const buildParams = useCallback(
    (page: number) => ({
      lat: gymLocation?.lat,
      lng: gymLocation?.lng,
      category: getCategoryParam(activeTab),
      keyword: debouncedSearchQuery || undefined,
      page,
    }),
    [activeTab, debouncedSearchQuery, gymLocation?.lat, gymLocation?.lng]
  );

  useEffect(() => {
    let isMounted = true;
    const requestSeq = requestSeqRef.current + 1;
    requestSeqRef.current = requestSeq;

    const loadClasses = async () => {
      try {
        setIsLoading(true);
        const response = await getMarketClasses(buildParams(0));
        let nextClasses = response.items ?? [];
        let lastLoadedPage = response.currentPage ?? 0;
        const nextTotalPages = response.totalPages ?? 0;

        if (debouncedSearchQuery && nextTotalPages > 1) {
          for (
            let page = lastLoadedPage + 1;
            page < nextTotalPages;
            page += 1
          ) {
            const nextResponse = await getMarketClasses(buildParams(page));
            if (!isMounted || requestSeqRef.current !== requestSeq) return;
            nextClasses = nextClasses.concat(nextResponse.items ?? []);
            lastLoadedPage = nextResponse.currentPage ?? page;
          }
        }

        if (isMounted) {
          setClasses(mergeUniqueClasses(nextClasses));
          setCurrentPage(lastLoadedPage);
          setTotalPages(nextTotalPages);
          setLoadError("");
        }
      } catch {
        if (isMounted) setLoadError("클래스 목록을 불러오지 못했습니다.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void loadClasses();
    return () => {
      isMounted = false;
    };
  }, [buildParams, debouncedSearchQuery]);

  const hasNextPage =
    !debouncedSearchQuery && totalPages > 0 && currentPage + 1 < totalPages;

  const loadNextPage = useCallback(async () => {
    if (isLoading || isFetchingNext || !hasNextPage) return;

    try {
      setIsFetchingNext(true);
      const response = await getMarketClasses(buildParams(currentPage + 1));
      setClasses((prev) =>
        mergeUniqueClasses(prev.concat(response.items ?? []))
      );
      setCurrentPage(response.currentPage ?? currentPage + 1);
      setTotalPages(response.totalPages ?? totalPages);
      setLoadError("");
    } catch {
      setLoadError("클래스 목록을 더 불러오지 못했습니다.");
    } finally {
      setIsFetchingNext(false);
    }
  }, [
    buildParams,
    currentPage,
    hasNextPage,
    isFetchingNext,
    isLoading,
    totalPages,
  ]);

  useEffect(() => {
    if (!hasNextPage) return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadNextPage();
        }
      },
      {
        root: pageScrollRef.current,
        rootMargin: "240px 0px",
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, loadNextPage]);

  const filteredClasses = useMemo(
    () =>
      classes
        .filter((cls) => {
          const matchesTab = matchesCategoryTab(cls.category, activeTab);
          const normalizedQuery = debouncedSearchQuery.toLowerCase();
          const tags = cls.tags ?? [];
          return (
            matchesTab &&
            (normalizedQuery.length === 0 ||
              cls.title.toLowerCase().includes(normalizedQuery) ||
              tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)))
          );
        })
        .sort((a, b) => (a.distance ?? 999999) - (b.distance ?? 999999)),
    [activeTab, classes, debouncedSearchQuery]
  );

  return (
    <div className="flex flex-col h-full bg-[#FDFDFD] min-h-dvh">
      <div ref={pageScrollRef} className="flex-1 overflow-y-auto pb-32">
        {/* Luxury Hero Header */}
        <div className="relative px-6 pt-14 pb-12 overflow-hidden">
          {/* Decorative background gradients */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-main/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-amber-100/20 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col gap-2">
            <h1 className="text-[28px] font-black text-gray-900 tracking-tighter leading-tight">
              나만을 위한
              <br />
              <span className="text-main">완벽한 운동 클래스</span>
            </h1>
            <p className="text-gray-400 text-[13px] font-bold leading-relaxed max-w-[200px]">
              MZTK 토큰으로 시작하는
              <br />
              가장 스마트한 건강 관리
            </p>

            {/* Token Balance Badge */}
            <div
              onClick={() => navigate("/wallet")}
              className="absolute top-0 right-0 mt-2 bg-white rounded-[22px] px-4 py-2.5 shadow-xl shadow-gray-200/50 border border-gray-50 flex items-center gap-2.5 active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-main flex items-center justify-center shadow-lg shadow-main/20">
                <img
                  src="/icon/token.svg"
                  alt=""
                  className="w-3.5 h-3.5 brightness-0 invert"
                />
              </div>
              <span className="font-black text-[16px] text-gray-800 tabular-nums">
                {Number(balance).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Categories Bar (Sticky) */}
        <div className="sticky top-0 z-30 bg-[#FDFDFD]/80 backdrop-blur-xl border-b border-gray-50 pb-2">
          {/* Search Input */}
          <div className="px-5 py-4">
            <div className="bg-white rounded-[22px] shadow-lg shadow-gray-100/60 border border-gray-100 flex items-center px-5 h-14 focus-within:border-main/30 transition-all">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D1D5DB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-3"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="어떤 운동을 찾으시나요?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-[14px] font-black outline-none placeholder:text-gray-300 text-gray-900"
              />
            </div>
          </div>

          {/* Horizontal Category Tabs */}
          <div
            ref={scrollRef}
            className="w-full overflow-x-auto scrollbar-hide flex gap-2.5 px-5 pb-2"
          >
            {[
              MARKET_TEXT.TABS.ALL,
              MARKET_TEXT.TABS.PT,
              MARKET_TEXT.TABS.PILATES,
              MARKET_TEXT.TABS.YOGA,
              MARKET_TEXT.TABS.CROSSFIT,
            ].map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-full text-[12px] font-black whitespace-nowrap transition-all duration-300 border ${
                    isSelected
                      ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/10"
                      : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Class List Section */}
        <div className="px-5 py-8 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {loadError && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-[22px] text-[13px] font-black">
              {loadError}
            </div>
          )}

          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-main/20 border-t-main rounded-full animate-spin" />
              <p className="text-[13px] font-black text-gray-300 tracking-tight">
                클래스를 불러오는 중...
              </p>
            </div>
          ) : filteredClasses.length > 0 ? (
            filteredClasses.map((cls) => (
              <div
                key={cls.classId}
                onClick={() => navigate(`/market/${cls.classId}`)}
                className="group bg-white rounded-[32px] shadow-2xl shadow-gray-200/40 overflow-hidden flex flex-col cursor-pointer active:scale-[0.98] transition-all border border-transparent hover:border-main/10"
              >
                {/* Image Area with Overlays */}
                <div className="h-[200px] relative overflow-hidden bg-gray-100">
                  <img
                    src={buildMarketplaceImageUrl(cls.thumbnailFinalObjectKey)}
                    alt={cls.title}
                    className="w-full h-full object-cover transition-transform duration-700 scale-110 group-hover:scale-120"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full tracking-wider uppercase">
                    {formatCategory(cls.category)}
                  </div>
                  {/* New Badge */}
                  <div className="absolute top-4 right-4 bg-main text-white text-[9px] font-black px-2.5 py-1.5 rounded-full shadow-lg shadow-main/20 animate-pulse uppercase tracking-widest">
                    NEW
                  </div>
                  {/* Distance Overlay */}
                  {cls.distance != null && (
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-gray-900 text-[11px] font-black px-3 py-2 rounded-[14px] flex items-center gap-1.5 shadow-sm">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-main"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {(cls.distance / 1000).toFixed(1)}km
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-black text-[18px] text-gray-900 leading-[1.3] line-clamp-2 break-keep">
                      {cls.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-gray-400">
                        #{cls.classId}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-gray-200" />
                      <span className="text-[12px] font-bold text-gray-500">
                        {cls.durationMinutes}분 수업
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-2 flex-wrap">
                    {(cls.tags ?? []).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-black text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Price Area */}
                  <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-[12px] font-black text-gray-300 uppercase tracking-widest">
                      Pricing
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-[20px] text-gray-900 tabular-nums">
                        {cls.priceAmount.toLocaleString()}
                      </span>
                      <span className="text-[13px] font-black text-main">
                        MZTK
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-28 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-[28px] bg-white shadow-xl shadow-gray-200/40 flex items-center justify-center mb-6">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <h3 className="font-black text-gray-900 text-[18px] tracking-tight mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-400 text-[13px] font-bold text-center leading-relaxed">
                다른 검색어를 입력하거나
                <br />
                카테고리를 변경해 보세요.
              </p>
            </div>
          )}

          {(hasNextPage || isFetchingNext) && (
            <div
              ref={loadMoreRef}
              className="min-h-16 flex items-center justify-center pb-4"
            >
              {isFetchingNext && (
                <div className="flex items-center gap-3 text-[12px] font-black text-gray-300">
                  <div className="w-5 h-5 border-2 border-main/20 border-t-main rounded-full animate-spin" />
                  클래스 더 불러오는 중...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Market;
