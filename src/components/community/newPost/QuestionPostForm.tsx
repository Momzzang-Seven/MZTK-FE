import { useState } from "react";
import { CommonModal } from "@components/common";
import { usePostStore } from "@store";
import { TiptapEditor, QuestionPostTitle, TagInput, QuestionPostRewardToken, QuestionPostRewardSelector } from "@components/community";

interface QuestionPostFormProps {
  initialTitle?: string;
  initialContent?: string;
}

const QuestionPostForm = ({ initialTitle, initialContent }: QuestionPostFormProps) => {
  const tags = usePostStore((s) => s.tags);
  const reward = usePostStore((s) => s.reward);
  const setTitle = usePostStore((s) => s.setTitle);
  const setContent = usePostStore((s) => s.setContent);
  const setTags = usePostStore((s) => s.setTags);
  const setReward = usePostStore((s) => s.setReward);

  const [rewardModalOpen, setRewardModalOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <QuestionPostTitle onChange={setTitle} initialValue={initialTitle} />
      <TiptapEditor onChange={setContent} referenceType="COMMUNITY_QUESTION" initialContent={initialContent} />
      <TagInput tags={tags} onChange={setTags} />

      <div className="fixed bottom-10 w-full max-w-[420px] px-6">
        <QuestionPostRewardToken
          rewardToken={reward}
          onClick={() => setRewardModalOpen(true)}
        />
      </div>

      {rewardModalOpen && (
        <CommonModal
          title="보상 MZTK 지급"
          desc={`채택된 답변의 사용자에게 <b>${reward} MZTK</b>을 지급합니다.`}
          confirmLabel="설정"
          onConfirmClick={() => setRewardModalOpen(false)}
        >
          <QuestionPostRewardSelector reward={reward} setReward={setReward} />
        </CommonModal>
      )}
    </div>
  );
};

export default QuestionPostForm;
