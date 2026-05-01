import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { SimpleHeader } from "@components/layout";
import { usePostStore } from "@store";
import type { CreatePostType } from "@store";
import { usePostService, useLoadPostForEdit } from "@hooks";
import { FreePostForm, QuestionPostForm, AnswerPostForm } from "@components/community";

const WritePost = () => {
  const { type, postId } = useParams();
  const { pathname } = useLocation();
  const isEditMode = pathname.includes("/edit/");
  const shouldFetchHere = isEditMode && type !== "free"; // FREE 게시글은 SelectImage에서 이미 fetch했으므로 여기서는 skip

  const postType = usePostStore((s) => s.postType);
  const storeContent = usePostStore((s) => s.content);
  const storeTitle = usePostStore((s) => s.title);
  const reset = usePostStore((s) => s.reset);
  const setPostType = usePostStore((s) => s.setPostType);
  const setParentPostId = usePostStore((s) => s.setParentPostId);

  const { isFetching, loadPost } = useLoadPostForEdit();
  const {
    isSubmitActive,
    isLoading: isSubmitting,
    createPost,
    updatePost,
  } = usePostService();

  // 수정 모드
  useEffect(() => {
    if (shouldFetchHere && postId) {
      loadPost(Number(postId));
    }
  }, [shouldFetchHere, postId, loadPost]);

  // 새 게시물 모드
  useEffect(() => {
    if (isEditMode || !shouldFetchHere) return;

    const urlType = (type?.toUpperCase() ?? "QUESTION") as CreatePostType;
    reset();
    setPostType(urlType);

    if (urlType === "ANSWER" && postId) {
      setParentPostId(Number(postId));
    }
  }, [type, postId, isEditMode, reset, setPostType, setParentPostId]);

  const handleSubmit = isEditMode
    ? () => updatePost(Number(postId))
    : createPost;

  const isActive = isSubmitActive && !isSubmitting;

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-sm text-gray-400">불러오는 중...</span>
      </div>
    );
  }

  // 수정 모드 초기값: 스토어에서 읽음
  // FREE: SelectImage fetch 완료 후 navigate → 스토어에 이미 데이터 있음
  // QUESTION/ANSWER: 위 useEffect fetch 완료 후 스토어에 데이터 있음
  const initialContent = isEditMode && storeContent ? storeContent : undefined;
  const initialTitle = isEditMode && storeTitle ? storeTitle : undefined;

  return (
    <div>
      <SimpleHeader
        button={
          <div
            className={`font-semibold text-sm cursor-pointer ${
              !isActive ? "text-gray-400" : "text-main"
            }`}
            onClick={isActive ? handleSubmit : undefined}
          >
            {isSubmitting
              ? isEditMode
                ? "수정 중..."
                : "등록 중..."
              : isEditMode
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
            initialContent={initialContent}
          />
        )}
        {postType === "ANSWER" && (
          <AnswerPostForm initialContent={initialContent} />
        )}
      </div>
    </div>
  );
};

export default WritePost;
