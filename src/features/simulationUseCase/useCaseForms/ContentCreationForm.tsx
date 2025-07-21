import React, { useState, useEffect } from "react";
import Button from "../../../components/Button"; // Assuming this is your custom Button
import { ArrowLeft } from "lucide-react";
import { useAudience } from "../../../context/AudienceContext";
import {
  PiNotepadLight,
  PiNotePencilLight,
  PiSubtitles,
  PiUser,
} from "react-icons/pi";
import {
  NetworkBlackIcon,
  NetworkPrimeIcon,
  RightWhiteArrow,
} from "@/icons/simulatePageIcons";
import BlackButton from "@/components/Buttons/BlackButton";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import CustomInput from "@/components/Buttons/CustomInput";
import CustomTextarea from "@/components/Buttons/CustomTextarea";

interface SegmentPersonaFilters {
  industryL1: string[];
  industryL2: string[];
  functions: string[];
  roles: string[];
}

interface ContentCreationFormProps {
  onSubmit: (simulationId: number) => void;
  selectedSegmentIds: number[];
  personaFilters: Record<number, SegmentPersonaFilters>;
  onBack: () => void;
  onEditStep?: () => void;
  initialFormData?: Record<string, any>;
  onFormDataChange?: (data: Record<string, any>) => void;
}

type ContentFormType = "short" | "long" | "";
type SimulationModeType = "basic" | "advanced" | "";

const API_URL = import.meta.env.VITE_API_URL || "";

const ContentCreationForm: React.FC<ContentCreationFormProps> = ({
  onSubmit,
  selectedSegmentIds,
  personaFilters,
  onBack,
  onEditStep,
  initialFormData = {},
  onFormDataChange = () => {},
}) => {
  const { audienceData } = useAudience();

  const [simName, setSimName] = useState(initialFormData.simName || "");
  const [goal, setGoal] = useState(initialFormData.goal || "");
  const [contentFormType, setContentFormType] = useState<ContentFormType>(
    initialFormData.contentFormType || ""
  );
  const [contentType, setContentType] = useState(
    initialFormData.contentType || ""
  ); // Re-added for specific content type
  const [simulationMode, setSimulationMode] = useState<SimulationModeType>(
    initialFormData.simulationMode || ""
  );
  const [contentSubject, setContentSubject] = useState(
    initialFormData.contentSubject || ""
  ); // This is the detailed brief
  const [companyContext, setCompanyContext] = useState(
    initialFormData.companyContext || ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const formData = {
      simName,
      goal,
      contentFormType,
      contentType, // Add to form data
      simulationMode,
      contentSubject,
      companyContext,
    };
    onFormDataChange(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    simName,
    goal,
    contentFormType,
    contentType,
    simulationMode,
    contentSubject,
    companyContext,
  ]);

  const handleFieldChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    setter(value);
    if (onEditStep) {
      onEditStep();
    }
  };

  const handleContentFormTypeChange = (type: ContentFormType) => {
    setContentFormType(type);
    setContentType(""); // Reset specific content type when form type changes
    if (type !== "long") {
      setSimulationMode("");
    } else if (type === "long" && !simulationMode) {
      setSimulationMode("basic");
    }
    if (onEditStep) {
      onEditStep();
    }
  };

  const handleSimulationModeChange = (mode: SimulationModeType) => {
    setSimulationMode(mode);
    if (onEditStep) {
      onEditStep();
    }
  };

  useEffect(() => {
    if (
      initialFormData.contentFormType === "long" &&
      !initialFormData.simulationMode
    ) {
      setSimulationMode("basic");
    }
    // Fetch segments logic (omitted for brevity)
  }, [
    audienceData.audienceId,
    initialFormData.contentFormType,
    initialFormData.simulationMode,
  ]);

  // const getContentTypePlaceholder = () => {
  //   if (contentFormType === "short") {
  //     return "e.g., Website Headline, Email subject line, LinkedIn Ad";
  //   } else if (contentFormType === "long") {
  //     return "e.g., Blog Post, 1-Pager, Whitepaper, Sales Pitch Deck Bullets";
  //   } else {
  //     return "Select a content form (Short or Long) above first";
  //   }
  // };

  const getContentSubjectPlaceholder = () => {
    // This is for the detailed brief
    if (contentFormType === "short") {
      return "Provide a brief description of what this short-form content should cover.";
    } else if (contentFormType === "long") {
      if (simulationMode === "advanced") {
        return "For advanced simulation, provide a comprehensive brief: topic, core messages, desired structure, key questions to address, and any constraints.";
      }
      return "For basic simulation, provide a detailed brief including the topic, core messages, and suggested structure or flow.";
    } else {
      return "Select content form and type first";
    }
  };

  const isFormValid =
    selectedSegmentIds.length > 0 &&
    goal.trim() !== "" &&
    contentFormType.trim() !== "" &&
    contentType.trim() !== "" && // Specific content type is now required
    (contentFormType === "short" ||
      (contentFormType === "long" && simulationMode.trim() !== "")) &&
    contentSubject.trim() !== "";

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const task =
        contentFormType === "long" ? "create-content-long" : "create-content";
      const is_deep_simulation =
        contentFormType === "long" && simulationMode === "advanced";

      const simulationData = {
        audience_id: audienceData.audienceId,
        segment_ids: selectedSegmentIds,
        persona_filters: personaFilters,
        task,
        name: simName,
        goal: goal,
        content_type: contentType, // Pass the specific content type
        content_subject: contentSubject, // This remains the detailed brief
        company_context: companyContext,
        is_deep_simulation: is_deep_simulation,
      };

      const response = await fetch(`${API_URL}/simulations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(simulationData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Failed to start simulation" }));
        throw new Error(errorData.detail || "Failed to start simulation");
      }
      const data = await response.json();
      onSubmit(data.simulation_id);
    } catch (err: any) {
      console.error("Error starting simulation:", err);
      setError(err.message || "Failed to start simulation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const options = [
    {
      type: "short",
      title: "Short form content",
      desc: "e.g., Website Headline, Email subject line, etc.",
    },
    {
      type: "long",
      title: "Long Form content",
      desc: "e.g., Blog, 1-Pager, Whitepaper, etc.",
    },
  ];
  const simOptions = [
    {
      type: "basic",
      title: "Run Basic Simulation",
      desc: "Faster, good for general content outlines and ideas.",
    },
    {
      type: "advanced",
      title: "Run Advanced Simulation",
      desc: "More detailed. Explores deeper insights. Takes longer.",
    },
  ];
  return (
    <div className="w-full bg-gray_light rounded-tl-[30px] p-[30px] relative">
      <div>
        <h3 className="text-[28px] font-semibold text-black mb-3">
          Create Content
        </h3>
        <p className="text-xs font-normal text-[#595E64]">
          Generate content, messages, ads, emails and more tailored to your
          audience
        </p>
      </div>
      {/* Header, Loading, Error (omitted for brevity, assumed unchanged) */}
      <div className="mb-6">
        {loading && (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-3">
            {error}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-5">
        {/* Name your simulation */}
        <CustomInput
          id="simName"
          value={simName}
          onChange={(e: any) => handleFieldChange(setSimName, e.target.value)}
          placeholder="Simulation Name"
          icon={<PiUser size={24} />}
        />

        <CustomInput
          id="goal"
          value={goal}
          onChange={(e: any) => handleFieldChange(setGoal, e.target.value)}
          placeholder="What's the expected outcome of this simulation?"
          icon={<PiNotePencilLight size={24} />}
        />
      </div>

      {/* What type of content are you creating? (Radio Buttons for Form Type) */}
      <div className="mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {options.map((opt: any, index: number) => (
            <div
              key={index}
              onClick={() => handleContentFormTypeChange(opt.type)}
              className={`px-4 py-3 rounded-2xl cursor-pointer transition-all duration-150 ease-in-out flex items-center justify-between gap-3 ${
                contentFormType === opt.type ? "bg-primary" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={
                    contentFormType === opt.type
                      ? "text-black"
                      : "text-primary2"
                  }
                >
                  <PiSubtitles size={24} />
                </div>
                <div>
                  <label
                    className={`text-base font-semibold ${
                      contentFormType === opt.type
                        ? "text-black"
                        : "text-[#595E64]"
                    }`}
                  >
                    {opt.title}
                  </label>
                  <p
                    className={`text-sm ${
                      contentFormType === opt.type
                        ? "text-black"
                        : "text-[#595E64]"
                    } font-normal mt-2`}
                  >
                    {opt.desc}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center">
                <input
                  type="radio"
                  name="contentFormType"
                  value={opt.type}
                  checked={contentFormType === opt.type}
                  onChange={() => {}}
                  className="sr-only peer"
                  id={`${opt.type}Form`}
                />
                <div
                  className={`w-5 h-5 rounded-full border  ${
                    contentFormType === opt.type
                      ? "border-black"
                      : "border-[#AEAEB2]"
                  } relative transition-all duration-200`}
                >
                  <div
                    className={`absolute inset-1 w-[10px] h-[10px] rounded-full bg-black ${
                      contentFormType === opt.type ? "scale-100" : "scale-0"
                    } transition-all duration-300`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEW: Specify the content type (Text Input) - Appears after form type selection */}
      {contentFormType && (
        <CustomInput
          id="contentType"
          value={contentType}
          onChange={(e: any) =>
            handleFieldChange(setContentType, e.target.value)
          }
          placeholder={`Specify the type of ${
            contentFormType === "short" ? "short-form" : "long-form"
          } content:`}
          icon={<PiSubtitles size={24} />}
          className="mt-5"
        />
      )}

      {/* CONDITIONAL: Simulation Mode (Basic/Advanced) - Only if Long Form is selected */}
      {contentFormType === "long" && (
        <div className="mt-5 transition-all duration-300 ease-in-out">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {simOptions.map((opt: any, index: number) => (
              <div
                key={index}
                onClick={() => handleSimulationModeChange(opt.type)}
                className={`px-4 py-3 rounded-2xl cursor-pointer transition-all duration-150 ease-in-out flex items-center justify-between gap-3 ${
                  simulationMode === opt.type ? "bg-primary" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={
                      simulationMode === opt.type
                        ? "text-black"
                        : "text-primary2"
                    }
                  >
                    <div className="max-w-6">
                      {simulationMode === opt.type ? (
                        <NetworkBlackIcon />
                      ) : (
                        <NetworkPrimeIcon />
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      className={`text-base font-semibold ${
                        simulationMode === opt.type
                          ? "text-black"
                          : "text-[#595E64]"
                      }`}
                    >
                      {opt.title}
                    </label>
                    <p
                      className={`text-sm ${
                        simulationMode === opt.type
                          ? "text-black"
                          : "text-[#595E64]"
                      } font-normal mt-2`}
                    >
                      {opt.desc}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center">
                  <input
                    type="radio"
                    name="simulationMode"
                    value={opt.type}
                    checked={simulationMode === opt.type}
                    onChange={() => {}}
                    className="sr-only peer"
                    id={`${opt.type}Sim`}
                  />
                  <div
                    className={`w-5 h-5 rounded-full border ${
                      simulationMode === opt.type
                        ? "border-black"
                        : "border-[#AEAEB2]"
                    } relative transition-all duration-200`}
                  >
                    <div
                      className={`absolute inset-1 w-[10px] h-[10px] rounded-full bg-black ${
                        simulationMode === opt.type ? "scale-100" : "scale-0"
                      } transition-all duration-300`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className={`mt-5 grid ${
          contentFormType === "long" ? "grid-cols-2" : "grid-cols-1"
        } transition-all duration-200  gap-5`}
      >
        {/* What should this content cover? (Detailed Brief Textarea) */}
        <div className="">
          
          <CustomTextarea
            id="contentSubject"
            rows={5}
            value={contentSubject}
            onChange={(e: any) =>
              handleFieldChange(setContentSubject, e.target.value)
            }
            placeholder="What should this content cover? Provide a detailed brief."
            disabled={
              !contentFormType ||
              !contentType ||
              (contentFormType === "long" && !simulationMode)
            }
            icon={<PiNotepadLight size={24} />}
          />

          <p className="mt-[10px] font-normal text-sm text-[#A3AAB3]">
            {contentFormType === "long" && simulationMode === "advanced"
              ? "For Advanced Simulation, please provide a comprehensive brief for your " +
                (contentType || "content") +
                ". The more detail, the better the insights."
              : contentFormType === "long" && simulationMode === "basic"
              ? "For Basic Simulation, outline the core topic, key messages, and desired structure for your " +
                (contentType || "content") +
                "."
              : contentFormType === "short"
              ? "For Short Form, describe the main angle or message for your " +
                (contentType || "content") +
                "."
              : "Select content form, specific type, and simulation mode (if applicable) to enable this field."}
          </p>
        </div>

        {/* Tell us about your brand voice or positioning (Optional) */}
        
        <CustomTextarea
          id="companyContext"
          rows={contentFormType === "long" ? 5 : 3}
          value={companyContext}
          onChange={(e: any) =>
            handleFieldChange(setCompanyContext, e.target.value)
          }
          placeholder="Tell us about your brand voice or positioning (Optional)"
          icon={<PiNotepadLight size={24} />}
        />
      </div>

      <div className="flex justify-between items-center mt-[87px]">
        <BlackButton onClick={onBack}>Back</BlackButton>

        <PrimaryButton
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          icon={<RightWhiteArrow />}
        >
          {isSubmitting ? "Starting Simulation..." : "Generate Content"}
        </PrimaryButton>
      </div>
    </div>
  );
};
export default ContentCreationForm;
