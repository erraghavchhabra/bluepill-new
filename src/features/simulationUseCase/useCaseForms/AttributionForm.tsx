import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import { ArrowLeft } from "lucide-react";
import { useAudience } from "../../../context/AudienceContext";
import BlackButton from "@/components/Buttons/BlackButton";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import {
  MarketingSpeakerIcon,
  RightWhiteArrow,
} from "@/icons/simulatePageIcons";
import CustomInput from "@/components/Buttons/CustomInput";
import { PiNotepadLight, PiPlus, PiUser } from "react-icons/pi";
import CustomTextarea from "@/components/Buttons/CustomTextarea";
import { CloseXIcon } from "@/icons/Other";

interface SegmentPersonaFilters {
  industryL1: string[];
  industryL2: string[];
  functions: string[];
  roles: string[];
}

interface AttributionFormProps {
  onSubmit: (simulationId: number) => void;
  selectedSegmentIds: number[];
  personaFilters: Record<number, SegmentPersonaFilters>;
  onBack: () => void;
  onEditStep?: () => void;
  initialFormData?: Record<string, any>;
  onFormDataChange?: (data: Record<string, any>) => void;
}

interface Segment {
  id: number;
  name: string;
  description: string;
  len: number;
  created_at: string;
  updated_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || "";

const AttributionForm: React.FC<AttributionFormProps> = ({
  onSubmit,
  selectedSegmentIds,
  personaFilters,
  onBack,
  onEditStep,
  initialFormData = {},
  onFormDataChange = () => {},
}) => {
  const { audienceData } = useAudience();
  const [segments, setSegments] = useState<Segment[]>([]);

  // Initialize form state
  const [simName, setSimName] = useState(initialFormData.simName || "");
  const [objective, setObjective] = useState(initialFormData.objective || "");
  const [marketingCopies, setMarketingCopies] = useState<string[]>(
    initialFormData.marketingCopies || [""]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update parent component with form data changes
  useEffect(() => {
    const formData = {
      simName,
      objective,
      marketingCopies,
    };
    onFormDataChange(formData);
  }, [simName, objective, marketingCopies]);

  // Handler to notify parent about edits
  const handleEdit = () => {
    if (onEditStep) {
      onEditStep();
    }
  };

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

  // Add handlers for marketing copies
  const handleMarketingCopyChange = (index: number, value: string) => {
    const newCopies = [...marketingCopies];
    newCopies[index] = value;
    setMarketingCopies(newCopies);
    handleEdit();
  };

  const addMarketingCopy = () => {
    setMarketingCopies([...marketingCopies, ""]);
    handleEdit();
  };

  const removeMarketingCopy = (index: number) => {
    if (marketingCopies.length > 1) {
      const newCopies = marketingCopies.filter((_, i) => i !== index);
      setMarketingCopies(newCopies);
      handleEdit();
    }
  };

  const isFormValid =
    selectedSegmentIds.length > 0 &&
    objective.trim() !== "" &&
    marketingCopies.every((copy) => copy.trim() !== "") &&
    marketingCopies.length >= 2; // Ensure at least 2 copies for A/B testing

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const simulationData = {
        audience_id: audienceData.audienceId,
        segment_ids: selectedSegmentIds,
        persona_filters: personaFilters,
        name: simName,
        task: "ab-test-messaging",
        objective: objective,
        marketing_copies: marketingCopies,
      };

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
          AB Test Messaging
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

      <div className="mt-5">
        <CustomInput
          id="simName"
          value={simName}
          onChange={(e: any) => {
            setSimName(e.target.value);
            handleEdit();
          }}
          placeholder="Simulation Name"
          icon={<PiUser size={24} />}
        />
      </div>

      <div className="mt-5">
        <CustomTextarea
          id="objective"
          value={objective}
          onChange={(e: any) => {
            setObjective(e.target.value);
            handleEdit();
          }}
          placeholder="What is your objective? (e.g., which headline will maximize click-through rate?)"
          icon={<PiNotepadLight size={24} />}
        />
      </div>

      <div className="mt-5 flex flex-col gap-5 items-start">
        {marketingCopies.map((copy, index) => (
          <label
            htmlFor={`Copies_${index + 1}`}
            key={index}
            className="px-4 py-[18px] w-full bg-white rounded-2xl items-start flex gap-[10px] text-primary2 "
          >
            <MarketingSpeakerIcon />

            <textarea
              id={`Copies_${index + 1}`}
              rows={5}
              className="w-full resize-none text-sm font-normal outline-none border-none bg-white"
              value={copy}
              onChange={(e) => handleMarketingCopyChange(index, e.target.value)}
              placeholder={`Marketing Copies to Test ${
                index + 1 > 1 ? `- ${index + 1}` : ""
              } `}
            />
            {marketingCopies.length > 1 && (
              <button onClick={() => removeMarketingCopy(index)}>
                <CloseXIcon size={24} color="#595E64" />
              </button>
            )}
          </label>
        ))}
        {marketingCopies.length < 2 && (
          <p className="text-sm text-[#595E64] ">
            Please add at least 2 marketing copies for A/B testing
          </p>
        )}
      </div>
      <div className="mt-5">
        <PrimaryButton
          onClick={addMarketingCopy}
          className="flex-row-reverse"
          icon={
            <div className="p-[3px]">
              <PiPlus size={18} />
            </div>
          }
        >
          Add Copy
        </PrimaryButton>
      </div>
      <div className="flex justify-between items-center mt-[100px] ">
        <BlackButton onClick={onBack}>Back</BlackButton>

        <PrimaryButton
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          icon={<RightWhiteArrow />}
        >
          {isSubmitting ? "Running A/B Test..." : "Run A/B Test"}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default AttributionForm;
