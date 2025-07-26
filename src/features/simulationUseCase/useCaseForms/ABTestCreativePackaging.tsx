import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { useAudience } from "../../../context/AudienceContext";
import BlackButton from "@/components/Buttons/BlackButton";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import {
  GoalIcon,
  RightWhiteArrow,
  UploadIcon,
} from "@/icons/simulatePageIcons";
import { PiUser } from "react-icons/pi";
import CustomInput from "@/components/Buttons/CustomInput";

interface SegmentPersonaFilters {
  industryL1: string[];
  industryL2: string[];
  functions: string[];
  roles: string[];
}

interface ABTestCreativesProps {
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

type ImageFile = {
  file: File;
  preview: string;
};

const API_URL = import.meta.env.VITE_API_URL || "";

const ABTestCreativePackagingForm: React.FC<ABTestCreativesProps> = ({
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

  // Initialize form state from initialFormData
  const [simName, setSimName] = useState(initialFormData.simName || "");
  const [goal, setGoal] = useState(initialFormData.goal || "");
  const [images, setImages] = useState<ImageFile[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Note: We can't persist image files directly, but we'll persist other form data
  useEffect(() => {
    const formData = {
      simName,
      goal,
      // Images can't be serialized, so we won't include them
    };

    onFormDataChange(formData);
  }, [simName, goal, onFormDataChange]);

  // Handler to notify parent about edits
  const handleEdit = () => {
    if (onEditStep) {
      onEditStep();
    }
  };

  // Clean up image previews on unmount
  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

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

  // Image handling functions
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages([...images, ...newImages]);
    handleEdit();

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    URL.revokeObjectURL(imageToRemove.preview);

    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    handleEdit();
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isFormValid =
    selectedSegmentIds.length > 0 && goal.trim() !== "" && images.length > 0;
  // Add a utility function to convert an image file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
    setShowProcessing(true);
    setIsSubmitting(true);
    try {
      // Step 1: Get image descriptions from the API
      const imageDescriptionsFormData = new FormData();
      images.forEach((image) => {
        imageDescriptionsFormData.append("images", image.file);
      });

      const descriptionsResponse = await fetch(`${API_URL}/images/describe`, {
        method: "POST",
        credentials: "include",
        body: imageDescriptionsFormData,
      });

      if (!descriptionsResponse.ok) {
        throw new Error("Failed to get image descriptions");
      }

      const descriptionsData = await descriptionsResponse.json();
      const imageDescriptions = descriptionsData.descriptions;

      // Convert all images to base64
      const imagePromises = images.map((image) => fileToBase64(image.file));
      const base64Images = await Promise.all(imagePromises);

      // Step 2: Submit the simulation with images and descriptions
      const body = {
        audience_id: audienceData.audienceId,
        task: "packaging-review-gemini",
        name: simName,
        goal: goal,
        image_descriptions: imageDescriptions,
        segment_ids: selectedSegmentIds,
        persona_filters: personaFilters, // Include persona filters
        images: base64Images,
      };

      // Send the request to start a simulation with image uploads and descriptions
      const response = await fetch(`${API_URL}/simulations`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to start simulation");
      }

      const data = await response.json();

      // Call onSubmit with the simulation ID
      onSubmit(data.simulation_id);
    } catch (err) {
      console.error("Error starting simulation:", err);
      setError("Failed to start simulation. Please try again.");
      setShowProcessing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showProcessing) {
    return (
      <div className="relative bg-grey rounded-xl p-6">
        <div className="mb-24"></div>
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center">
          <div className="animate-spin mb-4">
            <Loader2 className="h-16 w-16 text-blue-500" />
          </div>
          <div className="text-base font-medium">Processing images...</div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full bg-gray_light rounded-tl-[30px] p-[30px] relative pb-16 h-[87vh]">
      <div>
        <h3 className="text-[28px] font-semibold text-black mb-3">
          Packaging Review
        </h3>
        <p className="text-xs font-normal text-[#595E64]">
          Review and optimize your packaging design
        </p>
      </div>
      <div className="mb-3">
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
          onChange={(e: any) => {
            setSimName(e.target.value);
            handleEdit();
          }}
          placeholder="Simulation Name"
          icon={<PiUser size={24} />}
        />

        <CustomInput
          id="goal"
          value={goal}
          onChange={(e: any) => {
            setGoal(e.target.value);
            handleEdit();
          }}
          placeholder="Goal"
          icon={<GoalIcon />}
        />
      </div>

      <div className="mt-5">
        <div className="flex justify-between items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
            aria-label="Upload creative images"
            title="Upload creative images"
          />
        </div>

        {images.length === 0 ? (
          <div className="p-[10px] bg-white rounded-2xl">
            <div
              className="border-2 border-dashed border-[#E8E8E8] rounded-xl p-8 text-center cursor-pointer  transition-colors flex items-center flex-col gap-5"
              onClick={triggerFileInput}
            >
              <UploadIcon />
              <div className="flex items-center gap-2 flex-col">
                <p className="font-semibold text-base text-[#595E64]">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm font-normal text-[#595E64]">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-[10px] bg-white rounded-2xl">
            <div className="border-2 border-dashed border-[#E8E8E8] rounded-xl p-8 text-center cursor-pointer  transition-colors flex items-center flex-col gap-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.preview}
                      alt={`Creative ${index + 1}`}
                      className="h-32 w-full object-cover rounded-md border border-gray-300"
                    />
                    <button
                      type="button"
                      aria-label={`Remove image ${index + 1}`}
                      title={`Remove image ${index + 1}`}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div
                  className="h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={triggerFileInput}
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="mt-1 text-xs text-gray-500">Add more</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-10 ">
        <BlackButton onClick={onBack}>Back</BlackButton>

        <PrimaryButton
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          icon={<RightWhiteArrow />}
        >
          {isSubmitting ? "Running Test..." : "Run Test"}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default ABTestCreativePackagingForm;
