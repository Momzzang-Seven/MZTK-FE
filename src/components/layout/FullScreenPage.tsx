import type { ReactNode } from "react";

type FullScreenPageProps = {
  children: ReactNode;
  className?: string;
};

export const FullScreenPage = ({
  children,
  className,
}: FullScreenPageProps) => {
  const baseClassName = "flex flex-col min-h-dvh bg-white px-6";
  const mergedClassName = className
    ? `${baseClassName} ${className}`
    : baseClassName;

  return <div className={mergedClassName}>{children}</div>;
};
