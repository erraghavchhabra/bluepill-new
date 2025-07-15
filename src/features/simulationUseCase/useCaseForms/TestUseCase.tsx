import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Button";
import { ArrowLeft, GoalIcon } from "lucide-react";
import { useAudience } from "../../../context/AudienceContext";
import CustomInput from "@/components/Buttons/CustomInput";
import { PiNotepadLight, PiUser } from "react-icons/pi";
import CustomTextarea from "@/components/Buttons/CustomTextarea";
import { GroupQuesetionIcon, RightWhiteArrow } from "@/icons/simulatePageIcons";
import BlackButton from "@/components/Buttons/BlackButton";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

interface SegmentPersonaFilters {
  industryL1: string[];
  industryL2: string[];
  functions: string[];
  roles: string[];
}

interface InsightsFormProps {
  onSubmit: (simulationId: number) => void;
  selectedSegmentIds: number[];
  personaFilters: Record<number, SegmentPersonaFilters>;
  onBack: () => void;
  onEditStep?: () => void; // Add this prop for edit tracking
  initialFormData?: Record<string, any>; // Add this prop for form state persistence
  onFormDataChange?: (data: Record<string, any>) => void; // Add this prop for notifying parent of changes
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

const TestUseCase: React.FC<InsightsFormProps> = ({
  onSubmit,
  selectedSegmentIds,
  personaFilters,
  onBack,
  onEditStep,
  initialFormData = {},
  onFormDataChange = () => {},
}) => {
  const navigate = useNavigate();
  const { audienceData } = useAudience();
  const [segments, setSegments] = useState<Segment[]>([]);

  // Initialize form state from initialFormData
  const [simName, setSimName] = useState(initialFormData.simName || "");
  const [goal, setGoal] = useState(initialFormData.goal || ""); // New goal field
  const [questionsText, setQuestionsText] = useState(
    initialFormData.questionsText || ""
  ); // Combined questions in a text area
  const [context, setContext] = useState(initialFormData.context || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update parent component with form data changes
  useEffect(() => {
    const formData = {
      simName,
      goal,
      questionsText,
      context,
    };

    onFormDataChange(formData);
  }, [simName, goal, questionsText, context]); // Remove onFormDataChange from dependencies

  // Handle field changes and notify parent about edits
  const handleFieldChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    setter(value);
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
    questionsText.trim() !== "" && selectedSegmentIds.length > 0;

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Parse questions from text area - split by new line
      const parsedQuestions = questionsText
        .split("\n")
        .map((q) => q.trim())
        .filter((q) => q !== "");

      // Prepare the simulation data
      const simulationData = {
        audience_id: audienceData.audienceId,
        segment_ids: selectedSegmentIds,
        name: simName,
        persona_filters: personaFilters, // Include persona filters
        task: "test_use_case",
        questions: parsedQuestions,
        context: context,
        goal: goal, // Add goal to simulation data
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
          Test Use Case
        </h3>
        <p className="text-xs font-normal text-[#595E64]">
          Simulate a test to get insights
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
      <div className="flex items-center justify-between gap-5 mt-[30px]">
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
          placeholder="Goal"
          icon={<GoalIcon />}
        />
      </div>
      <div className="mt-5">
        <CustomTextarea
          id="questionsText"
          value={questionsText}
          onChange={(e: any) =>
            handleFieldChange(setQuestionsText, e.target.value)
          }
          rows={6}
          placeholder="Survey or Focus Group Questions"
          icon={<GroupQuesetionIcon />}
        />

        <p className="mt-[10px] text-sm font-normal text-[#A3AAB3]">
          Add each question on a new line
        </p>
      </div>
      <div className="mt-5">
        <CustomTextarea
          id="context"
          value={context}
          onChange={(e: any) => handleFieldChange(setContext, e.target.value)}
          rows={3}
          placeholder="Context (Optional)"
          icon={<PiNotepadLight size={24} />}
        />
      </div>

      <div>{error && <p className="text-sm text-red-600">{error}</p>}</div>
      <div className="flex justify-between items-center mt-[100px] ">
        <BlackButton onClick={onBack}>Back</BlackButton>

        <PrimaryButton
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          icon={<RightWhiteArrow />}
        >
          {isSubmitting ? "Starting..." : "Start Simulation"}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default TestUseCase;
