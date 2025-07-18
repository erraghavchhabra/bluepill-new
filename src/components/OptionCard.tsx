import React from "react";
import Card from "./Card";
import Button from "./Button";
import PrimaryButton from "./Buttons/PrimaryButton";
import { RightWhiteArrow } from "@/icons/simulatePageIcons";

interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick?: () => void;
  selected?: boolean;
}

const OptionCard: React.FC<OptionCardProps> = ({
  icon,
  title,
  description,
  buttonText,
  onClick,
  selected = false,
}) => {
  return (
    <Card
      className="p-5 flex gap-5 items-start flex-col h-full bg-white rounded-[20px] transition-all duration-200"
      selected={selected}
      hoverable={true}
    >
      <div className="text-primary">{icon}</div>
      <div className="flex items-start flex-col gap-3">
        <h3 className="text-[28px] font-semibold text-black ">{title}</h3>
        <p className="text-[#595E64] text-sm font-normal">{description}</p>
      </div>

      <PrimaryButton
        onClick={onClick}
        icon={<RightWhiteArrow />}
        className="w-full"
      >
        {buttonText}
      </PrimaryButton>
    </Card>
  );
};

export default OptionCard;
