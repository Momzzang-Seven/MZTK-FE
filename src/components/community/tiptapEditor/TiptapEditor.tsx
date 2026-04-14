import { EditorContent } from "@tiptap/react";
import { useTiptapEditor } from "@hooks/useTiptapEditor";
import type { ImageReferenceType } from "@types";
import Toolbar from "./Toolbar";

interface TiptapEditorProps {
  onChange: (html: string) => void;
  referenceType: ImageReferenceType;
}

const TiptapEditor = ({ onChange, referenceType }: TiptapEditorProps) => {
  const { editor, handleImageSelect } = useTiptapEditor(onChange, referenceType);

  return (
    <div className="w-full">
      {editor && (
        <Toolbar editor={editor} onImageSelect={handleImageSelect} />
      )}
      <div className="px-4 py-2 border-b border-gray-200">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;
