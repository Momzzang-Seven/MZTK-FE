import type { QuestionPost } from "@types";
import { useSearchParams } from "react-router-dom";
import { LoadingSpinner } from "@components/common";
import { QuestionPostCard } from "@components/community";
import { usePostBoard, useInfiniteScroll } from "@hooks";
import { HelpCircle } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" color="text-main" />
        <p className="mt-4 text-gray-400 font-bold tracking-tight">
          질문을 불러오는 중...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-2 pb-20 animate-in fade-in duration-700">
      {posts.map((post) => (
        <QuestionPostCard key={post.postId} post={post} />
      ))}

      {isLoading && (
        <div className="py-10 flex justify-center">
          <LoadingSpinner size="md" color="text-main" />
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="bg-white p-6 rounded-[32px] shadow-sm mb-4">
            <HelpCircle size={48} className="text-gray-200" strokeWidth={1.5} />
          </div>
          <p className="text-gray-900 font-black text-[18px] mb-1">
            등록된 질문이 없습니다
          </p>
          <p className="text-gray-400 text-[14px] font-medium">
            {tag || keyword
              ? "검색 조건에 맞는 결과가 없습니다."
              : "평소 궁금했던 운동 지식을 질문해보세요!"}
          </p>
        </div>
      )}

      {!isLoading && hasMore && (
        <div ref={observerRef} className="h-10 w-full" />
      )}
    </div>
  );
};

export default QuestionBoard;
