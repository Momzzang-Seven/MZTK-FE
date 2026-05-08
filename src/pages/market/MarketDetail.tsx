import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CommonButton } from "@components/common";
import {
  IntroTab,
  LocationTab,
  ReviewTab,
} from "@components/market/detail/MarketTabs";
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
  if (!objectKey) {
    return PLACEHOLDER_IMAGE;
  }

  if (/^https?:\/\//.test(objectKey)) {
    return objectKey;
  }

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

        if (!isMounted) return;

        setData(response);
        setLoadError("");
      } catch (error) {
        console.error("Failed to load marketplace class detail", error);
        if (!isMounted) return;
        setLoadError("클래스 상세를 불러오지 못했습니다.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
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

          if (!currentTimes.includes(time)) {
            acc[label] = [...currentTimes, time].sort();
          }
        });

        return acc;
      },
      {}
    );

    const operatingDays = Object.keys(operatingTimes);
    const address = data.store
      ? `${data.store.address} ${data.store.detailAddress}`.trim()
      : "등록된 매장 정보가 없습니다.";

    return {
      description: data.description,
      features: data.features ?? [],
      duration: `${data.durationMinutes}분`,
      supplies: data.personalItems ?? "",
      operatingDays,
      operatingTimes,
      location: data.store?.storeName ?? "매장 정보 없음",
      address,
      rating: "0.0",
      reviewCount: 0,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-400">
        클래스 상세를 불러오는 중입니다...
      </div>
    );
  }

  if (loadError || !data || !tabData) {
    return (
      <div className="p-10 text-center">
        {loadError || "클래스를 찾을 수 없습니다."}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen relative pb-28">
      <div className="relative w-full h-[280px]">
        <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          {imageUrls.map((img: string, idx: number) => (
            <img
              key={idx}
              src={img}
              alt={`${data.title}-${idx}`}
              className="w-full h-full object-cover flex-shrink-0 snap-center"
            />
          ))}
        </div>
        {imageUrls.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {imageUrls.map((_: string, idx: number) => (
              <div
                key={idx}
                className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm"
              ></div>
            ))}
          </div>
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white active:bg-black/50 transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M9.57 5.92993L3.5 11.9999L9.57 18.0699M20.5 11.9999H3.67"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="bg-white px-5 py-6 flex flex-col gap-4 shadow-sm z-10 -mt-4 rounded-t-3xl relative">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg w-fit">
              {formatCategory(data.category)}
            </span>
            <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg w-fit flex items-center gap-1 border border-green-200">
              {data.classTimes.length > 0
                ? `운영 슬롯 ${data.classTimes.length}개`
                : "운영 슬롯 없음"}
            </span>
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
            {data.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-600 font-medium text-[15px]">
              {data.store?.storeName ?? `Trainer #${data.trainerId}`}
            </span>
            <div className="w-[1px] h-3 bg-gray-300"></div>
            <span className="text-sm text-gray-400">
              {data.durationMinutes}분 수업
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {data.tags.map((tag: string) => (
            <span
              key={tag}
              className="text-[12px] font-bold text-main bg-main/10 px-2.5 py-1.5 rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="sticky top-0 bg-white z-20 border-b border-gray-100 flex shadow-[0_4px_10px_rgba(0,0,0,0.02)] pt-2 relative">
        {[
          { id: "intro", label: "프로그램 소개" },
          { id: "location", label: "위치" },
          { id: "review", label: "후기(0)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(tab.id as "intro" | "location" | "review")
            }
            className={`flex-1 py-3 text-[15px] font-bold transition-colors ${activeTab === tab.id ? "text-gray-900" : "text-gray-400"}`}
          >
            {tab.label}
          </button>
        ))}
        <div
          className="absolute bottom-0 h-0.5 bg-gray-900 transition-all duration-300"
          style={{
            width: "33.333%",
            transform: `translateX(${activeTab === "intro" ? 0 : activeTab === "location" ? 100 : 200}%)`,
          }}
        />
      </div>

      <div className="flex-1 px-5 pt-6 pb-6 flex flex-col gap-8 min-h-[500px]">
        {activeTab === "intro" && <IntroTab data={tabData} />}
        {activeTab === "location" && <LocationTab data={tabData} />}
        {activeTab === "review" && <ReviewTab data={tabData} />}
      </div>

      <div className="fixed bottom-0 max-w-[450px] w-full bg-white px-5 py-4 flex items-center justify-between border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] z-50 rounded-t-2xl">
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 font-bold mb-0.5">
            1회권 구매
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-main flex items-center justify-center text-white text-[11px] font-bold">
              T
            </div>
            <span className="font-bold text-[22px] text-gray-900 tabular-nums leading-none tracking-tight">
              {data.priceAmount}
            </span>
          </div>
        </div>
        <div className="w-[200px]">
          <CommonButton
            label="클래스 구매하기"
            onClick={() => navigate(`/market/purchase/${data.classId}`)}
            className="h-[52px] rounded-xl font-bold"
          />
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;
