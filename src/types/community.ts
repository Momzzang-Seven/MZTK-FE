import type { ExecutionWeb3Intent } from "@types";

export type PostType = "FREE" | "QUESTION";

export interface PostPayload {
  title?: string;
  content?: string;
  imageIds?: number[];
  reward?: number;
  tags?: string[];
}

export interface CommentPayload {
  content: string;
  parentId?: number;
}

export type ActionModalType =
  | "MY"
  | "OTHERS"
  | "REPORT_CONFIRM"
  | "DELETE_CONFIRM"
  | "SELECT_CONFIRM"
  | "EDIT_COMMENT"
  | null;

export interface Writer {
  userId: number;
  nickname: string;
  profileImage?: string;
}

export interface Image {
  imageId: number;
  imageUrl: string;
}

export interface Post {
  type?: PostType;
  content: string;
  writer: Writer;
  createdAt: string;
  updatedAt: string;
  images: Image[];
  commentCount: number;
  tags: string[];
}

export interface FreePost extends Post {
  postId: number;
  isLiked: boolean;
  likeCount: number;
}

export interface QuestionPost extends Post {
  postId: number;
  title: string;
  question: {
    isSolved: boolean;
    reward: number;
    web3Execution: ExecutionWeb3Intent;
  };
}

export interface AnswerPost extends Post {
  answerId: number;
  isAccepted: boolean;
}

export interface Comment {
  commentId: number;
  content: string;
  writer: Writer;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  isDeleted: boolean;
}

export interface Reply extends Comment {
  replyId: number;
}

export interface GetPostsResponse {
  posts: FreePost[] | QuestionPost[];
  hasNext: boolean;
}

export interface CreateFreePostResponse {
  postId: number;
  isXpGranted: boolean;
  grantedXp: number;
  message: string;
}

export interface QnAPostResponse {
  postId: number;
  web3?: ExecutionWeb3Intent;
}

/** GET /v2/users/me/posts 단일 게시글 항목 */
export interface MyPost {
  postId: number;
  type: PostType;
  title: string;
  content: string;
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
  tags: string[];
  images: Image[];
  createdAt: string;
  updatedAt: string;
  writer: Writer;
  question?: {
    reward: number;
    isSolved: boolean;
  };
}

/** GET /v2/users/me/posts cursor 기반 응답 */
export interface GetMyPostsResponse {
  posts: MyPost[];
  hasNext: boolean;
  nextCursor: string | null;
}

export interface GetCommentsResponse {
  content: Comment[];
  last: boolean;
}