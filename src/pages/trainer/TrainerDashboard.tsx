import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TRAINER_DASHBOARD_TEXT } from "@constant";
import TrainerHeader from "@components/trainer/TrainerHeader";
import { CommonModal } from "@components/common";
import { useTrainerStatus } from "@hooks";
import { getTrainerStore } from "@services";
import { useUserStore } from "@store";

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isCheckingStore, setIsCheckingStore] = useState(true);
  const { isRestricted, handleAppeal } = useTrainerStatus();
  const user = useUserStore((state) => state.user);

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
          if (!isMounted) return;
          setShowRegisterModal(true);
        } else {
          console.error("Failed to check trainer store", error);
        }
      } finally {
        if (isMounted) {
          setIsCheckingStore(false);
        }
      }
    };

    void checkTrainerStore();

    return () => {
      isMounted = false;
    };
  }, [isRestricted]);

  const handleGoToRegister = () => {
    setShowRegisterModal(false);
    navigate("/trainer/store-register");
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen pb-[120px]">
      <TrainerHeader title={TRAINER_DASHBOARD_TEXT.TITLE} />

      <div className="px-5 pt-8 pb-4">
        <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">
          {TRAINER_DASHBOARD_TEXT.GREETING(user?.nickname || "oo")}
        </h2>
        <p className="text-gray-500 text-[14px] mt-1">
          오늘도 회원님들의 운동을 준비해 주세요.
        </p>
      </div>

      <div className="flex flex-col px-5 gap-6 mt-2">
        {TRAINER_DASHBOARD_TEXT.MENU_GROUPS.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col">
            <h3 className="text-[13px] font-bold text-gray-400 mb-3 px-1">
              {group.groupName}
            </h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/60 overflow-hidden flex flex-col">
              {group.items.map((item, itemIdx) => (
                <button
                  key={itemIdx}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors ${
                    itemIdx !== group.items.length - 1
                      ? "border-b border-gray-50"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${item.bgClass}`}
                    >
                      <img
                        src={item.icon}
                        alt={item.title}
                        className={`w-5 h-5 ${
                          item.path === "/trainer/reviews"
                            ? "brightness-0 invert"
                            : item.filterClass
                        }`}
                      />
                    </div>
                    <span className="font-semibold text-gray-800 text-[15px]">
                      {item.title}
                    </span>
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center opacity-30">
                    <img
                      src="/icon/backArrow.svg"
                      alt="arrow"
                      className="w-4 h-4 rotate-180"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!isCheckingStore && showRegisterModal && (
        <CommonModal
          title="매장 등록 권고"
          desc="클래스 등록 및 관리를 위해<br/>먼저 매장 정보를 등록해 주세요."
          confirmLabel="매장 등록하러 가기"
          onConfirmClick={handleGoToRegister}
          cancelLabel="다음에 하기"
          onCancelClick={() => setShowRegisterModal(false)}
        />
      )}

      {isRestricted && (
        <CommonModal
          title="이용 제한 안내"
          desc="이용이 제한된 트레이너입니다."
          confirmLabel="문의하기"
          onConfirmClick={handleAppeal}
        />
      )}
    </div>
  );
};

export default TrainerDashboard;
