import React, { useState } from "react";

const CustomTextarea = ({
  id,
  value,
  onChange,
  placeholder,
  rows = 5,
  icon,
  disabled = false,
  className = "",
  textareaClassName = "",
  ...props
}: any) => {
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
        className="absolute left-[50px] text-sm text-gray-400 line-clamp-1 transition-all duration-200 pointer-events-none"
        style={{
          transform: shouldFloat ? "translateY(0)" : "translateY(-50%)",
          top: shouldFloat ? "6px" : "30px",
          fontSize: shouldFloat ? "11px" : "1rem",
        }}
      >
        {placeholder}
      </label>

      {/* Textarea container */}
      <label
        htmlFor={id}
        className="px-4  py-[18px] bg-white rounded-2xl flex items-start gap-[10px] text-primary2"
      >
        {icon && <span className="">{icon}</span>}
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder=" " // important: keeps placeholder logic but hidden
          disabled={disabled}
          className={`peer pt-1 w-full resize-none text-sm font-normal outline-none border-none bg-white text-black ${textareaClassName}`}
          {...props}
        />
      </label>
    </div>
  );
};

export default CustomTextarea;
