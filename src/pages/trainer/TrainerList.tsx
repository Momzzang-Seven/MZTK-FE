import TrainerHeader from "@components/trainer/TrainerHeader";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TrainerList = () => {
    const navigate = useNavigate();

    // 토글 상태 관리를 위한 임시 상태 (id 기준: 1, 2는 켜짐(true), 3은 꺼짐(false))
    const [ticketActiveState, setTicketActiveState] = useState<Record<number, boolean>>({
        1: true,
        2: true,
        3: false
    });

    // 토글 핸들러
    const handleToggle = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        setTicketActiveState(prev => ({
            ...prev,
            [id]: e.target.checked
        }));
    };

    // 더미 데이터 (목업)
    const myTickets = [
        {
            id: 1,
            title: "1:1 집중 웨이트 트레이닝",
            price: 350,
            image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "체형 교정 & 코어 강화 소그룹 PT (정원 4명)",
            price: 180,
            image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "바디프로필 준비반 (식단 밀착 관리 포함)",
            price: 500,
            image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop"
        }
    ];

    return (
        <div className="flex flex-col h-full bg-gray-50 min-h-screen">
            <TrainerHeader title="내 클래스 목록" showBack />

            <div className="px-5 pt-6 pb-20 flex flex-col gap-4">
                {/* 친절한 이용 가이드 박스 */}
                <div className="bg-main/5 border border-main/10 text-gray-700 px-4 py-3.5 rounded-xl text-[13.5px] leading-relaxed font-medium shadow-sm mb-1">
                    <p className="flex items-center gap-1.5 mb-1 text-main font-bold">
                        <span className="text-[16px]">💡</span> 이용 팁
                    </p>
                    <ul className="list-disc pl-5 text-gray-500 space-y-1 text-[13px]">
                        <li>클래스를 터치하면 내용을 <b className="text-gray-700">수정</b>할 수 있습니다.</li>
                        <li>스위치를 끄면 회원에게 클래스가 <b className="text-gray-700">노출되지 않습니다</b>.</li>
                    </ul>
                </div>

                {myTickets.length > 0 ? (
                    myTickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="bg-white rounded-2xl flex border border-gray-100 shadow-sm overflow-hidden"
                        >
                            {/* 왼쪽: 수정 진입 영역 (클릭 가능) */}
                            <div
                                onClick={() => navigate(`/trainer/edit/${ticket.id}`)}
                                className="group flex-1 min-w-0 p-4 flex gap-4 items-center cursor-pointer active:bg-gray-50 transition-colors"
                            >
                                <img src={ticket.image} alt={ticket.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                                <div className="flex-1 min-w-0 pr-2">
                                    <h3 className="font-bold text-gray-900 text-[15px] truncate">{ticket.title}</h3>
                                    <p className="text-main font-bold text-sm mt-1">{ticket.price} 토큰</p>
                                </div>
                                {/* 명시적인 수정 버튼 뱃지 */}
                                <div className="flex-shrink-0 bg-gray-100/80 px-3 py-1.5 rounded-lg text-gray-500 font-bold text-[11px] group-active:bg-gray-300 transition-colors">
                                    수정
                                </div>
                            </div>

                            {/* 세로 구분선 */}
                            <div className="w-[1px] bg-gray-100 my-4"></div>

                            {/* 오른쪽: 토글 제어 영역 (터치 영역 분리) */}
                            <div
                                className="w-[84px] p-4 flex flex-col items-center justify-center flex-shrink-0"
                                onClick={(e) => e.stopPropagation()} // 영역 터치 시 상세 페이지 진입 방지
                            >
                                <span className={`text-[11px] font-bold mb-1.5 tracking-tight transition-colors ${ticketActiveState[ticket.id] ? "text-main" : "text-gray-400"
                                    }`}>
                                    {ticketActiveState[ticket.id] ? "판매중" : "판매중지"}
                                </span>
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={ticketActiveState[ticket.id]}
                                            onChange={(e) => handleToggle(ticket.id, e)}
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
                            <img src="/icon/paste.svg" alt="list" className="w-8 h-8 opacity-50" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-[16px] mb-2">등록된 클래스가 없습니다</h3>
                        <p className="text-gray-400 text-sm text-center">아직 등록된 클래스가 없습니다.<br />새로운 클래스를 등록해보세요!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainerList;
