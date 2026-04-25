import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePostStore } from "@store";
import { buildPostPayload } from "@utils/buildPostPayload";
import { postService } from "@services";
import type { FreePost, QuestionPost } from "@types";

export const usePostService = () => {
  const navigate = useNavigate();
  const store = usePostStore();
  const uploadingCount = usePostStore((s) => s.uploadingCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { postType, title, content, reward, parentPostId, reset } = store;

  const isSubmitActive = (() => {
    if (uploadingCount > 0) return false;
    if (!content?.trim()) return false;

    switch (postType) {
      case "FREE":
        return true;
      case "QUESTION":
        return title.trim() !== "" && reward >= 1;
      case "ANSWER":
        return true;
    }
  })();

  /**
   * 게시물 생성
   * 양식 검사 + 제출
   */
  const createPost = async () => {
    if (!isSubmitActive || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const payload = buildPostPayload(store);

      if (postType === "FREE") {
        await postService.createFreePost(payload);
      } else if (postType === "QUESTION") {
        await postService.createQuestionPost(payload);
      } else if (postType === "ANSWER" && parentPostId) {
        await postService.createAnswer(parentPostId, payload);
      }

      reset();

      if ((postType === "ANSWER" && parentPostId) || postType === "QUESTION") {
        navigate(-1); // 답변, 질문 -> 이전 페이지로
      } else if (postType === "FREE") {
        navigate(-2); // 자유 -> 이미지 선택 페이지에서 왔으므로 두 번 뒤로
      }

    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "게시물 등록에 실패했습니다.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 게시물 상세 조회
   * @param postId 게시물 ID
   * @returns 게시물 정보
   */
  const getPost = async (postId: number): Promise<FreePost | QuestionPost | null> => {
    if (isLoading) return null;

    setIsLoading(true);
    setError(null);
    try {
      const response = await postService.getPost(postId);
      return response;
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "게시물 조회에 실패했습니다.";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * 게시물 수정(자유, 질문)
   * @param postId 게시물 ID
   * @param payload 게시물 정보
   */
  const updatePost = async (postId: number) => {
    if (!isSubmitActive || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const payload = buildPostPayload(store);

      await postService.updatePost(postId, payload);
      reset();
      navigate(`/community/${postType.toLowerCase()}/${postId}`);
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "게시물 수정에 실패했습니다.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * 게시물 삭제
   * @param postId 게시물 ID
   */
  const deletePost = async (postId: number) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      await postService.deletePost(postId);
      reset();
      navigate(`/community/${postType.toLowerCase()}`);
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "게시물 삭제에 실패했습니다.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return { isSubmitActive, isLoading, error, createPost, getPost, updatePost, deletePost };
};
