import { useState } from "react";
import { CommonModal } from "@components/common";
import { usePostStore } from "@store";
import { useTokenBalance } from "@hooks";
import {
  TiptapEditor,
  QuestionPostTitle,
  TagInput,
  QuestionPostRewardToken,
  QuestionPostRewardSelector,
} from "@components/community";

interface QuestionPostFormProps {
  initialTitle?: string;
  initialContent?: string;
}

const QuestionPostForm = ({
  initialTitle,
  initialContent,
}: QuestionPostFormProps) => {
  const tags = usePostStore((s) => s.tags);
  const reward = usePostStore((s) => s.reward);
  const setTitle = usePostStore((s) => s.setTitle);
  const setContent = usePostStore((s) => s.setContent);
  const setTags = usePostStore((s) => s.setTags);
  const setReward = usePostStore((s) => s.setReward);
  const { balance, loading: isBalanceLoading } = useTokenBalance();
  const balanceNumber = Number(balance);
  const hasKnownBalance = Number.isFinite(balanceNumber);
  const hasInsufficientBalance =
    !isBalanceLoading &&
    hasKnownBalance &&
    reward > 0 &&
    reward > balanceNumber;
  const rewardHint = isBalanceLoading
    ? "보유 잔액 확인 중"
    : hasInsufficientBalance
      ? `보유 ${balanceNumber.toLocaleString()} MZTK`
      : "답변 채택 시 지급될 토큰";

  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [tempReward, setTempReward] = useState(reward);

  const handleOpenRewardModal = () => {
    setTempReward(reward);
    setRewardModalOpen(true);
  };

  const handleConfirmReward = () => {
    setReward(tempReward);
    setRewardModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-80px)] bg-white animate-in fade-in duration-700">
      <QuestionPostTitle onChange={setTitle} initialValue={initialTitle} />

      <div className="border-b border-gray-50 py-1">
        <TagInput tags={tags} onChange={setTags} />
      </div>

      <div className="flex-1 px-1">
        <TiptapEditor
          onChange={setContent}
          referenceType="COMMUNITY_QUESTION"
          initialContent={initialContent}
        />
      </div>

      {/* Spacing for fixed footer */}
      <div className="pb-32" />

      {/* Fixed Footer Reward Card */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-[calc(2rem+env(safe-area-inset-bottom))] px-6 flex justify-center pointer-events-none">
        <div className="w-full max-w-[450px] pointer-events-auto">
          <QuestionPostRewardToken
            rewardToken={reward}
            onClick={handleOpenRewardModal}
            hint={rewardHint}
            tone={hasInsufficientBalance ? "warning" : "default"}
          />
        </div>
      </div>

      {rewardModalOpen && (
        <CommonModal
          title="지급 보상 설정"
          desc="질문이 해결되었을 때 채택된 답변자에게 지급할 MZTK 토큰을 설정합니다."
          confirmLabel="적용하기"
          onConfirmClick={handleConfirmReward}
          cancelLabel="취소"
          onCancelClick={() => setRewardModalOpen(false)}
        >
          <div className="mt-6">
            <QuestionPostRewardSelector
              reward={tempReward}
              setReward={setTempReward}
            />
          </div>
        </CommonModal>
      )}
    </div>
  );
};

export default QuestionPostForm;
