import { usePostStore } from "@store";
import { TiptapEditor } from "@components/community";

interface AnswerPostFormProps {
  initialContent?: string;
}

const AnswerPostForm = ({ initialContent }: AnswerPostFormProps) => {
  const setContent = usePostStore((s) => s.setContent);

  return (
    <div className="flex flex-col gap-4">
      <TiptapEditor
        onChange={setContent}
        referenceType="COMMUNITY_ANSWER"
        initialContent={initialContent}
      />
    </div>
  );
};

export default AnswerPostForm;
