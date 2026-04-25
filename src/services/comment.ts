import { api } from "./client";
import type { Comment, CommentPayload, GetCommentsResponse } from "@types";

export const commentService = {
    async createComment(postId: number, payload: CommentPayload): Promise<Comment> {
        const response = await api.post(`/posts/${postId}/comments`, payload);
        return response.data.data;
    },

    async getComments(postId: number, page: number, size: number): Promise<GetCommentsResponse> {
        const response = await api.get(`/posts/${postId}/comments`, { params: { page, size } });
        return response.data.data;
    },

    async getReplies(commentId: number, page: number, size: number): Promise<GetCommentsResponse> {
        const response = await api.get(`/comments/${commentId}/replies`, { params: { page, size } });
        return response.data.data;
    },

    async updateComment(commentId: number, content: string) {
        const response = await api.put(`/comments/${commentId}`, { content });
        return response.data;
    },

    async deleteComment(commentId: number) {
        const response = await api.delete(`/comments/${commentId}`);
        return response.data;
    }
}