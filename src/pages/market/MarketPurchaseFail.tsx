import { useNavigate } from "react-router-dom";
import { SimpleHeader } from "@components/layout";
import { CommonButton } from "@components/common";

const MarketPurchaseFail = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-white min-h-screen">
            <SimpleHeader />
            <div className="flex-1 flex flex-col items-center justify-center px-5 gap-4">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-2">
                    <img src="/icon/close.svg" alt="fail" className="w-10 h-10 object-contain text-red-500" style={{ filter: "invert(40%) sepia(85%) saturate(1478%) hue-rotate(338deg) brightness(96%) contrast(90%)" }} />
                </div>
                <h2 className="text-[22px] font-bold text-gray-900 text-center">
                    클래스 예약이<br />실패했습니다
                </h2>
                <p className="text-gray-500 text-center text-[15px] font-medium leading-relaxed mb-6">
                    보유한 MZT가 부족하거나<br />서버 통신 중 오류가 발생했습니다.<br />다시 시도해주세요.
                </p>
                <div className="w-full max-w-[400px] flex flex-col gap-3">
                    <CommonButton
                        label="다시 시도하기"
                        onClick={() => navigate(-1)}
                        className="w-full h-14 rounded-xl text-base font-bold shadow-sm"
                    />
                    <CommonButton
                        label="홈으로 돌아가기"
                        onClick={() => navigate("/")}
                        className="w-full h-14 rounded-xl text-base font-bold bg-gray-100 text-gray-600 hover:bg-gray-200"
                    />
                </div>
            </div>
        </div>
    );
};

export default MarketPurchaseFail;
