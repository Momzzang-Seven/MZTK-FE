import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePostStore } from "@store/createPostStore";
import { buildPostPayload } from "@utils/buildPostPayload";
import {
  createPost,
  createAnswer,
} from "@services/community";

/**
 * 게시물 등록 공통 로직 (유효성 검증 + 제출)
 */
export const useCreatePost = () => {
  const navigate = useNavigate();
  const store = useCreatePostStore();
  const uploadingCount = useCreatePostStore(
    (s) => s.uploadingCount,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { postType, title, content, reward, parentPostId, reset } = store;

  const isSubmitActive = (() => {
    if (uploadingCount > 0) return false;
    if (!content.trim()) return false;

    switch (postType) {
      case "free":
        return true;
      case "question":
        return title.trim() !== "" && reward >= 1;
      case "answer":
        return true;
    }
  })();

  const handleSubmit = async () => {
    if (!isSubmitActive || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = buildPostPayload(store);

      if (postType === "answer" && parentPostId) {
        await createAnswer(parentPostId, payload);
      } else {
        await createPost(payload);
      }

      reset();
      navigate(-1);
    } catch (error) {
      console.error("게시물 등록 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitActive, isSubmitting, handleSubmit };
};
