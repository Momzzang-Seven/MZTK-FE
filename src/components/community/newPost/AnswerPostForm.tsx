import { useCreatePostStore } from "@store/createPostStore";
import TiptapEditor from "../tiptapEditor/TiptapEditor";

const AnswerPostForm = () => {
  const setContent = useCreatePostStore((s) => s.setContent);

  return (
    <div className="flex flex-col gap-4">
      <TiptapEditor onChange={setContent} />
    </div>
  );
};

export default AnswerPostForm;
