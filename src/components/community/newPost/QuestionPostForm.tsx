import { useState } from "react";
import { CommonModal } from "@components/common";
import { usePostStore } from "@store";
import NewPostTitleInput from "./QuestionPostTitleInput";
import TiptapEditor from "../tiptapEditor/TiptapEditor";
import TagInput from "./TagInput";
import RewardToken from "./QuestionPostRewardToken";
import TokenSelector from "./QuestionPostRewardSelector";

const QuestionPostForm = () => {
  const tags = usePostStore((s) => s.tags);
  const reward = usePostStore((s) => s.reward);
  const setTitle = usePostStore((s) => s.setTitle);
  const setContent = usePostStore((s) => s.setContent);
  const setTags = usePostStore((s) => s.setTags);
  const setReward = usePostStore((s) => s.setReward);

  const [rewardModalOpen, setRewardModalOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <NewPostTitleInput onChange={setTitle} />
      <TiptapEditor onChange={setContent} referenceType="COMMUNITY_QUESTION" />
      <TagInput tags={tags} onChange={setTags} />

      <div className="fixed bottom-10 w-full max-w-[420px] px-6">
        <RewardToken
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
          <TokenSelector reward={reward} setReward={setReward} />
        </CommonModal>
      )}
    </div>
  );
};

export default QuestionPostForm;
