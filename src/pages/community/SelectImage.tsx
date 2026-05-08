import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { SimpleHeader } from "@components/layout";
import { usePostStore } from "@store";
import type { PostType } from "@store";
import { FreePostImageUploader } from "@components/community";
import { useLoadPostForEdit } from "@hooks";

// free 게시글 전용 페이지
const SelectImage = () => {
  const navigate = useNavigate();
  const { type, postId } = useParams();
  const { pathname } = useLocation();
  const isEditMode = pathname.includes("/edit/");

  const reset = usePostStore((s) => s.reset);
  const setPostType = usePostStore((s) => s.setPostType);
  const images = usePostStore((s) => s.images);

  const { isFetching, loadPost } = useLoadPostForEdit();

  useEffect(() => {
    if (isEditMode && postId) {
      // 수정 모드: 기존 게시물 데이터를 fetch해 스토어에 채움
      reset();
      loadPost(Number(postId));
    } else {
      // 신규 작성 모드: 스토어 초기화 후 타입 설정
      reset();
      setPostType(type?.toUpperCase() as PostType);
    }
  }, [isEditMode, postId, type, loadPost, reset, setPostType]);

  const handleBackClick = () => {
    reset();
    navigate(-1);
  };

  const handleNextClick = () => {
    if (isEditMode && postId) {
      navigate(`/community/${type}/edit/${postId}`);
    } else {
      navigate(`/community/${type}/new`);
    }
  };

  // 수정 모드에서는 새 이미지 없이도 진행 가능
  const canProceed = images.length > 0 || isEditMode;

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-sm text-gray-400">불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <SimpleHeader
        onBackClick={handleBackClick}
        button={
          <div
            className={`font-semibold text-sm cursor-pointer ${
              canProceed ? "text-main" : "text-gray-400"
            }`}
            onClick={canProceed ? handleNextClick : undefined}
          >
            다음
          </div>
        }
      />

      <div className="mt-4">
        <FreePostImageUploader />
      </div>
    </div>
  );
};

export default SelectImage;
