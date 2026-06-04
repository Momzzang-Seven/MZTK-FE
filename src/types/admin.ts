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
  answerId?: number | null;
  targetType?: "POST" | "ANSWER";
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

export interface AdminWeb3TransactionQuery {
  failureReason?: string;
  status?: string;
  referenceType?: string;
  referenceId?: string;
  txType?: string;
  page?: number;
  size?: number;
}

export interface AdminWeb3TransactionDto {
  transactionId: number;
  idempotencyKey: string | null;
  referenceType: string | null;
  referenceId: string | null;
  txType: string | null;
  fromUserId: number | null;
  toUserId: number | null;
  fromAddress: string | null;
  toAddress: string | null;
  status: string;
  txHash: string | null;
  failureReason: string | null;
  processingBy: string | null;
  processingUntil: string | null;
  signedAt: string | null;
  broadcastedAt: string | null;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
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

export type MarketplaceAdminRefundReason =
  | "TRAINER_TIMEOUT"
  | "SESSION_START_WINDOW_TIMEOUT"
  | "ADMIN_MANUAL_REFUND";

export type MarketplaceAdminSettlementReason =
  | "BUYER_CONFIRMATION_TIMEOUT"
  | "ADMIN_MANUAL_SETTLE";

export interface MarketplaceAdminRefundRequest {
  reasonCode: MarketplaceAdminRefundReason;
  memo: string;
  confirmManualRefund: boolean;
}

export interface MarketplaceAdminSettlementRequest {
  reasonCode: MarketplaceAdminSettlementReason;
  memo: string;
  confirmEarlySettle: boolean;
}

export interface MarketplaceAdminValidationItem {
  code: string;
  severity: string;
  message: string;
  blocking: boolean;
}

export interface MarketplaceAdminReasonOption {
  reasonCode: MarketplaceAdminRefundReason | MarketplaceAdminSettlementReason;
  processable: boolean;
  blockingCode: string | null;
  requiresConfirmation: boolean;
  confirmationType: string | null;
  requiredAuthority: string | null;
  authoritySatisfied: boolean;
  displayCode: string | null;
  resultPreview: {
    targetReservationStatus: string;
    targetEscrowStatus: string;
    resolvedBy: string;
    terminalReasonCode: string;
  } | null;
  validationItems: MarketplaceAdminValidationItem[];
}

export interface MarketplaceAdminEscrowReviewResponse {
  reservationId: number;
  processable: boolean;
  baseBlockingCode: string | null;
  blockingReason: string | null;
  reservationStatus: string;
  escrowStatus: string;
  reviewedAt: string;
  chainCheckedAt: string | null;
  reservationVersion: number | null;
  adminExecutionPhase: string | null;
  nextPollAfterMs: number | null;
  pollingEndpoint: string | null;
  txHash: string | null;
  activeExecution: MarketplaceAdminExecutionAttempt | null;
  lastAttempt: MarketplaceAdminExecutionAttempt | null;
  baseValidationItems: MarketplaceAdminValidationItem[];
  reasonOptions: MarketplaceAdminReasonOption[];
}

export interface MarketplaceAdminExecutionAttempt {
  actionStateId: number | null;
  attemptStatus: string | null;
  failureStage: string | null;
  executionIntentId: string | null;
  executionStatus: string | null;
  adminExecutionPhase: string | null;
  txHash: string | null;
  failureReason: string | null;
  errorCode: string | null;
  evidenceErrorCode: string | null;
  retryable: boolean | null;
  finishedAt: string | null;
}

export interface MarketplaceAdminExecutionResponse {
  reservationId: number;
  actionType: string;
  orderKey: string;
  reservationStatus: string;
  escrowStatus: string;
  executionIntent: {
    id: string;
    status: string;
    expiresAt: string;
  } | null;
  execution: {
    mode: string;
    requiresUserSignature: boolean;
    authorityModel: string;
  } | null;
  adminExecutionPhase: string | null;
  nextPollAfterMs: number | null;
  pollingEndpoint: string | null;
  existing: boolean;
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
