import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CREATE_TICKET_TEXT, EDIT_TICKET_TEXT, EXERCISE_CATEGORIES } from "@constant";
import TrainerHeader from "@components/trainer/TrainerHeader";
import { CommonButton, CommonModal } from "@components/common";
import { calculateEndTime } from "@utils";

const EditTicket = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        category: EXERCISE_CATEGORIES[1],
        price: "",
        capacity: "",
        description: "",
        tags: ["", "", ""],
        features: ["", "", ""],
        duration: "",
        supplies: "",
        operatingDays: [] as string[],
        operatingTimes: {
            월: [],
            화: [],
            수: [],
            목: [],
            금: [],
            토: [],
            일: [],
        } as Record<string, string[]>,
    });

    // Dummy data loading effect
    useEffect(() => {
        // In a real app, you'd fetch by ID. Here we use dummy data.
        console.log(`Loading ticket with ID: ${id}`);
        setFormData({
            title: "1:1 집중 웨이트 트레이닝",
            category: "PT/헬스",
            price: "350",
            capacity: "1",
            description: "개인별 맞춤형 웨이트 트레이닝 프로그램입니다.",
            tags: ["체형 분석", "웨이트", "다이어트"],
            features: ["체형 분석 및 평가", "개인 맞춤형 식단 제공", "수업 외 카톡 밀착 코칭"],
            duration: "50분",
            supplies: "실내용 개인 선호 운동화",
            operatingDays: ["월", "수", "금"],
            operatingTimes: {
                월: ["09:00", "10:00", "18:00"],
                화: [],
                수: ["09:00", "15:00", "19:00"],
                목: [],
                금: ["10:00", "11:00"],
                토: [],
                일: [],
            },
        });
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeatureChange = (index: number, value: string) => {
        setFormData(prev => {
            const newFeatures = [...prev.features];
            newFeatures[index] = value;
            return { ...prev, features: newFeatures };
        });
    };

    const handleTagChange = (index: number, value: string) => {
        setFormData(prev => {
            const newTags = [...prev.tags];
            newTags[index] = value;
            return { ...prev, tags: newTags };
        });
    };

    const handleDayToggle = (day: string) => {
        setFormData(prev => {
            const isSelected = prev.operatingDays.includes(day);
            return {
                ...prev,
                operatingDays: isSelected
                    ? prev.operatingDays.filter(d => d !== day)
                    : [...prev.operatingDays, day]
            };
        });
    };

    const handleAddTime = (day: string, time: string) => {
        if (!time) return;
        setFormData(prev => {
            const currentTimes = prev.operatingTimes[day];
            if (currentTimes.includes(time)) return prev;
            return {
                ...prev,
                operatingTimes: {
                    ...prev.operatingTimes,
                    [day]: [...currentTimes, time].sort()
                }
            };
        });
    };

    const handleRemoveTime = (day: string, timeToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            operatingTimes: {
                ...prev.operatingTimes,
                [day]: prev.operatingTimes[day].filter(time => time !== timeToRemove)
            }
        }));
    };

    const handleSubmit = async () => {
        if (formData.operatingDays.length === 0) {
            setErrorMessage("최소 하나 이상의 운영 요일을 선택해 주세요.");
            setShowErrorModal(true);
            return;
        }

        const hasNoTimeRegistered = formData.operatingDays.some(day => formData.operatingTimes[day].length === 0);
        if (hasNoTimeRegistered) {
            setErrorMessage("선택한 운영 요일의 클래스 시작 시간을 추가해 주세요.");
            setShowErrorModal(true);
            return;
        }

        try {
            // [TODO] 실제 서버 API 연동 시 이 영역에 PUT/PATCH 요청을 구현합니다.
            // 예시: 
            // const response = await updateTicketApi(id, formData);
            // if (response.code !== "SUCCESS") throw new Error(response.message);

            alert("클래스가 성공적으로 수정되었습니다!");
            navigate("/trainer");
        } catch (error: any) {
            // 백엔드에서 전송한 실패 사유 및 에러 코드 처리
            const backendErrorMessage = error?.response?.data?.message || error?.message || "서버 요청 중 오류가 발생했습니다. 다시 시도해주세요.";
            setErrorMessage(backendErrorMessage);
            setShowErrorModal(true);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white min-h-screen">
            <TrainerHeader title={EDIT_TICKET_TEXT.TITLE} showBack />

            <div className="flex-1 px-5 py-6 flex flex-col gap-6 overflow-y-auto pb-32">
                {/* Title */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.TITLE}</label>
                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.TITLE}
                        className="w-full bg-grey-pale rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20"
                    />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-2 border-b border-gray-50 pb-2">
                    <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.CATEGORY}</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-grey-pale rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20 appearance-none bg-[url('https://cdn0.iconfinder.com/data/icons/user-interface-2062/24/arrow_drop_down-512.png')] bg-[length:24px] bg-[right_12px_center] bg-no-repeat"
                    >
                        {EXERCISE_CATEGORIES.filter(cat => cat !== "전체").map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Price & Capacity */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.PRICE}</label>
                        <input
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.PRICE}
                            className="w-full bg-grey-pale rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.CAPACITY}</label>
                        <input
                            name="capacity"
                            type="number"
                            value={formData.capacity}
                            onChange={handleChange}
                            placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.CAPACITY}
                            className="w-full bg-grey-pale rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20"
                        />
                    </div>
                </div>

                {/* 상세 설명 및 부가 정보 */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.DESC}</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.DESC}
                            className="w-full bg-grey-pale rounded-xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20 resize-none leading-relaxed"
                        />
                    </div>

                    {/* 해시태그 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">해시태그 (최대 3개)</label>
                        <div className="flex gap-2">
                            {formData.tags.map((tag, index) => (
                                <div key={index} className="flex-1 flex items-center relative gap-1 bg-grey-pale rounded-xl px-3 py-3.5 focus-within:ring-2 focus-within:ring-main/20">
                                    <span className="text-main font-bold">#</span>
                                    <input
                                        value={tag}
                                        onChange={(e) => handleTagChange(index, e.target.value)}
                                        placeholder={`태그${index + 1}`}
                                        className="w-full bg-transparent text-sm outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 프로그램 특징 (딱 3칸) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.FEATURES}</label>
                        <div className="flex flex-col gap-2">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <span className="text-main font-bold w-4">{index + 1}.</span>
                                    <input
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                                        placeholder={index === 0 ? CREATE_TICKET_TEXT.PLACEHOLDERS.FEATURE : ""}
                                        className="flex-1 bg-grey-pale rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 수업 시간 & 준비물 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.DURATION}</label>
                            <input
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.DURATION}
                                className="w-full bg-grey-pale rounded-xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.SUPPLIES}</label>
                            <input
                                name="supplies"
                                value={formData.supplies}
                                onChange={handleChange}
                                placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.SUPPLIES}
                                className="w-full bg-grey-pale rounded-xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. 스케줄 및 시간 설정 섹션 */}
                <div className="flex flex-col gap-8 mt-2">
                    {/* 운영 요일 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.OPERATING_DAYS}</label>
                        <p className="text-xs text-gray-500 mb-1">{CREATE_TICKET_TEXT.LABELS.OPERATING_DAYS_DESC}</p>
                        <div className="flex justify-between gap-1.5">
                            {['월', '화', '수', '목', '금', '토', '일'].map((day) => {
                                const isSelected = formData.operatingDays.includes(day);
                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDayToggle(day)}
                                        className={`w-10 h-10 rounded-full font-bold text-[14px] transition-all flex items-center justify-center ${isSelected ? 'bg-gray-300 text-gray-800 shadow-inner' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 매장 운영 시간 (개별 요일별) */}
                    {formData.operatingDays.length > 0 && (
                        <div className="flex flex-col gap-4 mt-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.OPERATING_HOURS}</label>
                                <p className="text-xs text-gray-500">{CREATE_TICKET_TEXT.LABELS.OPERATING_HOURS_DESC}</p>
                            </div>

                            {/* 선택된 요일별 시간 입력 */}
                            {['월', '화', '수', '목', '금', '토', '일'].filter(day => formData.operatingDays.includes(day)).map((day) => (
                                <div key={day} className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100/80">
                                    <div className="flex items-center gap-3">
                                        <div className="text-[15px] font-bold text-gray-800 w-8">{day}</div>
                                        <div className="flex flex-1 gap-2">
                                            <input
                                                type="time"
                                                id={`time-${day}`}
                                                className="flex-1 bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-medium outline-none focus:border-main/50"
                                            />
                                            <button
                                                onClick={() => {
                                                    const input = document.getElementById(`time-${day}`) as HTMLInputElement;
                                                    if (input && input.value) {
                                                        handleAddTime(day, input.value);
                                                        input.value = "";
                                                    }
                                                }}
                                                className="bg-main text-white px-4 py-2.5 rounded-xl text-[13px] font-bold shadow-sm active:opacity-90 transition-all"
                                            >
                                                추가
                                            </button>
                                        </div>
                                    </div>

                                    {/* 추가된 시간 리스트 */}
                                    {formData.operatingTimes[day].length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-1.5 pl-11">
                                            {formData.operatingTimes[day].map((time) => (
                                                <div key={time} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-[13px] shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                                    <span className="font-bold">
                                                        {formData.duration ? `${time} ~ ${calculateEndTime(time, formData.duration)}` : time}
                                                    </span>
                                                    <button onClick={() => handleRemoveTime(day, time)} className="text-gray-400 hover:text-red-500 font-bold p-0.5 ml-0.5 leading-none transition-colors">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Image Placeholder */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.IMAGE}</label>
                    <div className="w-full aspect-video bg-grey-pale rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                        <img src="/icon/camera.svg" alt="camera" className="w-8 h-8 opacity-20 mb-2" />
                        <span className="text-xs text-gray-400 font-medium">이미지 수정 (준비중)</span>
                        <span className="text-[10px] text-gray-400/80 font-medium mt-1">권장 사이즈 1028x720</span>
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <CommonButton
                    label={EDIT_TICKET_TEXT.SUBMIT}
                    className="h-[56px] rounded-2xl"
                    onClick={handleSubmit}
                    disabled={!formData.title || !formData.price || !formData.capacity || !formData.description || !formData.duration || !formData.supplies || formData.operatingDays.length === 0}
                />
            </div>

            {/* Error Modal */}
            {showErrorModal && (
                <CommonModal
                    title="수정 실패"
                    desc={errorMessage}
                    confirmLabel="확인"
                    onConfirmClick={() => setShowErrorModal(false)}
                />
            )}
        </div>
    );
};

export default EditTicket;
