import type { Editor } from "@tiptap/react";
import { useRef } from "react";
import { toolbarConfig } from "./ToolbarConfig";
import ToolbarButton from "./ToolbarButton";
import ToolbarGroup from "./ToolbarGroup";
import ToolbarLine from "./ToolbarLine";
import { useUserStore } from "@store";
import { ACCEPTED_IMAGE_INPUT_TYPES, getInvalidImageFileMessage } from "@utils";

interface TiptapToolbarProps {
  editor: Editor;
  onImageSelect: (file: File) => void;
}

const groupOrder = ["heading", "text", "list", "media"] as const;

const Toolbar = ({ editor, onImageSelect }: TiptapToolbarProps) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const showSnackbar = useUserStore((s) => s.showSnackbar);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const invalidMessage = getInvalidImageFileMessage(file);

      if (invalidMessage) {
        showSnackbar(invalidMessage, { variant: "error" });
      } else {
        onImageSelect(file);
      }
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  const grouped = groupOrder
    .map((group) => ({
      group,
      items: toolbarConfig.filter((item) => item.group === group),
    }))
    .filter(({ items }) => items.length > 0);

  return (
    <div className="flex items-center gap-0.5 px-4 py-2 border-b border-gray-200 sticky top-0 bg-white z-10">
      {grouped.map(({ group, items }, groupIdx) => (
        <div key={group} className="flex items-center">
          {groupIdx > 0 && <ToolbarLine />}
          <ToolbarGroup>
            {items.map((item) => (
              <ToolbarButton
                key={item.label}
                icon={item.icon}
                label={item.label}
                active={item.isActive(editor)}
                onClick={() =>
                  item.action(editor, () => fileRef.current?.click())
                }
              />
            ))}
          </ToolbarGroup>
        </div>
      ))}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_IMAGE_INPUT_TYPES}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default Toolbar;
