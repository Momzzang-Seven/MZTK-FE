import type { FreePost } from "@types";
import { useSearchParams } from "react-router-dom";
import { FreePostCard } from "@components/community";
import { usePostBoard, useInfiniteScroll } from "@hooks";

const FreeBoard = () => {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get("tag") ?? undefined;

  const { posts, isLoading, hasMore, loadMore, refetch } = usePostBoard<FreePost>("FREE", tag);
  const observerRef = useInfiniteScroll({ onLoadMore: loadMore, hasMore, isLoading });

  return (
    <div className="flex flex-col gap-2 mt-3">
      {posts.map((post) => (
        <FreePostCard key={post.postId} post={post} onDeletePostSuccess={refetch} />
      ))}
      {!isLoading && posts.length === 0 && (
        <p className="text-center text-gray-400 py-8">
          {tag ? "검색 결과가 없습니다." : "게시물이 없습니다."}
        </p>
      )}
      {isLoading && (
        <p className="text-center text-gray-400 py-4">불러오는 중...</p>
      )}
      <div ref={observerRef} />
    </div>
  );
};

export default FreeBoard;
