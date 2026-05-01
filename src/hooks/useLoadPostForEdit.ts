import { useCallback, useState } from "react";
import { usePostStore } from "@store";
import type { CreatePostType } from "@store";
import { postService } from "@services";

/**
 * 수정 모드 진입 시 게시물 데이터를 fetch해 스토어에 채우는 훅.
 * - FREE 게시글: SelectImage에서 호출
 * - QUESTION/ANSWER 게시글: WritePost에서 호출
 */
export const useLoadPostForEdit = () => {
  const setPostType = usePostStore((s) => s.setPostType);
  const setTitle = usePostStore((s) => s.setTitle);
  const setContent = usePostStore((s) => s.setContent);
  const setImages = usePostStore((s) => s.setImages);
  const setTags = usePostStore((s) => s.setTags);
  const setReward = usePostStore((s) => s.setReward);

  const [isFetching, setIsFetching] = useState(false);

  const loadPost = useCallback(async (postId: number) => {
      setIsFetching(true);
      try {
        const post = await postService.getPost(postId);
        setContent(post.content);
        setTags(post.tags);
        setPostType(post.type as CreatePostType);
        setImages(post.images.map((image) => ({ imageId: image.imageId, imageUrl: image.imageUrl })));

        if ("title" in post) {
          setTitle(post.title);
        }
        if ("question" in post) {
          setReward(post.question.reward);
        }
      } finally {
        setIsFetching(false);
      }
    },
    [setPostType, setTitle, setContent, setImages, setTags, setReward],
  );

  return { isFetching, loadPost };
};
