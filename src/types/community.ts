export type PostType = "free" | "question";

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

export interface Post {
  type: PostType;
  content: string;
  writer: Writer;
  createdAt: string;
  updatedAt: string;
  imageUrls: string;
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
