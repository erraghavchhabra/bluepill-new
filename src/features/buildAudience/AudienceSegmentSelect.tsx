import React, { useRef, useState, useEffect } from "react";
import StepContainer from "../../components/StepContainer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { Upload, X, AlertCircle } from "lucide-react";
import { useAudience } from "../../context/AudienceContext";
import BlackButton from "@/components/Buttons/BlackButton";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import { RightWhiteArrow, UploadIcon } from "@/icons/simulatePageIcons";
import { PiBuildingOfficeLight, PiNotepad, PiPackage } from "react-icons/pi";
import CustomTextarea from "@/components/Buttons/CustomTextarea";

interface AudienceSegmentSelectProps {
  onNext: () => void;
  onBack: () => void;
}

const AudienceSegmentSelect: React.FC<AudienceSegmentSelectProps> = ({
  onNext,
  onBack,
}) => {
  const { audienceData, updateAudienceData } = useAudience();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState("");
  const [touched, setTouched] = useState({
    segmentType: false,
    specificSegment: false,
  });
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingMessages = [
    "Uploading...",
    "Processing file...",
    "Analyzing data...",
    "Almost there...",
  ];

  // Validate form whenever relevant values change
  useEffect(() => {
    if (touched.segmentType && !audienceData.segmentType) {
      setValidationError("Please select a segment type");
    } else if (
      touched.specificSegment &&
      audienceData.segmentType === "specific" &&
      !audienceData.specificSegment.trim()
    ) {
      setValidationError("Please describe the specific segment");
    } else {
      setValidationError("");
    }
  }, [
    audienceData.segmentType,
    audienceData.specificSegment,
    touched.segmentType,
    touched.specificSegment,
  ]);

  // Add effect for rotating loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isUploading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 30000); // Rotate every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isUploading]);

  const handleSegmentTypeChange = (type: "all" | "specific") => {
    updateAudienceData({ segmentType: type });
    setTouched((prev) => ({ ...prev, segmentType: true }));
  };

  const handleSpecificSegmentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    updateAudienceData({ specificSegment: e.target.value });
    setTouched((prev) => ({ ...prev, specificSegment: true }));
  };

  const handleQualitativeInfoChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    updateAudienceData({ qualitativeInfo: e.target.value });
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setValidationError("File size exceeds 10MB limit");
        return;
      }

      // Check file type
      const allowedTypes = [".csv", ".json", ".doc", ".docx", ".txt"];
      const fileExtension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        setValidationError(
          "Only CSV, JSON, DOC, DOCX, and TXT files are allowed"
        );
        return;
      }

      setIsUploading(true);
      setValidationError("");
      setLoadingMessageIndex(0); // Reset loading message index

      // Simulate upload delay
      setTimeout(() => {
        updateAudienceData({ uploadedFile: file });
        setIsUploading(false);
      }, 1000);
    }
  };

  const handleRemoveFile = () => {
    updateAudienceData({ uploadedFile: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    // Mark required fields as touched
    setTouched({
      segmentType: true,
      specificSegment: audienceData.segmentType === "specific",
    });

    // Validate segment type selection
    if (!audienceData.segmentType) {
      setValidationError("Please select a segment type");
      return false;
    }

    // Validate specific segment description if that option is selected
    if (
      audienceData.segmentType === "specific" &&
      !audienceData.specificSegment.trim()
    ) {
      setValidationError("Please describe the specific segment");
      return false;
    }

    return true;
  };

  const handleBuildAudience = async () => {
    if (validateForm()) {
      onNext();
    }
  };
  const segmentOptions = [
    {
      key: "all",
      title: "All Customers",
      icon: <PiBuildingOfficeLight size={50} />,
      description:
        "Profiles will reflect your entire customer base. You can segment them later if needed.",
    },
    {
      key: "specific",
      title: "A Specific Segment",
      icon: <PiPackage size={50} />,

      description:
        "e.g., 'Procurement leaders in healthcare and Technology,' 'Gen Z buyers', etc.",
    },
  ];
  return (
    <div className="w-full bg-gray_light rounded-tl-[30px] p-[30px] relative">
      <div>
        <h3 className="text-[28px] font-semibold text-black mb-3">
          Details about your audience
        </h3>
        <p className="text-xs font-normal text-[#595E64]">
          Should this audience represent your entire customer base or just a
          specific segment?
        </p>
      </div>
      {validationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{validationError}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-5 mt-5 mb-[30px]">
        {segmentOptions.map((option: any, index: number) => (
          <div
            key={index}
            onClick={() => handleSegmentTypeChange(option.key)}
            className={`${
              audienceData.segmentType === option.key
                ? "bg-primary"
                : "bg-white"
            } flex h-full items-center gap-3 flex-col p-[30px] rounded-2xl cursor-pointer border border-transparent hover:border-primary transition-all duration-200 `}
          >
            <div
              className={`transition-all duration-200  ${
                audienceData.segmentType === option.key
                  ? "text-black"
                  : "text-primary2"
              }`}
            >
              {option.icon}
            </div>
            <h3
              className={`text-xl font-semibold text-center transition-all duration-200  ${
                audienceData.segmentType === option.key
                  ? "text-black"
                  : "text-primary2"
              }`}
            >
              {option.title}
            </h3>
            <p
              className={`text-sm font-medium text-center transition-all duration-200  ${
                audienceData.segmentType === option.key
                  ? "text-black"
                  : "text-[#A3AAB3]"
              }`}
            >
              {option.description}
            </p>
          </div>
        ))}
      </div>
      {audienceData.segmentType === "specific" && (
        <CustomTextarea
          placeholder="Describe the segment you have in mind *"
          value={audienceData.specificSegment}
          onChange={handleSpecificSegmentChange}
          className="mb-[30px]"
          onBlur={() =>
            setTouched((prev) => ({ ...prev, specificSegment: true }))
          }
          id="segment"
          rows={3}
          icon={<PiNotepad size={24} />}
        />
      )}
      <div className="pt-[30px]  border-t border-[#E8E8E8]">
        <h3 className="text-[28px] font-semibold text-black">
          Optional data input
        </h3>
        <p className="mt-3 text-[#595E64] text-sm font-normal">
          If you have any info about your customers, share it below to help us
          build a lifelike audience.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-5 mt-5">
        <div className="flex-1">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".csv,.json,.doc,.docx,.txt"
          />

          {audienceData.uploadedFile ? (
            <div className="bg-white p-[10px] rounded-2xl min-h-[220px]">
              <div
                onClick={handleFileUploadClick}
                className="border-2 relative border-dashed h-full border-[#E8E8E8] rounded-xl p-8 text-center cursor-pointer  transition-colors flex items-center justify-between gap-5"
              >
                <div className="flex items-center flex-col gap-3 w-full">
                  <UploadIcon />
                  <div className="flex items-center gap-2 flex-col">
                    <p className="font-semibold text-base text-[#595E64]">
                      {audienceData.uploadedFile.name}
                    </p>
                    <p className="text-sm font-normal text-[#595E64]">
                      {Math.round(audienceData.uploadedFile.size / 1024)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-1 absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  aria-label="Remove file"
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-[10px] rounded-2xl">
              <div
                onClick={handleFileUploadClick}
                className="border-2 border-dashed border-[#E8E8E8] rounded-xl p-8 text-center cursor-pointer  transition-colors flex items-center flex-col gap-5"
              >
                <UploadIcon />
                <div className="flex items-center gap-2 flex-col">
                  <p className="font-semibold text-base text-[#595E64]">
                    Upload file (CSV, JSON, Docs)
                  </p>
                  <p className="text-sm font-normal text-[#595E64]">
                    Max size: 10MB
                  </p>
                </div>

                {isUploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-1 rounded-full w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <CustomTextarea
          placeholder="Add any qualitative information about your customers..."
          value={audienceData.qualitativeInfo}
          className="h-full"
          onChange={handleQualitativeInfoChange}
          id="textariaId"
          rows={9}
          icon={<PiNotepad size={24} />}
        />
      </div>

      <div className="flex justify-between items-center mt-[100px] ">
        <BlackButton onClick={onBack}>Back</BlackButton>

        <PrimaryButton onClick={handleBuildAudience} icon={<RightWhiteArrow />}>
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
};

export default AudienceSegmentSelect;
