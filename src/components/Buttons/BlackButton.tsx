import React from "react";

const BlackButton = ({ children, onClick, className = "", ...props }: any) => {
  return (
    <button
      onClick={onClick}
      className={`text-white bg-black p-[14px_30px] text-base font-semibold rounded-full ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default BlackButton;
