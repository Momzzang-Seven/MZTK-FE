import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";

const SearchBar = () => {
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const isQuestion = pathname.startsWith("/community/question");
  const isFree = pathname.startsWith("/community/free");

  const placeholder = isQuestion
    ? "제목 혹은 #태그 검색"
    : "태그 검색 (#오운완)";

  const [searchParams] = useSearchParams();
  const initialTag = searchParams.get("tag");
  const initialKeyword = searchParams.get("keyword");

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (initialTag) setInputValue(`#${initialTag}`);
    else if (initialKeyword) setInputValue(initialKeyword);
    else setInputValue("");
  }, [pathname, initialTag, initialKeyword]);

  const handleSearch = (input: string) => {
    const trimmed = input.trim();

    if (!trimmed) {
      if (isFree) navigate("/community/free", { replace: true });
      else if (isQuestion) navigate("/community/question", { replace: true });
      return;
    }

    let url = "";

    if (isQuestion) {
      if (trimmed.startsWith("#")) {
        const tagValue = trimmed.replace("#", "").trim();
        url = `/community/question?tag=${encodeURIComponent(tagValue)}`;
      } else {
        url = `/community/question?keyword=${encodeURIComponent(trimmed)}`;
      }
    } else if (isFree) {
      const tagValue = trimmed.startsWith("#")
        ? trimmed.replace("#", "")
        : trimmed;
      url = `/community/free?tag=${encodeURIComponent(tagValue)}`;
    }

    if (url) navigate(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(inputValue);
    }
  };

  return (
    <div className="relative flex w-full group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-main group-focus-within:scale-110 transition-all duration-500 ease-out">
        <Search size={20} strokeWidth={3} />
      </div>

      <input
        type="search"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-[22px] bg-gray-50/50 backdrop-blur-md border border-gray-100 focus:border-main/30 focus:bg-white py-4.5 pl-14 pr-6 text-[15px] font-black text-gray-900 placeholder:text-gray-300 placeholder:font-bold outline-none transition-all duration-500 shadow-sm focus:shadow-[0_15px_30px_rgba(250,177,47,0.08)]"
      />

      {/* Subtle bottom line indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-main rounded-full group-focus-within:w-[80%] transition-all duration-700 ease-out opacity-40" />
    </div>
  );
};

export default SearchBar;
