import type { LucideIcon } from "lucide-react";
import type { Editor } from "@tiptap/react";
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  ImagePlus,
} from "lucide-react";

export interface ToolbarItem {
  icon: LucideIcon;
  label: string;
  // media 그룹만 triggerFileInput을 사용하므로 선택적으로 정의
  action: (editor: Editor, triggerFileInput?: () => void) => void;
  isActive: (editor: Editor) => boolean;
  group: "heading" | "text" | "list" | "media";
}

export const toolbarConfig: ToolbarItem[] = [
  {
    icon: Heading1,
    label: "제목 1",
    action: (editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
    group: "heading",
  },
  {
    icon: Heading2,
    label: "제목 2",
    action: (editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
    group: "heading",
  },
  {
    icon: Heading3,
    label: "제목 3",
    action: (editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
    group: "heading",
  },
  {
    icon: Bold,
    label: "굵게",
    action: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive("bold"),
    group: "text",
  },
  {
    icon: Italic,
    label: "기울임",
    action: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive("italic"),
    group: "text",
  },
  {
    icon: Strikethrough,
    label: "취소선",
    action: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive("strike"),
    group: "text",
  },
  {
    icon: List,
    label: "글머리 기호",
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: (editor) => editor.isActive("bulletList"),
    group: "list",
  },
  {
    icon: ListOrdered,
    label: "번호 매기기",
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive("orderedList"),
    group: "list",
  },
  {
    icon: ImagePlus,
    label: "이미지 업로드",
    action: (_editor, triggerFileInput) => triggerFileInput?.(),
    isActive: () => false,
    group: "media",
  },
];
