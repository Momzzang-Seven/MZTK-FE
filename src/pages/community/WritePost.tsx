import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { SimpleHeader } from "@components/layout";
import { LoadingSpinner, CommonModal } from "@components/common";
import { usePostStore } from "@store";
import type { PostType } from "@store";
import { usePostService, useLoadPostForEdit } from "@hooks";
import { FreePostForm, QuestionPostForm, AnswerPostForm } from "@components/community";
import { replaceImageSrc } from "@utils";

const WritePost = () => {
  const { type, postId } = useParams();
  const { pathname } = useLocation();
  const isEditMode = pathname.includes("/edit/");
  const shouldFetchHere = isEditMode && type !== "free"; // FREE 게시글은 SelectImage에서 이미 fetch했으므로 여기서는 skip

  const postType = usePostStore((s) => s.postType);
  const storeContent = usePostStore((s) => s.content);
  const storeImages = usePostStore((s) => s.images);
  const storeTitle = usePostStore((s) => s.title);
  const reset = usePostStore((s) => s.reset);
  const setPostType = usePostStore((s) => s.setPostType);
  const setParentPostId = usePostStore((s) => s.setParentPostId);

  const { isFetching, loadPost } = useLoadPostForEdit();
  const {
    isSubmitActive,
    isPostLoading: isLoading,
    error,
    setError,
    createPost,
    updatePost,
  } = usePostService();

  useEffect(() => {
    if (isEditMode && shouldFetchHere && postId) {
      // 수정 모드
      reset();
      loadPost(Number(postId));
    } else {
      // 새 게시물 모드
      const urlType = (type?.toUpperCase() ?? "QUESTION") as PostType;
      if (urlType !== "FREE") reset();
      setPostType(urlType);

      if (urlType === "ANSWER" && postId) {
        setParentPostId(Number(postId));
      }
    }
  }, [type, postId, isEditMode, reset, loadPost, setPostType, setParentPostId, shouldFetchHere]);

  // 수정 모드 초기값: 스토어에서 읽음
  // FREE: SelectImage fetch 후 WritePost → 스토어에 이미 데이터 있음
  // QUESTION/ANSWER: 위 useEffect fetch 완료 후 스토어에 데이터 있음
  const initialContent = isEditMode && storeContent ? storeContent : undefined;
  const initialTitle = isEditMode && storeTitle ? storeTitle : undefined;
  const processedContent = initialContent
    ? replaceImageSrc(initialContent, storeImages)
    : "";

  const handleSubmit = isEditMode
    ? () => updatePost(Number(postId))
    : createPost;

  const isActive = isSubmitActive && !isLoading;

  return (
    <div className="relative min-h-screen pt-20">
      {(isFetching || isLoading) && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
          <LoadingSpinner size="lg" color="text-white" />
        </div>
      )}

      {error && (
        <CommonModal
          title="오류 발생"
          desc={error}
          confirmLabel="재시도"
          onConfirmClick={handleSubmit}
          cancelLabel="닫기"
          onCancelClick={() => setError(null)}
        />
      )}

      <SimpleHeader
        button={
          <div
            className={`font-semibold text-sm cursor-pointer ${
              !isActive ? "text-gray-400" : "text-main"
            }`}
            onClick={isActive ? handleSubmit : undefined}
          >
            {isEditMode
                ? "수정하기"
                : "등록하기"}
          </div>
        }
      />

      <div className="flex flex-col gap-4 mt-2 mb-35">
        {postType === "FREE" && (
          <FreePostForm initialContent={initialContent} />
        )}
        {postType === "QUESTION" && (
          <QuestionPostForm
            initialTitle={initialTitle}
            initialContent={processedContent}
          />
        )}
        {postType === "ANSWER" && (
          <AnswerPostForm initialContent={processedContent} />
        )}
      </div>
    </div>
  );
};

export default WritePost;
