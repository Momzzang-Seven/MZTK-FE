import { create } from "zustand";
import { ADMIN_TEXT } from "@constant/admin";
import {
  fetchUsersList,
  updateUserStatus,
  fetchPostsList,
  fetchCommentsList,
  banAdminPost,
  unblockAdminPost,
  banAdminComment,
  unblockAdminComment,
  postService,
  fetchAdminAccounts,
  createAdminAccount,
  resetAdminPassword,
  markTransactionSucceeded,
  fetchQnARefundReview,
  fetchQnASettlementReview,
  processQnARefund,
  processQnASettle,
  fetchMarketplaceRefundReview,
  fetchMarketplaceSettlementReview,
  processMarketplaceRefund,
  processMarketplaceSettle,
  provisionTreasuryKey,
  disableTreasuryKey,
  archiveTreasuryKey,
  fetchAllTreasuryKeys,
  reseedSystem,
  changeAdminPassword,
} from "@services";
import type {
  AdminAccountDto,
  CreateAdminAccountResponse,
  QnARefundReviewResponse,
  QnASettlementReviewResponse,
  Web3ActionResponse,
  TreasuryKeyDto,
  ProvisionKeyRequest,
  BanRequest,
  AdminPostQuery,
  ChangeAdminPasswordRequest,
  MarkTransactionSucceededRequest,
  MarkTransactionSucceededResponse,
  ResetAdminPasswordResponse,
  AdminUserQuery,
  MarketplaceAdminEscrowReviewResponse,
  MarketplaceAdminExecutionResponse,
  MarketplaceAdminRefundRequest,
  MarketplaceAdminSettlementRequest,
} from "@types";

export interface AdminUser {
  id: number;
  nickname: string;
  email: string;
  joinDate: string; // YYYY.MM.DD
  status: "ACTIVE" | "BLOCKED" | "DELETED" | "UNVERIFIED";
  postCount: number;
  commentCount: number;
  profileColor: string; // Hex color for avatar background
  role: "MEMBER" | "TRAINER";
}

export interface AdminComment {
  id: number;
  author: string;
  content: string;
  date: string; // YYYY-MM-DD HH:mm
  profileColor: string;
  isBanned: boolean;
  parentId?: number | null;
  answerId?: number | null;
  targetType?: "POST" | "ANSWER";
}

export interface AdminAnswer {
  id: number;
  author: string;
  content: string;
  date: string; // YYYY-MM-DD HH:mm
  profileColor: string;
  isAccepted: boolean;
  commentCount: number;
  likeCount: number;
}

export interface AdminPost {
  id: number;
  author: string;
  date: string; // YYYY-MM-DD HH:mm
  category: string;
  title: string;
  content: string;
  comments: AdminComment[];
  answers?: AdminAnswer[];
  profileColor: string;
  isBanned: boolean;
  publicationStatus?: "PENDING" | "VISIBLE" | "FAILED";
  moderationStatus?: "NORMAL" | "BLOCKED";
  publiclyVisible?: boolean;
  likeCount: number;
  commentCount: number;
  answerCount?: number;
}

export interface AdminInquiry {
  id: number;
  author: string;
  authorId: number;
  authorRole: "MEMBER" | "TRAINER";
  title: string;
  content: string;
  date: string;
  status: "OPEN" | "CLOSED";
  isAuthorBanned: boolean;
}

interface AdminState {
  // User Management State
  users: AdminUser[];
  filteredUsers: AdminUser[];
  searchQuery: string;
  statusFilter: "ALL" | "ACTIVE" | "BLOCKED";
  roleFilter: "ALL" | "MEMBER" | "TRAINER";
  isLoading: boolean;

  // User Management Stats
  totalUsers: number;
  blockedUsers: number;
  userPage: number;
  userTotalPages: number;
  userPageSize: number;

  // Post Management State
  posts: AdminPost[];
  filteredPosts: AdminPost[];
  searchPostQuery: string;
  postStatusFilter: "ALL" | "ACTIVE" | "BANNED";

  // Inquiry Management State
  inquiries: AdminInquiry[];
  filteredInquiries: AdminInquiry[];
  searchInquiryQuery: string;
  inquiryFilter: "ALL" | "MEMBER" | "TRAINER";

  // Pagination
  page: number;
  hasMore: boolean;
  isFetchingPosts: boolean;

  // User Management Actions
  fetchUsers: (page?: number) => Promise<void>;
  setUserPage: (page: number) => Promise<void>;
  setStatusFilter: (status: "ALL" | "ACTIVE" | "BLOCKED") => void;
  setRoleFilter: (role: "ALL" | "MEMBER" | "TRAINER") => void;
  searchUsers: (query: string) => void;
  banUser: (userId: number) => Promise<void>;
  unbanUser: (userId: number) => Promise<void>;

  // Post Management Actions
  fetchPosts: (reset?: boolean) => Promise<void>;
  setPostStatusFilter: (status: "ALL" | "ACTIVE" | "BANNED") => void;
  searchPosts: (query: string) => void;
  banPost: (
    postId: number,
    reason?: string,
    reasonCode?: BanRequest["reasonCode"]
  ) => Promise<void>;
  unbanPost: (postId: number) => Promise<void>;
  deleteComment: (
    postId: number,
    commentId: number,
    reason?: string,
    reasonCode?: BanRequest["reasonCode"]
  ) => Promise<void>;
  restoreComment: (postId: number, commentId: number) => Promise<void>;

  // Inquiry Management Actions
  fetchInquiries: () => Promise<void>;
  searchInquiries: (query: string) => void;
  setInquiryFilter: (filter: "ALL" | "MEMBER" | "TRAINER") => void;
  toggleUserBanByInquiry: (inquiryId: number) => Promise<void>;

  // Admin Account State & Actions
  adminAccounts: AdminAccountDto[];
  fetchAccounts: () => Promise<void>;
  addAdminAccount: () => Promise<CreateAdminAccountResponse>;
  resetPassword: (userId: number) => Promise<ResetAdminPasswordResponse>;

  // Web3/Escrow Actions
  confirmTransaction: (
    txId: number,
    data: MarkTransactionSucceededRequest
  ) => Promise<MarkTransactionSucceededResponse>;
  getRefundReview: (postId: number) => Promise<QnARefundReviewResponse>;
  getSettlementReview: (
    postId: number,
    answerId: number
  ) => Promise<QnASettlementReviewResponse>;
  executeRefund: (postId: number) => Promise<Web3ActionResponse>;
  executeSettle: (
    postId: number,
    answerId: number
  ) => Promise<Web3ActionResponse>;
  getMarketplaceRefundReview: (
    reservationId: number
  ) => Promise<MarketplaceAdminEscrowReviewResponse>;
  getMarketplaceSettlementReview: (
    reservationId: number
  ) => Promise<MarketplaceAdminEscrowReviewResponse>;
  executeMarketplaceRefund: (
    reservationId: number,
    data: MarketplaceAdminRefundRequest
  ) => Promise<MarketplaceAdminExecutionResponse>;
  executeMarketplaceSettle: (
    reservationId: number,
    data: MarketplaceAdminSettlementRequest
  ) => Promise<MarketplaceAdminExecutionResponse>;

  // Treasury & Recovery
  treasuryKeys: TreasuryKeyDto[];
  fetchTreasuryKeys: () => Promise<void>;
  provisionKey: (data: ProvisionKeyRequest) => Promise<void>;
  disableKey: (alias: string) => Promise<void>;
  archiveKey: (alias: string) => Promise<void>;
  reseedSystem: () => Promise<void>;
  updateAdminPassword: (data: ChangeAdminPasswordRequest) => Promise<void>;
}

// Helper to filter inquiries
const getFilteredInquiries = (
  inquiries: AdminInquiry[],
  role: string,
  query: string
) => {
  let filtered = inquiries;

  if (role !== "ALL") {
    filtered = filtered.filter((inquiry) => inquiry.authorRole === role);
  }

  const trimmedQuery = query.trim().toLowerCase();
  if (trimmedQuery) {
    filtered = filtered.filter(
      (inquiry) =>
        inquiry.title.toLowerCase().includes(trimmedQuery) ||
        inquiry.content.toLowerCase().includes(trimmedQuery)
    );
  }

  return filtered;
};

export const useAdminStore = create<AdminState>((set, get) => ({
  // User State
  users: [],
  filteredUsers: [],
  searchQuery: "",
  statusFilter: "ALL",
  roleFilter: "ALL",
  isLoading: false,
  totalUsers: 0,
  blockedUsers: 0,
  userPage: 0,
  userTotalPages: 1,
  userPageSize: 20,

  // Admin Account State
  adminAccounts: [],

  // Post State
  posts: [],
  filteredPosts: [],
  searchPostQuery: "",
  postStatusFilter: "ALL",
  page: 1,
  hasMore: true,
  isFetchingPosts: false,

  // Inquiry State
  inquiries: [],
  filteredInquiries: [],
  searchInquiryQuery: "",
  inquiryFilter: "ALL",

  // User Actions
  fetchUsers: async (page = get().userPage) => {
    set({ isLoading: true });
    try {
      const { searchQuery, statusFilter, roleFilter, userPageSize } = get();
      const params: AdminUserQuery = {
        page,
        size: userPageSize,
        sort: "joinedAt",
      };

      const trimmedSearch = searchQuery.trim();
      if (trimmedSearch) {
        params.search = trimmedSearch;
      }
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      if (roleFilter !== "ALL") {
        params.role = roleFilter === "MEMBER" ? "USER" : "TRAINER";
      }

      const response = await fetchUsersList(params);
      const users: AdminUser[] = response.content.map((u) => ({
        id: u.userId,
        nickname: u.nickname,
        email: u.email,
        joinDate: new Date(u.joinedAt)
          .toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .replace(/\. /g, ".")
          .replace(/\.$/, ""),
        status: u.status,
        postCount: u.postCount,
        commentCount: u.commentCount,
        profileColor:
          ADMIN_TEXT.COLORS.AVATARS[
            u.userId % ADMIN_TEXT.COLORS.AVATARS.length
          ],
        role: u.role === "TRAINER" ? "TRAINER" : "MEMBER",
      }));

      set({
        users,
        filteredUsers: users,
        totalUsers: response.totalElements,
        blockedUsers:
          statusFilter === "BLOCKED"
            ? response.totalElements
            : users.filter((u) => u.status === "BLOCKED").length,
        userPage: response.number,
        userTotalPages: response.totalPages,
        userPageSize: response.size,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      set({ isLoading: false });
    }
  },

  setUserPage: async (page: number) => {
    const { userTotalPages } = get();
    const nextPage = Math.max(
      0,
      Math.min(page, Math.max(userTotalPages - 1, 0))
    );
    await get().fetchUsers(nextPage);
  },

  setStatusFilter: (status: "ALL" | "ACTIVE" | "BLOCKED") => {
    set({ statusFilter: status, userPage: 0 });
    void get().fetchUsers(0);
  },

  setRoleFilter: (role: "ALL" | "MEMBER" | "TRAINER") => {
    set({ roleFilter: role, userPage: 0 });
    void get().fetchUsers(0);
  },

  searchUsers: (query: string) => {
    set({ searchQuery: query, userPage: 0 });
    void get().fetchUsers(0);
  },

  banUser: async (userId: number) => {
    try {
      await updateUserStatus(userId, {
        status: "BLOCKED",
        reason: ADMIN_TEXT.POST.MSG_BAN_REASON,
      });
      await get().fetchUsers(get().userPage);
    } catch (error) {
      console.error("Failed to ban user:", error);
      throw error;
    }
  },

  unbanUser: async (userId: number) => {
    try {
      await updateUserStatus(userId, {
        status: "ACTIVE",
        reason: ADMIN_TEXT.POST.MSG_UNBAN_REASON,
      });
      await get().fetchUsers(get().userPage);
    } catch (error) {
      console.error("Failed to unban user:", error);
      throw error;
    }
  },

  // Post Actions
  fetchPosts: async (reset = false) => {
    const {
      page,
      isFetchingPosts,
      hasMore,
      postStatusFilter,
      searchPostQuery,
    } = get();

    if (isFetchingPosts || (!hasMore && !reset)) return;

    set({ isFetchingPosts: true });

    try {
      const nextPage = reset ? 0 : page - 1;
      const params: AdminPostQuery = { size: 10, page: nextPage };
      if (postStatusFilter === "ACTIVE") {
        params.publicationStatus = "VISIBLE";
        params.moderationStatus = "NORMAL";
      } else if (postStatusFilter === "BANNED") {
        params.moderationStatus = "BLOCKED";
      }
      if (searchPostQuery) params.search = searchPostQuery;

      const response = await fetchPostsList(params);

      const postsWithComments: AdminPost[] = await Promise.all(
        response.content.map(async (p) => {
          let comments: AdminComment[] = [];
          if (p.commentCount > 0) {
            const commentRes = await fetchCommentsList(p.postId, { size: 50 });
            comments = commentRes.content.map((c) => ({
              id: c.commentId,
              author: c.writerNickname,
              content: c.content,
              date: new Date(c.createdAt).toLocaleString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
              profileColor:
                ADMIN_TEXT.COLORS.AVATARS[
                  c.writerId % ADMIN_TEXT.COLORS.AVATARS.length
                ],
              isBanned: c.isDeleted,
              parentId: c.parentId,
              answerId: c.answerId ?? null,
              targetType: c.targetType ?? "POST",
            }));
          }
          const answers =
            p.type === "QUESTION" && (p.answerCount ?? 0) > 0
              ? await postService
                  .getAnswers(p.postId)
                  .then((answerRes) =>
                    answerRes.map((answer) => ({
                      id: answer.answerId,
                      author: answer.nickname,
                      content: answer.content,
                      date: new Date(answer.createdAt).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      profileColor:
                        ADMIN_TEXT.COLORS.AVATARS[
                          answer.userId % ADMIN_TEXT.COLORS.AVATARS.length
                        ],
                      isAccepted: answer.isAccepted,
                      commentCount: answer.commentCount,
                      likeCount: answer.likeCount,
                    }))
                  )
                  .catch((error) => {
                    console.error("Failed to fetch answers:", error);
                    return [];
                  })
              : [];
          return {
            id: p.postId,
            author: p.writerNickname,
            date: new Date(p.createdAt).toLocaleString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            category:
              p.type === "FREE"
                ? ADMIN_TEXT.POST.BOARD_TYPE.FREE
                : ADMIN_TEXT.POST.BOARD_TYPE.QUESTION,
            title: p.title,
            content: p.contentPreview,
            comments: comments,
            answers,
            profileColor:
              ADMIN_TEXT.COLORS.AVATARS[
                p.writerId % ADMIN_TEXT.COLORS.AVATARS.length
              ],
            isBanned: p.moderationStatus === "BLOCKED",
            publicationStatus: p.publicationStatus,
            moderationStatus: p.moderationStatus,
            publiclyVisible:
              p.publicationStatus === "VISIBLE" &&
              p.moderationStatus === "NORMAL",
            likeCount: 0,
            commentCount: p.commentCount,
            answerCount: p.answerCount,
          };
        })
      );

      const isLastPage = response.last;
      const allPosts = reset
        ? postsWithComments
        : [...get().posts, ...postsWithComments];

      set(() => ({
        posts: allPosts,
        filteredPosts: allPosts,
        page: (reset ? 1 : page) + 1,
        hasMore: !isLastPage,
        isFetchingPosts: false,
      }));
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      set({ isFetchingPosts: false });
    }
  },

  setPostStatusFilter: (status: "ALL" | "ACTIVE" | "BANNED") => {
    set({ postStatusFilter: status, posts: [], page: 1, hasMore: true });
    get().fetchPosts(true);
  },

  searchPosts: (query: string) => {
    set({ searchPostQuery: query, posts: [], page: 1, hasMore: true });
    get().fetchPosts(true);
  },

  banPost: async (
    postId: number,
    reason?: string,
    reasonCode: BanRequest["reasonCode"] = "INAPPROPRIATE"
  ) => {
    try {
      await banAdminPost(postId, {
        reasonCode,
        reasonDetail: reason || ADMIN_TEXT.POST.MSG_DELETE_REASON,
      });
      const { posts } = get();
      const updatedPosts = posts.map((post) =>
        post.id === postId ? { ...post, isBanned: true } : post
      );
      set({ posts: updatedPosts, filteredPosts: updatedPosts });
    } catch (error) {
      console.error("Failed to ban post:", error);
      throw error;
    }
  },

  unbanPost: async (postId: number) => {
    try {
      const result = await unblockAdminPost(postId, {
        reasonCode: "OTHER",
        reasonDetail: "Admin restored post",
      });
      const { posts } = get();
      const updatedPosts = posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isBanned: result.moderationStatus === "BLOCKED",
              publicationStatus: result.publicationStatus,
              moderationStatus: result.moderationStatus,
              publiclyVisible: result.publiclyVisible,
            }
          : post
      );
      set({ posts: updatedPosts, filteredPosts: updatedPosts });
    } catch (error) {
      console.error("Failed to unblock post:", error);
      throw error;
    }
  },

  deleteComment: async (
    postId: number,
    commentId: number,
    reason?: string,
    reasonCode: BanRequest["reasonCode"] = "INAPPROPRIATE"
  ) => {
    try {
      await banAdminComment(commentId, {
        reasonCode,
        reasonDetail: reason || ADMIN_TEXT.POST.MSG_DELETE_REASON,
      });
      const { posts } = get();
      const updatedPosts = posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.map((c) =>
              c.id === commentId ? { ...c, isBanned: true } : c
            ),
          };
        }
        return post;
      });
      set({ posts: updatedPosts, filteredPosts: updatedPosts });
    } catch (error) {
      console.error("Failed to delete comment:", error);
      throw error;
    }
  },

  restoreComment: async (postId: number, commentId: number) => {
    try {
      await unblockAdminComment(commentId, {
        reasonCode: "OTHER",
        reasonDetail: "Admin restored comment",
      });
      const { posts } = get();
      const updatedPosts = posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.map((c) =>
              c.id === commentId ? { ...c, isBanned: false } : c
            ),
          };
        }
        return post;
      });
      set({ posts: updatedPosts, filteredPosts: updatedPosts });
    } catch (error) {
      console.error("Failed to unblock comment:", error);
      throw error;
    }
  },

  // Inquiry Actions
  fetchInquiries: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 500));
    set({
      inquiries: [],
      filteredInquiries: [],
      isLoading: false,
    });
  },

  searchInquiries: (query: string) => {
    set({ searchInquiryQuery: query });
    const { inquiries, inquiryFilter } = get();
    set({
      filteredInquiries: getFilteredInquiries(inquiries, inquiryFilter, query),
    });
  },

  setInquiryFilter: (filter: "ALL" | "MEMBER" | "TRAINER") => {
    set({ inquiryFilter: filter });
    const { inquiries, searchInquiryQuery } = get();
    set({
      filteredInquiries: getFilteredInquiries(
        inquiries,
        filter,
        searchInquiryQuery
      ),
    });
  },

  toggleUserBanByInquiry: async (inquiryId: number) => {
    const { inquiries, inquiryFilter, users, searchInquiryQuery } = get();
    const inquiry = inquiries.find((i) => i.id === inquiryId);
    if (!inquiry) return;

    const newBanStatus = !inquiry.isAuthorBanned;

    // Update inquiries
    const updatedInquiries = inquiries.map((i) =>
      i.authorId === inquiry.authorId
        ? { ...i, isAuthorBanned: newBanStatus }
        : i
    );

    // Update corresponding user in user list if exists
    const updatedUsers = users.map((u) =>
      u.id === inquiry.authorId
        ? {
            ...u,
            status: newBanStatus ? ("BLOCKED" as const) : ("ACTIVE" as const),
          }
        : u
    );

    set({
      inquiries: updatedInquiries,
      filteredInquiries: getFilteredInquiries(
        updatedInquiries,
        inquiryFilter,
        searchInquiryQuery
      ),
      users: updatedUsers,
    });
  },

  // Admin Account Actions
  fetchAccounts: async () => {
    set({ isLoading: true });
    try {
      const accounts = await fetchAdminAccounts();
      set({ adminAccounts: accounts, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch admin accounts:", error);
      set({ isLoading: false });
    }
  },

  addAdminAccount: async () => {
    try {
      const created = await createAdminAccount();
      await get().fetchAccounts();
      return created;
    } catch (error) {
      console.error("Failed to create admin account:", error);
      throw error;
    }
  },

  resetPassword: async (userId: number) => {
    try {
      return await resetAdminPassword(userId);
    } catch (error) {
      console.error("Failed to reset password:", error);
      throw error;
    }
  },

  // Web3/Escrow Actions
  confirmTransaction: async (
    txId: number,
    data: MarkTransactionSucceededRequest
  ) => {
    try {
      return await markTransactionSucceeded(txId, data);
    } catch (error) {
      console.error("Failed to confirm transaction:", error);
      throw error;
    }
  },

  getRefundReview: async (postId: number) => {
    return await fetchQnARefundReview(postId);
  },

  getSettlementReview: async (postId: number, answerId: number) => {
    return await fetchQnASettlementReview(postId, answerId);
  },

  executeRefund: async (postId: number) => {
    return await processQnARefund(postId);
  },

  executeSettle: async (postId: number, answerId: number) => {
    return await processQnASettle(postId, answerId);
  },

  getMarketplaceRefundReview: async (reservationId: number) => {
    return await fetchMarketplaceRefundReview(reservationId);
  },

  getMarketplaceSettlementReview: async (reservationId: number) => {
    return await fetchMarketplaceSettlementReview(reservationId);
  },

  executeMarketplaceRefund: async (
    reservationId: number,
    data: MarketplaceAdminRefundRequest
  ) => {
    return await processMarketplaceRefund(reservationId, data);
  },

  executeMarketplaceSettle: async (
    reservationId: number,
    data: MarketplaceAdminSettlementRequest
  ) => {
    return await processMarketplaceSettle(reservationId, data);
  },

  // Treasury & Recovery
  treasuryKeys: [],

  fetchTreasuryKeys: async () => {
    set({ isLoading: true });
    try {
      const keys = await fetchAllTreasuryKeys();
      set({ treasuryKeys: keys || [], isLoading: false });
    } catch (error) {
      console.error("Failed to fetch treasury keys:", error);
      set({ isLoading: false });
    }
  },

  provisionKey: async (data: ProvisionKeyRequest) => {
    await provisionTreasuryKey(data);
    await get().fetchTreasuryKeys();
  },

  disableKey: async (alias: string) => {
    await disableTreasuryKey(alias);
    await get().fetchTreasuryKeys();
  },

  archiveKey: async (alias: string) => {
    await archiveTreasuryKey(alias);
    await get().fetchTreasuryKeys();
  },

  reseedSystem: async () => {
    await reseedSystem();
  },

  updateAdminPassword: async (data: ChangeAdminPasswordRequest) => {
    await changeAdminPassword(data);
  },
}));
