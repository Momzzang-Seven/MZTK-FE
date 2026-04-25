import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

const SearchBar = () => {
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const isQuestion = pathname.startsWith("/community/question");
  const isFree = pathname.startsWith("/community/free");

  const placeholder = isQuestion ? "제목 검색: 검색어만 / 태그 검색: #운동" : "태그 검색...";

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
    
    if (isQuestion) { // 질문 게시판은 #으로 시작하면 태그 검색, 아니면 키워드 검색
      if (trimmed.startsWith("#")) {
        const tagValue = trimmed.replace("#", "").trim();
        url = `/community/question?tag=${encodeURIComponent(tagValue)}`;
      } else {
        url = `/community/question?keyword=${encodeURIComponent(trimmed)}`;
      }
    } else if (isFree) { // 자유게시판은 태그 검색만 지원 
      const tagValue = trimmed.startsWith("#") ? trimmed.replace("#", "") : trimmed;
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
    <div className="relative flex w-full max-w-md">
      <div className="relative flex w-full items-center rounded-xl border-1 border-gray-200 bg-white">
        <img
          src="/icon/search.svg"
          alt="search"
          className="absolute left-3 h-4 w-4"
        />

        <input
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-full bg-transparent py-3 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default SearchBar;
