import type { ChangeEvent } from "react";
import TrainerHeader from "@components/trainer/TrainerHeader";
import { CommonModal } from "@components/common";
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
  const map: Record<string, string> = {
    PT: "PT/헬스",
    PILATES: "필라테스",
    YOGA: "요가",
    CROSSFIT: "크로스핏",
    BOXING: "복싱",
    DANCE: "댄스",
    REHABILITATION: "재활",
    OTHER: "기타",
  };
  return map[category] || category;
};

const TrainerList = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TrainerClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSuspended, setIsSuspended] = useState(false);
  const [togglingIds, setTogglingIds] = useState<number[]>([]);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
    variant?: "error" | "warning" | "info" | "success";
  }>({
    isOpen: false,
    title: "",
    desc: "",
  });

  useEffect(() => {
    let isMounted = true;
    const loadTickets = async () => {
      try {
        const response = await getTrainerClasses();
        if (!isMounted) return;
        setTickets(response.items);
        setIsSuspended(response.isSuspended);
        setLoadError("");
      } catch {
        if (!isMounted) return;
        setLoadError("클래스 목록을 불러오지 못했습니다.");
      } finally {
        if (isMounted) setIsLoading(false);
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
        prev.map((t) =>
          t.classId === classId ? { ...t, active: response.active } : t
        )
      );
    } catch {
      setModalState({
        isOpen: true,
        title: "상태 변경 실패",
        desc: "클래스 노출 상태를 변경하는 중 오류가 발생했습니다.<br/>잠시 후 다시 시도해 주세요.",
        variant: "error",
      });
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== classId));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD]">
      <TrainerHeader title="내 클래스 목록" showBack backTo="/trainer" />

      <div className="flex-1 px-5 pt-6 pb-28 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Info Banner */}
        <div className="bg-white rounded-[24px] border border-amber-100/50 p-5 shadow-xl shadow-gray-200/30 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-main/5 rounded-full blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FAB12F"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h4 className="text-[14px] font-black text-gray-900 mb-1">
                비즈니스 가이드
              </h4>
              <p className="text-[12px] font-bold text-gray-400 leading-relaxed">
                클래스 카드를 터치하여 상세 내용을 수정할 수 있으며, 토글
                스위치를 통해 수강생에게 노출 여부를 즉시 결정할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-[13px] font-black">
            {loadError}
          </div>
        )}

        {isSuspended && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-[13px] font-black flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            현재 이용 제한 상태입니다. 관리자에게 문의해 주세요.
          </div>
        )}

        {/* List Content */}
        <div className="flex flex-col gap-5">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-main/20 border-t-main rounded-full animate-spin" />
              <p className="text-[13px] font-black text-gray-300">
                목록을 구성하고 있습니다...
              </p>
            </div>
          ) : tickets.length > 0 ? (
            tickets.map((ticket) => (
              <div
                key={ticket.classId}
                className={`bg-white rounded-[26px] flex flex-col border transition-all duration-300 ${ticket.active ? "border-gray-100 shadow-xl shadow-gray-200/40" : "border-gray-50 opacity-70 grayscale-[0.5]"}`}
              >
                <div
                  onClick={() => navigate(`/trainer/edit/${ticket.classId}`)}
                  className="flex p-5 gap-4.5 items-center cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="relative">
                    <img
                      src={buildMarketplaceImageUrl(
                        ticket.thumbnailFinalObjectKey
                      )}
                      alt=""
                      className="w-20 h-20 rounded-[20px] object-cover bg-gray-50 shadow-inner"
                    />
                    {!ticket.active && (
                      <div className="absolute inset-0 bg-black/40 rounded-[20px] flex items-center justify-center">
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                          Hidden
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] font-black text-main bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-tight">
                        {formatCategory(ticket.category)}
                      </span>
                    </div>
                    <h3 className="font-black text-gray-900 text-[16px] truncate leading-tight">
                      {ticket.title}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-[15px] font-black text-gray-900">
                        {ticket.priceAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-black text-gray-400">
                        MZTK
                      </span>
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D1D5DB"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </div>

                <div className="px-5 py-4 bg-[#F9FAFB]/50 border-t border-gray-50 flex items-center justify-between rounded-b-[26px]">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${ticket.active ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <span
                      className={`text-[12px] font-black ${ticket.active ? "text-gray-700" : "text-gray-400"}`}
                    >
                      {ticket.active
                        ? "수강생에게 노출 중"
                        : "현재 비공개 상태"}
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={ticket.active}
                      onChange={(e) => void handleToggle(ticket.classId, e)}
                      disabled={togglingIdSet.has(ticket.classId)}
                    />
                    <div className="w-12 h-6.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-main shadow-inner"></div>
                    {togglingIdSet.has(ticket.classId) && (
                      <div className="absolute inset-0 bg-white/40 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-main border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </label>
                </div>
              </div>
            ))
          ) : (
            <div className="py-28 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
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
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14.5 2 14.5 7.5 20 7.5" />
                </svg>
              </div>
              <h3 className="font-black text-gray-900 text-[18px] mb-2 tracking-tight">
                클래스가 비어있습니다
              </h3>
              <p className="text-gray-400 text-[13px] font-bold text-center leading-relaxed mb-8">
                아직 등록된 클래스가 없습니다.
                <br />첫 번째 클래스를 열고 수강생을 맞이해 보세요.
              </p>
              <button
                onClick={() => navigate("/trainer/register-ticket")}
                className="px-8 py-4 bg-gray-900 text-white rounded-[20px] text-[14px] font-black shadow-xl shadow-gray-900/20 btn-press"
              >
                첫 클래스 등록하기
              </button>
            </div>
          )}
        </div>
      </div>

      {modalState.isOpen && (
        <CommonModal
          variant={modalState.variant}
          title={modalState.title}
          desc={modalState.desc}
          confirmLabel="확인"
          onConfirmClick={() => setModalState({ ...modalState, isOpen: false })}
        />
      )}
    </div>
  );
};

export default TrainerList;
