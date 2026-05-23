import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CommonButton, CommonModal } from "@components/common";
import {
  IntroTab,
  LocationTab,
  ReviewTab,
} from "@components/market/detail/MarketTabs";
import { useTokenBalance } from "@hooks";
import { getMarketplaceClassDetail } from "@services";

const IMAGE_BASE_URL =
  (import.meta.env.VITE_IMAGE_BASE_URL as string | undefined) ||
  "https://mztk-bucket.s3.ap-northeast-2.amazonaws.com/";
const PLACEHOLDER_IMAGE = "/icon/gallery.svg";

const DAY_LABEL_MAP: Record<string, string> = {
  MONDAY: "월",
  TUESDAY: "화",
  WEDNESDAY: "수",
  THURSDAY: "목",
  FRIDAY: "금",
  SATURDAY: "토",
  SUNDAY: "일",
};

const buildMarketplaceImageUrl = (objectKey: string | null | undefined) => {
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

const MarketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"intro" | "location" | "review">(
    "intro"
  );
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getMarketplaceClassDetail>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [modalState, setModalState] = useState<{
    title: string;
    desc: string;
  } | null>(null);
  const { balance, loading: isBalanceLoading } = useTokenBalance();
  const balanceNumber = Number(balance);

  useEffect(() => {
    const classId = Number(id);
    if (!Number.isFinite(classId)) {
      setLoadError("클래스를 찾을 수 없습니다.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const loadDetail = async () => {
      try {
        setIsLoading(true);
        const response = await getMarketplaceClassDetail(classId);
        if (isMounted) {
          setData(response);
          setLoadError("");
        }
      } catch {
        if (isMounted) setLoadError("클래스 상세를 불러오지 못했습니다.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void loadDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const imageUrls = useMemo(() => {
    if (!data) return [];
    const detailImages = data.images
      .sort((a, b) => a.imgOrder - b.imgOrder)
      .map((image) => buildMarketplaceImageUrl(image.finalObjectKey));
    const thumbnail = buildMarketplaceImageUrl(data.thumbnailFinalObjectKey);
    return Array.from(new Set([thumbnail, ...detailImages]));
  }, [data]);

  const tabData = useMemo(() => {
    if (!data) return null;
    const operatingTimes = data.classTimes.reduce<Record<string, string[]>>(
      (acc, classTime) => {
        classTime.daysOfWeek.forEach((day) => {
          const label = DAY_LABEL_MAP[day] ?? day;
          const time = classTime.startTime.slice(0, 5);
          const currentTimes = acc[label] ?? [];
          if (!currentTimes.includes(time))
            acc[label] = [...currentTimes, time].sort();
        });
        return acc;
      },
      {}
    );

    return {
      description: data.description,
      features: data.features ?? [],
      duration: `${data.durationMinutes}분`,
      supplies: data.personalItems ?? "",
      operatingDays: Object.keys(operatingTimes),
      operatingTimes,
      location: data.store?.storeName ?? "매장 정보 없음",
      address: data.store
        ? `${data.store.address} ${data.store.detailAddress}`.trim()
        : "등록된 매장 정보가 없습니다.",
      rating: "0.0",
      reviewCount: 0,
      lat: data.store?.latitude,
      lng: data.store?.longitude,
    };
  }, [data]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const idx = Math.round(scrollLeft / width);
    setCurrentImgIdx(idx);
  };

  const handleReservationClick = () => {
    if (!data) return;

    if (isBalanceLoading) {
      setModalState({
        title: "잔액 확인 중",
        desc: "보유 MZTK 잔액을 확인하고 있습니다. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }

    if (Number.isFinite(balanceNumber) && balanceNumber < data.priceAmount) {
      setModalState({
        title: "잔액 부족",
        desc: `예약에는 ${data.priceAmount.toLocaleString()} MZTK가 필요합니다. 현재 보유 잔액은 ${balanceNumber.toLocaleString()} MZTK입니다.`,
      });
      return;
    }

    navigate(`/market/purchase/${data.classId}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#FDFDFD] min-h-dvh items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-main/20 border-t-main rounded-full animate-spin" />
        <p className="text-[13px] font-black text-gray-300">
          클래스 상세 정보를 가져오는 중...
        </p>
      </div>
    );
  }

  if (loadError || !data || !tabData) {
    return (
      <div className="flex flex-col h-full bg-[#FDFDFD] min-h-dvh items-center justify-center p-10 gap-6">
        <div className="w-16 h-16 rounded-[24px] bg-red-50 flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EF4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-[14px] font-black text-gray-400 text-center">
          {loadError || "클래스를 찾을 수 없습니다."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 bg-gray-900 text-white font-black text-[13px] rounded-2xl"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#FDFDFD] min-h-dvh relative pb-32">
      {/* Immersive Image Banner */}
      <div className="relative w-full h-[380px] group">
        <div
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
        >
          {imageUrls.map((img: string, idx: number) => (
            <img
              key={idx}
              src={img}
              alt={`${data.title}-${idx}`}
              className="w-full h-full object-cover flex-shrink-0 snap-center"
            />
          ))}
        </div>

        {/* Banner Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-5 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-all border border-white/30 z-30"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {imageUrls.length > 1 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {imageUrls.map((_: string, idx: number) => (
              <div
                key={idx}
                className={`transition-all duration-300 ${currentImgIdx === idx ? "w-6 h-1.5 bg-main" : "w-1.5 h-1.5 bg-white/60"} rounded-full`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="bg-white px-6 py-10 flex flex-col gap-6 -mt-8 rounded-t-[36px] relative z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] border-t border-gray-50/50">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-gray-900 text-white text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase">
              {formatCategory(data.category)}
            </span>
            <div className="flex items-center gap-1 bg-main/5 px-3 py-1.5 rounded-full border border-main/10">
              <div className="w-1.5 h-1.5 bg-main rounded-full animate-pulse" />
              <span className="text-main text-[11px] font-black tracking-tight">
                Active Program
              </span>
            </div>
          </div>

          <h1 className="text-[26px] font-black text-gray-900 leading-[1.2] tracking-tighter break-keep">
            {data.title}
          </h1>

          <div className="flex items-center gap-3 mt-1">
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src="/icon/gallery.svg"
                alt=""
                className="w-4 h-4 opacity-20"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 font-black text-[14px] leading-tight">
                {data.store?.storeName ?? `Trainer #${data.trainerId}`}
              </span>
              <span className="text-[11px] font-bold text-gray-400 mt-0.5 tracking-tight uppercase">
                Verified Expert Trainer
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap pt-2">
          {data.tags.map((tag: string) => (
            <span
              key={tag}
              className="text-[12px] font-black text-gray-400 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full transition-all hover:border-main/20 hover:text-main"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Premium Tabs */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-gray-50 flex px-2">
        {[
          { id: "intro", label: "프로그램 소개" },
          { id: "location", label: "위치 정보" },
          { id: "review", label: "이용 후기" },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as "intro" | "location" | "review")
              }
              className={`flex-1 py-4 text-[15px] font-black transition-all relative ${isSelected ? "text-gray-900" : "text-gray-400"}`}
            >
              {tab.label}
              {isSelected && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-[3.5px] bg-main rounded-full animate-in zoom-in-50 duration-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 px-6 pt-10 pb-12 flex flex-col gap-10 min-h-[600px] animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === "intro" && <IntroTab data={tabData} />}
        {activeTab === "location" && <LocationTab data={tabData} />}
        {activeTab === "review" && <ReviewTab data={tabData} />}
      </div>

      {/* Luxury Floating Footer */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[450px] w-full bg-white/90 backdrop-blur-xl px-6 pt-4 pb-[calc(2rem+env(safe-area-inset-bottom))] flex items-center justify-between border-t border-gray-100/50 shadow-[0_-15px_40px_rgba(0,0,0,0.06)] z-50 rounded-t-[32px]">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            1-Class Pricing
          </span>
          <div className="flex items-end gap-1.5">
            <span className="font-black text-[26px] text-gray-900 tabular-nums leading-none tracking-tighter">
              {data.priceAmount.toLocaleString()}
            </span>
            <span className="text-[14px] font-black text-main uppercase pb-0.5 tracking-tight">
              MZTK
            </span>
          </div>
        </div>
        <div className="w-[180px]">
          <CommonButton
            label={isBalanceLoading ? "잔액 확인 중..." : "지금 예약하기"}
            onClick={handleReservationClick}
            className="h-[60px] rounded-[22px] font-black text-[16px] shadow-xl shadow-main/20 active:scale-95 transition-all"
          />
        </div>
      </div>

      {modalState && (
        <CommonModal
          title={modalState.title}
          desc={modalState.desc}
          confirmLabel="확인"
          onConfirmClick={() => setModalState(null)}
        />
      )}
    </div>
  );
};

export default MarketDetail;
