import { useState } from "react";
import TrainerHeader from "@components/trainer/TrainerHeader";

const MOCK_REVIEWS = [
    {
        id: "rv1",
        customerName: "열혈다이어터",
        rating: 5,
        date: "2026.02.26",
        className: "1:1 집중 웨이트 트레이닝",
        content: "처음 웨이트를 시작해서 걱정이 많았는데 꼼꼼하게 자세를 봐주셔서 자극이 어디에 와야하는지 정확히 알게 되었습니다! 트레이너님 덕분에 헬스장에 가는 게 즐거워졌어요😊"
    },
    {
        id: "rv2",
        customerName: "바쁘다바빠현대사회",
        rating: 4,
        date: "2026.02.21",
        className: "체형 교정 & 코어 강화 소그룹 PT",
        content: "거북목이랑 라운드 숄더가 심해서 신청했는데 한 달 만에 어깨 통증이 많이 줄어든 게 느껴집니다. 그룹 수업이지만 개인별로 신경을 잘 써주십니다."
    },
    {
        id: "rv3",
        customerName: "몸짱도전기",
        rating: 5,
        date: "2026.02.15",
        className: "바디프로필 준비반 (식단방 포함)",
        content: "말씀하신 대로만 식단하고 운동했더니 인생 첫 바프 대성공했습니다!!!! 🔥🔥 진짜 멘탈 관리까지 완벽하게 해주셔서 견딜 수 있었어요! 최고!!"
    },
    {
        id: "rv4",
        customerName: "초보헬린이",
        rating: 4,
        date: "2026.02.10",
        className: "1:1 집중 웨이트 트레이닝",
        content: "자세는 잘 잡아주시는데, 인기 많은 강사님이시라 예약 잡기가 조금 빡셉니다 ㅠㅠ 그래도 수업 퀄리티 자체는 대만족이에요!"
    }
];

const TrainerReviews = () => {
    const [selectedClass, setSelectedClass] = useState<string>("전체");

    // 존재하는 모든 클래스 이름 추출
    const classNames = ["전체", ...Array.from(new Set(MOCK_REVIEWS.map(r => r.className)))];

    // 선택된 클래스에 따른 후기 리스트 필터링
    const filteredReviews = selectedClass === "전체"
        ? MOCK_REVIEWS
        : MOCK_REVIEWS.filter(r => r.className === selectedClass);

    return (
        <div className="flex flex-col h-full bg-gray-50 min-h-screen">
            <TrainerHeader title="후기 보기" showBack />

            {/* 상단 클래스 필터 영역 (Select 드롭다운으로 변경) */}
            <div className="w-full bg-white border-b border-gray-100 z-10 sticky top-[60px] shadow-sm px-5 py-3">
                <div className="relative">
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-[15px] font-bold outline-none focus:border-gray-800 focus:bg-white transition-all appearance-none pr-10 shadow-sm"
                    >
                        {classNames.map((cName) => (
                            <option key={cName} value={cName}>
                                {cName === "전체" ? "🌟 모든 클래스 종합" : cName}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 pb-24 flex flex-col gap-6">

                {/* 클래스별 별점 요약 (단일 통합 UI로 변경) */}
                <div className="flex flex-col gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-[17px]">
                        {selectedClass === "전체" ? "전체 강좌 리뷰 평점" : "선택한 클래스 평점"}
                    </h3>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3">
                        <span className="text-gray-500 text-[14px] font-bold text-center break-keep">
                            {selectedClass === "전체" ? "모든 클래스 종합 평점" : selectedClass}
                        </span>

                        {filteredReviews.length === 0 ? (
                            <div className="text-gray-400 text-[13px] font-medium py-2">아직 작성된 후기가 없습니다.</div>
                        ) : (
                            <div className="flex items-end gap-1.5">
                                <span className="text-yellow-400 text-[28px] -mt-1 drop-shadow-sm">⭐</span>
                                <span className="text-[34px] font-extrabold text-gray-900 leading-none tracking-tight">
                                    {(filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length).toFixed(1)}
                                </span>
                                <span className="text-gray-400 text-[15px] font-bold mb-1.5 ml-1">
                                    ({filteredReviews.length}개)
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 후기 목록 */}
                <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-gray-900 text-[17px] mb-1">받은 후기 내역</h3>
                    {filteredReviews.length === 0 ? (
                        <div className="text-center text-gray-400 py-10 font-medium text-[14px]">해당하는 후기가 없습니다.</div>
                    ) : (filteredReviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3.5">
                            {/* 후기 상단 헤더: 별점 및 날짜 */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-800">{review.customerName}</span>
                                    <div className="h-3 w-[1px] bg-gray-300"></div>
                                    <span className="text-yellow-400 text-[13px] tracking-widest mt-0.5">
                                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                    </span>
                                </div>
                                <span className="text-gray-400 text-[12px] font-medium tabular-nums">{review.date}</span>
                            </div>

                            {/* 클래스 이름 뱃지 */}
                            <div className="bg-gray-50 text-gray-600 text-[12px] px-3 py-1.5 rounded-lg w-fit font-medium">
                                수강 클래스 : {review.className}
                            </div>

                            {/* 리뷰 내용 본문 */}
                            <p className="text-[14.5px] text-gray-700 leading-relaxed font-medium mt-1">
                                {review.content}
                            </p>
                        </div>
                    )))}
                </div>

            </div>
        </div>
    );
};

export default TrainerReviews;
