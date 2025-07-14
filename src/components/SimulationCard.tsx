import React from "react";
import Card from "./Card";
import { HiOutlineArrowRight } from "react-icons/hi";

interface SimulationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
}

const SimulationCard: React.FC<SimulationCardProps> = ({
  icon,
  title,
  description,
  onClick,
  selected = false,
  disabled = false,
  comingSoon = false,
}) => {
  return (
    <Card
      className={`p-5 flex group flex-col gap-5 h-full hover:bg-primary bg-white rounded-2xl items-center  transition-all duration-500 ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      } `}
      onClick={disabled ? undefined : onClick}
      selected={selected}
    >
      {icon}
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-center text-xl text-black  ">
          {title}
        </h3>
        <p className="text-sm text-[#595E64] text-center group-hover:text-black font-normal">{description}</p>
      </div>
      <div className="group-hover:text-black text-center text-primary2">
        <HiOutlineArrowRight size={24}/>
      </div>
      {/* <div className="flex items-start">
        <div className={`mr-4 p-2 rounded-lg ${disabled ? 'text-gray-400 bg-gray-100' : 'text-blue-600 bg-blue-50'}`}>
          {icon}
        </div>
        <div>
          <div className="flex items-center">
            <h3 className={`text-lg font-medium mb-1 ${disabled ? 'text-gray-500' : 'text-gray-900'}`}>{title}</h3>
            {comingSoon && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                Coming Soon
              </span>
            )}
          </div>
          <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
        </div>
      </div> */}
    </Card>
  );
};

export default SimulationCard;
