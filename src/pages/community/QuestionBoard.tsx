import type { QuestionPost } from "@types";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { QuestionPostCard } from "@components/community";

const QuestionBoard = () => {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get("tag");
  const isSearchMode = Boolean(tag);

  const [questionPosts, setQuestionPosts] = useState<QuestionPost[]>([]);

  useEffect(() => {
    if (isSearchMode) {
      fetch("/data/questions.json")
        .then((res) => res.json())
        .then(setQuestionPosts)
        .catch(console.error);
      return;
    }

    fetch("/data/questions.json")
      .then((res) => res.json())
      .then(setQuestionPosts)
      .catch(console.error);
  }, [isSearchMode]);

  return (
    <div className="flex flex-col gap-2 mt-3">
      {questionPosts.length > 0
        ? questionPosts.map((post) => (
            <QuestionPostCard key={post.postId} post={post} />
          ))
        : isSearchMode && (
            <p className="text-center text-gray-400 py-8">
              검색 결과가 없습니다.
            </p>
          )}
    </div>
  );
};

export default QuestionBoard;
