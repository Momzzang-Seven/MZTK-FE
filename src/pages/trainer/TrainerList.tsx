import type { ChangeEvent } from "react";
import TrainerHeader from "@components/trainer/TrainerHeader";
import {
  getTrainerClasses,
  toggleTrainerClassStatus,
  type TrainerClassItem,
} from "@services";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
      return category;
  }
};

const TrainerList = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TrainerClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSuspended, setIsSuspended] = useState(false);
  const [togglingIds, setTogglingIds] = useState<number[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadTickets = async () => {
      try {
        const response = await getTrainerClasses();

        if (!isMounted) return;

        setTickets(response.items);
        setIsSuspended(response.isSuspended);
        setLoadError("");
      } catch (error) {
        console.error("Failed to load trainer classes", error);
        if (!isMounted) return;
        setLoadError("클래스 목록을 불러오지 못했습니다.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTickets();

    return () => {
      isMounted = false;
    };
  }, []);

  const togglingIdSet = useMemo(() => new Set(togglingIds), [togglingIds]);

  const handleToggle = async (
    classId: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();

    try {
      setTogglingIds((prev) => [...prev, classId]);
      const response = await toggleTrainerClassStatus(classId);
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.classId === classId
            ? { ...ticket, active: response.active }
            : ticket
        )
      );
    } catch (error) {
      console.error("Failed to toggle trainer class status", error);
      alert("클래스 상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== classId));
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen">
      <TrainerHeader title="내 클래스 목록" showBack backTo="/trainer" />

      <div className="px-5 pt-6 pb-20 flex flex-col gap-4">
        <div className="bg-main/5 border border-main/10 text-gray-700 px-4 py-3.5 rounded-xl text-[13.5px] leading-relaxed font-medium shadow-sm mb-1">
          <p className="flex items-center gap-1.5 mb-1 text-main font-bold">
            <span className="text-[16px]">안내</span> 이용 전 확인
          </p>
          <ul className="list-disc pl-5 text-gray-500 space-y-1 text-[13px]">
            <li>클래스를 터치하면 수정 화면으로 이동합니다.</li>
            <li>스위치를 끄면 회원에게 클래스가 노출되지 않습니다.</li>
          </ul>
        </div>

        {isSuspended && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
            현재 이용 제한 상태입니다. 공개 클래스 운영이 제한될 수 있습니다.
          </div>
        )}

        {loadError && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex items-center justify-center text-gray-400 font-medium">
            클래스 목록을 불러오는 중입니다...
          </div>
        ) : tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div
              key={ticket.classId}
              className="bg-white rounded-2xl flex border border-gray-100 shadow-sm overflow-hidden"
            >
              <div
                onClick={() => navigate(`/trainer/edit/${ticket.classId}`)}
                className="group flex-1 min-w-0 p-4 flex gap-4 items-center cursor-pointer active:bg-gray-50 transition-colors"
              >
                <img
                  src={buildMarketplaceImageUrl(ticket.thumbnailFinalObjectKey)}
                  alt={ticket.title}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-50"
                />
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="font-bold text-gray-900 text-[15px] truncate">
                    {ticket.title}
                  </h3>
                  <p className="text-main font-bold text-sm mt-1">
                    {ticket.priceAmount.toLocaleString()} MZTK
                  </p>
                  <p className="text-[12px] text-gray-400 mt-1">
                    {formatCategory(ticket.category)}
                  </p>
                </div>
                <div className="flex-shrink-0 bg-gray-100/80 px-3 py-1.5 rounded-lg text-gray-500 font-bold text-[11px] group-active:bg-gray-300 transition-colors">
                  수정
                </div>
              </div>

              <div className="w-[1px] bg-gray-100 my-4"></div>

              <div
                className="w-[84px] p-4 flex flex-col items-center justify-center flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span
                  className={`text-[11px] font-bold mb-1.5 tracking-tight transition-colors ${
                    ticket.active ? "text-main" : "text-gray-400"
                  }`}
                >
                  {ticket.active ? "판매중" : "판매중지"}
                </span>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={ticket.active}
                      onChange={(event) =>
                        void handleToggle(ticket.classId, event)
                      }
                      disabled={togglingIdSet.has(ticket.classId)}
                    />
                    <div className="block bg-gray-200 w-10 h-6 rounded-full transition-colors duration-300 peer-checked:bg-main"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 peer-checked:translate-x-4 shadow-sm"></div>
                  </div>
                </label>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
              <img
                src="/icon/paste.svg"
                alt="list"
                className="w-8 h-8 opacity-50"
              />
            </div>
            <h3 className="font-bold text-gray-800 text-[16px] mb-2">
              등록된 클래스가 없습니다
            </h3>
            <p className="text-gray-400 text-sm text-center">
              아직 등록된 클래스가 없습니다.
              <br />
              새로운 클래스를 등록해 보세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerList;
