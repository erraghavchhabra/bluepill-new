import { CloseXIcon } from "@/icons/Other";
import React, { useState } from "react";

const CustomTextareaWithCloseButton = ({
  id,
  value,
  onChange,
  placeholder,
  rows = 5,
  icon,
  disabled = false,
  className = "",
  textareaClassName = "",
  onRemove,
  ...props
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  textareaClassName?: string;
  onRemove?: () => void;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const shouldFloat = isFocused || value;

  return (
    <div
      className={`relative w-full ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {/* Floating Label */}
      <label
        htmlFor={id}
        className="absolute left-[50px] text-sm z-10 text-gray-400 line-clamp-1 transition-all duration-200 pointer-events-none"
        style={{
          transform: shouldFloat ? "translateY(0)" : "translateY(-50%)",
          top: shouldFloat ? "6px" : "30px",
          fontSize: shouldFloat ? "11px" : "1rem",
        }}
      >
        {placeholder}
      </label>

      {/* Textarea with optional close button */}
      <label
        htmlFor={id}
        className="px-4 py-[18px] bg-white rounded-2xl flex items-start gap-[10px] text-primary2 relative"
      >
        {icon && <span>{icon}</span>}

        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder=" "
          disabled={disabled}
          className={`peer pt-1 w-full resize-none text-sm font-normal outline-none border-none bg-white text-black ${textareaClassName}`}
          {...props}
        />

        {/* Remove/Close Button */}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
          >
            {/* Replace this with your CloseXIcon if needed */}
            <CloseXIcon size={24} color="#595E64" />
          </button>
        )}
      </label>
    </div>
  );
};

export default CustomTextareaWithCloseButton;
