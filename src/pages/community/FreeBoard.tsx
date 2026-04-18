import type { FreePost } from "@types";
import { useSearchParams } from "react-router-dom";
import { FreePostCard } from "@components/community";
import { usePostBoard, useInfiniteScroll } from "@hooks";

const FreeBoard = () => {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get("tag") ?? undefined;

  const { posts, isLoading, hasMore, loadMore } = usePostBoard("FREE", tag);
  const observerRef = useInfiniteScroll({ onLoadMore: loadMore, hasMore, isLoading });

  // // 초기 로드 및 tag 변경 후 state reset 완료 시 첫 페이지 요청
  // useEffect(() => {
  //   loadMore();
  //   // tag 변경 시에만 재실행하며, loadMore 참조 변경은 의도적으로 제외
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [tag]);

  return (
    <div className="flex flex-col gap-2 mt-3">
      {(posts as FreePost[]).map((post) => (
        <FreePostCard key={post.postId} post={post} />
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
