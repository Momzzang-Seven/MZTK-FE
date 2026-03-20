import { useEffect, useState } from "react";
import { useAdminStore } from "@store/adminStore";
import { AdminSearchBar } from "@components/admin/common/AdminSearchBar";

const InquiryManagement = () => {
    const {
        fetchInquiries,
        filteredInquiries,
        inquiryFilter,
        setInquiryFilter,
        toggleUserBanByInquiry,
        isLoading
    } = useAdminStore();

    const [selectedInquiry, setSelectedInquiry] = useState<number | null>(null);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    const handleToggleBan = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm("해당 사용자의 이용 제한 상태를 변경하시겠습니까?")) {
            await toggleUserBanByInquiry(id);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 px-1">문의 내역 관리</h2>

            {/* Filter Section */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                <div className="flex-1">
                    <AdminSearchBar
                        placeholder="제목 또는 내용으로 검색 (구현 예정)"
                        onSearch={() => { }}
                    />
                </div>
                <div className="relative">
                    <select
                        className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-4 pl-4 pr-10 rounded-xl focus:outline-none focus:border-main text-sm font-bold min-w-[150px] cursor-pointer"
                        value={inquiryFilter}
                        onChange={(e) => setInquiryFilter(e.target.value as Parameters<typeof setInquiryFilter>[0])}
                    >
                        <option value="ALL">전체 사용자</option>
                        <option value="MEMBER">회원 문의</option>
                        <option value="TRAINER">트레이너 문의</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="py-20 text-center text-gray-400 font-medium">데이터를 불러오는 중입니다...</div>
                ) : filteredInquiries.length > 0 ? (
                    filteredInquiries.map((inquiry) => (
                        <div
                            key={inquiry.id}
                            className={`bg-white rounded-2xl border transition-all cursor-pointer overflow-hidden ${selectedInquiry === inquiry.id ? 'border-main ring-1 ring-main' : 'border-gray-100 hover:border-main/50'
                                }`}
                            onClick={() => setSelectedInquiry(selectedInquiry === inquiry.id ? null : inquiry.id)}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${inquiry.authorRole === 'TRAINER' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-main'
                                                }`}>
                                                {inquiry.authorRole === 'TRAINER' ? '트레이너' : '회원'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${inquiry.status === 'OPEN' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {inquiry.status === 'OPEN' ? '답변대기' : '답변완료'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mt-1">{inquiry.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <span>{inquiry.author}</span>
                                            <span>•</span>
                                            <span>{inquiry.date}</span>
                                        </div>
                                    </div>

                                    {/* Action Button: User Restriction */}
                                    <button
                                        onClick={(e) => handleToggleBan(e, inquiry.id)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-1.5 ${inquiry.isAuthorBanned
                                            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                                            }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${inquiry.isAuthorBanned ? 'bg-gray-400' : 'bg-red-600'}`}></div>
                                        {inquiry.isAuthorBanned ? '제한 해제' : '사용자 제한'}
                                    </button>
                                </div>

                                {selectedInquiry === inquiry.id && (
                                    <div className="mt-6 pt-6 border-t border-gray-100 animate-fadeIn">
                                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{inquiry.content}</p>

                                        <div className="mt-8">
                                            <textarea
                                                className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-main focus:ring-1 focus:ring-main text-sm"
                                                placeholder="답변 내용을 입력하세요..."
                                                onClick={(e) => e.stopPropagation()}
                                            ></textarea>
                                            <div className="flex justify-end mt-3">
                                                <button
                                                    className="bg-main text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-yellow-500 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        alert('답변이 등록되었습니다 (데모용)');
                                                        setSelectedInquiry(null);
                                                    }}
                                                >
                                                    답변 등록
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-40 bg-white rounded-2xl border border-dashed border-gray-200 text-center flex flex-col items-center gap-3">
                        <div className="text-4xl opacity-20">✉️</div>
                        <p className="text-gray-400 font-medium">조회된 문의 내역이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InquiryManagement;
