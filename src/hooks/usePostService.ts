import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { usePostStore, useUserStore } from "@store";
import { useWalletService } from "@hooks/useWalletService";
import { buildPostPayload } from "@utils/buildPostPayload";
import { imageService, postService, web3Service } from "@services";
import { getKoreanErrorMessageFromError } from "@constant";
import type {
  FreePost,
  QuestionPost,
  PostPayload,
  AnswerPost,
  ResourceType,
} from "@types";
import type { PostType } from "@store";
import {
  containsUnsafeMarkup,
  getPlainTextLength,
  TEXT_LIMITS,
} from "@utils/edgeCaseValidation";

export const POST_ERROR_CODE = {
  ALLOWANCE_REQUIRED: "ALLOWANCE_REQUIRED",
  BALANCE_PENDING: "BALANCE_PENDING",
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
} as const;

export const usePostService = () => {
  const navigate = useNavigate();
  const store = usePostStore();
  const setPostType = usePostStore((s) => s.setPostType);
  const uploadingCount = usePostStore((s) => s.uploadingCount);
  const [isPostLoading, setIsPostLoading] = useState(false);
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { postType, title, content, reward, parentPostId, initialData, reset } =
    store;

  const validateCurrentPostInput = () => {
    const contentLength = getPlainTextLength(content);
    const maxContentLength =
      postType === "FREE"
        ? TEXT_LIMITS.freePost
        : postType === "ANSWER"
          ? TEXT_LIMITS.answer
          : TEXT_LIMITS.richContent;

    if (contentLength > maxContentLength) {
      setError(`내용은 ${maxContentLength}자 이하로 작성해 주세요.`);
      return false;
    }

    if (containsUnsafeMarkup(content)) {
      setError("스크립트 형태의 내용은 작성할 수 없습니다.");
      return false;
    }

    if (store.tags.some((tag) => tag.length > TEXT_LIMITS.tag)) {
      setError(`태그는 ${TEXT_LIMITS.tag}자 이하로 작성해 주세요.`);
      return false;
    }

    if (store.tags.some((tag) => containsUnsafeMarkup(tag))) {
      setError("스크립트 형태의 태그는 사용할 수 없습니다.");
      return false;
    }

    if (postType === "QUESTION" && !Number.isInteger(reward)) {
      setError("Question reward must be a whole number.");
      return false;
    }

    return true;
  };

  const isSubmitActive = (() => {
    if (uploadingCount > 0) return false;
    if (!content?.trim()) return false;

    const isFormValid = (() => {
      switch (postType) {
        case "FREE":
          return true;
        case "QUESTION":
          return title.trim() !== "" && reward >= 1;
        case "ANSWER":
          return true;
        default:
          return false;
      }
    })();

    if (!isFormValid) return false;

    if (initialData) {
      const patch = buildPostPayload(store, initialData as PostPayload);
      return Object.keys(patch).length > 0;
    }

    return true; // 신규 생성 모드
  })();

  const { getAllowance } = useWalletService();

  const confirmPostImages = async (payload: Partial<PostPayload>) => {
    await imageService.confirmImageUpload(payload.imageIds ?? []);
  };

  /**
   * 게시물 생성
   * 양식 검사 + 제출
   */
  const createPost = async () => {
    if (!isSubmitActive || isPostLoading) return;
    if (!validateCurrentPostInput()) return;

    setIsPostLoading(true);
    setError(null);
    try {
      const payload = buildPostPayload(store);
      let hasWeb3Action = false;

      await confirmPostImages(payload);

      if (postType === "FREE") {
        await postService.createFreePost(payload);
      } else if (postType === "QUESTION") {
        // 🛡️ Allowance 체크
        const user = useUserStore.getState().user;
        const walletAddress =
          localStorage.getItem("wallet_address") || user?.walletAddress;

        if (walletAddress) {
          try {
            const allowance = await getAllowance(walletAddress);
            const requiredAmount = ethers.parseUnits(reward.toString(), 18);

            if (allowance < requiredAmount) {
              setError(POST_ERROR_CODE.ALLOWANCE_REQUIRED);
              setIsPostLoading(false);
              return;
            }
          } catch (e) {
            console.error("Allowance check failed:", e);
            // 체크 자체가 실패한 경우, 일단 진행하되 백엔드 에러 처리에 맡김
          }
        } else {
          // 지갑 주소가 아예 없는 경우
          setError("지갑 연동이 필요합니다.");
          setIsPostLoading(false);
          return;
        }

        const response = await postService.createQuestion(payload);
        if (response?.web3) {
          navigate(
            `/verify-wallet/${response.web3.resource.type}/${response.postId}`,
            { state: { intent: response.web3 } }
          );
          hasWeb3Action = true;
        }
      } else if (postType === "ANSWER" && parentPostId) {
        const response = await postService.createAnswer(parentPostId, payload);
        if (response?.web3) {
          navigate(
            `/verify-wallet/${response.web3.resource.type}/${response.postId}`,
            { state: { intent: response.web3 } }
          );
          hasWeb3Action = true;
        }
      }

      reset();

      if (!hasWeb3Action) {
        if (postType === "QUESTION" || postType === "ANSWER") navigate(-1);
        else navigate("/community");
      }
    } catch (err: unknown) {
      console.error("Post creation failed:", err);

      let errorCode: string | undefined;
      const message = getKoreanErrorMessageFromError(
        err,
        "게시물 등록에 실패했습니다."
      );

      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response: { data: { code?: string; message?: string } };
        };
        errorCode = axiosError.response?.data?.code;
      }

      // 백엔드에서 명시적으로 WEB3_001 에러를 뱉었을 경우 안내 강화 및 모달 유도
      if (errorCode === "WEB3_001") {
        setError(POST_ERROR_CODE.ALLOWANCE_REQUIRED);
      } else {
        setError(message);
      }
    } finally {
      setIsPostLoading(false);
    }
  };

  /**
   * 게시물 상세 조회
   * @param postId 게시물 ID
   * @returns 게시물 정보
   */
  const getPost = useCallback(
    async (postId: number): Promise<FreePost | QuestionPost | null> => {
      setIsPostLoading(true);
      setError(null);
      try {
        const response = await postService.getPost(postId);
        if (response.type) setPostType(response.type);
        return response;
      } catch (error) {
        setError(
          getKoreanErrorMessageFromError(error, "게시물 조회에 실패했습니다.")
        );
        return null;
      } finally {
        setIsPostLoading(false);
      }
    },
    [setPostType]
  );

  /**
   * 게시물 수정(자유, 질문)
   * @param postId 게시물 ID
   * @param payload 게시물 정보
   */
  const updatePost = async (postId: number, parentPostId?: number) => {
    if (!isSubmitActive || isPostLoading) return;
    if (!validateCurrentPostInput()) return;
    if (!initialData) {
      setError("초기 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsPostLoading(true);
    setError(null);
    try {
      const payload = buildPostPayload(store, initialData as PostPayload);
      let hasWeb3Action = false;

      await confirmPostImages(payload);

      if (postType === "FREE") {
        await postService.updateFreePost(postId, payload);
      } else if (postType === "QUESTION") {
        const response = await postService.updateQuestion(postId, payload);
        if (response?.web3) {
          navigate(
            `/verify-wallet/${response.web3.resource.type}/${response.postId}`,
            { state: { intent: response.web3 } }
          );
          hasWeb3Action = true;
        }
      } else if (postType === "ANSWER") {
        if (!parentPostId)
          throw Error("답변은 부모 게시글 정보가 있어야 합니다.");
        const response = await postService.updateAnswer(
          parentPostId,
          postId,
          payload
        );
        if (response?.web3) {
          navigate(
            `/verify-wallet/${response.web3.resource.type}/${response.postId}`,
            { state: { intent: response.web3 } }
          );
          hasWeb3Action = true;
        }
      }

      reset();

      if (!hasWeb3Action) {
        if (postType === "QUESTION" || postType === "ANSWER") navigate(-1);
        else navigate("/community");
      }
    } catch (error) {
      setError(
        getKoreanErrorMessageFromError(error, "게시물 수정에 실패했습니다.")
      );
    } finally {
      setIsPostLoading(false);
    }
  };

  /**
   * 게시물 삭제
   * @param postId 게시물 ID
   */
  const deletePost = async (
    type: PostType,
    postId: number,
    parentPostId?: number
  ) => {
    if (isPostLoading) return;

    setIsPostLoading(true);
    setError(null);
    try {
      let hasWeb3Action = false;

      if (type === "FREE") {
        await postService.deletePost(postId);
      } else if (type === "QUESTION") {
        const response = await postService.deletePost(postId);
        if (response?.web3) {
          navigate(
            `/verify-wallet/${response.web3.resource.type}/${response.postId}`,
            { state: { intent: response.web3 } }
          );
          hasWeb3Action = true;
        }
      } else if (type === "ANSWER") {
        if (!parentPostId)
          throw Error("답변은 부모 게시글 정보가 있어야 합니다.");
        const response = await postService.deleteAnswer(parentPostId, postId);
        if (response?.web3) {
          navigate(
            `/verify-wallet/${response.web3.resource.type}/${response.postId}`,
            { state: { intent: response.web3 } }
          );
          hasWeb3Action = true;
        }
      }

      if (!hasWeb3Action) {
        if (postType === "QUESTION" || postType === "ANSWER") navigate(-1);
        else navigate("/community");
      }
    } catch (error) {
      setError(
        getKoreanErrorMessageFromError(error, "게시물 삭제에 실패했습니다.")
      );
    } finally {
      setIsPostLoading(false);
    }
  };

  /**
   * 답변 조회
   */
  const getAnswers = useCallback(
    async (postId: number): Promise<AnswerPost[] | null> => {
      setIsAnswerLoading(true);
      setError(null);
      try {
        const response = await postService.getAnswers(postId);
        return response;
      } catch (error) {
        setError(
          getKoreanErrorMessageFromError(error, "답변 조회에 실패했습니다.")
        );
        return null;
      } finally {
        setIsAnswerLoading(false);
      }
    },
    []
  );

  const getIncompletedPostTransaction = async (executionIntentId: string) => {
    if (isPostLoading) return null;

    setIsPostLoading(true);
    setError(null);
    try {
      const response =
        await web3Service.getWeb3TransactionStatus(executionIntentId);
      return response;
    } catch (error) {
      setError(
        getKoreanErrorMessageFromError(error, "트랜잭션 조회에 실패했습니다.")
      );
      throw error;
    } finally {
      setIsPostLoading(false);
    }
  };

  /**
   * intent 재생성
   */
  const recoverCreate = async (
    postType: ResourceType,
    postId: number,
    parentPostId?: number
  ) => {
    if (isPostLoading) return null;

    setIsPostLoading(true);
    try {
      let response;
      if (postType === "QUESTION") {
        response = await postService.recoverCreatePost(postId);
      } else if (postType === "ANSWER" && parentPostId) {
        response = await postService.recoverCreateAnswer(parentPostId, postId);
      } else {
        throw Error("게시글 타입이 올바르지 않습니다.");
      }
      return response;
    } catch (error) {
      setError(
        getKoreanErrorMessageFromError(error, "게시물 재생성에 실패했습니다.")
      );
      throw error;
    } finally {
      setIsPostLoading(false);
    }
  };

  /**
   * 답변 채택
   */
  const acceptAnswer = async (postId: number, answerId: number) => {
    if (isPostLoading) return;

    setIsPostLoading(true);
    try {
      const response = await postService.acceptAnswer(postId, answerId);
      if (response.web3) {
        navigate(
          `/verify-wallet/${response.web3.resource.type}/${response.postId}`,
          { state: { intent: response.web3 } }
        );
      }
    } catch (error) {
      setError(
        getKoreanErrorMessageFromError(error, "답변 채택에 실패했습니다.")
      );
      throw error;
    } finally {
      setIsPostLoading(false);
    }
  };

  /**
   * 게시물 좋아요
   */
  const likePost = async (postId: number, answerId?: number) => {
    if (isPostLoading) return;

    setIsPostLoading(true);
    try {
      const response = answerId
        ? await postService.likeAnswer(postId, answerId)
        : await postService.likePost(postId);
      return response;
    } catch (error) {
      setError(
        getKoreanErrorMessageFromError(error, "게시물 좋아요에 실패했습니다.")
      );
      throw error;
    } finally {
      setIsPostLoading(false);
    }
  };

  /**
   * 게시물 좋아요 취소
   */
  const unlikePost = async (postId: number, answerId?: number) => {
    if (isPostLoading) return;

    setIsPostLoading(true);
    try {
      const response = answerId
        ? await postService.unlikeAnswer(postId, answerId)
        : await postService.unlikePost(postId);
      return response;
    } catch (error) {
      setError(
        getKoreanErrorMessageFromError(error, "게시물 좋아요에 실패했습니다.")
      );
      throw error;
    } finally {
      setIsPostLoading(false);
    }
  };

  return {
    isSubmitActive,
    isPostLoading,
    isAnswerLoading,
    error,
    setError,
    createPost,
    getPost,
    updatePost,
    deletePost,
    getAnswers,
    getIncompletedPostTransaction,
    recoverCreate,
    acceptAnswer,
    likePost,
    unlikePost,
  };
};
