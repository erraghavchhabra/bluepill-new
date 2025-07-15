import React from "react";

const CustomInput = ({
  id,
  value,
  onChange,
  placeholder,
  icon,
  className = "",
  ...props
}: any) => {
  return (
    <label
      htmlFor={id}
      className={`px-4 py-[18px] w-full bg-white rounded-2xl items-center flex gap-[10px] text-primary2 ${className}`}
    >
      {icon && <span>{icon}</span>}
      <input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full text-sm font-normal outline-none border-none bg-transparent"
        {...props}
      />
    </label>
  );
};

export default CustomInput;
