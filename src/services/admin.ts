import { api } from "./client";
import type {
  UserStatsResponse,
  PostStatsResponse,
  UpdateUserStatusRequest,
  UpdateUserStatusResponse,
  AdminUserQuery,
  AdminUserDto,
  PageResponse,
  BanRequest,
  BanResponse,
  AdminPostQuery,
  AdminPostDto,
  AdminCommentQuery,
  AdminCommentDto,
  AdminAccountDto,
  CreateAdminAccountResponse,
  ListAdminAccountsResponse,
  QnARefundReviewResponse,
  QnASettlementReviewResponse,
  Web3ActionResponse,
  TreasuryKeyDto,
  ProvisionKeyRequest,
  ChangeAdminPasswordRequest,
  ResetAdminPasswordResponse,
  MarkTransactionSucceededRequest,
  MarkTransactionSucceededResponse,
  SponsorNonceSlotsResponse,
  MarketplaceAdminEscrowReviewResponse,
  MarketplaceAdminExecutionResponse,
  MarketplaceAdminRefundRequest,
  MarketplaceAdminSettlementRequest,
} from "@types";

interface BaseResponse<T> {
  status: string;
  message: string;
  data: T;
  code: string;
  retryable: boolean;
}

export const fetchUserStats = async (): Promise<UserStatsResponse> => {
  const { data } = await api.get<BaseResponse<UserStatsResponse>>(
    "/admin/dashboard/user-stats"
  );
  return data.data;
};

export const fetchPostStats = async (): Promise<PostStatsResponse> => {
  const { data } = await api.get<BaseResponse<PostStatsResponse>>(
    "/admin/dashboard/post-stats"
  );
  return data.data;
};

export const updateUserStatus = async (
  userId: number,
  data: UpdateUserStatusRequest
): Promise<UpdateUserStatusResponse> => {
  const res = await api.patch<BaseResponse<UpdateUserStatusResponse>>(
    `/admin/users/${userId}/status`,
    data
  );
  return res.data.data;
};

export const fetchUsersList = async (
  params: AdminUserQuery
): Promise<PageResponse<AdminUserDto>> => {
  const res = await api.get<BaseResponse<PageResponse<AdminUserDto>>>(
    "/admin/users",
    { params }
  );
  return res.data.data;
};

export const fetchPostsList = async (
  params: AdminPostQuery
): Promise<PageResponse<AdminPostDto>> => {
  const res = await api.get<BaseResponse<PageResponse<AdminPostDto>>>(
    "/admin/boards/posts",
    { params }
  );
  return res.data.data;
};

export const fetchCommentsList = async (
  postId: number,
  params?: AdminCommentQuery
): Promise<PageResponse<AdminCommentDto>> => {
  const res = await api.get<BaseResponse<PageResponse<AdminCommentDto>>>(
    `/admin/boards/posts/${postId}/comments`,
    { params }
  );
  return res.data.data;
};

export const banAdminPost = async (
  postId: number,
  data: BanRequest
): Promise<BanResponse> => {
  const res = await api.post<BaseResponse<BanResponse>>(
    `/admin/boards/posts/${postId}/ban`,
    data
  );
  return res.data.data;
};

export const unblockAdminPost = async (
  postId: number,
  data: BanRequest
): Promise<BanResponse> => {
  const res = await api.post<BaseResponse<BanResponse>>(
    `/admin/boards/posts/${postId}/unblock`,
    data
  );
  return res.data.data;
};

export const banAdminComment = async (
  commentId: number,
  data: BanRequest
): Promise<BanResponse> => {
  const res = await api.post<BaseResponse<BanResponse>>(
    `/admin/boards/comments/${commentId}/ban`,
    data
  );
  return res.data.data;
};

// admin-account-controller
export const fetchAdminAccounts = async (): Promise<AdminAccountDto[]> => {
  const res =
    await api.get<BaseResponse<ListAdminAccountsResponse>>("/admin/accounts");
  return res.data.data.admins;
};

export const createAdminAccount =
  async (): Promise<CreateAdminAccountResponse> => {
    const res =
      await api.post<BaseResponse<CreateAdminAccountResponse>>(
        "/admin/accounts"
      );
    return res.data.data;
  };

export const resetAdminPassword = async (
  userId: number
): Promise<ResetAdminPasswordResponse> => {
  const res = await api.post<BaseResponse<ResetAdminPasswordResponse>>(
    `/admin/accounts/${userId}/password/reset`
  );
  return res.data.data;
};

// transaction-controller
export const markTransactionSucceeded = async (
  txId: number,
  data: MarkTransactionSucceededRequest
): Promise<MarkTransactionSucceededResponse> => {
  const res = await api.post<BaseResponse<MarkTransactionSucceededResponse>>(
    `/admin/web3/transactions/${txId}/mark-succeeded`,
    data
  );
  return res.data.data;
};

export const fetchSponsorNonceSlots = async (params: {
  chainId: number;
  fromAddress: string;
  page?: number;
  size?: number;
}): Promise<SponsorNonceSlotsResponse> => {
  const res = await api.get<BaseResponse<SponsorNonceSlotsResponse>>(
    "/admin/web3/nonce-slots",
    { params }
  );
  return res.data.data;
};

// qna-admin-escrow-controller
export const fetchQnARefundReview = async (
  postId: number
): Promise<QnARefundReviewResponse> => {
  const res = await api.get<BaseResponse<QnARefundReviewResponse>>(
    `/admin/web3/qna/questions/${postId}/refund-review`
  );
  return res.data.data;
};

export const fetchQnASettlementReview = async (
  postId: number,
  answerId: number
): Promise<QnASettlementReviewResponse> => {
  const res = await api.get<BaseResponse<QnASettlementReviewResponse>>(
    `/admin/web3/qna/questions/${postId}/answers/${answerId}/settlement-review`
  );
  return res.data.data;
};

export const processQnARefund = async (
  postId: number
): Promise<Web3ActionResponse> => {
  const res = await api.post<BaseResponse<Web3ActionResponse>>(
    `/admin/web3/qna/questions/${postId}/refund`
  );
  return res.data.data;
};

export const processQnASettle = async (
  postId: number,
  answerId: number
): Promise<Web3ActionResponse> => {
  const res = await api.post<BaseResponse<Web3ActionResponse>>(
    `/admin/web3/qna/questions/${postId}/answers/${answerId}/settle`
  );
  return res.data.data;
};

// marketplace-admin-escrow-controller
export const fetchMarketplaceRefundReview = async (
  reservationId: number
): Promise<MarketplaceAdminEscrowReviewResponse> => {
  const res = await api.get<BaseResponse<MarketplaceAdminEscrowReviewResponse>>(
    `/admin/web3/marketplace/reservations/${reservationId}/refund-review`
  );
  return res.data.data;
};

export const fetchMarketplaceSettlementReview = async (
  reservationId: number
): Promise<MarketplaceAdminEscrowReviewResponse> => {
  const res = await api.get<BaseResponse<MarketplaceAdminEscrowReviewResponse>>(
    `/admin/web3/marketplace/reservations/${reservationId}/settlement-review`
  );
  return res.data.data;
};

export const processMarketplaceRefund = async (
  reservationId: number,
  data: MarketplaceAdminRefundRequest
): Promise<MarketplaceAdminExecutionResponse> => {
  const res = await api.post<BaseResponse<MarketplaceAdminExecutionResponse>>(
    `/admin/web3/marketplace/reservations/${reservationId}/refund`,
    data
  );
  return res.data.data;
};

export const processMarketplaceSettle = async (
  reservationId: number,
  data: MarketplaceAdminSettlementRequest
): Promise<MarketplaceAdminExecutionResponse> => {
  const res = await api.post<BaseResponse<MarketplaceAdminExecutionResponse>>(
    `/admin/web3/marketplace/reservations/${reservationId}/settle`,
    data
  );
  return res.data.data;
};

// treasury-key-controller
export const provisionTreasuryKey = async (
  data: ProvisionKeyRequest
): Promise<TreasuryKeyDto> => {
  const res = await api.post<BaseResponse<TreasuryKeyDto>>(
    "/admin/web3/treasury-keys/provision",
    data
  );
  return res.data.data;
};

export const disableTreasuryKey = async (
  walletAlias: string
): Promise<void> => {
  await api.post(`/admin/web3/treasury-keys/${walletAlias}/disable`);
};

export const archiveTreasuryKey = async (
  walletAlias: string
): Promise<void> => {
  await api.post(`/admin/web3/treasury-keys/${walletAlias}/archive`);
};

export const fetchTreasuryKey = async (
  walletAlias: string
): Promise<TreasuryKeyDto> => {
  const res = await api.get(`/admin/web3/treasury-keys/${walletAlias}`);
  return res.data.data;
};

export const fetchAllTreasuryKeys = async (): Promise<TreasuryKeyDto[]> => {
  const res = await api.get("/admin/web3/treasury-keys");
  return res.data.data;
};

// admin-recovery-controller
export const reseedSystem = async (): Promise<void> => {
  await api.post("/admin/recovery/reseed");
};

// admin-auth-controller
export const changeAdminPassword = async (
  data: ChangeAdminPasswordRequest
): Promise<void> => {
  await api.post("/admin/auth/password", data);
};
