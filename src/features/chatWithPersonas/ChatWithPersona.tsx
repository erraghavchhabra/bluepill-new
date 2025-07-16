import React, { useState, useEffect } from "react";
import ExistingAudiences from "../existingAudience/ExistingAudiences";
import SegmentsSelectorGrove from "../simulationUseCase/SegmentsSelectorGrove";
import SegmentsSelectorYoga from "../simulationUseCase/SegmentsSelectorYoga";
import SegmentsSelectorKettleAndFire from "../simulationUseCase/SegmentsSelectorKettleAndFire";
import SegmentsSelectorLoverery from "../simulationUseCase/SegmentsSelectorLoverery";
import SegmentsSelectorCoreStack from "../simulationUseCase/SegmentsSelectorCoreStack";
import SegmentsSelectorSolidigm from "../simulationUseCase/SegmentsSelectorSolidigm";
import SegmentsSelector from "../simulationUseCase/SegmentsSelector";
import ChatUI from "./ChatUI";
import { useAudience } from "@/context/AudienceContext";
import Header from "../../components/Header";

const ChatWithPersona: React.FC = () => {
  // All hooks at the top
  const [step, setStep] = useState<"audience" | "segments" | "chat">(
    "audience"
  );
  const [selectedAudienceId, setSelectedAudienceId] = useState<number | null>(
    null
  );
  const [selectedAudienceName, setSelectedAudienceName] = useState<string>("");
  const [chatPersonaIds, setChatPersonaIds] = useState<number[]>([]);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState<number[]>([]);
  const [personaFilters, setPersonaFilters] = useState<Record<number, any>>({});
  const { currentStep, setCurrentStep, audienceData, updateAudienceData } =
    useAudience();

  // Always call useEffect
  useEffect(() => {
    const fetchPersonaIds = async () => {
      if (step !== "chat") return;
      setLoadingPersonas(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || "";
        const filterRequest = {
          segments: audienceData.selectedSegments,
          filters: audienceData.personaFilters,
          audience_name: audienceData.audienceName || "",
        };
        const response = await fetch(`${API_URL}/filter_personas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(filterRequest),
        });
        if (!response.ok) throw new Error("Failed to fetch persona IDs");
        const roleToPersonaIdsMap = await response.json();
        console.log("roleToPersonaIdsMap", roleToPersonaIdsMap);
        // Flatten all persona IDs from all roles
        const allPersonaIds: number[] = [];
        Object.values(roleToPersonaIdsMap).forEach((ids: any) => {
          if (Array.isArray(ids)) {
            allPersonaIds.push(...ids);
          }
        });
        setChatPersonaIds(Array.from(new Set(allPersonaIds)));
      } catch (error) {
        console.error("Error fetching persona IDs:", error);
        setChatPersonaIds([]);
      } finally {
        setLoadingPersonas(false);
      }
    };
    fetchPersonaIds();
  }, [
    step,
    audienceData.selectedSegments,
    audienceData.personaFilters,
    audienceData.audienceName,
  ]);

  // Handler for audience selection
  const handleSelectAudience = (audienceId: number, audienceName: string) => {
    setSelectedAudienceId(audienceId);
    setSelectedAudienceName(audienceName);
    updateAudienceData({
      audienceId: audienceId,
      audienceName: audienceName,
      selectedSegments: [],
      personaFilters: {},
    });
    setStep("segments");
  };

  // Handler for segment selection
  const handleSegmentsNext = (
    segments: number[],
    filters: Record<number, any>
  ) => {
    setSelectedSegments(segments);
    setPersonaFilters(filters);
    updateAudienceData({
      selectedSegments: segments,
      personaFilters: filters,
    });
    setStep("chat");
  };

  // Conditional rendering only
  if (step === "audience") {
    return (
      <>
        <Header />
        <br />
        <div className="ml-[30px]">
          <ExistingAudiences
            onSelectAudience={handleSelectAudience}
            onBack={() => {}}
          />
        </div>
      </>
    );
  }

  if (step === "segments" && selectedAudienceId) {
    const name = selectedAudienceName.toLowerCase();
    const commonProps = {
      btn_text: "Continue to Chat",
      audienceId: selectedAudienceId,
      onBack: () => setStep("audience"),
      onNext: handleSegmentsNext,
    };
    return (
      <>
        <Header />
        <br />
        <div className="ml-[30px]">
          {name.includes("grove") || name.includes("nrc") ? (
            <SegmentsSelectorGrove {...commonProps} />
          ) : name.includes("yoga") ? (
            <SegmentsSelectorYoga {...commonProps} />
          ) : name.includes("kettle & fire") ? (
            <SegmentsSelectorKettleAndFire {...commonProps} />
          ) : name.includes("lovevery") ? (
            <SegmentsSelectorLoverery {...commonProps} />
          ) : name.includes("core") ? (
            <SegmentsSelectorCoreStack {...commonProps} />
          ) : name.includes("solidigm") ? (
            <SegmentsSelectorSolidigm {...commonProps} />
          ) : (
            <SegmentsSelector {...commonProps} />
          )}
        </div>
      </>
    );
  }

  if (step === "chat") {
    if (loadingPersonas) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
          <svg
            className="animate-spin h-10 w-10 mb-4 text-blue-500"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <div className="text-lg font-medium">
            Loading personas for chat...
          </div>
        </div>
      );
    }
    if (chatPersonaIds.length === 0) {
      return (
        <div>No personas found for the selected segments and filters.</div>
      );
    }
    return (
      <>
        <Header />
        <div className="pl-[30px]">
          <div className="w-full bg-gray_light rounded-tl-[30px] p-[30px] relative ">
            <div>
              <h3 className="text-[28px] font-semibold text-black mb-3">
                Chat with Personas
              </h3>
              <p className="text-xs font-normal text-[#595E64]">
                Engage with unique personalities in dynamic conversations
                tailored to your preferences and interests.
              </p>
            </div>
            <div className="mt-[30px]">
              <ChatUI
                personaIds={chatPersonaIds}
                onBlack={() => setStep("segments")}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default ChatWithPersona;
