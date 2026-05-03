import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

const QnaContent = ({ content }: { content: string }) => {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: content,
    editable: false,
  });

  return <EditorContent editor={editor} className="prose max-w-none" />;
};

export default QnaContent;