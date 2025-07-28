import React from "react";

interface TooltipBoxProps {
  text: string;
  position?: "top" | "bottom" | "left" | "right" | "bottomLeft";
  children: React.ReactNode;
  disabled?: boolean;
}

const TooltipBox: React.FC<TooltipBoxProps> = ({
  text,
  position = "bottom",
  children,
  disabled = false,
}) => {
  const positionClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-3",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-3",
    left: "right-[110%] top-1/2 -translate-y-1/2 mr-3",
    right: "left-[110%] top-1/2 -translate-y-1/2 ml-3",
    bottomLeft: "top-full left-1/2 -translate-x-[90%] mt-3",
  }[position];

  const arrowClass = {
    top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-[54%] rotate-180 border-t-white",
    bottom:
      "top-0 left-1/2 -translate-x-1/2 translate-y-[-54%]  border-b-white",
    left: "right-0 top-1/2 -translate-y-1/2 translate-x-[52%] rotate-90 rotate border-l-white",
    right:
      "left-0 top-1/2 -translate-y-1/2 translate-x-[-52%] rotate-[270deg] border-r-white",
    bottomLeft: "top-0 right-[5%] translate-y-[-54%]  border-b-white",
  }[position];

  return (
    <div className="relative group inline-block">
      {children}

      {/* Tooltip */}
      {!disabled && (
        <div
          className={`absolute ${positionClass}  hidden group-hover:block z-50`}
        >
          <div className="relative bg-white drop-shadow-[2px_4px_7px_#028b7e73] text-primary2 px-3 rounded-md py-2 text-sm font-medium whitespace-nowrap">
            {text}

            {/* Arrow */}
            <div className={`absolute   ${arrowClass}`}>
              <svg
                width="21"
                height="19"
                viewBox="0 0 21 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.30385 3.01306C7.61325 -0.986944 13.3868 -0.986937 15.6962 3.01306L19.5933 9.76307C21.9027 13.7631 19.0159 18.7631 14.3971 18.7631H6.60288C1.98408 18.7631 -0.902667 13.7631 1.40673 9.76306L5.30385 3.01306Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TooltipBox;
