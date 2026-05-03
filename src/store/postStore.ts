import { create } from "zustand";
import type { UploadedImage } from "@types";

export type PostType = "FREE" | "QUESTION" | "ANSWER";

export interface CreatePostState {
  postType: PostType;
  images: UploadedImage[];
  uploadingCount: number;
  title: string;
  content: string;
  reward: number;
  tags: string[];
  parentPostId: number | null;
  initialData: { 
    postType: PostType;
    title?: string; 
    content?: string; 
    imageIds?: number[]; 
    reward?: number; 
    tags?: string[]; 
  } | null;

  setPostType: (type: PostType) => void;
  addImage: (image: UploadedImage) => void;
  removeImage: (id: number) => void;
  reorderImages: (images: UploadedImage[]) => void;
  setImages: (images: UploadedImage[]) => void;
  incrementUploading: () => void;
  decrementUploading: () => void;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setReward: (reward: number) => void;
  setTags: (tags: string[]) => void;
  setParentPostId: (id: number | null) => void;
  reset: () => void;
  setInitialData: (data: CreatePostState["initialData"]) => void;
}

const initialState = {
  postType: "FREE" as PostType,
  images: [] as UploadedImage[],
  uploadingCount: 0,
  title: "",
  content: "",
  reward: 0,
  tags: [],
  parentPostId: null,
  initialData: null,
};

export const usePostStore = create<CreatePostState>()((set) => ({
  ...initialState,

  setPostType: (postType) => set({ postType }),

  addImage: (image) =>
    set((state) => ({ images: [...state.images, image] })),

  removeImage: (id) =>
    set((state) => ({
      images: state.images.filter((img) => img.imageId !== id),
    })),

  reorderImages: (images) => set({ images }),

  setImages: (images) => set({ images }),

  incrementUploading: () =>
    set((state) => ({ uploadingCount: state.uploadingCount + 1 })),

  decrementUploading: () =>
    set((state) => ({
      uploadingCount: Math.max(0, state.uploadingCount - 1),
    })),

  setTitle: (title) => set({ title }),

  setContent: (content) => set({ content }),

  setReward: (reward) => set({ reward }),

  setTags: (tags) => set({ tags }),

  setParentPostId: (parentPostId) => set({ parentPostId }),

  setInitialData: (initialData) => set({ initialData }),

  reset: () => set(initialState),
}));
