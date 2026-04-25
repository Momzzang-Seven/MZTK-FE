import { api } from "./client";
import type { PostType, PostPayload, GetPostsResponse, FreePost, QuestionPost } from "@types";

export const postService = {
  /**
   * 자유게시글 등록
   */
  async createFreePost(payload: PostPayload): Promise<void> {
    const response = await api.post("/posts/free", payload);
    return response.data;
  },

  /**
   * 질문게시글 등록
   */
  async createQuestionPost(payload: PostPayload): Promise<void> {
    const response = await api.post("/posts/question", payload);
    return response.data;
  },

  /**
   * 게시글 목록 조회 & 게시글 검색
   */
  async getPosts(
    type: PostType,
    tag?: string,
    search?: string,
    page?: number,
    size?: number
  ): Promise<GetPostsResponse> {
    const response = await api.get("/posts", {
      params: {
        type,
        tag,
        search,
        page,
        size,
      },
    });
    return response.data.data;
  },

  /**
   * 게시글 상세 조회
   */
  async getPost(postId: number): Promise<FreePost | QuestionPost> {
    const response = await api.get(`/posts/${postId}`)
    return response.data.data;
  },

  /**
   * 게시물 수정
   */
  async updatePost(postId: number, payload: PostPayload): Promise<void> {
    const response = await api.patch(`/posts/${postId}`, payload)
    return response.data.data;
  },

  /**
   * 게시물 삭제
   */
  async deletePost(postId: number): Promise<void> {
    const response = await api.delete(`/posts/${postId}`)
    return response.data;
  },

  /**
   * 답변 등록
   */
  async createAnswer(postId: number, payload: PostPayload): Promise<void> {
    console.log(postId, payload)
  },

  /**
   * 게시물 좋아요
   */
  async likePost(postId: number): Promise<void> {
    const response = await api.post(`/posts/${postId}/likes`)
    return response.data;
  },

  /**
   * 게시물 좋아요 취소
   */
  async unlikePost(postId: number): Promise<void> {
    const response = await api.delete(`/posts/${postId}/likes`)
    return response.data;
  },

  async createComment(postId: number, payload: PostPayload): Promise<void> {
    const response = await api.post(`/posts/${postId}/comments`, payload)
    return response.data;
  }
}