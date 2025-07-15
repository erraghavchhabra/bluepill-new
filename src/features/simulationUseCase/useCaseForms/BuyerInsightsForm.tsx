import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import { ArrowLeft, Globe, Briefcase, Users } from "lucide-react";
import { useAudience } from "../../../context/AudienceContext";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import BlackButton from "@/components/Buttons/BlackButton";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import {
  HashNameIcon,
  RightWhiteArrow,
  WebIcon,
} from "@/icons/simulatePageIcons";
import CustomInput from "@/components/Buttons/CustomInput";
import {
  PiBuildingsLight,
  PiNotepadLight,
  PiUser,
  PiUsersThree,
} from "react-icons/pi";

interface SegmentPersonaFilters {
  industryL1: string[];
  industryL2: string[];
  functions: string[];
  roles: string[];
}

interface BuyerInsightsFormProps {
  onSubmit: (simulationId: number) => void;
  selectedSegmentIds: number[];
  personaFilters: Record<number, SegmentPersonaFilters>;
  onBack: () => void;
  onEditStep?: () => void; // Add this prop
  initialFormData?: Record<string, any>; // Add this prop to receive saved form data
  onFormDataChange?: (data: Record<string, any>) => void; // Add this prop to save form data
}

interface Segment {
  id: number;
  name: string;
  description: string;
  len: number; // Number of personas
  created_at: string;
  updated_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || "";

const BuyerInsightsForm: React.FC<BuyerInsightsFormProps> = ({
  onSubmit,
  selectedSegmentIds,
  personaFilters,
  onBack,
  onEditStep,
  initialFormData = {}, // Default to empty object if not provided
  onFormDataChange = () => {}, // Default to no-op if not provided
}) => {
  const { audienceData } = useAudience();
  const [segments, setSegments] = useState<Segment[]>([]);

  // Initialize form values from initialFormData if available
  const [simName, setSimName] = useState(initialFormData.simName || "");
  const [productName, setProductName] = useState(
    initialFormData.productName || ""
  );
  const [websiteUrl, setWebsiteUrl] = useState(
    initialFormData.websiteUrl || ""
  );
  const [context, setContext] = useState(initialFormData.context || "");
  const [businessModel, setBusinessModel] = useState<"B2B" | "B2C">(
    initialFormData.businessModel || "B2B"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When any form field changes, update the parent component
  useEffect(() => {
    const formData = {
      simName,
      productName,
      websiteUrl,
      context,
      businessModel,
    };

    onFormDataChange(formData);
  }, [simName, productName, websiteUrl, context, businessModel]); // Remove onFormDataChange from dependencies

  // Handle form field changes
  const handleFormChange = () => {
    if (onEditStep) {
      onEditStep();
    }
  };

  // Fetch segments
  useEffect(() => {
    const fetchSegments = async () => {
      if (!audienceData.audienceId) return;

      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/audience/${audienceData.audienceId}/segments`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch segments");
        }

        const data = await response.json();
        // Filter segments to only include the selected ones
        const filteredSegments = data.filter((segment: Segment) =>
          selectedSegmentIds.includes(segment.id)
        );
        setSegments(filteredSegments);
        setError(null);
      } catch (err) {
        console.error("Error fetching segments:", err);
        setError("Failed to load segments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, [audienceData.audienceId, selectedSegmentIds]);

  const isFormValid =
    selectedSegmentIds.length > 0 && productName.trim() !== "";

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Prepare the simulation data
      const simulationData = {
        audience_id: audienceData.audienceId,
        segment_ids: selectedSegmentIds,
        persona_filters: personaFilters, // Include persona filters
        name: simName,
        task:
          businessModel === "B2B"
            ? "buyer-insights-report-b2b"
            : "buyer-insights-report-b2c",
        objective: "in-depth-buyer-insights-report",
        context: context,
        additional_data: {
          product_name: productName,
          website_url: websiteUrl,
        },
      };

      // Send the request to start a simulation
      const response = await fetch(`${API_URL}/simulations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(simulationData),
      });

      if (!response.ok) {
        throw new Error("Failed to start simulation");
      }

      const data = await response.json();

      // Call onSubmit with the simulation ID instead of navigating away
      onSubmit(data.simulation_id);
    } catch (err) {
      console.error("Error starting simulation:", err);
      setError("Failed to start simulation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-gray_light rounded-tl-[30px] p-[30px] relative">
      <div>
        <h3 className="text-[28px] font-semibold text-black mb-3">
          Customer Insights Report
        </h3>
        <p className="text-xs font-normal text-[#595E64]">
          Generate a detailed report on customer insights
        </p>
      </div>
      <div className="mb-6">
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          error && <div className="text-sm text-red-600 mb-3">{error}</div>
        )}
      </div>

      <div className="mt-[30px]">
        <CustomInput
          id="simName"
          value={simName}
          onChange={(e: any) => {
            setSimName(e.target.value);
            handleFormChange();
          }}
          placeholder="Enter a name for your simulation"
          icon={<PiUser />}
          label="Simulation Name"
        />
      </div>

      <div className="mt-5">
        <label className="text-black text-sm font-medium">
          What product, service, or company do you want insights on?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CustomInput
            id="Name"
            value={productName}
            onChange={(e: any) => {
              setProductName(e.target.value);
              handleFormChange();
            }}
            placeholder="Name"
            icon={<HashNameIcon />}
          />

          <CustomInput
            id="weblink"
            value={websiteUrl}
            onChange={(e: any) => {
              setWebsiteUrl(e.target.value);
              handleFormChange();
            }}
            placeholder="Website link (optional)"
            icon={<WebIcon />}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium text-black ">
          Business Model
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-[10px]">
          {[
            {
              type: "B2B",
              title: "B2B",
              desc: "Business to Business: Sell to other companies",
              icon: <PiBuildingsLight size={24} />,
            },
            {
              type: "B2C",
              title: "B2C",
              desc: "Business to Consumer: Sell directly to individuals",
              icon: <PiUsersThree size={24} />,
            },
          ].map((opt: any, idx: number) => (
            <div
              key={idx}
              onClick={() => {
                setBusinessModel(opt.type);
                handleFormChange();
              }}
              className={`px-4 py-3 rounded-2xl cursor-pointer transition-all duration-150 ease-in-out flex items-center justify-between gap-3 ${
                businessModel === opt.type ? "bg-primary" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={
                    businessModel === opt.type ? "text-black" : "text-primary2"
                  }
                >
                  <div className="max-w-6">{opt.icon}</div>
                </div>
                <div>
                  <label
                    className={`text-base font-semibold ${
                      businessModel === opt.type
                        ? "text-black"
                        : "text-[#595E64]"
                    }`}
                  >
                    {opt.title}
                  </label>
                  <p
                    className={`text-sm font-normal mt-2 ${
                      businessModel === opt.type
                        ? "text-black"
                        : "text-[#595E64]"
                    }`}
                  >
                    {opt.desc}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center">
                <input
                  type="radio"
                  name="businessModel"
                  value={opt.type}
                  checked={businessModel === opt.type}
                  onChange={() => {}}
                  className="sr-only peer"
                  id={`${opt.type}-radio`}
                />
                <div
                  className={`w-5 h-5 rounded-full border ${
                    businessModel === opt.type
                      ? "border-black"
                      : "border-[#AEAEB2]"
                  } relative transition-all duration-200`}
                >
                  <div
                    className={`absolute inset-1 w-[10px] h-[10px] rounded-full bg-black ${
                      businessModel === opt.type ? "scale-100" : "scale-0"
                    } transition-all duration-300`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="context"
          className="px-4 py-[18px] w-full bg-white rounded-2xl items-start flex gap-[10px] text-primary2 "
        >
          <PiNotepadLight size={24} />
          <textarea
            id="context"
            className="w-full resize-none text-sm font-normal outline-none border-none bg-white"
            rows={4}
            value={context}
            onChange={(e) => {
              setContext(e.target.value);
              handleFormChange();
            }}
            placeholder="Context (Optional)"
          />
        </label>
      </div>
      <div className="flex justify-between items-center mt-[100px] ">
        <BlackButton onClick={onBack}>Back</BlackButton>

        <PrimaryButton
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          icon={<RightWhiteArrow />}
        >
          {isSubmitting
            ? "Generating Report..."
            : "Generate Buyer Insights Report"}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default BuyerInsightsForm;
