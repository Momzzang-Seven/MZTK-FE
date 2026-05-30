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
  status: "ACTIVE" | "BLOCKED" | "DELETED" | "UNVERIFIED";
}

export interface AdminUserQuery {
  search?: string;
  status?: "ACTIVE" | "BLOCKED" | "DELETED" | "UNVERIFIED";
  role?: "USER" | "TRAINER";
  page?: number;
  size?: number;
  sort?: string;
}

export interface AdminUserDto {
  userId: number;
  nickname: string;
  role: "USER" | "TRAINER" | "ADMIN" | "ADMIN_SEED" | "ADMIN_GENERATED";
  email: string;
  joinedAt: string;
  status: "ACTIVE" | "BLOCKED" | "DELETED" | "UNVERIFIED";
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

export type AdminPostStatus =
  | "OPEN"
  | "PENDING_ACCEPT"
  | "PENDING_ADMIN_REFUND"
  | "RESOLVED";

export type AdminPostPublicationStatus = "PENDING" | "VISIBLE" | "FAILED";

export type AdminPostModerationStatus = "NORMAL" | "BLOCKED";

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
  publicationStatus?: AdminPostPublicationStatus;
  moderationStatus?: AdminPostModerationStatus;
  publiclyVisible?: boolean;
}

export interface AdminPostQuery {
  search?: string;
  status?: AdminPostStatus;
  type?: "FREE" | "QUESTION";
  publicationStatus?: AdminPostPublicationStatus;
  moderationStatus?: AdminPostModerationStatus;
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
  status: AdminPostStatus;
  publicationStatus: AdminPostPublicationStatus;
  moderationStatus: AdminPostModerationStatus;
  title: string;
  contentPreview: string;
  writerId: number;
  writerNickname: string;
  createdAt: string;
  commentCount: number;
  answerCount?: number;
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

export interface CreateAdminAccountResponse {
  userId: number;
  loginId: string;
  generatedPassword: string;
  createdAt: string;
}

export interface ResetAdminPasswordResponse {
  userId: number;
  loginId: string;
  generatedPassword: string;
  resetAt: string;
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

export interface MarkTransactionSucceededRequest {
  txHash: string;
  explorerUrl: string;
  reason: string;
  evidence: string;
}

export interface MarkTransactionSucceededResponse {
  transactionId: number;
  previousStatus: string;
  status: string;
  txHash: string;
  explorerUrl: string;
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
  role: TreasuryRole | null;
  status: "ACTIVE" | "DISABLED" | "ARCHIVED";
  kmsKeyId?: string;
  keyOrigin: string;
  createdAt: string;
  disabledAt?: string | null;
}

export type TreasuryRole =
  | "REWARD"
  | "SPONSOR"
  | "QNA_SIGNER"
  | "MARKETPLACE_SIGNER";

export interface ProvisionKeyRequest {
  rawPrivateKey: string;
  role: TreasuryRole;
  expectedAddress: string;
}

export interface SponsorNonceSlotDto {
  nonce: number;
  status: string;
  blocking: boolean;
  lowestBlockingSlot: boolean;
  severity: "BLOCKING" | "WARNING" | "INFO" | string;
  displayReason?: string | null;
  operatorAction?: string | null;
  runbookKey?: string | null;
  attemptNo: number;
  activeAttemptId?: number | null;
  activeTxId?: number | null;
  activeTxHash?: string | null;
  consumedAttemptId?: number | null;
  consumedTxId?: number | null;
  consumedExternalEvidenceId?: number | null;
  consumedAt?: string | null;
  consumedReason?: string | null;
  releasedAttemptId?: number | null;
  releasedTxId?: number | null;
  releasedAt?: string | null;
  releaseReason?: string | null;
  stuckReason?: string | null;
  replacementClaimOwner?: string | null;
  replacementClaimExpiresAt?: string | null;
  replacementPrepareAttemptCount: number;
  broadcastStartedAt?: string | null;
  lastBroadcastedAt?: string | null;
  broadcastRecoveryClaimOwner?: string | null;
  broadcastRecoveryClaimExpiresAt?: string | null;
  broadcastRecoveryAttemptCount: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SponsorNonceSlotsResponse {
  chainId: number;
  fromAddress: string;
  serverTimeZone: string;
  page: number;
  size: number;
  hasNext: boolean;
  slots: SponsorNonceSlotDto[];
}

export interface ChangeAdminPasswordRequest {
  currentPassword: string;
  newPassword: string;
}
