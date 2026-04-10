import { EditorContent } from "@tiptap/react";
import { useTiptapEditor } from "@hooks/useTiptapEditor";
import Toolbar from "./Toolbar";

interface TiptapEditorProps {
  onChange: (html: string) => void;
}

const TiptapEditor = ({ onChange }: TiptapEditorProps) => {
  const { editor, handleImageSelect } = useTiptapEditor(onChange);

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
