import { api } from "./client";
import type {
  PostType,
  PostPayload,
  GetPostsResponse,
  GetMyPostsResponse,
  FreePost,
  QuestionPost,
  AnswerPost,
  CreateQnAPostResponse,
  AcceptAnswerResponse,
} from "@types";

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
  async createQuestion(payload: PostPayload): Promise<CreateQnAPostResponse> {
    const response = await api.post("/posts/question", payload);
    return response.data.data;
  },

  /**
   * 답변 등록
   */
  async createAnswer(
    postId: number,
    payload: PostPayload
  ): Promise<CreateQnAPostResponse> {
    const response = await api.post(`/questions/${postId}/answers`, payload);
    return response.data.data;
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
   * 답변 조회
   */
  async getAnswers(postId: number): Promise<AnswerPost[]> {
    const response = await api.get(`/questions/${postId}/answers`);
    return response.data.data;
  },

  /**
   * 게시글 상세 조회
   */
  async getPost(postId: number): Promise<FreePost | QuestionPost> {
    const response = await api.get(`/posts/${postId}`);
    return response.data.data;
  },

  /**
   * 자유게시글 수정
   */
  async updateFreePost(postId: number, payload: PostPayload): Promise<void> {
    const response = await api.patch(`/posts/${postId}`, payload);
    return response.data.data;
  },

  /**
   * 질문게시글 수정
   */
  async updateQuestion(
    postId: number,
    payload: PostPayload
  ): Promise<CreateQnAPostResponse> {
    const response = await api.patch(`/posts/${postId}`, payload);
    return response.data.data;
  },

  /**
   * 답변 수정
   */
  async updateAnswer(
    postId: number,
    answerId: number,
    payload: PostPayload
  ): Promise<CreateQnAPostResponse> {
    const response = await api.put(
      `/questions/${postId}/answers/${answerId}`,
      payload
    );
    return response.data.data;
  },

  /**
   * 게시물 삭제
   */
  async deletePost(postId: number): Promise<CreateQnAPostResponse> {
    const response = await api.delete(`/posts/${postId}`);
    return response.data.data;
  },

  /**
   * 답변 삭제
   */
  async deleteAnswer(
    postId: number,
    answerId: number
  ): Promise<CreateQnAPostResponse> {
    const response = await api.delete(
      `/questions/${postId}/answers/${answerId}`
    );
    return response.data.data;
  },

  /**
   * 게시물 좋아요
   */
  async likePost(postId: number): Promise<void> {
    const response = await api.post(`/posts/${postId}/likes`);
    return response.data;
  },

  /**
   * 게시물 좋아요 취소
   */
  async unlikePost(postId: number): Promise<void> {
    const response = await api.delete(`/posts/${postId}/likes`);
    return response.data;
  },

  /**
   * 자유, 질문 생성 복구
   */
  async recoverCreatePost(postId: number): Promise<CreateQnAPostResponse> {
    const response = await api.post(`/posts/${postId}/web3/recover-create`);
    return response.data.data;
  },

  /**
   * 답변 생성 복구
   */
  async recoverCreateAnswer(
    postId: number,
    answerId: number
  ): Promise<CreateQnAPostResponse> {
    const response = await api.post(
      `/questions/${postId}/answers/${answerId}/web3/recover-create`
    );
    return response.data.data;
  },

  /**
   * 답변 채택
   */
  async acceptAnswer(
    postId: number,
    answerId: number
  ): Promise<AcceptAnswerResponse> {
    const response = await api.post(
      `/posts/${postId}/answers/${answerId}/accept`
    );
    return response.data.data;
  },

  /**
   * 내가 쓴 글 목록 조회 (cursor 기반)
   */
  async getMyPosts(
    type?: PostType,
    cursor?: string,
    size = 10
  ): Promise<GetMyPostsResponse> {
    const response = await api.get("/v2/users/me/posts", {
      params: { type, cursor, size },
    });
    return response.data.data;
  },

  /**
   * 내가 좋아요 누른 글 목록 조회 (cursor 기반)
   */
  async getMyLikedPosts(
    type: PostType,
    cursor?: string,
    size = 10
  ): Promise<GetMyPostsResponse> {
    const response = await api.get("/v2/users/me/liked-posts", {
      params: { type, cursor, size },
    });
    return response.data.data;
  },

  /**
   * 내가 댓글 단 글 목록 조회 (cursor 기반)
   */
  async getMyCommentedPosts(
    type: PostType,
    cursor?: string,
    size = 10
  ): Promise<GetMyPostsResponse> {
    const response = await api.get("/v2/users/me/commented-posts", {
      params: { type, cursor, size },
    });
    return response.data.data;
  },
};
