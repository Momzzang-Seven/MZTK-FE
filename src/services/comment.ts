import { api } from "./client";
import type { Comment, CommentPayload, GetCommentsResponse } from "@types";

export const commentService = {
  async createComment(
    targetId: number,
    payload: CommentPayload,
    isAnswer: boolean = false
  ): Promise<Comment> {
    const path = isAnswer ? "answers" : "posts";
    const response = await api.post(
      `/v2/${path}/${targetId}/comments`,
      payload
    );
    return response.data.data;
  },

  async getComments(
    targetId: number,
    cursor: string | null,
    size: number,
    isAnswer: boolean = false
  ): Promise<GetCommentsResponse> {
    const path = isAnswer ? "answers" : "posts";
    const response = await api.get(`/v2/${path}/${targetId}/comments`, {
      params: { cursor, size },
    });
    return response.data.data;
  },

  async getReplies(
    commentId: number,
    cursor: string | null,
    size: number
  ): Promise<GetCommentsResponse> {
    const response = await api.get(`/v2/comments/${commentId}/replies`, {
      params: { cursor, size },
    });
    return response.data.data;
  },

  async updateComment(
    commentId: number,
    content: string,
    targetId?: number,
    isAnswer: boolean = false
  ) {
    const url = isAnswer
      ? `/v2/answers/${targetId}/comments/${commentId}`
      : `/comments/${commentId}`;
    const response = await api.put(url, { content });
    return response.data;
  },

  async deleteComment(
    commentId: number,
    targetId?: number,
    isAnswer: boolean = false
  ) {
    const url = isAnswer
      ? `/v2/answers/${targetId}/comments/${commentId}`
      : `/comments/${commentId}`;
    const response = await api.delete(url);
    return response.data;
  },
};
