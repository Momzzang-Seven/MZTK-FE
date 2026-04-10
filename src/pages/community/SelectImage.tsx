import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SimpleHeader } from "@components/layout";
import { useCreatePostStore } from "@store/createPostStore";
import type { CreatePostType } from "@store/createPostStore";
import MultiImageUploader from "@components/community/newPost/FreePostImageUploader";

// free 게시글 전용 페이지
const SelectImage = () => {
  const navigate = useNavigate();
  const { type } = useParams();

  const reset = useCreatePostStore((s) => s.reset);
  const setPostType = useCreatePostStore((s) => s.setPostType);
  const images = useCreatePostStore((s) => s.images);

  // 진입 시 스토어 초기화 + 타입 설정
  useEffect(() => {
    reset();
    setPostType(type as CreatePostType);
  }, [reset, setPostType]);

  const handleBackClick = () => {
    reset();
    navigate(-1);
  };

  const handleNextClick = () => {
    navigate(`/community/${type}/new`);
  };

  return (
    <div>
      <SimpleHeader
        onBackClick={handleBackClick}
        button={
          <div
            className={`font-semibold text-sm cursor-pointer ${
              images.length > 0 ? "text-main" : "text-gray-400"
            }`}
            onClick={images.length > 0 ? handleNextClick : undefined}
          >
            다음
          </div>
        }
      />

      <div className="mt-4">
        <MultiImageUploader />
      </div>
    </div>
  );
};

export default SelectImage;
