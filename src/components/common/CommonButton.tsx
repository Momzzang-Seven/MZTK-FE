interface CommonButtonProps {
  textColor?: string;
  bgColor?: string;
  border?: string;
  shadow?: boolean;
  label: string | React.ReactNode;
  img?: string;
  className?: string;
  icon?: React.ReactNode;
  width?: string;
  padding?: string;
  onClick?: () => void;
  disabled?: boolean;
}
export const CommonButton = ({
  textColor,
  bgColor,
  border,
  shadow = false,
  label,
  className,
  width,
  img,
  icon,
  padding,
  onClick,
  disabled = false,
}: CommonButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${textColor ? textColor : "text-[#ffffff]"} 
        ${bgColor ? bgColor : "bg-[#fab12f]"}
        ${border}
        ${shadow ? "shadow-[0_2px_2px_rgba(0,0,0,0.12)]" : ""}
        ${width ? width : "w-full"}
        ${padding ? padding : "p-[11.5px]"}
        ${className}
        flex flex-row items-center justify-center
        ${disabled ? "cursor-not-allowed" : ""}
        `}
    >
      {img && <img src={img} alt="buttonImage" width="20px" className="mr-3" />}
      {icon && <span className="flex items-center">{icon}</span>}
      {label}
    </button>
  );
};
