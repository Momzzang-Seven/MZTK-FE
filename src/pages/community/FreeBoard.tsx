import type { FreePost } from "@types";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FreePostCard } from "@components/community";

const FreeBoard = () => {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get("tag");
  const isSearchMode = Boolean(tag);

  const [freePosts, setFreePosts] = useState<FreePost[]>([]);

  useEffect(() => {
    if (isSearchMode) {
      setFreePosts([]);
      return;
    }

    fetch("/data/freePosts.json")
      .then((res) => res.json())
      .then(setFreePosts)
      .catch(console.error);
  }, [isSearchMode]);

  return (
    <div className="flex flex-col gap-2 mt-3">
      {freePosts.length > 0
        ? freePosts.map((post) => (
            <FreePostCard key={post.postId} post={post} />
          ))
        : isSearchMode && (
            <p className="text-center text-gray-400 py-8">
              검색 결과가 없습니다.
            </p>
          )}
    </div>
  );
};

export default FreeBoard;
