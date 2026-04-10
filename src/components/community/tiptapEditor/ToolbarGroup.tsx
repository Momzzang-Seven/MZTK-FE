import type { ReactNode } from "react";

interface ToolbarGroupProps {
  children: ReactNode;
}

const ToolbarGroup = ({ children }: ToolbarGroupProps) => (
  <div className="flex items-center gap-0.5">{children}</div>
);

export default ToolbarGroup;
