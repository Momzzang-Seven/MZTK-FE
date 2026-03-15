import { useState, useRef, useEffect } from "react";

interface NewPostContentInputProps {
  maxLength?: number;
  onChange?: (value: string) => void;
}

const NewPostContentInput = ({
  maxLength = 1000,
  onChange,
}: NewPostContentInputProps) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 내용 길이에 따라 height 자동 조절
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    const lineHeight = 20;
    const maxHeight = lineHeight * 6;
    const newHeight = Math.min(el.scrollHeight, maxHeight);

    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value.slice(0, maxLength);
    setValue(next);
    onChange?.(next);
  };

  return (
    <div className="w-full px-4">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder="개인정보를 공유 및 요청하거나, 명예 훼손, 무단 광고, 불법 정보 유포 시 모니터링 후 삭제될 수 있습니다."
        className="
          w-full bg-transparent
          text-sm leading-relaxed text-gray-900
          placeholder:text-gray-400
          resize-none outline-none
          border-none
        "
      />
      <div className="mt-1 flex justify-end">
        <span className="text-[11px] text-gray-400">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
};

export default NewPostContentInput;
