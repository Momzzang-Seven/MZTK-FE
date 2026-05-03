import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePostStore } from "@store";
import { buildPostPayload } from "@utils/buildPostPayload";
import { postService, web3Service } from "@services";
import type { FreePost, QuestionPost, PostPayload, Web3Execution, StoredWeb3Action, AnswerPost } from "@types";
import type { PostType } from "@store";

export const usePostService = () => {
  const navigate = useNavigate();
  const store = usePostStore();
  const setPostType = usePostStore((s) => s.setPostType);
  const uploadingCount = usePostStore((s) => s.uploadingCount);
  const [isPostLoading, setIsPostLoading] = useState(false);
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { postType, title, content, reward, parentPostId, initialData, reset } = store;

  const isSubmitActive = (() => {
    if (uploadingCount > 0) return false;
    if (!content?.trim()) return false;

    const isFormValid = (() => {
      switch (postType) {
        case "FREE": return true;
        case "QUESTION": return title.trim() !== "" && reward >= 1;
        case "ANSWER": return true;
        default: return false;
      }
    })();

    if (!isFormValid) return false;

    if (initialData) {
      const patch = buildPostPayload(store, initialData as PostPayload);
      return Object.keys(patch).length > 0;
    }

    return true; // 신규 생성 모드
  })();

  /**
   * 게시물 생성
   * 양식 검사 + 제출
   */
  const createPost = async () => {
    if (!isSubmitActive || isPostLoading) return;

    setIsPostLoading(true);
    setError(null);
    try {
      const payload = buildPostPayload(store);
      let hasWeb3Action = false;

      if (postType === "FREE") {
        await postService.createFreePost(payload);

      } else if (postType === "QUESTION") {
        const response = await postService.createQuestion(payload);
        if (response?.web3) {
          addPendingAction(response.web3, title);
          navigate(`/verify-wallet/${response.web3.resource.type}/${response.postId}`, {state : { intent: response.web3 }  });
          hasWeb3Action = true;
        }

      } else if (postType === "ANSWER" && parentPostId) {
        const response = await postService.createAnswer(parentPostId, payload);
        if (response?.web3) {
          addPendingAction(response.web3);
          navigate(`/verify-wallet/${response.web3.resource.type}/${response.postId}`, {state : { intent: response.web3 }  });
          hasWeb3Action = true;
        }
      }

      reset();

      if (!hasWeb3Action) {
        if (postType === "QUESTION" || postType === "ANSWER") navigate(-1);
        else navigate(-2);
      }
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "게시물 등록에 실패했습니다.";
      setError(message);
    } finally {
      setIsPostLoading(false);
    }
  };

  /**
   * 게시물 상세 조회
   * @param postId 게시물 ID
   * @returns 게시물 정보
   */
  const getPost = useCallback(async (postId: number): Promise<FreePost | QuestionPost | null> => {
    setIsPostLoading(true);
    setError(null);
    try {
      const response = await postService.getPost(postId);
      if (response.type) setPostType(response.type);
      return response;
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "게시물 조회에 실패했습니다.";
      setError(message);
      return null;
    } finally {
      setIsPostLoading(false);
    }
  }, [setPostType]);

  /**
   * 게시물 수정(자유, 질문)
   * @param postId 게시물 ID
   * @param payload 게시물 정보
   */
  const updatePost = async (postId: number, parentPostId?: number) => {
    if (!isSubmitActive || isPostLoading) return;
    if (!initialData) {
      setError("초기 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    
    setIsPostLoading(true);
    setError(null);
    try {
      const payload = buildPostPayload(store, initialData as PostPayload);
      let hasWeb3Action = false;

      if (postType === "FREE") {
        await postService.updateFreePost(postId, payload);

      } else if (postType === "QUESTION") {
        const response = await postService.updateQuestion(postId, payload);
        if (response?.web3) {
          addPendingAction(response.web3, title);
          navigate(`/verify-wallet/${response.web3.resource.type}/${response.postId}`, {state : { intent: response.web3 }  });
          hasWeb3Action = true;
        }

      } else if (postType === "ANSWER") {
        if (!parentPostId) throw Error("답변은 부모 게시글 정보가 있어야 합니다.");
        const response = await postService.updateAnswer(parentPostId, postId, payload)
        if (response?.web3) {
          addPendingAction(response.web3);
          navigate(`/verify-wallet/${response.web3.resource.type}/${response.postId}`, {state : { intent: response.web3 }  });
          hasWeb3Action = true;
        }
      }
      
      reset();

      if (!hasWeb3Action) {
        if (postType === "QUESTION" || postType === "ANSWER") navigate(-1);
        else navigate(-2);
      }
    } catch (error) {
      console.log(error);
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "게시물 수정에 실패했습니다.";
      setError(message);
    } finally {
      setIsPostLoading(false);
    }
  }

  /**
   * 게시물 삭제
   * @param postId 게시물 ID
   */
  const deletePost = async (type: PostType, postId: number, parentPostId?: number) => {
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
          addPendingAction(response.web3, title);
          navigate(`/verify-wallet/${response.web3.resource.type}/${response.postId}`, {state : { intent: response.web3 }  });
          hasWeb3Action = true;
        }

      } else if (type === "ANSWER") {
        if (!parentPostId) throw Error("답변은 부모 게시글 정보가 있어야 합니다.");
        const response = await postService.deleteAnswer(parentPostId, postId)
        if (response?.web3) {
          addPendingAction(response.web3);
          navigate(`/verify-wallet/${response.web3.resource.type}/${response.postId}`, {state : { intent: response.web3 }  });
          hasWeb3Action = true;
        }
      }
      
      if (!hasWeb3Action) {
        if (postType === "QUESTION" || postType === "ANSWER") navigate(-1);
        else navigate(-2);
      }
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "게시물 삭제에 실패했습니다.";
      setError(message);
    } finally {
      setIsPostLoading(false);
    }
  };

  /**
   * 답변 조회
   */
  const getAnswers = useCallback(async (postId: number): Promise<AnswerPost[] | null> => {
    setIsAnswerLoading(true);
    setError(null);
    try {
      const response = await postService.getAnswers(postId);
      return response;
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "답변 조회에 실패했습니다.";
      setError(message);
      return null;
    } finally {
      setIsAnswerLoading(false);
    }
  }, []);

  const addPendingAction = (data: Web3Execution, summary?: string) => {
    if (!data) return;

    const existingActions: StoredWeb3Action[] = JSON.parse(
      localStorage.getItem("pendingWeb3Actions") || "[]"
    );
    
    const newAction: StoredWeb3Action = {
      ...data,
      summary: summary || (postType === "QUESTION" ? title : content.substring(0, 20)),
    };

    localStorage.setItem("pendingWeb3Actions", JSON.stringify([...existingActions, newAction]));
  };

  const getIncompletedPostTransaction = async (executionIntentId: string) => {
    if(isPostLoading) return null;

    setIsPostLoading(true);
    setError(null);
    try {
      const response = await web3Service.getWeb3TransactionStatus(executionIntentId);
      return response;
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "트랜잭션 조회에 실패했습니다.";
      setError(message);
      throw error;
    } finally {
      setIsPostLoading(false);
    }
  }

  /**
   * 로컬 생성된 게시글의 Intent Refresh
   */
  const refreshPendingPosts = async () => {
    const storedData = localStorage.getItem('pendingWeb3Actions');
    if (!storedData) return;

    const actions: StoredWeb3Action[] = JSON.parse(storedData);
    if (actions.length === 0) return;

    setIsPostLoading(true);

    try {
      // 1. 모든 Pending 액션에 대해 병렬로 온체인 상태 조회 API 호출
      const updatePromises = actions.map(async (intent) => {
        try {
          // API URL: /users/me/web3/execution-intents/{executionIntentId}
          const newData = await web3Service.getWeb3TransactionStatus(intent.executionIntent.id);
          
          if (newData) {
            // 2. 응답 데이터 기반으로 액션 정보 업데이트
            return {
              ...newData,
              summary: intent.summary,
            };
          }
          return intent; // 실패 시 기존 데이터 유지
        } catch (err) {
          console.log(err);
          return intent;
        }
      });

      const updatedActions = await Promise.all(updatePromises);
      localStorage.setItem('pendingWeb3Actions', JSON.stringify(updatedActions));
      // 페이지 리렌더링을 위해 필요 시 상태를 반환하거나 window 이벤트를 발생시킬 수 있음
      window.dispatchEvent(new Event('storage')); 
      
    } catch (error) {
      console.error("복구 프로세스 중 에러 발생:", error);
    } finally {
      setIsPostLoading(false);
    }
  };

  /**
   * intent 재생성
   */
  const recoverCreate = async (postType: PostType, postId: number, parentPostId?: number) => {
    if(isPostLoading) return null;

    setIsPostLoading(true);
    try {
      let response;
      if (postType === "FREE" || postType==="QUESTION") {
        response = await postService.recoverCreatePost(postId);
      } else if (postType === "ANSWER" && parentPostId) {
        response = await postService.recoverCreateAnswer(parentPostId, postId);
      } else {
        throw Error("게시글 타입이 올바르지 않습니다.");
      }
      
      // 1. 응답에 web3 정보가 포함되어 있는지 확인
      if (response?.web3) {
        const storedData = localStorage.getItem('pendingWeb3Actions');
        if (storedData) {
          const actions: StoredWeb3Action[] = JSON.parse(storedData);
          
          // 2. 같은 resourceId를 가진 기존 액션을 찾아 업데이트
          const updatedActions = actions.map((intent) => {

            if (Number(intent.resource.id) === postId) {
              return {
                ...response.web3!,
                summary: intent.summary,
              };
            }
            return intent;
          });

          localStorage.setItem('pendingWeb3Actions', JSON.stringify(updatedActions));
          window.dispatchEvent(new Event('storage'));
        }
      }
      return response;
    } catch (error) {
      console.log(error);
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "게시물 재생성에 실패했습니다.";
      setError(message);
      throw error;
    } finally {
      setIsPostLoading(false);
    }
  }

  /**
   * 답변 채택
   */
  const acceptAnswer = async (postId: number, answerId: number) => {
    if(isPostLoading) return;

    setIsPostLoading(true);
    try {
      const response = await postService.acceptAnswer(postId, answerId);
      if(response.web3) {
        navigate(`/verify-wallet/${response.web3.resource.type}/${response.postId}`, {state : { intent: response.web3 }  });
      }
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "답변 채택에 실패했습니다.";
      setError(message);
      throw error;
    } finally {
      setIsPostLoading(false);
    }
  }

  /**
   * 게시물 좋아요
   */
  const likePost = async (postId: number) => {
    if(isPostLoading) return;

    setIsPostLoading(true);
    try {
      const response = await postService.likePost(postId);
      return response;
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "게시물 좋아요에 실패했습니다.";
      setError(message);
      throw error;
    } finally {
      setIsPostLoading(false);
    }
  }

  /**
   * 게시물 좋아요 취소
   */
  const unlikePost = async (postId: number) => {
    if(isPostLoading) return;

    setIsPostLoading(true);
    try {
      const response = await postService.unlikePost(postId);
      return response;
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "게시물 좋아요에 실패했습니다.";
      setError(message);
      throw error;
    } finally {
      setIsPostLoading(false);
    }
  }

  return { isSubmitActive, isPostLoading, isAnswerLoading, error, setError, createPost, getPost, updatePost, deletePost, getAnswers, getIncompletedPostTransaction, refreshPendingPosts, recoverCreate, acceptAnswer, likePost, unlikePost };
};
