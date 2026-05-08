import { create } from "zustand";

export interface AdminUser {
  id: number;
  nickname: string;
  email: string;
  joinDate: string; // YYYY.MM.DD
  status: "ACTIVE" | "BANNED" | "DELETED";
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
}

export interface AdminPost {
  id: number;
  author: string;
  date: string; // YYYY-MM-DD HH:mm
  category: string;
  title: string;
  content: string;
  comments: AdminComment[];
  profileColor: string;
  isBanned: boolean;
  likeCount: number;
  commentCount: number;
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
  statusFilter: "ALL" | "ACTIVE" | "BANNED";
  roleFilter: "ALL" | "MEMBER" | "TRAINER";
  isLoading: boolean;

  // User Management Stats
  totalUsers: number;
  bannedUsers: number;

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
  fetchUsers: () => Promise<void>;
  setStatusFilter: (status: "ALL" | "ACTIVE" | "BANNED") => void;
  setRoleFilter: (role: "ALL" | "MEMBER" | "TRAINER") => void;
  searchUsers: (query: string) => void;
  banUser: (userId: number) => Promise<void>;
  unbanUser: (userId: number) => Promise<void>;

  // Post Management Actions
  // Post Management Actions
  fetchPosts: (reset?: boolean) => Promise<void>;
  setPostStatusFilter: (status: "ALL" | "ACTIVE" | "BANNED") => void;
  searchPosts: (query: string) => void;
  banPost: (postId: number) => Promise<void>;
  unbanPost: (postId: number) => Promise<void>;
  deleteComment: (postId: number, commentId: number) => Promise<void>;
  restoreComment: (postId: number, commentId: number) => Promise<void>;

  // Inquiry Management Actions
  fetchInquiries: () => Promise<void>;
  searchInquiries: (query: string) => void;
  setInquiryFilter: (filter: "ALL" | "MEMBER" | "TRAINER") => void;
  toggleUserBanByInquiry: (inquiryId: number) => Promise<void>;
}

// Mock Data Generator
const generateMockUsers = (): AdminUser[] => {
  return [
    {
      id: 1,
      nickname: "김규원의마지막",
      email: "gyugyugyu@email.com",
      joinDate: "2024.01.15",
      status: "ACTIVE",
      postCount: 24,
      commentCount: 156,
      profileColor: "#FFD700",
      role: "MEMBER",
    },
    {
      id: 2,
      nickname: "운동하는직장인",
      email: "fitness_lover@test.com",
      joinDate: "2024.02.03",
      status: "ACTIVE",
      postCount: 18,
      commentCount: 89,
      profileColor: "#FFA500",
      role: "TRAINER",
    },
    {
      id: 3,
      nickname: "헬스장빌런",
      email: "villain@bad.com",
      joinDate: "2023.12.20",
      status: "BANNED",
      postCount: 5,
      commentCount: 12,
      profileColor: "#FF4500",
      role: "MEMBER",
    },
    {
      id: 4,
      nickname: "건강이최고",
      email: "health_first@good.com",
      joinDate: "2024.03.10",
      status: "ACTIVE",
      postCount: 42,
      commentCount: 231,
      profileColor: "#32CD32",
      role: "TRAINER",
    },
    {
      id: 5,
      nickname: "작심삼일",
      email: "three_days@fail.com",
      joinDate: "2024.01.28",
      status: "ACTIVE",
      postCount: 15,
      commentCount: 67,
      profileColor: "#1E90FF",
      role: "MEMBER",
    },
    {
      id: 6,
      nickname: "홍길동",
      email: "hong@test.com",
      joinDate: "2024.04.01",
      status: "ACTIVE",
      postCount: 0,
      commentCount: 2,
      profileColor: "#BA55D3",
      role: "MEMBER",
    },
    {
      id: 7,
      nickname: "스팸계정",
      email: "spam@spam.com",
      joinDate: "2024.04.05",
      status: "BANNED",
      postCount: 100,
      commentCount: 500,
      profileColor: "#808080",
      role: "TRAINER",
    },
  ];
};

const generateMockPosts = (page: number): AdminPost[] => {
  const startId = (page - 1) * 10 + 1;
  const comments: AdminComment[] = [
    {
      id: 1,
      author: "박지영",
      content: "ㄴㅇㄹㅇㄴㄹㅇㄴㄹㅇㄴㄹㅇㄴㄹ",
      date: "2024-01-18 15:20",
      profileColor: "#FFD700",
      isBanned: false,
    },
    {
      id: 2,
      author: "이민호",
      content: "ㄴㅇㄹㅇㄴㄹㅇㄴㄹㅇㄴㄹㅇㄴㄹ",
      date: "2024-01-18 16:45",
      profileColor: "#FFA500",
      isBanned: false,
    },
    {
      id: 3,
      author: "최수진",
      content: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ",
      date: "2024-01-18 17:10",
      profileColor: "#FF4500",
      isBanned: false,
    },
    {
      id: 4,
      author: "강태양",
      content: "1점",
      date: "2024-01-18 13:00",
      profileColor: "#32CD32",
      isBanned: false,
    },
    {
      id: 5,
      author: "윤성호",
      content: "010000010101000점",
      date: "2024-01-18 13:45",
      profileColor: "#1E90FF",
      isBanned: false,
    },
  ];

  const posts: AdminPost[] = [];

  // Generate 5 posts per page
  for (let i = 0; i < 5; i++) {
    const id = startId + i;
    posts.push({
      id: id,
      author: id % 2 === 0 ? "로지텍스" : "김기기기기길호",
      date: "2024-01-18 14:30",
      category: id % 2 === 0 ? "자유게시판" : "질문게시판",
      title:
        id % 2 === 0
          ? `내 몸은 짱멋지고 잘생겼어 ${id}`
          : `내 근육은 100점 ${id}`,
      content:
        id % 2 === 0
          ? "하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하"
          : "10점 만점에?",
      comments: [
        comments[0],
        comments[1],
        comments[2],
        comments[3],
        comments[4],
      ],
      profileColor: id % 2 === 0 ? "#DAA520" : "#CD853F",
      isBanned: false,
      likeCount: 80 + i,
      commentCount: 20 + i,
    });
  }

  return posts;
};

const generateMockInquiries = (): AdminInquiry[] => {
  return [
    {
      id: 1,
      author: "김규원의마지막",
      authorId: 1,
      authorRole: "MEMBER",
      title: "토큰 지급이 안 됐어요",
      content:
        "안녕하세요, 어제 레벨업 했는데 토큰이 안 들어왔습니다. 확인 부탁드려요.",
      date: "2024-03-09 10:20",
      status: "OPEN",
      isAuthorBanned: false,
    },
    {
      id: 2,
      author: "운동하는직장인",
      authorId: 2,
      authorRole: "TRAINER",
      title: "정산 관련 문의",
      content:
        "이번 주 정산 예정 금액이 실제 수업 횟수와 다릅니다. 확인 부탁드립니다.",
      date: "2024-03-09 11:45",
      status: "OPEN",
      isAuthorBanned: false,
    },
    {
      id: 3,
      author: "헬스장빌런",
      authorId: 3,
      authorRole: "MEMBER",
      title: "계정 정지 이의신청",
      content: "왜 정지됐는지 모르겠어요. 풀어주세요.",
      date: "2024-03-08 17:10",
      status: "CLOSED",
      isAuthorBanned: true,
    },
    {
      id: 4,
      author: "건강이최고",
      authorId: 4,
      authorRole: "TRAINER",
      title: "클래스 승인 반려 사유",
      content: "등록한 클래스가 반려됐는데 정확한 사유를 알고 싶습니다.",
      date: "2024-03-08 13:00",
      status: "OPEN",
      isAuthorBanned: false,
    },
    {
      id: 5,
      author: "작심삼일",
      authorId: 5,
      authorRole: "MEMBER",
      title: "앱 오류 제보",
      content: "운동 인증 버튼을 눌러도 반응이 없을 때가 많습니다.",
      date: "2024-03-07 14:30",
      status: "CLOSED",
      isAuthorBanned: false,
    },
  ];
};

// Helper to filter users
const getFilteredUsers = (
  users: AdminUser[],
  status: string,
  role: string,
  query: string
) => {
  let filtered = users;
  if (status !== "ALL") {
    filtered = filtered.filter((user) => user.status === status);
  }
  if (role !== "ALL") {
    filtered = filtered.filter((user) => user.role === role);
  }
  const trimmedQuery = query.trim().toLowerCase();
  if (trimmedQuery) {
    filtered = filtered.filter(
      (user) =>
        user.nickname.toLowerCase().includes(trimmedQuery) ||
        user.email.toLowerCase().includes(trimmedQuery)
    );
  }
  return filtered;
};

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

// Helper to filter posts
const getFilteredPosts = (
  posts: AdminPost[],
  status: string,
  query: string
) => {
  let filtered = posts;
  if (status !== "ALL") {
    filtered = filtered.filter((post) =>
      status === "ACTIVE" ? !post.isBanned : post.isBanned
    );
  }
  const trimmedQuery = query.trim().toLowerCase();
  if (trimmedQuery) {
    filtered = filtered.filter(
      (post) =>
        post.content.toLowerCase().includes(trimmedQuery) ||
        post.title.toLowerCase().includes(trimmedQuery) ||
        post.comments.some((comment) =>
          comment.content.toLowerCase().includes(trimmedQuery)
        )
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
  bannedUsers: 0,

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
  fetchUsers: async () => {
    set({ isLoading: true });
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockData = generateMockUsers();
    set({
      users: mockData,
      filteredUsers: mockData,
      totalUsers: mockData.length,
      bannedUsers: mockData.filter((u) => u.status === "BANNED").length,
      isLoading: false,
    });
  },

  setStatusFilter: (status: "ALL" | "ACTIVE" | "BANNED") => {
    set({ statusFilter: status });
    const { users, searchQuery, roleFilter } = get();
    set({
      filteredUsers: getFilteredUsers(users, status, roleFilter, searchQuery),
    });
  },

  setRoleFilter: (role: "ALL" | "MEMBER" | "TRAINER") => {
    set({ roleFilter: role });
    const { users, searchQuery, statusFilter } = get();
    set({
      filteredUsers: getFilteredUsers(users, statusFilter, role, searchQuery),
    });
  },

  searchUsers: (query: string) => {
    set({ searchQuery: query });
    const { users, statusFilter, roleFilter } = get();
    set({
      filteredUsers: getFilteredUsers(users, statusFilter, roleFilter, query),
    });
  },

  banUser: async (userId: number) => {
    const { users, searchQuery, statusFilter, roleFilter } = get();
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, status: "BANNED" as const } : user
    );

    set({
      users: updatedUsers,
      filteredUsers: getFilteredUsers(
        updatedUsers,
        statusFilter,
        roleFilter,
        searchQuery
      ),
      bannedUsers: updatedUsers.filter((u) => u.status === "BANNED").length,
    });
  },

  unbanUser: async (userId: number) => {
    const { users, searchQuery, statusFilter, roleFilter } = get();
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, status: "ACTIVE" as const } : user
    );

    set({
      users: updatedUsers,
      filteredUsers: getFilteredUsers(
        updatedUsers,
        statusFilter,
        roleFilter,
        searchQuery
      ),
      bannedUsers: updatedUsers.filter((u) => u.status === "BANNED").length,
    });
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

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const nextPage = reset ? 1 : page;
    const newPosts = generateMockPosts(nextPage);
    const isLastPage = nextPage >= 5;
    const allPosts = reset ? newPosts : [...get().posts, ...newPosts];

    set(() => ({
      posts: allPosts,
      filteredPosts: getFilteredPosts(
        allPosts,
        postStatusFilter,
        searchPostQuery
      ),
      page: nextPage + 1,
      hasMore: !isLastPage,
      isFetchingPosts: false,
    }));
  },

  setPostStatusFilter: (status: "ALL" | "ACTIVE" | "BANNED") => {
    set({ postStatusFilter: status });
    const { posts, searchPostQuery } = get();
    set({ filteredPosts: getFilteredPosts(posts, status, searchPostQuery) });
  },

  searchPosts: (query: string) => {
    set({ searchPostQuery: query });
    const { posts, postStatusFilter } = get();
    set({ filteredPosts: getFilteredPosts(posts, postStatusFilter, query) });
  },

  banPost: async (postId: number) => {
    const { posts, searchPostQuery, postStatusFilter } = get();
    const updatedPosts = posts.map((post) =>
      post.id === postId ? { ...post, isBanned: true } : post
    );
    set({
      posts: updatedPosts,
      filteredPosts: getFilteredPosts(
        updatedPosts,
        postStatusFilter,
        searchPostQuery
      ),
    });
  },

  unbanPost: async (postId: number) => {
    const { posts, searchPostQuery, postStatusFilter } = get();
    const updatedPosts = posts.map((post) =>
      post.id === postId ? { ...post, isBanned: false } : post
    );
    set({
      posts: updatedPosts,
      filteredPosts: getFilteredPosts(
        updatedPosts,
        postStatusFilter,
        searchPostQuery
      ),
    });
  },

  deleteComment: async (postId: number, commentId: number) => {
    const { posts, searchPostQuery, postStatusFilter } = get();
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
    set({
      posts: updatedPosts,
      filteredPosts: getFilteredPosts(
        updatedPosts,
        postStatusFilter,
        searchPostQuery
      ),
    });
  },

  restoreComment: async (postId: number, commentId: number) => {
    const { posts, searchPostQuery, postStatusFilter } = get();
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
    set({
      posts: updatedPosts,
      filteredPosts: getFilteredPosts(
        updatedPosts,
        postStatusFilter,
        searchPostQuery
      ),
    });
  },

  // Inquiry Actions
  fetchInquiries: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 500));
    const mockData = generateMockInquiries();
    const { inquiryFilter, searchInquiryQuery } = get();
    set({
      inquiries: mockData,
      filteredInquiries: getFilteredInquiries(
        mockData,
        inquiryFilter,
        searchInquiryQuery
      ),
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
            status: newBanStatus ? ("BANNED" as const) : ("ACTIVE" as const),
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
}));
