// filepath: c:\Users\Puneet Bajaj\Desktop\Ankit\ankitnewform\src\features\simulationUseCase\UseCaseSelector.tsx
import React, { useState, useEffect } from "react";
import {
  PenTool,
  TestTube,
  BarChart,
  DollarSign,
  Share2,
  Target,
  ArrowLeft,
  SearchCheck,
} from "lucide-react";
import StepContainer from "../../components/StepContainer";
import SimulationCard from "../../components/SimulationCard";
import Button from "../../components/Button";
import ContentCreationForm from "./useCaseForms/ContentCreationForm";
import ContentTestingForm from "./useCaseForms/ContentTestingForm";
import InsightsForm from "./useCaseForms/InsightsForm";
import PricingForm from "./useCaseForms/PricingForm";
import ChannelStrategyForm from "./useCaseForms/ABTestCreatives";
import ABTestCreativesFormGemini from "./useCaseForms/ABTestCreativesGemini";
// import PackagingReviewGemini from './useCaseForms/PackagingReviewGemini';
import ABTestCreativePackagingForm from "./useCaseForms/ABTestCreativePackaging";
import AttributionForm from "./useCaseForms/AttributionForm";
import BuyerInsightsForm from "./useCaseForms/BuyerInsightsForm";
import SurveyAndFocusGroups from "./useCaseForms/SurveyAndFocusGroups";
import TestUseCase from "./useCaseForms/TestUseCase";
import LongContentCreationForm from "./useCaseForms/LongContentCreationForm";
import SimulationResults from "../simulationResults/SimulationResults";
import SegmentsSelector from "./SegmentsSelector";
import SegmentsSelectorGrove from "./SegmentsSelectorGrove";
import SegmentsSelectorYoga from "./SegmentsSelectorYoga";
import SegmentsSelectorCoreStack from "./SegmentsSelectorCoreStack";
import SegmentsSelectorSolidigm from "./SegmentsSelectorSolidigm";
import SegmentsSelectorKettleAndFire from "./SegmentsSelectorKettleAndFire";
import SegmentsSelectorLoverery from "./SegmentsSelectorLoverery";
import { useAudience } from "../../context/AudienceContext";
import SimulationHistoryPanel from "../../components/SimulationHistoryPanel";
import { useNavigate } from "react-router-dom";
import CreateCampaignStratergy from "./useCaseForms/CreateCampaignStratergy";
import {
  AdsIcon,
  CampaignConceptsIcon,
  InsightsReportIcon,
  MessagingIcon,
  PackagingIcon,
  PenToolIcon,
  SurveyIcon,
  TestUseCaseIcon,
} from "@/icons/simulatePageIcons";
import BlackButton from "@/components/Buttons/BlackButton";

// Interface to track persona filters within each segment
export interface SegmentPersonaFilters {
  industryL1: string[];
  industryL2: string[];
  functions: string[];
  roles: string[];
}

export type UseCaseType =
  | "create-content"
  | "content-testing"
  | "get-insights"
  | "pricing-analysis"
  | "channel-strategy"
  | "ab-test-creatives-gemini"
  | "packaging-review-gemini"
  | "attribution"
  | "buyer-insights-report"
  | "survey-and-focus-groups"
  | "create-campaign-strategy"
  | "test-use-case"
  | null;

// Define the possible steps in the flow
type FlowStep =
  | "segment-selection"
  | "use-case-selection"
  | "form-filling"
  | "results-view";

interface UseCaseSelectorProps {
  onComplete: (simulationId: number) => void; // Modified to pass the simulationId
  onBack: () => void;
  audienceId: number;
  onStepChange?: (step: FlowStep) => void;
  onEditStep?: () => void; // New prop to signal edits
  currentStep?: FlowStep;
  hasEditedStep?: boolean; // New prop to track edit state from parent
  onFormDataChange?: (useCaseType: string, data: Record<string, any>) => void;
}

const UseCaseSelector: React.FC<UseCaseSelectorProps> = ({
  onComplete,
  onBack,
  audienceId,
  onStepChange,
  onEditStep,
  currentStep: providedStep,
  hasEditedStep = false,
  onFormDataChange,
}) => {
  const { audienceData, updateAudienceData } = useAudience();
  const navigate = useNavigate(); // Define which use cases are "coming soon"
  const COMING_SOON_USE_CASES: UseCaseType[] = [
    // 'get-insights',
    // 'pricing-analysis',
    // 'attribution',
    // 'channel-strategy'
  ];
  // Define available use cases FIRST before any functions that use it
  const useCases = [
    // Available use cases
    {
      type: "create-content" as UseCaseType,
      icon: <PenToolIcon />,
      title: "Create Content",
      description:
        "Generate content, messages, ads, emails and more tailored to your audience",
    },
    // {
    //   type: 'content-testing' as UseCaseType,
    //   icon: <TestTube className="w-5 h-5" />,
    //   title: 'Test Content',
    //   description: 'Run A/B or multivariate tests on any content, creatives and more',
    // },
    {
      type: "channel-strategy" as UseCaseType,
      icon: <AdsIcon />,
      title: "A/B Test Creatives, Ads ",
      description:
        "Discover the best way to reach this audience with detailed  execution plan",
    },
    // {
    //   type: 'ab-test-creatives-gemini' as UseCaseType,
    //   icon: <Share2 className="w-5 h-5" />,
    //   title: 'A/B Test Creatives, Ads ',
    //   description: 'Discover the best way to reach this audience with detailed  execution plan'
    // },
    {
      type: "packaging-review-gemini" as UseCaseType,
      icon: <PackagingIcon />,
      title: "Packaging Review",
      description: "Review and optimize your packaging design",
    },
    {
      type: "buyer-insights-report" as UseCaseType,
      icon: <InsightsReportIcon />,
      title: "Customer Insights Report",
      description: "Generate a detailed report on customer insights",
    },

    // // Coming soon use cases - placed at the end
    // {
    //   type: 'get-insights' as UseCaseType,
    //   icon: <BarChart className="w-5 h-5" />,
    //   title: 'Get Insights',
    //   description: 'Simulate a survey or focus group to get insights',
    // },
    // {
    //   type: 'pricing-analysis' as UseCaseType,
    //   icon: <DollarSign className="w-5 h-5" />,
    //   title: 'Pricing Analysis',
    //   description: 'Test how price points perform across different segments',
    // },
    {
      type: "attribution" as UseCaseType,
      icon: <MessagingIcon />,
      title: "AB Test Messaging",
      description: "Learn what drives or blocks conversions",
    },
    {
      type: "survey-and-focus-groups" as UseCaseType,
      icon: <SurveyIcon />,
      title: "Survey",
      description: "Simulate a survey or focus group to get insights",
    },
    {
      type: "create-campaign-strategy" as UseCaseType,
      icon: <CampaignConceptsIcon />,
      title: "Create Campaign Concepts",
      description: "Create a campaign concept",
    },
    {
      type: "test-use-case" as UseCaseType,
      icon: <TestUseCaseIcon />,
      title: "Test Use Case",
      description: "Simulate a test to get insights",
    },
  ];

  // Initialize with provided step or default to segment selection
  const [localCurrentStep, setLocalCurrentStep] = useState<FlowStep>(
    providedStep || "segment-selection"
  );

  // Use either the provided step from props or our local state
  const currentStep = providedStep || localCurrentStep;

  // Determine initial use case from audience data
  const getInitialUseCase = (): UseCaseType => {
    if (!audienceData.selectedUseCase) return null;

    const matchingUseCase = useCases.find(
      (uc) =>
        uc.title.toLowerCase() === audienceData.selectedUseCase?.toLowerCase()
    );

    return matchingUseCase?.type || null;
  };

  // Initialize from context if available, or use previously saved values
  const [selectedUseCase, setSelectedUseCase] = useState<UseCaseType>(
    getInitialUseCase()
  );
  const [selectedSegments, setSelectedSegments] = useState<number[]>(
    audienceData.selectedSegments || []
  );
  const [personaFilters, setPersonaFilters] = useState<
    Record<number, SegmentPersonaFilters>
  >(audienceData.personaFilters || {});
  const [simulationId, setSimulationId] = useState<number | null>(null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [localHasEditedStep, setLocalHasEditedStep] =
    useState<boolean>(hasEditedStep);

  // Store form data between steps
  const [formState, setFormState] = useState<Record<string, any>>({});

  // Update selectedUseCase when audienceData changes
  useEffect(() => {
    const initialUseCase = getInitialUseCase();
    if (initialUseCase && !selectedUseCase) {
      setSelectedUseCase(initialUseCase);
    }
  }, [audienceData.selectedUseCase]);

  // Track edit state from parent
  useEffect(() => {
    setLocalHasEditedStep(hasEditedStep);
  }, [hasEditedStep]);

  // Update local step and notify parent component
  const setCurrentStep = (step: FlowStep) => {
    // Check if we're trying to move forward while having edited
    if (localHasEditedStep) {
      const stepOrder: FlowStep[] = [
        "segment-selection",
        "use-case-selection",
        "form-filling",
        "results-view",
      ];
      const currentStepIndex = stepOrder.indexOf(currentStep);
      const targetStepIndex = stepOrder.indexOf(step);

      // If trying to move forward (skip steps) after editing, prevent it
      if (targetStepIndex > currentStepIndex + 1) {
        return; // Prevent navigation
      }
    }

    // Check if we're moving backward - if so, allow it regardless of edit state
    const stepOrder: FlowStep[] = [
      "segment-selection",
      "use-case-selection",
      "form-filling",
      "results-view",
    ];
    const isMovingBackward =
      stepOrder.indexOf(step) < stepOrder.indexOf(currentStep);

    if (isMovingBackward) {
      // If moving backward, reset local edit state for that step
      setLocalHasEditedStep(false);
    }

    // When changing steps, update the selected use case if appropriate
    if (
      step === "form-filling" &&
      !selectedUseCase &&
      audienceData.selectedUseCase
    ) {
      // Find the use case type from its title
      const matchingUseCase = useCases.find(
        (uc) => uc.title === audienceData.selectedUseCase
      );
      if (matchingUseCase) {
        setSelectedUseCase(matchingUseCase.type);
      }
    }

    setLocalCurrentStep(step);
    if (onStepChange) {
      onStepChange(step);
    }
  };

  // Store form data to persist across navigation
  const updateFormState = (
    formType: UseCaseType,
    data: Record<string, any>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [formType as string]: data,
    }));

    // Also notify the parent component
    if (onFormDataChange && formType) {
      onFormDataChange(formType as string, data);
    }
  };

  // Keep in sync with prop changes
  useEffect(() => {
    if (providedStep && providedStep !== localCurrentStep) {
      setLocalCurrentStep(providedStep);
    }
  }, [providedStep, localCurrentStep]);

  // Handle simulation history selection
  const handleSelectHistorySimulation = (simulationId: number) => {
    navigate(`/simulation-results/${simulationId}`);
    setIsHistoryPanelOpen(false);
    onComplete(simulationId); // Call onComplete when navigating to results
  };

  // Handle segment selection
  const handleSegmentSelect = (
    segments: number[],
    filters: Record<number, SegmentPersonaFilters>
  ) => {
    setSelectedSegments(segments);
    setPersonaFilters(filters);

    // Update audience context
    updateAudienceData({
      selectedSegments: segments,
      personaFilters: filters,
      selectedUseCase: null,
    });

    // Move to use case selection step using both local state and parent notification

    // Update local state
    setLocalCurrentStep("use-case-selection");

    // Also directly notify parent about step change
    if (onStepChange) {
      onStepChange("use-case-selection");
    }
  };

  // Handle form submission with simulation ID
  const handleFormSubmit = (simId: number) => {
    setSimulationId(simId);
    setCurrentStep("results-view");
    // When navigating to results view, tell the parent we're moving forward normally
    if (onStepChange) {
      onStepChange("results-view");
    }
    // Pass the simulation ID to the parent
    onComplete(simId);
  };

  // Handle form edit
  const handleFormEdit = () => {
    // Notify parent about edit
    if (onEditStep) {
      onEditStep();
      setLocalHasEditedStep(true);
    }
  }; // Handle use case selection
  const handleUseCaseSelect = (useCase: UseCaseType) => {
    // Check if this is one of the "coming soon" use cases
    const isComingSoon = COMING_SOON_USE_CASES.includes(useCase);
    // Don't proceed if it's a coming soon use case
    if (isComingSoon) {
      return;
    }
    setFormState({});
    setSelectedUseCase(useCase);

    // Update context with selected use case
    if (useCase) {
      const useCaseTitle =
        useCases.find((uc) => uc.type === useCase)?.title || "";
      updateAudienceData({ selectedUseCase: useCaseTitle });
    }

    // Move to form filling step
    setCurrentStep("form-filling");
  };

  // Handle navigation back from use case to segments
  const handleBackFromUseCase = () => {
    setCurrentStep("segment-selection");
    // Reset edit flag when going back
    setLocalHasEditedStep(false);
  };

  // Handle navigation back from form to use case selection
  const handleBackFromForm = () => {
    setCurrentStep("use-case-selection");
    // Reset edit flag when going back
    setLocalHasEditedStep(false);
  };

  // Display a message when navigation is restricted
  const renderEditWarningMessage = () => {
    // if (localHasEditedStep && currentStep !== 'results-view') {
    //   return (
    //     <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md mb-4 text-sm flex items-center">
    //       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    //         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    //       </svg>
    //       {/* You've made changes to this step. Please complete this step to continue. */}
    //     </div>
    //   );
    // }
    return null;
  };
  // Render the appropriate form component based on selected use case
  const renderUseCaseForm = () => {
    // Check if the selected use case is a "coming soon" use case
    if (selectedUseCase && COMING_SOON_USE_CASES.includes(selectedUseCase)) {
      // Go back to use case selection if somehow a coming soon use case was selected
      setCurrentStep("use-case-selection");
      return null;
    }

    // Get saved form data for this use case type
    const savedFormData = formState[selectedUseCase as string] || {};

    switch (selectedUseCase) {
      case "create-content":
        return (
          <div className="w-full">
            {renderEditWarningMessage()}
            <ContentCreationForm
              onSubmit={handleFormSubmit}
              selectedSegmentIds={selectedSegments}
              personaFilters={personaFilters}
              onBack={handleBackFromForm}
              onEditStep={handleFormEdit}
              initialFormData={savedFormData}
              onFormDataChange={(data) =>
                updateFormState("create-content", data)
              }
            />
          </div>
        );
      case "content-testing":
        return (
          <div className="w-full">
            {renderEditWarningMessage()}
            <ContentTestingForm
              onSubmit={handleFormSubmit}
              selectedSegmentIds={selectedSegments}
              personaFilters={personaFilters}
              onBack={handleBackFromForm}
              onEditStep={handleFormEdit}
              initialFormData={savedFormData}
              onFormDataChange={(data) =>
                updateFormState("content-testing", data)
              }
            />
          </div>
        );
      case "get-insights":
        return (
          <div className="w-full">
            {renderEditWarningMessage()}
            <InsightsForm
              onSubmit={handleFormSubmit}
              selectedSegmentIds={selectedSegments}
              personaFilters={personaFilters}
              onBack={handleBackFromForm}
              onEditStep={handleFormEdit}
              initialFormData={savedFormData}
              onFormDataChange={(data) => updateFormState("get-insights", data)}
            />
          </div>
        );
      case "pricing-analysis":
        return (
          <div className="w-full">
            {renderEditWarningMessage()}
            <PricingForm
              onSubmit={handleFormSubmit}
              selectedSegmentIds={selectedSegments}
              personaFilters={personaFilters}
              onBack={handleBackFromForm}
              onEditStep={handleFormEdit}
              initialFormData={savedFormData}
              onFormDataChange={(data) =>
                updateFormState("pricing-analysis", data)
              }
            />
          </div>
        );
      case "channel-strategy":
        return (
          <div className="w-full">
            {renderEditWarningMessage()}
            <ChannelStrategyForm
              onSubmit={handleFormSubmit}
              selectedSegmentIds={selectedSegments}
              personaFilters={personaFilters}
              onBack={handleBackFromForm}
              onEditStep={handleFormEdit}
              initialFormData={savedFormData}
              onFormDataChange={(data) =>
                updateFormState("channel-strategy", data)
              }
            />
          </div>
        );
      case "ab-test-creatives-gemini":
        return (
          <div className="w-full">
            {renderEditWarningMessage()}
            <ABTestCreativesFormGemini
              onSubmit={handleFormSubmit}
              selectedSegmentIds={selectedSegments}
              personaFilters={personaFilters}
              onBack={handleBackFromForm}
              onEditStep={handleFormEdit}
              initialFormData={savedFormData}
              onFormDataChange={(data) =>
                updateFormState("ab-test-creatives-gemini", data)
              }
            />
          </div>
        );
      case "packaging-review-gemini":
        return (
          <div className="w-full">
            {renderEditWarningMessage()}
            <ABTestCreativePackagingForm
              onSubmit={handleFormSubmit}
              selectedSegmentIds={selectedSegments}
              personaFilters={personaFilters}
              onBack={handleBackFromForm}
              onEditStep={handleFormEdit}
              initialFormData={savedFormData}
              onFormDataChange={(data) =>
                updateFormState("packaging-review-gemini", data)
              }
            />
          </div>
        );
      case "attribution":
        return (
          <div className="w-full">
            {renderEditWarningMessage()}
            <AttributionForm
              onSubmit={handleFormSubmit}
              selectedSegmentIds={selectedSegments}
              personaFilters={personaFilters}
              onBack={handleBackFromForm}
              onEditStep={handleFormEdit}
              initialFormData={savedFormData}
              onFormDataChange={(data) => updateFormState("attribution", data)}
            />
          </div>
        );
      case "buyer-insights-report":
        return (
          <div className="w-full">
            {renderEditWarningMessage()}
            <BuyerInsightsForm
              onSubmit={handleFormSubmit}
              selectedSegmentIds={selectedSegments}
              personaFilters={personaFilters}
              onBack={handleBackFromForm}
              onEditStep={handleFormEdit}
              initialFormData={savedFormData}
              onFormDataChange={(data) =>
                updateFormState("buyer-insights-report", data)
              }
            />
          </div>
        );
      case "survey-and-focus-groups":
        return (
          <div className="w-full">
            {renderEditWarningMessage()}
            <SurveyAndFocusGroups
              onSubmit={handleFormSubmit}
              selectedSegmentIds={selectedSegments}
              personaFilters={personaFilters}
              onBack={handleBackFromForm}
              onEditStep={handleFormEdit}
              initialFormData={savedFormData}
              onFormDataChange={(data) =>
                updateFormState("survey-and-focus-groups", data)
              }
            />
          </div>
        );
      case "create-campaign-strategy":
        return (
          <div className="w-full">
            {renderEditWarningMessage()}
            <CreateCampaignStratergy
              onSubmit={handleFormSubmit}
              selectedSegmentIds={selectedSegments}
              personaFilters={personaFilters}
              onBack={handleBackFromForm}
              onEditStep={handleFormEdit}
              initialFormData={savedFormData}
              onFormDataChange={(data) =>
                updateFormState("create-campaign-strategy", data)
              }
            />
          </div>
        );
      case "test-use-case":
        return (
          <div className="w-full">
            {renderEditWarningMessage()}
            <TestUseCase
              onSubmit={handleFormSubmit}
              selectedSegmentIds={selectedSegments}
              personaFilters={personaFilters}
              onBack={handleBackFromForm}
              onEditStep={handleFormEdit}
              initialFormData={savedFormData}
              onFormDataChange={(data) =>
                updateFormState("test-use-case", data)
              }
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Render the appropriate step component
  const renderStep = () => {
    switch (currentStep) {
      case "segment-selection":
        console.log(audienceData.audienceName);
        // Conditionally render the Grove-specific segment selector if audience name contains "grove"
        if (
          audienceData.audienceName &&
          (audienceData.audienceName.toLowerCase().includes("grove") ||
            audienceData.audienceName.toLowerCase().includes("nrc"))
        ) {
          return (
            <SegmentsSelectorGrove
              audienceId={audienceId}
              onBack={onBack}
              onNext={handleSegmentSelect}
              onEditStep={handleFormEdit}
            />
          );
        } else if (
          audienceData.audienceName &&
          audienceData.audienceName.toLowerCase().includes("yoga")
        ) {
          console.log("yoga");
          return (
            <SegmentsSelectorYoga
              audienceId={audienceId}
              onBack={onBack}
              onNext={handleSegmentSelect}
              onEditStep={handleFormEdit}
            />
          );
        } else if (
          audienceData.audienceName &&
          audienceData.audienceName.toLowerCase().includes("kettle & fire")
        ) {
          return (
            <SegmentsSelectorKettleAndFire
              audienceId={audienceId}
              onBack={() => {
                onBack();
                updateAudienceData({
                  selectedSegments: [],
                });
              }}
              onNext={handleSegmentSelect}
              onEditStep={handleFormEdit}
            />
          );
        } else if (
          audienceData.audienceName &&
          audienceData.audienceName.toLowerCase().includes("lovevery")
        ) {
          return (
            <SegmentsSelectorLoverery
              audienceId={audienceId}
              onBack={onBack}
              onNext={handleSegmentSelect}
              onEditStep={handleFormEdit}
            />
          );
        } else if (
          audienceData.audienceName &&
          audienceData.audienceName.toLowerCase().includes("core")
        ) {
          return (
            <SegmentsSelectorCoreStack
              audienceId={audienceId}
              onBack={onBack}
              onNext={handleSegmentSelect}
              onEditStep={handleFormEdit}
            />
          );
        } else if (
          audienceData.audienceName &&
          audienceData.audienceName.toLowerCase().includes("solidigm")
        ) {
          return (
            <SegmentsSelectorSolidigm
              audienceId={audienceId}
              onBack={onBack}
              onNext={handleSegmentSelect}
              onEditStep={handleFormEdit}
            />
          );
        } else {
          return (
            <SegmentsSelector
              audienceId={audienceId}
              onBack={onBack}
              onNext={handleSegmentSelect}
              onEditStep={handleFormEdit}
            />
          );
        }
      case "results-view":
        return (
          <div className="w-full">
            {simulationId && (
              <div>
                <div className="mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep("form-filling")}
                    icon={<ArrowLeft className="w-4 h-4 mr-1" />}
                  >
                    Back to form
                  </Button>
                </div>
                <SimulationResults
                  simulationId={simulationId}
                  embedded={true}
                />
              </div>
            )}
          </div>
        );
      case "use-case-selection":
        return (
          <div className="w-full bg-gray_light rounded-tl-[30px] p-[30px] relative">
            <div>
              <h3 className="text-[28px] font-semibold text-black mb-3">
                What would you like to do today?
              </h3>
              <p className="text-xs font-normal text-[#595E64]">
                Pick a use case to get started with Kettle & Fire - v3.
              </p>
            </div>
            {renderEditWarningMessage()}

            <div className="grid md:grid-cols-3 gap-5 mt-[30px] items-center justify-center">
              {useCases
                .sort((a, b) => {
                  // Sort "coming soon" use cases to the end
                  const aIsComingSoon = COMING_SOON_USE_CASES.includes(a.type);
                  const bIsComingSoon = COMING_SOON_USE_CASES.includes(b.type);

                  if (aIsComingSoon && !bIsComingSoon) return 1; // a comes after b
                  if (!aIsComingSoon && bIsComingSoon) return -1; // a comes before b
                  return 0; // maintain original order
                })
                .map((useCase) => {
                  // Check if this is one of the "coming soon" use cases
                  const isComingSoon = COMING_SOON_USE_CASES.includes(
                    useCase.type
                  );

                  return (
                    <SimulationCard
                      key={useCase.type}
                      icon={useCase.icon}
                      title={useCase.title}
                      description={useCase.description}
                      disabled={isComingSoon}
                      comingSoon={isComingSoon}
                      onClick={() =>
                        !isComingSoon && handleUseCaseSelect(useCase.type)
                      }
                    />
                  );
                })}
            </div>
            <div className="mt-[51px]">
              <BlackButton onClick={handleBackFromUseCase}>Back</BlackButton>
            </div>
          </div>
        );
      case "form-filling":
        return renderUseCaseForm();
      default:
        return null;
    }
  };

  return (
    <>
      {renderStep()}

      <SimulationHistoryPanel
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
        onSelectSimulation={handleSelectHistorySimulation}
      />
      {isHistoryPanelOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20"
          onClick={() => setIsHistoryPanelOpen(false)}
        />
      )}
    </>
  );
};

export default UseCaseSelector;
