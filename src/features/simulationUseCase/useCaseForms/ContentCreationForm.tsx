import React, { useState, useEffect } from "react";
import Button from "../../../components/Button"; // Assuming this is your custom Button
import { ArrowLeft } from "lucide-react";
import { useAudience } from "../../../context/AudienceContext";
import { PiNotePencilLight, PiSubtitles, PiUser } from "react-icons/pi";

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

  const getContentTypePlaceholder = () => {
    if (contentFormType === "short") {
      return "e.g., Website Headline, Email subject line, LinkedIn Ad";
    } else if (contentFormType === "long") {
      return "e.g., Blog Post, 1-Pager, Whitepaper, Sales Pitch Deck Bullets";
    } else {
      return "Select a content form (Short or Long) above first";
    }
  };

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
        <div className="px-4 py-[18px] w-full bg-white rounded-2xl items-center flex gap-[10px] text-primary2">
          <PiUser size={24} />
          <input
            id="simName"
            type="text"
            className="w-full text-sm font-normal outline-none border-none"
            value={simName}
            onChange={(e) => handleFieldChange(setSimName, e.target.value)}
            placeholder="Simulation Name"
          />
        </div>
        <div className="px-4 py-[18px] w-full bg-white rounded-2xl items-center flex gap-[10px] text-primary2">
          <PiNotePencilLight size={24} />
          <input
            id="goal"
            type="text"
            className="w-full text-sm font-normal outline-none border-none"
            value={goal}
            onChange={(e) => handleFieldChange(setGoal, e.target.value)}
            placeholder="Whats the expected outcome of this simulation?"
          />
        </div>
      </div>

      {/* What type of content are you creating? (Radio Buttons for Form Type) */}
      <div className="mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Short Form Option */}
          <div
            onClick={() => handleContentFormTypeChange("short")}
            className={`px-4 py-3 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out flex items-start justify-between gap-3 ${
              contentFormType === "short"
                ? " ring-primary bg-blue-50 "
                : "border-white "
            }`}
          >
            <PiSubtitles />
            <div>
              <label
                htmlFor="shortForm"
                className="block text-sm font-semibold text-gray-800 cursor-pointer"
              >
                Short form content
              </label>
              <p className="text-xs text-gray-500 font-normal mt-1">
                e.g., Website Headline, Email subject line, etc.
              </p>
            </div>
            <input
              type="radio"
              id="shortForm"
              name="contentFormType"
              value="short"
              checked={contentFormType === "short"}
              onChange={() => {}}
              className="h-5 w-5 mt-0.5 text-blue-600 border-gray-300 focus:ring-blue-500 shrink-0"
            />
          </div>
          {/* Long Form Option */}
          <div
            onClick={() => handleContentFormTypeChange("long")}
            className={`px-4 py-3 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out flex items-start justify-between gap-3 ${
              contentFormType === "long"
                ? " ring-primary bg-blue-50 "
                : "border-white "
            }`}
          >
            <PiSubtitles />
            <div>
              <label
                htmlFor="longForm"
                className="block text-sm font-semibold text-gray-800 cursor-pointer"
              >
                Long Form content
              </label>
              <p className="text-xs text-gray-500 font-normal mt-1">
                e.g., Blog, 1-Pager, Whitepaper, etc.
              </p>
            </div>
            <input
              type="radio"
              id="longForm"
              name="contentFormType"
              value="long"
              checked={contentFormType === "long"}
              onChange={() => {}}
              className="h-5 w-5 mt-0.5 text-blue-600 border-gray-300 focus:ring-blue-500 shrink-0"
            />
          </div>
        </div>
      </div>

      {/* NEW: Specify the content type (Text Input) - Appears after form type selection */}
      {contentFormType && (
        <div className="mb-6 transition-all duration-300 ease-in-out">
          <label
            htmlFor="contentType"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Specify the type of{" "}
            {contentFormType === "short" ? "short-form" : "long-form"} content:
          </label>
          <input
            type="text"
            id="contentType"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={contentType}
            onChange={(e) => handleFieldChange(setContentType, e.target.value)}
            placeholder={getContentTypePlaceholder()}
          />
        </div>
      )}

      {/* CONDITIONAL: Simulation Mode (Basic/Advanced) - Only if Long Form is selected */}
      {contentFormType === "long" && (
        <div className="mb-6 transition-all duration-300 ease-in-out">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose simulation depth for long form content:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Basic Simulation Option */}
            <div
              onClick={() => handleSimulationModeChange("basic")}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out flex items-start space-x-3 ${
                simulationMode === "basic"
                  ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                id="basicSim"
                name="simulationMode"
                value="basic"
                checked={simulationMode === "basic"}
                onChange={() => {}}
                className="h-5 w-5 mt-0.5 text-blue-600 border-gray-300 focus:ring-blue-500 shrink-0"
              />
              <div>
                <label
                  htmlFor="basicSim"
                  className="block text-sm font-semibold text-gray-800 cursor-pointer"
                >
                  Run Basic Simulation
                </label>
                <p className="text-xs text-gray-500 font-normal mt-1">
                  Faster, good for general content outlines and ideas.
                </p>
              </div>
            </div>
            {/* Advanced Simulation Option */}
            <div
              onClick={() => handleSimulationModeChange("advanced")}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out flex items-start space-x-3 ${
                simulationMode === "advanced"
                  ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                id="advancedSim"
                name="simulationMode"
                value="advanced"
                checked={simulationMode === "advanced"}
                onChange={() => {}}
                className="h-5 w-5 mt-0.5 text-blue-600 border-gray-300 focus:ring-blue-500 shrink-0"
              />
              <div>
                <label
                  htmlFor="advancedSim"
                  className="block text-sm font-semibold text-gray-800 cursor-pointer"
                >
                  Run Advanced Simulation
                </label>
                <p className="text-xs text-gray-500 font-normal mt-1">
                  More detailed. Explores deeper insights. Takes longer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* What should this content cover? (Detailed Brief Textarea) */}
      <div className="mb-6">
        <label
          htmlFor="contentSubject"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          What should this {contentType ? contentType.toLowerCase() : "content"}{" "}
          cover? Provide a detailed brief.
        </label>
        <textarea
          id="contentSubject"
          rows={5}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={contentSubject}
          onChange={(e) => handleFieldChange(setContentSubject, e.target.value)}
          placeholder={getContentSubjectPlaceholder()}
          disabled={
            !contentFormType ||
            !contentType ||
            (contentFormType === "long" && !simulationMode)
          }
        />
        <p className="mt-1 text-xs text-gray-500">
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
      <div className="mb-6">
        <label
          htmlFor="companyContext"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Tell us about your brand voice or positioning (Optional)
        </label>
        <textarea
          id="companyContext"
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={companyContext}
          onChange={(e) => handleFieldChange(setCompanyContext, e.target.value)}
          placeholder='Describe how your brand should sound. Example: "Tone: confident, clear, consultative"'
        />
      </div>

      <div className="flex justify-between items-center mt-[87px]">
        <button
          onClick={onBack}
          className="text-white bg-black p-[14px_30px] text-base font-semibold rounded-full"
        >
          Back
        </button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          withArrow
        >
          {isSubmitting ? "Starting Simulation..." : "Generate Content"}
        </Button>
      </div>
    </div>
  );
};
export default ContentCreationForm;
