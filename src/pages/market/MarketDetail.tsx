import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CommonButton } from "@components/common";
import { DUMMY_DETAILS } from "@constant/marketData";
import { IntroTab, LocationTab, ReviewTab } from "@components/market/detail/MarketTabs";

const MarketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"intro" | "location" | "review">("intro");

    const data = DUMMY_DETAILS[id || "1"];

    if (!data) return <div className="p-10 text-center">클래스를 찾을 수 없습니다.</div>;

    return (
        <div className="flex flex-col h-full bg-gray-50 min-h-screen relative pb-28">
            {/* 상단 이미지 영역 */}
            <div className="relative w-full h-[280px]">
                <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                    {data.images?.map((img: string, idx: number) => (
                        <img key={idx} src={img} alt={`${data.title}-${idx}`} className="w-full h-full object-cover flex-shrink-0 snap-center" />
                    ))}
                </div>
                {/* 인디케이터 */}
                {data.images?.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {data.images.map((_: any, idx: number) => (
                            <div key={idx} className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm"></div>
                        ))}
                    </div>
                )}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white active:bg-black/50 transition-colors"
                >
                    <img src="/icon/backArrow.svg" alt="back" className="w-6 h-6 invert" />
                </button>
            </div>

            {/* 기본 정보 영역 */}
            <div className="bg-white px-5 py-6 flex flex-col gap-4 shadow-sm z-10 -mt-4 rounded-t-3xl relative">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg w-fit">
                            {data.category}
                        </span>
                        {/* 정원 */}
                        <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg w-fit flex items-center gap-1 border border-green-200">
                            {data.capacity === 1 ? '👤 1:1 레슨' : `👥 정원 ${data.capacity}명`}
                        </span>

                    </div>
                    <h1 className="text-[22px] font-bold text-gray-900 leading-tight">{data.title}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-600 font-medium text-[15px]">{data.trainerName}</span>
                        <div className="w-[1px] h-3 bg-gray-300"></div>
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-400 text-sm">⭐</span>
                            <span className="text-sm font-bold text-gray-800">{data.rating}</span>
                            <span className="text-sm text-gray-400">({data.reviewCount})</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {data.tags.map((tag: string) => (
                        <span key={tag} className="text-[12px] font-bold text-main bg-main/10 px-2.5 py-1.5 rounded-md">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="sticky top-0 bg-white z-20 border-b border-gray-100 flex shadow-[0_4px_10px_rgba(0,0,0,0.02)] pt-2 relative">
                {[
                    { id: "intro", label: "프로그램 소개" },
                    { id: "location", label: "위치" },
                    { id: "review", label: `후기(${data.reviewCount})` }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-3 text-[15px] font-bold transition-colors ${activeTab === tab.id ? "text-gray-900" : "text-gray-400"}`}
                    >
                        {tab.label}
                    </button>
                ))}
                {/* Active Bar */}
                <div
                    className="absolute bottom-0 h-0.5 bg-gray-900 transition-all duration-300"
                    style={{
                        width: '33.333%',
                        transform: `translateX(${activeTab === 'intro' ? 0 : activeTab === 'location' ? 100 : 200}%)`
                    }}
                />
            </div>

            <div className="flex-1 px-5 pt-6 pb-6 flex flex-col gap-8 min-h-[500px]">
                {activeTab === 'intro' && <IntroTab data={data} />}
                {activeTab === 'location' && <LocationTab data={data} />}
                {activeTab === 'review' && <ReviewTab data={data} />}
            </div>

            {/* 하단 고정 예약 바 */}
            <div className="fixed bottom-0 max-w-[450px] w-full bg-white px-5 py-4 flex items-center justify-between border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] z-50 rounded-t-2xl">
                <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400 font-bold mb-0.5">1회권 구매</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-main flex items-center justify-center text-white text-[11px] font-bold">
                            T
                        </div>
                        <span className="font-bold text-[22px] text-gray-900 tabular-nums leading-none tracking-tight">{data.price}</span>
                    </div>
                </div>
                <div className="w-[200px]">
                    <CommonButton
                        label="클래스 구매하기"
                        onClick={() => navigate(`/market/purchase/${id}`)}
                        className="h-[52px] rounded-xl font-bold"
                    />
                </div>
            </div>
        </div>
    );
};

export default MarketDetail;
