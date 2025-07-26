import React, { useState, useEffect } from "react";
import { Building, Package, User, Globe } from "lucide-react";
import Card from "../../components/Card";
import StepContainer from "../../components/StepContainer";
import Button from "../../components/Button";
import { useAudience } from "../../context/AudienceContext";
import {
  PiBuildingOfficeLight,
  PiLink,
  PiPackage,
  PiUserLight,
} from "react-icons/pi";
import BlackButton from "@/components/Buttons/BlackButton";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import { RightWhiteArrow } from "@/icons/simulatePageIcons";
import CustomInput from "@/components/Buttons/CustomInput";

export type AudienceType = "company" | "product" | "person";

interface AudienceTypeSelectProps {
  onNext: () => void;
  onBack: () => void;
}

const AudienceTypeSelect: React.FC<AudienceTypeSelectProps> = ({
  onNext,
  onBack,
}) => {
  const { audienceData, updateAudienceData } = useAudience();
  const [validationError, setValidationError] = useState("");
  const [typeError, setTypeError] = useState("");
  const [touched, setTouched] = useState({
    type: false,
    websiteUrl: false,
  });

  const audienceTypes = [
    {
      type: "company" as AudienceType,
      icon: <PiBuildingOfficeLight size={50} />,
      title: "A Company",
      description:
        "Simulate how people respond to a brand or organization, you can always test on a segment of the audience later",
    },
    {
      type: "product" as AudienceType,
      icon: <PiPackage size={50} />,
      title: "A Product",
      description:
        "Simulate reactions to a specific product, feature, or service",
    },
    {
      type: "person" as AudienceType,
      icon: <PiUserLight size={50} />,
      title: "A Person",
      description:
        "Simulate how people might react to an influencer, executive, VC or candidate",
    },
  ];

  useEffect(() => {
    // Validate audience type whenever it changes
    if (touched.type && !audienceData.type) {
      setTypeError("Please select an audience type");
    } else {
      setTypeError("");
    }

    // Also validate website URL when it changes
    if (touched.websiteUrl) {
      if (!audienceData.websiteUrl || !audienceData.websiteUrl.trim()) {
        setValidationError("Website URL is required");
      } else if (!isValidUrl(audienceData.websiteUrl)) {
        setValidationError("Please enter a valid URL");
      } else {
        setValidationError("");
      }
    }
  }, [
    audienceData.type,
    audienceData.websiteUrl,
    touched.type,
    touched.websiteUrl,
  ]);

  const handleSelectType = (type: AudienceType) => {
    updateAudienceData({ type });
    setTouched((prev) => ({ ...prev, type: true }));
  };

  const validateForm = (): boolean => {
    // Mark all fields as touched to show validation errors
    setTouched({ type: true, websiteUrl: true });

    let isValid = true;

    // Validate audience type
    if (!audienceData.type) {
      setTypeError("Please select an audience type");
      isValid = false;
    }

    // Validate website URL - now required
    if (!audienceData.websiteUrl || !audienceData.websiteUrl.trim()) {
      setValidationError("Website URL is required");
      isValid = false;
    } else if (!isValidUrl(audienceData.websiteUrl)) {
      setValidationError("Please enter a valid URL");
      isValid = false;
    }

    return isValid;
  };

  const handleContinue = () => {
    if (validateForm()) {
      setValidationError("");
      setTypeError("");
      onNext();
    }
  };

  const isValidUrl = (string: string) => {
    try {
      if (!string.trim()) return false; // No longer allow empty URLs
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateAudienceData({ websiteUrl: value });
    setTouched((prev) => ({ ...prev, websiteUrl: true }));

    if (!value || !value.trim()) {
      setValidationError("Website URL is required");
    } else if (!isValidUrl(value)) {
      setValidationError("Please enter a valid URL");
    } else {
      setValidationError("");
    }
  };

  return (
    <div className="w-full bg-gray_light rounded-tl-[30px] p-[30px] relative pb-16 pb-16">
      <div>
        <h3 className="text-[28px] font-semibold text-black mb-3">
          Who is this audience for?
        </h3>
        <p className="text-xs font-normal text-[#595E64]">
          We'll tailor your profiles based on the target of your simulation — is
          it a company, a product, or a person?
        </p>
      </div>
      <div className="grid grid-cols-3 gap-5 mt-5 mb-[30px]">
        {typeError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {typeError}
          </div>
        )}

        {audienceTypes.map((option) => (
          <div
            key={option.type}
            onClick={() => handleSelectType(option.type)}
            className={`${
              audienceData.type === option.type ? "bg-primary" : "bg-white"
            } flex h-full items-center gap-3 flex-col p-[30px] rounded-2xl cursor-pointer border border-transparent hover:border-primary transition-all duration-200 `}
          >
            <div
              className={`transition-all duration-200  ${
                audienceData.type === option.type
                  ? "text-black"
                  : "text-primary2"
              }`}
            >
              {option.icon}
            </div>
            <h3
              className={`text-xl font-semibold text-center transition-all duration-200  ${
                audienceData.type === option.type
                  ? "text-black"
                  : "text-primary2"
              }`}
            >
              {option.title}
            </h3>
            <p
              className={`text-sm font-medium text-center transition-all duration-200  ${
                audienceData.type === option.type
                  ? "text-black"
                  : "text-[#A3AAB3]"
              }`}
            >
              {option.description}
            </p>
          </div>
        ))}
      </div>
      <div className="pt-[30px]  border-t border-[#E8E8E8]">
        <h3 className="text-[28px] font-semibold text-black">
          Add website or social media URL
        </h3>
        <p className="mt-3 text-[#595E64] text-sm font-normal">
          This helps us understand your brand or product better. We'll analyze
          the content to create more accurate profiles.
        </p>
      </div>
      <div className="mt-5">
        <CustomInput
          id="website-url"
          placeholder="Website URL *"
          value={audienceData.websiteUrl}
          required
          onChange={handleWebsiteChange}
          onBlur={() => setTouched((prev) => ({ ...prev, websiteUrl: true }))}
          icon={<PiLink size={24} />}
        />
      </div>
      {validationError && (
        <p className="mt-1 text-sm text-red-600">{validationError}</p>
      )}

      <div className="flex justify-between items-center mt-[100px] ">
        <BlackButton onClick={onBack}>Back</BlackButton>

        <PrimaryButton
          onClick={handleContinue}
          disabled={
            !audienceData.type ||
            !audienceData.websiteUrl ||
            !isValidUrl(audienceData.websiteUrl)
          }
          icon={<RightWhiteArrow />}
        >
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
};

export default AudienceTypeSelect;
