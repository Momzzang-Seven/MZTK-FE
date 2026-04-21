import { useEffect, useRef, useState } from "react";

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
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  ariaLabel?: string;
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
  ariaLabel,
}: CommonButtonProps) => {
  const clickLockedRef = useRef(false);
  const unlockTimerRef = useRef<number | null>(null);
  const [isClickLocked, setIsClickLocked] = useState(false);
  const isDisabled = disabled || isClickLocked;

  useEffect(() => {
    return () => {
      if (unlockTimerRef.current) {
        window.clearTimeout(unlockTimerRef.current);
      }
    };
  }, []);

  const handleClick = async () => {
    if (!onClick || disabled || clickLockedRef.current) return;

    clickLockedRef.current = true;
    setIsClickLocked(true);

    try {
      await onClick();
    } finally {
      if (unlockTimerRef.current) {
        window.clearTimeout(unlockTimerRef.current);
      }

      unlockTimerRef.current = window.setTimeout(() => {
        clickLockedRef.current = false;
        setIsClickLocked(false);
      }, 300);
    }
  };

  return (
    <button
      aria-label={ariaLabel}
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        ${textColor ? textColor : "text-[#ffffff]"} 
        ${bgColor ? bgColor : "bg-[#fab12f]"}
        ${border}
        ${shadow ? "shadow-[0_2px_2px_rgba(0,0,0,0.12)]" : ""}
        ${width ? width : "w-full"}
        ${padding ? padding : "p-[11.5px]"}
        ${className}
        flex flex-row items-center justify-center
        ${isDisabled ? "cursor-not-allowed" : ""}
        `}
    >
      {img && <img src={img} alt="buttonImage" width="20px" className="mr-3" />}
      {icon && <span className="mr-2 flex items-center">{icon}</span>}
      {label}
    </button>
  );
};
