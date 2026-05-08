import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TRAINER_DASHBOARD_TEXT } from "@constant";
import { CommonModal } from "@components/common";
import { useTrainerStatus } from "@hooks";
import { getTrainerStore } from "@services";
import { useUserStore } from "@store";

// Premium Icon Map
const PremiumIcons: Record<string, React.ReactNode> = {
  "/trainer/register-ticket": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5V19M5 12H19"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="white"
        strokeWidth="2.5"
        strokeOpacity="0.3"
      />
    </svg>
  ),
  "/trainer/list": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="3"
        stroke="white"
        strokeWidth="2.5"
      />
      <path
        d="M8 10H16M8 14H13"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="18" cy="7" r="2.5" fill="white" fillOpacity="0.2" />
    </svg>
  ),
  "/trainer/reservations": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 2V5M16 2V5M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V6C3 4.89543 3.89543 4 5 4Z"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="15"
        r="2"
        stroke="white"
        strokeWidth="2"
        fill="white"
        fillOpacity="0.2"
      />
    </svg>
  ),
  "/trainer/reviews": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1272L3 21L7.8728 20C9.10898 20.6391 10.5124 21 12 21Z"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 11.5L10.5 14L16 8.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  "/trainer/store-register": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 21H21"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M5 21V7L13 3V21M19 21V11L13 7"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="8"
        y="11"
        width="2"
        height="2"
        rx="0.5"
        fill="white"
        fillOpacity="0.4"
      />
    </svg>
  ),
};

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [appealModal, setAppealModal] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
    variant?: "warning" | "error" | "info" | "success";
  } | null>(null);
  const [isCheckingStore, setIsCheckingStore] = useState(true);
  const { isRestricted, handleAppeal: postAppeal } = useTrainerStatus();
  const user = useUserStore((state) => state.user);

  const onAppealClick = async () => {
    try {
      await postAppeal();
      setAppealModal({
        isOpen: true,
        title: "이의 신청 접수",
        desc: "이의 신청이 성공적으로 접수되었습니다.<br/>관리자 확인 후 조치해 드릴 예정입니다.",
      });
    } catch {
      setAppealModal({
        isOpen: true,
        title: "이의 신청 실패",
        desc: "이의 신청 처리에 실패했습니다.<br/>잠시 후 다시 시도해 주세요.",
        variant: "error",
      });
    }
  };

  useEffect(() => {
    if (isRestricted) {
      setIsCheckingStore(false);
      setShowRegisterModal(false);
      return;
    }

    let isMounted = true;
    const checkTrainerStore = async () => {
      try {
        await getTrainerStore();
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 404 &&
          error.response?.data?.code === "MARKETPLACE_001"
        ) {
          if (isMounted) setShowRegisterModal(true);
        }
      } finally {
        if (isMounted) setIsCheckingStore(false);
      }
    };
    void checkTrainerStore();
    return () => {
      isMounted = false;
    };
  }, [isRestricted]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pb-32">
      {/* ── Dashboard Content (Header Removed) ── */}
      <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Welcome Header */}
        <div className="relative pt-16 pb-20 px-6 overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-64 h-64 bg-main opacity-[0.06] blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute top-[80px] left-[-40px] w-72 h-72 bg-main opacity-[0.04] blur-[80px] rounded-full pointer-events-none" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-[11px] font-black tracking-widest uppercase opacity-80 mb-2">
                Trainer Center
              </p>
              <h2 className="text-gray-900 text-[26px] font-black leading-[1.15] tracking-tight">
                {user?.nickname || "트레이너"}님, <br />
                센터 관리를{" "}
                <span className="text-main underline decoration-main/20 underline-offset-4">
                  시작
                </span>
                해볼까요?
              </h2>
            </div>
            <div className="w-12 h-12 rounded-[20px] bg-white shadow-xl shadow-gray-200/50 border border-white flex items-center justify-center shrink-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FAB12F"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Action Highlight (Light Theme) */}
        <div className="px-6 -mt-10 mb-12">
          <button
            onClick={() => navigate("/trainer/register-ticket")}
            className="w-full bg-white p-6 rounded-[24px] border border-gray-100 shadow-xl shadow-gray-200/40 flex items-center justify-between group btn-press relative z-10"
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-1.5 h-1.5 bg-main rounded-full" />
                <span className="text-main text-[11px] font-black uppercase tracking-widest">
                  Recommended
                </span>
              </div>
              <h3 className="text-gray-900 text-[18px] font-black tracking-tight">
                새로운 클래스 등록하기
              </h3>
              <p className="text-gray-400 text-[12px] font-bold mt-0.5">
                수강생들에게 최고의 운동을 제안해 보세요.
              </p>
            </div>
            <div className="w-12 h-12 rounded-[20px] bg-amber-50 flex items-center justify-center group-hover:bg-main transition-all group-hover:shadow-lg group-hover:shadow-main/30">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-main group-hover:text-white transition-colors"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
          </button>
        </div>

        {/* Menu Grid */}
        <div className="px-6 flex flex-col gap-10">
          {TRAINER_DASHBOARD_TEXT.MENU_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[17px] font-black text-gray-900 tracking-tight">
                  {group.groupName}
                </h3>
                <div className="h-[2px] flex-1 bg-gray-50 mx-4" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {group.items.map((item, iIdx) => (
                  <button
                    key={iIdx}
                    onClick={() => navigate(item.path)}
                    className="group btn-press relative flex flex-col items-start p-5 bg-white border border-gray-100 rounded-[22px] shadow-sm hover:shadow-md transition-all text-left overflow-hidden"
                  >
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-main/5 rounded-full blur-2xl group-hover:bg-main/10 transition-all duration-500" />

                    <div
                      className={`w-11 h-11 rounded-[18px] ${item.bgClass} flex items-center justify-center mb-5 shadow-lg shadow-main/15 transition-transform duration-300 group-active:scale-95`}
                    >
                      {PremiumIcons[item.path] || (
                        <img src={item.icon} alt="" className="w-5.5 h-5.5" />
                      )}
                    </div>

                    <span className="text-[14px] font-black text-gray-900 leading-tight tracking-tight mb-1.5 break-keep">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Go Manage
                      </span>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#9CA3AF"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {!isCheckingStore && showRegisterModal && (
        <CommonModal
          title="매장 등록 권고"
          desc="전문적인 클래스 운영을 위해<br/>먼저 매장 정보를 등록해 주세요."
          confirmLabel="매장 등록하러 가기"
          onConfirmClick={() => {
            setShowRegisterModal(false);
            navigate("/trainer/store-register");
          }}
          cancelLabel="나중에"
          onCancelClick={() => setShowRegisterModal(false)}
        />
      )}

      {isRestricted && (
        <CommonModal
          variant="error"
          title="이용 제한 안내"
          desc="현재 관리자에 의해 활동이 제한되었습니다."
          confirmLabel="이의 제기하기"
          onConfirmClick={onAppealClick}
        />
      )}

      {appealModal?.isOpen && (
        <CommonModal
          variant={appealModal.variant}
          title={appealModal.title}
          desc={appealModal.desc}
          confirmLabel="확인"
          onConfirmClick={() => setAppealModal(null)}
        />
      )}
    </div>
  );
};

export default TrainerDashboard;
