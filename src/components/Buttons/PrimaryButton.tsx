import React from "react";

const PrimaryButton = ({
  children,
  onClick,
  disabled,
  className = "",
  icon,
  ...props
}: any) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full bg-primary flex items-center justify-center gap-2 text-base font-semibold p-[14px_30px] text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
      {icon && <span>{icon}</span>}
    </button>
  );
};

export default PrimaryButton;
