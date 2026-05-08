import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SimpleHeader } from "@components/layout";
import { CommonButton } from "@components/common";
import { PhotoUploader } from "@components/common/PhotoUploader";

const ReviewWrite = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      alert("후기 내용을 입력해주세요.");
      return;
    }
    alert("후기가 성공적으로 등록되었습니다!");
    navigate("/market/reservations");
  };

  return (
    <div className="flex flex-col h-full bg-white max-w-[450px] mx-auto min-h-screen shadow-lg">
      <SimpleHeader title="수강평 작성" onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-8 pb-32">
        {/* 별점 선택 */}
        <div className="flex flex-col items-center gap-4 py-6 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="text-gray-500 font-bold text-[15px]">
            클래스는 어떠셨나요?
          </span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="text-[36px] transition-transform active:scale-90"
              >
                {star <= rating ? "⭐" : "☆"}
              </button>
            ))}
          </div>
          <span className="text-main font-extrabold text-[18px]">
            {rating === 5
              ? "최고예요! 😍"
              : rating === 4
                ? "좋아요! 😊"
                : rating === 3
                  ? "보통이에요 😐"
                  : rating === 2
                    ? "그저 그래요 😕"
                    : "별로예요 😥"}
          </span>
        </div>

        {/* 사진 업로드 */}
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-gray-900 text-[17px]">
            사진 첨부 (선택)
          </h3>
          <div className="w-full">
            <PhotoUploader
              previewUrl={previewUrl}
              onFileChange={handleFileChange}
              guideTitle="운동 인증샷을 공유해주세요"
              guideDesc="직접 찍은 사진을 올리면 다른 회원들에게 큰 도움이 됩니다."
              uploadNoImageText="사진을 선택해주세요"
              uploadSizeHintText="이미지 파일만 업로드 가능합니다"
            />
          </div>
        </div>

        {/* 후기 내용 */}
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-gray-900 text-[17px]">후기 내용</h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="트레이너님의 수업 방식이나 장소의 쾌적함 등 솔직한 후기를 남겨주세요!"
            className="w-full h-[180px] bg-gray-50 border border-gray-100 rounded-2xl p-5 text-[15px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-main/20 focus:border-main transition-all resize-none shadow-inner"
          />
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="fixed bottom-0 w-full max-w-[450px] bg-white px-5 py-5 border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-50 rounded-t-3xl left-1/2 -translate-x-1/2">
        <CommonButton
          label="후기 등록하기"
          onClick={handleSubmit}
          className="h-[56px] rounded-2xl font-bold text-[17px]"
        />
      </div>
    </div>
  );
};

export default ReviewWrite;
