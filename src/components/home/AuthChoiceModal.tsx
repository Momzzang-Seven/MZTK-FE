import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { HOME_TEXT } from "@constant/home";

interface AuthChoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthChoiceModal = ({ isOpen, onClose }: AuthChoiceModalProps) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    // Handlers for each auth method
    const handleLocationAuth = () => {
        navigate("/verify");
        onClose();
    };

    const handleExerciseAuth = () => {
        navigate("/exercise-auth");
        onClose();
    };

    const handleRecordAuth = () => {
        navigate("/record-auth");
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-fade-in-up z-10">
                <h2 className="text-center font-bold text-lg mb-8 tracking-tight">
                    {HOME_TEXT.MODAL.TITLE}
                </h2>

                <div className="flex justify-between items-center">
                    {/* Location Auth */}
                    <button
                        aria-label="위치 인증"
                        onClick={handleLocationAuth}
                        className="flex-1 flex flex-col items-center gap-3 group active:scale-95 transition-transform"
                    >
                        <div className="w-12 h-12 flex items-center justify-center text-[#FAB12F] mb-1">
                            <img src="/icon/location_auth.svg" alt="location" width={40} height={40} className="text-current" />
                        </div>
                        <span className="text-base font-bold text-[#FAB12F]">{HOME_TEXT.MODAL.LOCATION}</span>
                    </button>

                    {/* Divider */}
                    <div className="w-[1.5px] h-16 bg-[#FAB12F]/20 mx-2"></div>

                    {/* Exercise Auth */}
                    <button
                        aria-label="운동 사진 인증"
                        onClick={handleExerciseAuth}
                        className="flex-1 flex flex-col items-center gap-3 group active:scale-95 transition-transform"
                    >
                        <div className="w-12 h-12 flex items-center justify-center mb-1">
                            <div
                                className="w-10 h-10 bg-[#FAB12F] [mask-image:url(/icon/dumbell.svg)] [webkit-mask-image:url(/icon/dumbell.svg)] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]"
                            />
                        </div>
                        <span className="text-base font-bold text-[#FAB12F]">{HOME_TEXT.MODAL.EXERCISE}</span>
                    </button>

                    {/* Divider */}
                    <div className="w-[1.5px] h-16 bg-[#FAB12F]/20 mx-2"></div>

                    {/* Record Auth */}
                    <button
                        aria-label="운동 기록 인증"
                        onClick={handleRecordAuth}
                        className="flex-1 flex flex-col items-center gap-3 group active:scale-95 transition-transform"
                    >
                        <div className="w-12 h-12 flex items-center justify-center mb-1">
                            <div
                                className="w-10 h-10 bg-[#FAB12F] [mask-image:url(/icon/record.svg)] [webkit-mask-image:url(/icon/record.svg)] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]"
                            />
                        </div>
                        <span className="text-base font-bold text-[#FAB12F]">{HOME_TEXT.MODAL.RECORD}</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
