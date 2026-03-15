import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TRAINER_DASHBOARD_TEXT } from "@constant";
import TrainerHeader from "@components/trainer/TrainerHeader";
import { CommonModal } from "@components/common";
import { useTrainerStatus } from "@hooks";

const TrainerDashboard = () => {
    const navigate = useNavigate();
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const { isRestricted, handleAppeal } = useTrainerStatus();

    useEffect(() => {
        const hasVisited = localStorage.getItem("hasVisitedTrainerDashboard");
        const hasStore = localStorage.getItem("trainerStoreRegistered");

        if (!hasVisited && !hasStore && !isRestricted) {
            setShowRegisterModal(true);
            localStorage.setItem("hasVisitedTrainerDashboard", "true");
        }
    }, [isRestricted]);

    const handleGoToRegister = () => {
        setShowRegisterModal(false);
        navigate("/trainer/store-register");
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 min-h-screen pb-[120px]">
            {/* 1. Header */}
            <TrainerHeader title={TRAINER_DASHBOARD_TEXT.TITLE} />

            {/* 2. Greeting */}
            <div className="px-5 pt-8 pb-4">
                <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">
                    {TRAINER_DASHBOARD_TEXT.GREETING}
                </h2>
                <p className="text-gray-500 text-[14px] mt-1">오늘도 활기찬 수업을 응원합니다!</p>
            </div>

            {/* 3. Menu List Section */}
            <div className="flex flex-col px-5 gap-6 mt-2">
                {TRAINER_DASHBOARD_TEXT.MENU_GROUPS.map((group, groupIdx) => (
                    <div key={groupIdx} className="flex flex-col">
                        <h3 className="text-[13px] font-bold text-gray-400 mb-3 px-1">{group.groupName}</h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/60 overflow-hidden flex flex-col">
                            {group.items.map((item, itemIdx) => (
                                <button
                                    key={itemIdx}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors ${itemIdx !== group.items.length - 1 ? "border-b border-gray-50" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${item.bgClass}`}>
                                            <img src={item.icon} alt={item.title} className={`w-5 h-5 ${item.filterClass}`} />
                                        </div>
                                        <span className="font-semibold text-gray-800 text-[15px]">
                                            {item.title}
                                        </span>
                                    </div>
                                    <div className="w-6 h-6 flex items-center justify-center opacity-30">
                                        <img src="/icon/backArrow.svg" alt="arrow" className="w-4 h-4 rotate-180" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* 4. Store Registration Recommendation Modal */}
            {showRegisterModal && (
                <CommonModal
                    title="매장 등록 권고"
                    desc="클래스 등록 및 관리를 위해<br/>먼저 매장 정보를 등록해주세요."
                    confirmLabel="매장 등록하기"
                    onConfirmClick={handleGoToRegister}
                />
            )}

            {/* 5. Restriction Modal */}
            {isRestricted && (
                <CommonModal
                    title="이용 제한 안내"
                    desc="이용이 제한된 트레이너 입니다."
                    confirmLabel="문의하기"
                    onConfirmClick={handleAppeal}
                />
            )}
        </div>
    );
};

export default TrainerDashboard;
