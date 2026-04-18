import { usePostStore } from "@store";
import NewPostContentInput from "./FreePostContentInput";
import TagInput from "./TagInput";

const FreePostForm = () => {
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
                key={img.id}
                src={img.previewUrl}
                alt="업로드된 이미지"
                className="w-full max-h-[400px] object-cover"
              />
            ))}
          </div>
        </div>
      )}

      <NewPostContentInput onChange={setContent} />
      <TagInput tags={tags} onChange={setTags} />
    </div>
  );
};

export default FreePostForm;
