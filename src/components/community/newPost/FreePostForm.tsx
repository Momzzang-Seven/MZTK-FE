import { usePostStore } from "@store";
import { FreePostContentInput, TagInput } from "@components/community";

interface FreePostFormProps {
  initialContent?: string;
}

const FreePostForm = ({ initialContent }: FreePostFormProps) => {
  const images = usePostStore((s) => s.images);
  const tags = usePostStore((s) => s.tags);
  const setContent = usePostStore((s) => s.setContent);
  const setTags = usePostStore((s) => s.setTags);

  return (
    <div className="flex flex-col gap-4">
      {/* 분리형: 이미지 상단 미리보기 */}
      {images.length > 0 && (
        <div className="w-full overflow-x-auto">
          <div className="flex gap-1">
            {images.map((img) => (
              <img
                key={img.imageId}
                src={img.imageUrl}
                alt={img.imageUrl}
                className="w-full max-h-[400px] object-cover"
              />
            ))}
          </div>
        </div>
      )}

      <FreePostContentInput
        onChange={setContent}
        initialValue={initialContent}
      />
      <TagInput tags={tags} onChange={setTags} />
    </div>
  );
};

export default FreePostForm;
