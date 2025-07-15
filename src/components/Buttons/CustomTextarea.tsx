import React from "react";
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
  return (
    <label
      htmlFor={id}
      className={`px-4 py-[18px] w-full bg-white rounded-2xl flex items-start gap-[10px] text-primary2 ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {icon && <span className="">{icon}</span>}
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full resize-none text-sm font-normal outline-none border-none bg-white ${textareaClassName}`}
        {...props}
      />
    </label>
  );
};

export default CustomTextarea;
