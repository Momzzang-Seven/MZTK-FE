import { useNavigate } from "react-router-dom";

interface Ticket {
    id: number;
    title: string;
    price: number;
    sales: number;
    image: string;
}

interface TrainerTicketListProps {
    tickets: Ticket[];
}

const TrainerTicketList = ({ tickets }: TrainerTicketListProps) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-4 px-5">
            <h2 className="font-bold text-lg text-gray-800">내 클래스 목록</h2>
            {tickets.length > 0 ? (
                tickets.map((ticket) => (
                    <div key={ticket.id} className="bg-white rounded-2xl p-4 flex gap-4 border border-gray-100 shadow-sm">
                        <img src={ticket.image} alt={ticket.title} className="w-20 h-20 rounded-xl object-cover" />
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                            <div>
                                <h3 className="font-bold text-gray-900 line-clamp-1">{ticket.title}</h3>
                                <p className="text-main font-bold text-sm mt-1">{ticket.price} 토큰</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">판매수: {ticket.sales}건</span>
                                <button
                                    onClick={() => navigate(`/trainer/edit/${ticket.id}`)}
                                    className="text-xs text-gray-500 underline"
                                >
                                    수정하기
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="bg-gray-50 rounded-2xl py-12 flex flex-col items-center justify-center text-gray-400">
                    <p>등록된 클래스가 없습니다.</p>
                </div>
            )}
        </div>
    );
};

export default TrainerTicketList;
