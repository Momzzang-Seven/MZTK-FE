import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { SimpleHeader } from "@components/layout";
import { useCreatePostStore } from "@store/createPostStore";
import type { CreatePostType } from "@store/createPostStore";
import { useCreatePost } from "@hooks/useCreatePost";
import FreePostForm from "@components/community/newPost/FreePostForm";
import QuestionPostForm from "@components/community/newPost/QuestionPostForm";
import AnswerPostForm from "@components/community/newPost/AnswerPostForm";

const WritePost = () => {
  const { type, postId } = useParams();
  const postType = useCreatePostStore((s) => s.postType);
  const reset = useCreatePostStore((s) => s.reset);
  const setPostType = useCreatePostStore((s) => s.setPostType);
  const setParentPostId = useCreatePostStore(
    (s) => s.setParentPostId,
  );
  const { isSubmitActive, isSubmitting, handleSubmit } =
    useCreatePost();

  // question/answer 전용: 스토어 초기화 + 타입 설정
  useEffect(() => {
    const urlType = (type ?? "free") as CreatePostType;
    if (urlType === "free") return;

    reset();
    setPostType(urlType);

    if (urlType === "answer" && postId) {
      setParentPostId(Number(postId));
    }
  }, [type, postId, reset, setPostType, setParentPostId]);

  return (
    <div>
      <SimpleHeader
        button={
          <div
            className={`font-semibold text-sm cursor-pointer ${
              !isSubmitActive || isSubmitting
                ? "text-gray-400"
                : "text-main"
            }`}
            onClick={
              isSubmitActive && !isSubmitting
                ? handleSubmit
                : undefined
            }
          >
            {isSubmitting ? "등록 중..." : "등록하기"}
          </div>
        }
      />

      <div className="flex flex-col gap-4 mt-2 mb-35">
        {postType === "free" && <FreePostForm />}
        {postType === "question" && <QuestionPostForm />}
        {postType === "answer" && <AnswerPostForm />}
      </div>
    </div>
  );
};

export default WritePost;

