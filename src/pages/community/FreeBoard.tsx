import type { FreePost } from "@types";
import { useSearchParams } from "react-router-dom";
import { LoadingSpinner } from "@components/common";
import { FreePostCard } from "@components/community";
import { usePostBoard, useInfiniteScroll } from "@hooks";
import { Ghost } from "lucide-react";

const FreeBoard = () => {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get("tag") ?? undefined;

  const { posts, isLoading, hasMore, loadMore, refetch } =
    usePostBoard<FreePost>("FREE", tag);
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
          피드를 불러오는 중...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-2 pb-20 animate-in fade-in duration-700">
      {posts.map((post) => (
        <FreePostCard
          key={post.postId}
          post={post}
          onDeletePostSuccess={refetch}
        />
      ))}

      {isLoading && (
        <div className="py-10 flex justify-center">
          <LoadingSpinner size="md" color="text-main" />
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="bg-white p-6 rounded-[32px] shadow-sm mb-4">
            <Ghost size={48} className="text-gray-200" strokeWidth={1.5} />
          </div>
          <p className="text-gray-900 font-black text-[18px] mb-1">
            게시물이 없습니다
          </p>
          <p className="text-gray-400 text-[14px] font-medium">
            {tag
              ? `#${tag} 태그에 대한 결과가 없습니다.`
              : "첫 번째 게시물의 주인공이 되어보세요!"}
          </p>
        </div>
      )}

      {!isLoading && hasMore && (
        <div ref={observerRef} className="h-10 w-full" />
      )}
    </div>
  );
};

export default FreeBoard;
