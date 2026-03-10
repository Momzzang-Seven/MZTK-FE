import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CommonModal } from "@components/common";
import { SimpleHeader } from "@components/layout";
import {
  NewPostImageUploader,
  NewPostContentInput,
  RewardToken,
  TokenSelect,
} from "@components/community";
import NewPostTitleInput from "@components/community/newPost/NewPostTitleInput";

const CreatePost = () => {
  const navigate = useNavigate();

  const { type } = useParams();
  const isQuestion = type === "question";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [reward, setReward] = useState(0);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);

  const isSubmitActive =
    content.trim() !== "" &&
    (isQuestion ? title.trim() !== "" && reward >= 1 : true);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleSubmitClick = () => {
    const formData = new FormData();
    if (imageFile) formData.append("image", imageFile);
    if (isQuestion) formData.append("title", title);
    formData.append("content", content);

    navigate(-1);
  };

  const handleRewardTokenConfirm = () => {
    setRewardModalOpen(false);
  };

  return (
    <div>
      <SimpleHeader
        onBackClick={handleBackClick}
        button={
          <div
            className={`font-semibold text-xs items-center cursor-pointer ${!isSubmitActive ? "text-gray-400" : "text-main"
              }`}
            onClick={isSubmitActive ? handleSubmitClick : undefined}
          >
            등록하기
          </div>
        }
      />

      <div className="flex flex-col gap-4">
        <NewPostImageUploader onChange={setImageFile} />
        {isQuestion && <NewPostTitleInput onChange={setTitle} />}
        <NewPostContentInput onChange={setContent} />
      </div>

      {isQuestion && (
        <div className="fixed bottom-10 w-full max-w-[420px] px-6">
          <RewardToken
            rewardToken={reward}
            onClick={() => setRewardModalOpen(true)}
          />
        </div>
      )}

      {isQuestion && rewardModalOpen && (
        <CommonModal
          title="보상 MZTK 지급"
          desc={`채택된 답변의 사용자에게 <b>${reward} MZTK</b>을 지급합니다.`}
          confirmLabel="설정"
          onConfirmClick={handleRewardTokenConfirm}
        >
          <TokenSelect reward={reward} setReward={setReward} />
        </CommonModal>
      )}
    </div>
  );
};

export default CreatePost;
