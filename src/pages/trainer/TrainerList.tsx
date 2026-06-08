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
import {
  Plus,
  ChevronRight,
  Tag,
  Coins,
  EyeOff,
  AlertCircle,
  TrendingUp,
  LayoutGrid,
} from "lucide-react";

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
        setTickets(response.items ?? []);
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
    <div className="flex flex-col min-h-dvh bg-[#F8F9FA] font-pretendard">
      <TrainerHeader title="내 클래스 목록" showBack backTo="/trainer" />

      <div className="flex-1 px-5 pt-8 pb-32 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section with Floating Add Button */}
        <div className="flex justify-between items-end px-1">
          <div>
            <h2 className="text-[24px] font-black text-gray-900 leading-tight tracking-tight">
              운영 중인 클래스
            </h2>
            <p className="text-[13px] font-bold text-gray-400 mt-1">
              총 {tickets.length}개의 프로그램이 등록되어 있습니다.
            </p>
          </div>
          <button
            onClick={() => navigate("/trainer/register-ticket")}
            className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.15)] active:scale-95 transition-all"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Business Intelligence Banner */}
        <div className="bg-white rounded-[32px] border border-amber-100/50 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.03)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-main/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:scale-150" />
          <div className="relative flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 shadow-inner">
              <TrendingUp size={24} className="text-main" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-[15px] font-black text-gray-900">
                  매니지먼트 가이드
                </h4>
                <div className="w-1.5 h-1.5 rounded-full bg-main animate-pulse" />
              </div>
              <p className="text-[12px] font-bold text-gray-400 leading-relaxed">
                클래스 카드를 터치해 내용을 수정하고, 토글로 노출 상태를
                제어하세요.
              </p>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="bg-red-50 border border-red-100 text-red-500 px-5 py-4 rounded-2xl text-[13px] font-black flex items-center gap-3">
            <AlertCircle size={18} />
            {loadError}
          </div>
        )}

        {isSuspended && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-5 rounded-2xl text-[13px] font-black flex items-center gap-4 shadow-sm">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
            <p>현재 계정 이용이 제한되어 클래스 수정 및 노출이 불가능합니다.</p>
          </div>
        )}

        {/* List Content */}
        <div className="flex flex-col gap-6">
          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 border-[5px] border-main/10 border-t-main rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <LayoutGrid size={24} className="text-main/30" />
                </div>
              </div>
              <p className="text-[14px] font-black text-gray-300 tracking-widest">
                FETCHING DATA...
              </p>
            </div>
          ) : tickets.length > 0 ? (
            tickets.map((ticket) => (
              <div
                key={ticket.classId}
                className={`group bg-white rounded-[32px] flex flex-col border transition-all duration-500 ${
                  ticket.active
                    ? "border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_rgba(255,107,0,0.08)] hover:border-main/10"
                    : "border-gray-50 opacity-60 grayscale-[0.3]"
                }`}
              >
                <div
                  onClick={() => navigate(`/trainer/edit/${ticket.classId}`)}
                  className="flex p-6 gap-6 items-center cursor-pointer active:scale-[0.98] transition-all"
                >
                  <div className="relative">
                    <img
                      src={buildMarketplaceImageUrl(
                        ticket.thumbnailFinalObjectKey
                      )}
                      alt=""
                      className="w-24 h-24 rounded-full object-cover bg-gray-50 shadow-inner ring-4 ring-gray-50/50 transition-transform duration-500 group-hover:scale-105"
                    />
                    {!ticket.active && (
                      <div className="absolute inset-0 bg-gray-900/40 rounded-full backdrop-blur-[2px] flex flex-col items-center justify-center gap-1 animate-in fade-in duration-300">
                        <EyeOff size={16} className="text-white" />
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                          Hidden
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-full border border-gray-100">
                        <Tag size={10} className="text-gray-400" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">
                          {formatCategory(ticket.category)}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-black text-gray-900 text-[18px] truncate leading-tight tracking-tight">
                      {ticket.title}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Coins size={12} className="text-main" />
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[17px] font-black text-gray-900">
                          {ticket.priceAmount.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">
                          MZTK
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-main group-hover:text-white transition-all shadow-sm">
                    <ChevronRight size={20} strokeWidth={3} />
                  </div>
                </div>

                <div
                  className={`px-6 py-5 border-t transition-colors duration-500 flex items-center justify-between rounded-b-[32px] ${
                    ticket.active
                      ? "bg-[#F9FAFB]/50 border-gray-50"
                      : "bg-gray-50/30 border-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={`w-3 h-3 rounded-full ${ticket.active ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      {ticket.active && (
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-30" />
                      )}
                    </div>
                    <span
                      className={`text-[13px] font-black tracking-tight ${ticket.active ? "text-gray-700" : "text-gray-400"}`}
                    >
                      {ticket.active
                        ? "수강생에게 공개 중"
                        : "수강생에게 비공개"}
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
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-main shadow-inner"></div>
                    {togglingIdSet.has(ticket.classId) && (
                      <div className="absolute inset-0 bg-white/40 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-main border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </label>
                </div>
              </div>
            ))
          ) : (
            <div className="py-32 flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-[32px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex items-center justify-center">
                  <EyeOff size={40} className="text-gray-100" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-main rounded-2xl flex items-center justify-center shadow-lg text-white">
                  <Plus size={20} strokeWidth={3} />
                </div>
              </div>
              <h3 className="font-black text-gray-900 text-[20px] mb-2 tracking-tight">
                클래스 목록이 비어있습니다
              </h3>
              <p className="text-gray-400 text-[14px] font-bold text-center leading-relaxed mb-10 px-10">
                아직 등록된 수업이 없습니다. 트레이너님의 전문성을 담은 클래스를
                개설해 보세요.
              </p>
              <button
                onClick={() => navigate("/trainer/register-ticket")}
                className="px-10 py-5 bg-gray-900 text-white rounded-[24px] text-[15px] font-black shadow-[0_15px_30px_rgba(0,0,0,0.2)] active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus size={20} strokeWidth={3} />첫 클래스 등록하기
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
