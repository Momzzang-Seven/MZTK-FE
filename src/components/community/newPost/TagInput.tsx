import { useState, useRef } from "react";
import { Hash, X } from "lucide-react";
import { containsUnsafeMarkup, TEXT_LIMITS } from "@utils";

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
    if (trimmed.length > TEXT_LIMITS.tag) return;
    if (containsUnsafeMarkup(trimmed)) return;
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
    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="w-full px-5 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag, index) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-black text-main bg-main/5 rounded-full border border-main/10 animate-in zoom-in duration-300"
          >
            <Hash size={12} strokeWidth={3} className="opacity-50" />
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-main/10 rounded-full p-0.5 transition-colors"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </span>
        ))}

        {tags.length < maxTags && (
          <div className="flex items-center gap-2 flex-1 min-w-[120px]">
            <Hash size={16} className="text-gray-300" strokeWidth={2.5} />
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) =>
                setInputValue(e.target.value.slice(0, TEXT_LIMITS.tag))
              }
              onKeyDown={handleKeyDown}
              onBlur={() => addTag(inputValue)}
              maxLength={TEXT_LIMITS.tag}
              placeholder={
                tags.length === 0 ? "관련 태그 (최대 5개)" : "태그 추가..."
              }
              className="w-full text-[14px] text-gray-900 font-bold placeholder:text-gray-300 outline-none bg-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TagInput;
