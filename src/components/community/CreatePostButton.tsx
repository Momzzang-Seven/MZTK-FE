import { useNavigate, useLocation } from "react-router-dom";
import { CommonButton } from "@components/common";

interface CreatePostButtonProps {
  postId?: number;
}

const CreatePostButton = ({ postId }: CreatePostButtonProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleCreatePost = () => {
    if (postId !== undefined) {
      navigate(
        `/community/new/answer/${encodeURIComponent(postId)}/write`,
      );
      return;
    }

    if (pathname === "/community/free") {
      navigate("/community/new/free/select-image");
    } else if (pathname === "/community/question") {
      navigate("/community/new/question/write");
    }
  };

  // 답변 쓰기 (pill 스타일)
  if (postId !== undefined) {
    return (
      <div className="fixed flex bottom-10 w-full max-w-[420px] justify-center bg-none">
        <div
          className="z-[999] px-13 py-3 bg-main rounded-full text-white font-semibold cursor-pointer"
          onClick={handleCreatePost}
        >
          답변 쓰기
        </div>
      </div>
    );
  }

  // free/question (원형 十 스타일)
  return (
    <div className="fixed bottom-[100px] flex w-full max-w-[420px] flex-row items-end justify-end px-4">
      <CommonButton
        onClick={handleCreatePost}
        width="w-[60px]"
        padding="p-0"
        shadow={true}
        className="h-[60px] !rounded-full shadow-xl"
        label="十"
      />
    </div>
  );
};

export default CreatePostButton;
