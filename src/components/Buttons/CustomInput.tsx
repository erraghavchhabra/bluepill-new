import React, { useState } from "react";

const CustomInput = ({
  id,
  value,
  onChange,
  icon,
  className = "",
  placeholder,
  ...props
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
  [key: string]: any;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const shouldFloat = isFocused || value;

  return (
    <div  className={`relative w-full ${className}`}>
      <label
        htmlFor={id}
        className="absolute left-[50px] top-1/2 -translate-y-1/2 text-sm text-gray-400 transition-all duration-200 pointer-events-none
          peer-placeholder-shown:top-1/2
          peer-placeholder-shown:text-base
          peer-placeholder-shown:text-gray-400
          peer-focus:top-[12px]
          peer-focus:text-xs
          peer-focus:text-primary2"
        style={{
          transform: shouldFloat ? "translateY(0)" : "translateY(-50%)",
          top: shouldFloat ? "6px" : "50%",
          fontSize: shouldFloat ? "11px" : "1rem",
        }}
      >
        {placeholder}
      </label>

      <label htmlFor={id} className="flex items-center gap-[10px] bg-white w-full px-4 py-[18px] rounded-2xl text-primary2">
        {icon && <span className="text-xl text-primary2">{icon}</span>}
        <input
          id={id}
          type="text"
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          // placeholder=" "
          className="peer pt-1 w-full text-sm font-normal outline-none border-none bg-transparent text-black"
          {...props}
        />
      </label>
    </div>
  );
};

export default CustomInput;
