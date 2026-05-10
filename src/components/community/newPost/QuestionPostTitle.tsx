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
    <div className="w-full px-5 py-4 border-b border-gray-50">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder="어떤 것이 궁금하신가요?"
        rows={1}
        className="w-full bg-transparent text-[22px] font-black leading-tight text-gray-900 placeholder:text-gray-300 resize-none outline-none border-none tracking-tight"
      />
    </div>
  );
};

export default QuestionPostTitle;
