import { EditorContent } from "@tiptap/react";
import { useTiptapEditor } from "@hooks/useTiptapEditor";
import type { ImageReferenceType } from "@types";
import Toolbar from "./Toolbar";

interface TiptapEditorProps {
  onChange: (html: string) => void;
  referenceType: ImageReferenceType;
  initialContent?: string;
}

const TiptapEditor = ({ onChange, referenceType, initialContent }: TiptapEditorProps) => {
  const { editor, handleImageSelect } = useTiptapEditor(onChange, referenceType, initialContent);

  if (!editor) return null;

  return (
    <div className="w-full">
      <Toolbar editor={editor} onImageSelect={handleImageSelect} />
      <div className="px-4 py-2 border-b border-gray-200">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;
