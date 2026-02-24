import { useState, useRef, useEffect } from "react";

interface NewPostTitleInputProps {
  maxLength?: number;
  onChange?: (value: string) => void;
}

const NewPostTitleInput = ({
  maxLength = 50,
  onChange,
}: NewPostTitleInputProps) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 내용 길이에 따라 height 자동 조절
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    const lineHeight = 20;
    const maxHeight = lineHeight;
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
    <div className="w-full px-4 border-b border-gray-200">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder="제목을 입력하세요."
        className="
          w-full bg-transparent
          text-sm leading-relaxed text-gray-900
          placeholder:text-gray-400
          resize-none outline-none
          border-none
        "
      />
    </div>
  );
};

export default NewPostTitleInput;
