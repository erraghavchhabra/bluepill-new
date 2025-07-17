import React from "react";
import { Building, Package, Users } from "lucide-react";
import OptionCard from "../../components/OptionCard";
import StepContainer from "../../components/StepContainer";
import { PiUsersThree } from "react-icons/pi";

interface LandingScreenProps {
  onBuildAudience?: () => void;
  onSelectExisting?: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({
  onBuildAudience,
  onSelectExisting,
}) => {
  return (
    <div className="w-full bg-gray_light rounded-tl-[30px] p-[30px] relative h-[87vh]">
      <div>
        <h3 className="text-[28px] font-semibold text-black mb-3">
          What would you like to do today?
        </h3>
        <p className="text-xs font-normal text-[#595E64]">
          We'll tailor your profiles based on the target of your simulation — is
          it a company, a product, or a person?
        </p>
      </div>
      <div className="grid gap-5 mt-[30px]">
        {/* <OptionCard
          icon={<Building className="w-10 h-10" />}
          title="Build a New Audience"
          description="Create a new set of customer profiles tailored to your specific needs. Build detailed profiles for simulation."
          buttonText="Build Audience"
          onClick={onBuildAudience}
          
        /> */}

        <OptionCard
          icon={<PiUsersThree size={60} />}
          title="Simulation Playground"
          description="Use an existing audience to simulate customer behavior, test ideas, and gain valuable insights."
          buttonText="Select Existing Audience"
          onClick={onSelectExisting}
        />
      </div>
    </div>
  );
};

export default LandingScreen;
