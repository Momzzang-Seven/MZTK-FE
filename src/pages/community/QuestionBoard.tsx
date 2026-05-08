import type { QuestionPost } from "@types";
import { useSearchParams } from "react-router-dom";
import { LoadingSpinner } from "@components/common";
import { QuestionPostCard } from "@components/community";
import { usePostBoard, useInfiniteScroll } from "@hooks";

const QuestionBoard = () => {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get("tag") ?? undefined;
  const keyword = searchParams.get("keyword") ?? undefined;

  const { posts, isLoading, hasMore, loadMore } = usePostBoard<QuestionPost>(
    "QUESTION",
    tag,
    keyword
  );
  const observerRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  if (isLoading && posts.length === 0) {
    return (
      <div className="mt-10 py-10">
        <LoadingSpinner size="lg" color="text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-3">
      {posts.map((post) => (
        <QuestionPostCard key={post.postId} post={post} />
      ))}

      {isLoading && (
        <div className="py-4">
          <LoadingSpinner size="md" color="text-gray-400" />
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <p className="text-center text-gray-400 py-8">
          {tag ? "검색 결과가 없습니다." : "게시물이 없습니다."}
        </p>
      )}
      <div ref={observerRef} />
    </div>
  );
};

export default QuestionBoard;
