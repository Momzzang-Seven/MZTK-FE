import type { LucideIcon } from "lucide-react";

interface ToolbarButtonProps {
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  label: string;
}

const ToolbarButton = ({
  icon: Icon,
  active,
  onClick,
  label,
}: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`p-1.5 rounded transition-colors ${
      active ? "bg-main text-white" : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    <Icon size={18} strokeWidth={2} />
  </button>
);

export default ToolbarButton;
