import { api } from "./client";
import type { PostPayload } from "@types";

export const postService = {
  /**
   * 게시물 등록
   */
  async createPost(payload: PostPayload): Promise<void> {
    const response = await api.post("/posts", payload);
    return response.data;
  },

  /**
   * 게시물 수정
   */
  async updatePost(postId: number, payload: PostPayload): Promise<void> {
    console.log(postId, payload)
  },

  /**
   * 게시물 삭제
   */
  async deletePost(postId: number): Promise<void> {
    console.log(postId)
  },

  /**
   * 게시물 목록 조회
   */
  async getPosts(): Promise<void> {
    console.log("게시물 목록 조회")
  },

  /**
   * 게시물 상세 조회
   */
  async getPost(postId: number): Promise<void> {
    console.log(postId)
  },

  /**
   * 답변 등록
   */
  async createAnswer(postId: number, payload: PostPayload): Promise<void> {
    console.log(postId, payload)
  }
}