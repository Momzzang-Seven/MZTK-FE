import { useCallback, useState } from "react";
import { usePostStore } from "@store";
import { postService } from "@services";
import type { PostType } from "@store";

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
  const setInitialData = usePostStore((s) => s.setInitialData);
  const setParentPostId = usePostStore((s) => s.setParentPostId);

  const [isFetching, setIsFetching] = useState(false);

  const loadPost = useCallback(
    async (postId: number) => {
      setIsFetching(true);
      try {
        const post = await postService.getPost(postId);

        const nextPostType = post.type as PostType;
        const nextContent = post.content;
        const nextTags = post.tags;
        const nextImageIds = post.images.map((img) => img.imageId);
        const nextTitle = "title" in post ? post.title : "";
        const nextReward =
          "question" in post && post.question ? post.question.reward : 0;

        setPostType(nextPostType);
        setContent(nextContent);
        setTags(nextTags);
        setImages(
          post.images.map((img) => ({
            imageId: img.imageId,
            imageUrl: img.imageUrl,
          }))
        );
        setTitle(nextTitle);
        setReward(nextReward);

        setInitialData({
          postType: nextPostType,
          title: nextTitle,
          content: nextContent,
          reward: nextReward,
          tags: nextTags,
          imageIds: nextImageIds,
        });
      } finally {
        setIsFetching(false);
      }
    },
    [
      setPostType,
      setTitle,
      setContent,
      setImages,
      setTags,
      setReward,
      setInitialData,
    ]
  );

  const setPostForEdit = useCallback(
    (data: {
      type: PostType;
      content: string;
      images: { imageId: number; imageUrl: string }[];
      title?: string;
      reward?: number;
      parentId?: number;
    }) => {
      const {
        type,
        content,
        images,
        title = "",
        reward = 0,
        parentId = null,
      } = data;

      setPostType(type);
      setContent(content);
      setImages(images);
      setTitle(title);
      setReward(reward);
      setTags([]); // 답변은 태그가 없으므로 초기화
      setParentPostId(parentId);

      setInitialData({
        postType: type,
        title: title,
        content: content,
        reward: reward,
        tags: [],
        imageIds: images.map((img) => img.imageId),
      });
    },
    [
      setParentPostId,
      setPostType,
      setContent,
      setImages,
      setTitle,
      setReward,
      setInitialData,
      setTags,
    ]
  );

  return { isFetching, loadPost, setPostForEdit };
};
