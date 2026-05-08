export interface UserStatsResponse {
  totalUserCount: number;
  activeUserCount: number;
  blockedUserCount: number;
  roleCounts: Record<string, number>;
}

export interface PostStatsResponse {
  postRemovalReasonStats: Record<string, number>;
  boardTypeSplit: Record<string, number>;
  targetTypeStats: Record<string, number>;
}

export interface UpdateUserStatusRequest {
  status: "ACTIVE" | "BLOCKED" | "DELETED";
  reason?: string;
}

export interface UpdateUserStatusResponse {
  userId: number;
  status: "ACTIVE" | "BLOCKED" | "DELETED";
}

export interface AdminUserQuery {
  search?: string;
  status?: "ACTIVE" | "BLOCKED" | "DELETED";
  role?: "USER" | "TRAINER";
  page?: number;
  size?: number;
  sort?: string;
}

export interface AdminUserDto {
  userId: number;
  nickname: string;
  role: "USER" | "TRAINER";
  email: string;
  joinedAt: string;
  status: "ACTIVE" | "BLOCKED" | "DELETED";
  postCount: number;
  commentCount: number;
}

export interface PageResponse<T> {
  totalPages: number;
  totalElements: number;
  size: number;
  content: T[];
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface BanRequest {
  reasonCode:
    | "INAPPROPRIATE"
    | "SPAM"
    | "POLICY_VIOLATION"
    | "HARASSMENT"
    | "OTHER";
  reasonDetail?: string;
}

export interface BanResponse {
  targetId: number;
  targetType: "POST" | "COMMENT";
  reasonCode: string;
  moderated: boolean;
}

export interface AdminPostQuery {
  search?: string;
  status?: "OPEN" | "CLOSED" | "BANNED";
  page?: number;
  size?: number;
  sort?: string;
}

export interface AdminCommentQuery {
  page?: number;
  size?: number;
}

export interface AdminPostDto {
  postId: number;
  type: "FREE" | "QUESTION";
  status: "OPEN" | "CLOSED" | "BANNED";
  title: string;
  contentPreview: string;
  writerId: number;
  writerNickname: string;
  createdAt: string;
  commentCount: number;
}

export interface AdminCommentDto {
  commentId: number;
  postId: number;
  writerId: number;
  writerNickname: string;
  content: string;
  parentId: number | null;
  isDeleted: boolean;
  createdAt: string;
}

// admin-account-controller
export interface AdminAccountDto {
  userId: number;
  loginId: string;
  nickname: string;
  role: string;
  isSeed?: boolean;
  passwordLastRotatedAt?: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface ListAdminAccountsResponse {
  admins: AdminAccountDto[];
}

export interface CreateAdminAccountRequest {
  loginId: string;
  nickname: string;
}

// transaction-controller
export interface AdminTransactionDto {
  txId: number;
  hash: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  type: string;
  userId: number;
  createdAt: string;
}

// qna-admin-escrow-controller
export interface QnARefundReviewResponse {
  postId: number;
  status: string;
  isRefundable: boolean;
  reason?: string;
}

export interface QnASettlementReviewResponse {
  postId: number;
  answerId: number;
  status: string;
  isSettlable: boolean;
  reason?: string;
}

export interface Web3ActionResponse {
  success: boolean;
  message: string;
  txHash?: string;
}

// treasury-key-controller
export interface TreasuryKeyDto {
  walletAlias: string;
  walletAddress: string;
  role: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  kmsKeyId?: string;
  keyOrigin: string;
  createdAt: string;
}

export interface ProvisionKeyRequest {
  rawPrivateKey: string;
  role: string;
  expectedAddress: string;
}

export interface ChangeAdminPasswordRequest {
  currentPassword: string;
  newPassword: string;
}
