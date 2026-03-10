import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { SimpleHeader } from "@components/layout";
import { CommentItem, CommentInput } from "@components/community";
import type { Comment } from "@types";

const FreePostDetail = () => {
  const { params } = useParams();
  const postId = Number(params);

  const [comments, setComments] = useState<Comment[]>([]);
  const [repliesMap, setRepliesMap] = useState<Record<number, Comment[]>>({});
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});

  const [writingComment, setWritingComment] = useState("");

  useEffect(() => {
    fetch("/data/comments.json")
      .then((res) => res.json())
      .then(setComments)
      .catch(console.error);
  }, []);

  const handleReplyClick = (commentId: number) => {
    if (openMap[commentId]) {
      setOpenMap((prev) => ({
        ...prev,
        [commentId]: false,
      }));
      return;
    }

    fetch("/data/replies.json")
      .then((res) => res.json())
      .then((data) => setRepliesMap((prev) => ({ ...prev, [commentId]: data })))
      .then(() => setOpenMap((prev) => ({ ...prev, [commentId]: true })))
      .catch(console.error);
  };

  const handleWriteReplyClick = (commentId: number, nickname: string) => {
    setWritingComment(`@${nickname}`);
    console.log(commentId);
  };

  const handleCommentSubmit = () => {
    if (!writingComment.trim()) return;

    // 전송 api 추가
    console.log(postId, writingComment);
    setWritingComment("");
  };

  return (
    <div>
      <SimpleHeader />

      <section>
        {comments.map((comment) => (
          <div key={comment.commentId} className="mb-1">
            <CommentItem comment={comment} />

            <div className="flex gap-4 ml-15 font-semibold text-xs text-gray-500">
              {comment.replyCount > 0 && (
                <div
                  className="cursor-pointer"
                  onClick={() => handleReplyClick(comment.commentId)}
                >
                  답글 펼쳐보기({comment.replyCount}개)
                </div>
              )}

              <div
                className="cursor-pointer"
                onClick={() =>
                  handleWriteReplyClick(
                    comment.commentId,
                    comment.writer.nickname
                  )
                }
              >
                답글 달기
              </div>
            </div>

            {openMap[comment.commentId] && (
              <div>
                {repliesMap[comment.commentId]?.map((reply) => (
                  <div key={reply.commentId} className="ml-12">
                    <CommentItem comment={reply} showProfileImage={false} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      <div>
        <CommentInput
          postId={postId}
          comment={writingComment}
          setComment={setWritingComment}
          handleCommentSubmit={handleCommentSubmit}
        />
      </div>
    </div>
  );
};

export default FreePostDetail;
