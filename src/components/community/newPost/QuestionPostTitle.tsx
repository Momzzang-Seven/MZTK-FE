import { useState, useRef, useEffect } from "react";

interface QuestionPostTitleInputProps {
  maxLength?: number;
  onChange?: (value: string) => void;
  initialValue?: string;
}

const QuestionPostTitle = ({
  maxLength = 50,
  onChange,
  initialValue = "",
}: QuestionPostTitleInputProps) => {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";

    el.style.height = `${el.scrollHeight}px`;
    
    el.style.overflowY = "hidden";
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
          text-lg font-semibold leading-relaxed text-gray-900
          placeholder:text-gray-400
          resize-none outline-none
          border-none
        "
      />
    </div>
  );
};

export default QuestionPostTitle;
