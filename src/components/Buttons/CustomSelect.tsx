import { DownArrowAnnalysis } from "@/icons/Other";
import { useState } from "react";

const CustomSelectDropdown = ({
  id,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  icon,
  className = "",
}: any) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (val: any) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <button
        type="button"
        className="w-full px-4 py-[18px] bg-white rounded-2xl flex items-center justify-between gap-2 text-primary2"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2 text-sm font-normal">
          {icon}
          <span>
            {value
              ? options.find((opt: any) => opt.value === value)?.label
              : placeholder}
          </span>
        </div>

        <div
          className={`transition-transform duration-300 ${
            open ? "rotate-0" : "rotate-180"
          }`}
        >
          <DownArrowAnnalysis />
        </div>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-[90%] left-2/4 -translate-x-2/4 bg-white shadow rounded-xl p-2 flex flex-col gap-2 max-h-60 overflow-auto">
          {options.map((opt: any, i: number) => (
            <div
              key={i}
              onClick={() => handleSelect(opt.value)}
              className="px-3 py-2 text-sm text-gray-800 rounded-md hover:bg-gray-100 cursor-pointer transition"
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelectDropdown;
