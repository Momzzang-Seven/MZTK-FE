import { useState, useRef } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

const TagInput = ({ tags, onChange, maxTags = 5 }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const addTag = (tag: string) => {
    const trimmed = tag.trim().replace(/^#/, "");
    if (!trimmed) return;
    if (tags.includes(trimmed)) return;
    if (tags.length >= maxTags) return;

    onChange([...tags, trimmed]);
    setInputValue("");
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
    if (
      e.key === "Backspace" &&
      inputValue === "" &&
      tags.length > 0
    ) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="w-full px-4">
      <div className="flex flex-wrap items-center gap-2 py-2">
        {tags.map((tag, index) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2.5 py-1 text-sm font-medium text-main bg-main/10 rounded-full"
          >
            #{tag}  
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-main/60 hover:text-main ml-0.5"
            >
              ×
            </button>
          </span>
        ))}

        {tags.length < maxTags && (
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(inputValue)}
            placeholder={
              tags.length === 0 ? "게시물에 관련된 태그를 입력해주세요. 예) 운동루틴, 오운완" : ""
            }
            className="flex-1 min-w-[80px] text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
          />
        )}
      </div>
    </div>
  );
};

export default TagInput;
