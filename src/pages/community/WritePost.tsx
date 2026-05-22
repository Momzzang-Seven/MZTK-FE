import { useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { SimpleHeader } from "@components/layout";
import { LoadingSpinner, CommonModal } from "@components/common";
import { usePostStore } from "@store";
import type { PostType } from "@store";
import {
  POST_ERROR_CODE,
  useTokenBalance,
  usePostService,
  useLoadPostForEdit,
} from "@hooks";
import {
  FreePostForm,
  QuestionPostForm,
  AnswerPostForm,
} from "@components/community";
import { replaceImageSrc } from "@utils";
import type { Image } from "@types";

const WritePost = () => {
  const navigate = useNavigate();
  const { type, postId, parentId } = useParams();
  const location = useLocation();
  const { pathname } = useLocation();
  const isEditMode = pathname.includes("/edit/");
  const shouldFetchHere = isEditMode && type !== "free"; // FREE 게시글은 SelectImage에서 이미 fetch했으므로 여기서는 skip

  const postType = usePostStore((s) => s.postType);
  const parentPostId = usePostStore((s) => s.parentPostId);
  const storeContent = usePostStore((s) => s.content);
  const storeImages = usePostStore((s) => s.images);
  const storeTitle = usePostStore((s) => s.title);
  const reward = usePostStore((s) => s.reward);
  const reset = usePostStore((s) => s.reset);
  const setPostType = usePostStore((s) => s.setPostType);
  const setParentPostId = usePostStore((s) => s.setParentPostId);
  const { balance, loading: isBalanceLoading } = useTokenBalance();
  const balanceNumber = Number(balance);
  const hasKnownBalance = Number.isFinite(balanceNumber);
  const hasInsufficientRewardBalance =
    postType === "QUESTION" &&
    !isBalanceLoading &&
    hasKnownBalance &&
    reward > balanceNumber;

  const { isFetching, loadPost, setPostForEdit } = useLoadPostForEdit();
  const {
    isSubmitActive,
    isPostLoading: isLoading,
    error,
    setError,
    createPost,
    updatePost,
  } = usePostService();

  useEffect(() => {
    const urlType = (type?.toUpperCase() ?? "QUESTION") as PostType;

    if (isEditMode && shouldFetchHere && postId) {
      // 수정 모드
      reset();
      if (urlType === "QUESTION") loadPost(Number(postId));
      else if (urlType === "ANSWER") {
        const answerContent = location.state?.content ?? "";
        const answerImages = location.state?.images ?? [];

        setPostForEdit({
          parentId: Number(parentId),
          type: urlType,
          content: answerContent,
          images: answerImages.map((img: Image) => ({
            imageId: img.imageId,
            imageUrl: img.imageUrl,
          })),
        });
      }
    } else {
      // 새 게시물 모드
      // 이미 내용이 있는 경우(예: 승인 후 복귀) reset을 건너뜀
      const hasContent =
        (storeTitle?.trim() ?? "") !== "" ||
        (storeContent?.trim() ?? "") !== "";
      if (urlType !== "FREE" && !hasContent) reset();

      setPostType(urlType);

      if (urlType === "ANSWER" && postId) {
        // 이때 postId: 부모 질문의 postId
        setParentPostId(Number(postId));
      }
    }
  }, [
    location.state?.content,
    location.state?.images,
    parentId,
    type,
    postId,
    isEditMode,
    shouldFetchHere,
    reset,
    loadPost,
    setPostType,
    setParentPostId,
    setPostForEdit,
  ]);

  // 수정 모드 초기값: 스토어에서 읽음
  // FREE: SelectImage fetch 후 WritePost → 스토어에 이미 데이터 있음
  // QUESTION/ANSWER: 위 useEffect fetch 완료 후 스토어에 데이터 있음
  const initialContent = isEditMode && storeContent ? storeContent : undefined;
  const initialTitle = isEditMode && storeTitle ? storeTitle : undefined;
  const processedContent = initialContent
    ? replaceImageSrc(initialContent, storeImages)
    : "";

  const submitPost = isEditMode
    ? postType === "QUESTION"
      ? () => updatePost(Number(postId))
      : () => updatePost(Number(postId), Number(parentPostId))
    : createPost;

  const handleSubmit = () => {
    if (postType === "QUESTION") {
      if (isBalanceLoading) {
        setError(POST_ERROR_CODE.BALANCE_PENDING);
        return;
      }

      if (!hasKnownBalance || hasInsufficientRewardBalance) {
        setError(POST_ERROR_CODE.INSUFFICIENT_BALANCE);
        return;
      }
    }

    void submitPost();
  };

  const isActive =
    isSubmitActive &&
    !isLoading &&
    !(postType === "QUESTION" && isBalanceLoading) &&
    !hasInsufficientRewardBalance;

  return (
    <div className="relative min-h-screen pt-20">
      {(isFetching || isLoading) && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
          <LoadingSpinner size="lg" color="text-white" />
        </div>
      )}

      {error && error === POST_ERROR_CODE.ALLOWANCE_REQUIRED ? (
        <CommonModal
          title="지갑 재등록 필요"
          desc="이 지갑은 새 승인 정책으로 다시 등록해야 합니다. 지금 등록하시겠습니까?"
          confirmLabel="지갑 등록하러 가기"
          onConfirmClick={() => {
            setError(null);
            navigate("/register-wallet");
          }}
          cancelLabel="나중에"
          onCancelClick={() => setError(null)}
        />
      ) : error === POST_ERROR_CODE.BALANCE_PENDING ? (
        <CommonModal
          title="잔액 확인 중"
          desc="보유 MZTK 잔액을 확인하고 있습니다. 잠시 후 다시 시도해 주세요."
          confirmLabel="확인"
          onConfirmClick={() => setError(null)}
        />
      ) : error === POST_ERROR_CODE.INSUFFICIENT_BALANCE ? (
        <CommonModal
          title="잔액 부족"
          desc="설정한 질문 보상이 현재 보유 MZTK보다 큽니다. 보상 금액을 낮춘 뒤 다시 등록해 주세요."
          confirmLabel="보상 수정하기"
          onConfirmClick={() => setError(null)}
          cancelLabel="닫기"
          onCancelClick={() => setError(null)}
        />
      ) : (
        error && (
          <CommonModal
            title="오류 발생"
            desc={error}
            confirmLabel="재시도"
            onConfirmClick={handleSubmit}
            cancelLabel="닫기"
            onCancelClick={() => setError(null)}
          />
        )
      )}

      <SimpleHeader
        button={
          <div
            className={`font-black text-[15px] cursor-pointer transition-all active:scale-95 px-2 py-1 ${
              !isActive ? "text-gray-300 pointer-events-none" : "text-main"
            }`}
            onClick={isActive ? handleSubmit : undefined}
          >
            {isEditMode ? "수정" : "등록"}
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
