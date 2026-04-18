import { usePostStore } from "@store";
import TiptapEditor from "../tiptapEditor/TiptapEditor";

const AnswerPostForm = () => {
  const setContent = usePostStore((s) => s.setContent);

  return (
    <div className="flex flex-col gap-4">
      <TiptapEditor onChange={setContent} referenceType="COMMUNITY_ANSWER" />
    </div>
  );
};

export default AnswerPostForm;
