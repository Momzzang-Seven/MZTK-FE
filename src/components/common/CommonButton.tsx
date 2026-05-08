interface CommonButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  bgColor?: string;
  textColor?: string;
  border?: string;
  icon?: React.ReactNode;
}

export const CommonButton = ({
  label,
  onClick,
  disabled = false,
  type = "button",
  className = "",
  bgColor = "bg-main",
  textColor = "text-black",
  border = "border-none",
  icon,
}: CommonButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        btn-press
        w-full h-[60px] 
        ${bgColor} ${textColor} ${border}
        rounded-[22px] 
        text-[16px] font-black tracking-tight
        flex items-center justify-center gap-2
        shadow-lg ${bgColor === "bg-main" ? "shadow-main/20" : "shadow-gray-100"}
        disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none
        transition-all duration-200
        ${className}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </button>
  );
};
