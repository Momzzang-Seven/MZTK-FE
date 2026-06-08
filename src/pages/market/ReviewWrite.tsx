import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TrainerHeader from "@components/trainer/TrainerHeader";
import { CommonButton, CommonModal } from "@components/common";
import { PhotoUploader } from "@components/common/PhotoUploader";

const ReviewWrite = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    desc: "",
    variant: "success" as "success" | "warning" | "error",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      setModalState({
        isOpen: true,
        title: "내용 미입력",
        desc: "클래스에 대한 솔직한 후기를 한 줄 이상 남겨주세요.",
        variant: "warning",
      });
      return;
    }

    // In real app, API call would go here
    setModalState({
      isOpen: true,
      title: "등록 완료",
      desc: "소중한 후기가 성공적으로 등록되었습니다!<br/>작성해주신 후기는 다른 회원들에게 큰 도움이 됩니다.",
      variant: "success",
    });
  };

  const getRatingText = (val: number) => {
    switch (val) {
      case 5:
        return "최고의 경험이었어요! 😍";
      case 4:
        return "정말 만족스러워요 😊";
      case 3:
        return "보통이었어요 😐";
      case 2:
        return "조금 아쉬워요 😕";
      case 1:
        return "추천하지 않아요 😥";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FDFDFD] min-h-dvh">
      <TrainerHeader
        title="수강평 작성"
        desc="수업에 대한 솔직한 후기를 남겨주세요."
        showBack
      />

      <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col gap-10 pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Rating Section */}
        <section className="flex flex-col items-center gap-6 py-10 bg-white rounded-[32px] shadow-2xl shadow-gray-200/40 border border-gray-50">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">
              How was your class?
            </span>
            <h3 className="text-[18px] font-black text-gray-900 tracking-tight">
              수업은 만족스러우셨나요?
            </h3>
          </div>

          <div className="flex gap-2.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-all active:scale-90"
              >
                <svg
                  width="42"
                  height="42"
                  viewBox="0 0 24 24"
                  fill={star <= rating ? "#FAB12F" : "none"}
                  stroke={star <= rating ? "#FAB12F" : "#E5E7EB"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={
                    star <= rating
                      ? "drop-shadow-[0_0_8px_rgba(250,177,47,0.3)]"
                      : ""
                  }
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            ))}
          </div>

          <div className="px-6 py-2 bg-amber-50 rounded-full">
            <span className="text-main font-black text-[15px] tracking-tight transition-all">
              {getRatingText(rating)}
            </span>
          </div>
        </section>

        {/* Photo Upload Section */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-4 bg-main rounded-full" />
            <h3 className="text-[15px] font-black text-gray-900 tracking-tight">
              운동 인증샷 첨부
            </h3>
          </div>
          <div className="w-full bg-white rounded-[28px] p-2 border border-gray-100 shadow-xl shadow-gray-100/40">
            <PhotoUploader
              previewUrl={previewUrl}
              onFileChange={handleFileChange}
              guideTitle="오늘의 운동을 사진으로 남겨보세요"
              guideDesc="직접 찍은 인증샷은 트레이너에게 큰 힘이 됩니다."
              uploadNoImageText="이곳을 눌러 사진 선택"
              uploadSizeHintText="클래스 관련 이미지만 업로드해 주세요"
            />
          </div>
        </section>

        {/* Content Section */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-4 bg-main rounded-full" />
            <h3 className="text-[15px] font-black text-gray-900 tracking-tight">
              솔직한 후기를 남겨주세요
            </h3>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="수업 방식이나 장소의 쾌적함 등 다른 회원들에게 도움이 될 만한 이야기를 들려주세요!"
            className="w-full h-48 bg-white border border-gray-100 rounded-[28px] p-6 text-[15px] font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-main/30 transition-all shadow-lg shadow-gray-100/40 resize-none leading-relaxed"
          />
        </section>
      </div>

      {/* Luxury Sticky Footer */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[450px] w-full bg-white/90 backdrop-blur-xl px-6 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom))] border-t border-gray-100/50 shadow-[0_-15px_40px_rgba(0,0,0,0.06)] z-50 rounded-t-[32px]">
        <CommonButton
          label="후기 등록 완료"
          onClick={handleSubmit}
          className="h-[60px] rounded-[22px] font-black text-[16px] shadow-xl shadow-main/20 active:scale-95 transition-all"
        />
      </div>

      {modalState.isOpen && (
        <CommonModal
          variant={modalState.variant}
          title={modalState.title}
          desc={modalState.desc}
          confirmLabel="확인"
          onConfirmClick={() => {
            if (modalState.variant === "success") {
              navigate("/market/reservations");
            }
            setModalState({ ...modalState, isOpen: false });
          }}
        />
      )}
    </div>
  );
};

export default ReviewWrite;
