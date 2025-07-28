// Full updated App.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import ProgressSteps from "./components/ProgressSteps";
import LandingScreen from "./features/landing/LandingScreen";
import AudienceTypeSelect from "./features/buildAudience/AudienceTypeSelect";
import AudienceSegmentSelect from "./features/buildAudience/AudienceSegmentSelect";
import AudiencePreview from "./features/buildAudience/AudiencePreview";
import ExistingAudiences from "./features/existingAudience/ExistingAudiences";
import UseCaseSelector from "./features/simulationUseCase/UseCaseSelector";
import SimulationResults from "./features/simulationResults/SimulationResults";
import ChatPage from "./features/chat/ChatPage";
import AdminPanel from "./features/admin/AdminPanel";
import AnalysisPage from "./features/analysis/AnalysisPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AudienceProvider, useAudience } from "./context/AudienceContext";
import Auth from "./features/auth/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Button from "./components/Button";
import { ArrowLeft, LucideNetwork } from "lucide-react";
import ChatWithPersona from "./features/chatWithPersonas/ChatWithPersona";
import {
  PiBuildingOfficeLight,
  PiChartDonut,
  PiEyeglasses,
  PiEyeLight,
  PiLineSegments,
  PiNotebook,
  PiUsersThree,
} from "react-icons/pi";
import SimulationResultsContent from "./features/simulationResults/SimulationResultsContent";

type Step =
  | "landing"
  | "audience-type"
  | "audience-segment"
  | "audience-preview"
  | "existing-audiences"
  | "simulation-use-case"
  | "simulation-results";

type FlowStep =
  | "segment-selection"
  | "use-case-selection"
  | "form-filling"
  | "results-view";

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { currentStep, setCurrentStep, audienceData, updateAudienceData } = useAudience();

  const [stepMapping, setStepMapping] = useState<Step>("landing");
  const [flowType, setFlowType] = useState<"build" | "existing" | null>(null);
  const [selectedAudienceId, setSelectedAudienceId] = useState<number | null>(null);
  const [selectedAudienceName, setSelectedAudienceName] = useState<string>("");
  const [currentStepInUseCase, setCurrentStepInUseCase] = useState<FlowStep>("segment-selection");
  const [hasEditedStep, setHasEditedStep] = useState<boolean>(false);
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [visitedSteps, setVisitedSteps] = useState<Set<Step>>(new Set(["landing"]));
  const [visitedUseCaseSteps, setVisitedUseCaseSteps] = useState<Set<FlowStep>>(new Set());
  const [currentSimulationId, setCurrentSimulationId] = useState<number | null>(null);

  useEffect(() => {
    updateAudienceData({
      segmentType: null,
      specificSegment: "",
      qualitativeInfo: "",
      uploadedFile: null,
      audienceId: null,
      audienceName: "",
      selectedUseCase: null,
      selectedSegments: [],
      personaFilters: {},
    });
  }, [audienceData.type, audienceData.websiteUrl]);

  const updateStepMapping = useCallback((step: number) => {
    switch (step) {
      case 1: setStepMapping("audience-type"); break;
      case 2: setStepMapping("audience-segment"); break;
      case 3: setStepMapping("audience-preview"); break;
      default: setStepMapping("landing");
    }
  }, []);

  const handleBuildAudience = useCallback(() => {
    setFlowType("build");
    setCurrentStep(1);
    updateStepMapping(1);
  }, [setFlowType, setCurrentStep, updateStepMapping]);

  const handleSelectExisting = useCallback(() => {
    setFlowType("existing");
    setStepMapping("existing-audiences");
  }, [setFlowType, setStepMapping]);

  const handleNext = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    updateStepMapping(nextStep);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateStepMapping(prevStep);
    } else {
      setStepMapping("landing");
      setFlowType(null);
    }
  };

  const handleReset = () => {
    setStepMapping("landing");
    setCurrentStep(1);
    setFlowType(null);
    updateAudienceData({
      type: null,
      websiteUrl: "",
      segmentType: null,
      specificSegment: "",
      qualitativeInfo: "",
      uploadedFile: null,
      audienceId: null,
      audienceName: "",
      selectedUseCase: null,
      selectedSegments: [],
      personaFilters: {},
    });
  };

  useEffect(() => {
    if (location.pathname === "/build-audience") {
      handleBuildAudience();
    } else if (location.pathname === "/simulate") {
      handleSelectExisting();
    }
  }, [location.pathname, handleBuildAudience, handleSelectExisting]);

  const handleSelectAudience = (audienceId: number, audienceName: string) => {
    setSelectedAudienceId(audienceId);
    setSelectedAudienceName(audienceName);
    updateAudienceData({
      audienceId,
      audienceName,
      selectedSegments: [],
      personaFilters: {},
      type: null,
      websiteUrl: "",
      segmentType: null,
      specificSegment: "",
      qualitativeInfo: "",
      uploadedFile: null,
      selectedUseCase: null,
    });
    setStepMapping("simulation-use-case");
    setCurrentStepInUseCase("segment-selection");
    setHasEditedStep(false);
    setVisitedSteps(new Set(["existing-audiences", "simulation-use-case"]));
    setVisitedUseCaseSteps(new Set());
  };

  const handleFormDataChange = (useCaseType: string, data: Record<string, any>) => {
    setFormState((prev) => ({
      ...prev,
      [useCaseType.toLowerCase()]: data,
    }));
  };

  const hasVisitedStep = (step: Step): boolean => visitedSteps.has(step);
  const hasVisitedUseCaseStep = (step: FlowStep): boolean => visitedUseCaseSteps.has(step);

  const handleUseCaseStepChange = (newStep: FlowStep) => {
    const currentIndex = ["segment-selection", "use-case-selection", "form-filling", "results-view"].indexOf(currentStepInUseCase);
    const newIndex = ["segment-selection", "use-case-selection", "form-filling", "results-view"].indexOf(newStep);

    setCurrentStepInUseCase(newStep);

    if (newIndex < currentIndex) {
      const newVisited = new Set([...visitedUseCaseSteps]);
      ["use-case-selection", "form-filling", "results-view"].forEach((step) => {
        if (["use-case-selection", "form-filling", "results-view"].indexOf(step) > newIndex) {
          newVisited.delete(step as FlowStep);
        }
      });
      setVisitedUseCaseSteps(newVisited);
    } else {
      setVisitedUseCaseSteps((prev) => new Set([...prev, newStep]));
    }

    if (
      (currentStepInUseCase === "segment-selection" && newStep === "use-case-selection") ||
      (currentStepInUseCase === "use-case-selection" && newStep === "form-filling") ||
      (currentStepInUseCase === "form-filling" && newStep === "results-view")
    ) {
      setHasEditedStep(false);
    }
  };

  const getProgressSteps = () => {
    if (flowType === "build") {
      return [
        {
          label: audienceData.type ? `Type: ${audienceData.type}` : "Audience Type",
          completed: currentStep > 1,
          icons: <PiBuildingOfficeLight size={24} />,
          current: currentStep === 1,
          onClick: currentStep > 1 ? () => { setCurrentStep(1); updateStepMapping(1); } : undefined,
        },
        {
          label: audienceData.segmentType ? `Segments (${audienceData.segmentType})` : "Define Segments",
          completed: currentStep > 2,
          current: currentStep === 2,
          icons: <PiLineSegments size={24} />,
          onClick: currentStep > 2 ? () => { setCurrentStep(2); updateStepMapping(2); } : undefined,
        },
        {
          label: "Preview & Save",
          completed: false,
          current: currentStep === 3,
          icons: <PiEyeglasses size={24} />,
          onClick: undefined,
        },
      ];
    } else if (flowType === "existing") {
      return [
        {
          label: selectedAudienceName ? `Audience: ${selectedAudienceName}` : "Select Audience",
          completed: hasVisitedStep("simulation-use-case") || stepMapping === "simulation-results",
          current: stepMapping === "existing-audiences",
          icons: <PiUsersThree size={24} />,
          onClick: () => {
            setStepMapping("existing-audiences");
            setHasEditedStep(false);
          },
        },
        {
          label: "Select Segments",
          completed: hasVisitedUseCaseStep("use-case-selection") || hasVisitedUseCaseStep("form-filling") || hasVisitedUseCaseStep("results-view") || stepMapping === "simulation-results",
          current: stepMapping === "simulation-use-case" && currentStepInUseCase === "segment-selection",
          icons: <PiChartDonut size={24} />,
          onClick: hasVisitedUseCaseStep("segment-selection") || selectedAudienceId ? () => {
            setStepMapping("simulation-use-case");
            setCurrentStepInUseCase("segment-selection");
            setHasEditedStep(false);
          } : undefined,
        },
        {
          label: audienceData.selectedUseCase ? `Use Case: ${audienceData.selectedUseCase}` : "Select Use Case",
          completed: hasVisitedUseCaseStep("form-filling") || hasVisitedUseCaseStep("results-view") || stepMapping === "simulation-results",
          current: stepMapping === "simulation-use-case" && currentStepInUseCase === "use-case-selection",
          icons: <LucideNetwork size={24} />,
          onClick: hasVisitedUseCaseStep("use-case-selection") || audienceData.selectedUseCase ? () => {
            setStepMapping("simulation-use-case");
            setCurrentStepInUseCase("use-case-selection");
            if (currentStepInUseCase === "form-filling" || currentStepInUseCase === "results-view") {
              setHasEditedStep(false);
            }
          } : undefined,
        },
        {
          label: "Complete Form",
          completed: hasVisitedUseCaseStep("results-view") || stepMapping === "simulation-results",
          current: stepMapping === "simulation-use-case" && currentStepInUseCase === "form-filling",
          icons: <PiNotebook size={24} />,
          onClick: hasVisitedUseCaseStep("form-filling") || formState[audienceData.selectedUseCase?.toLowerCase()] ? () => {
            setStepMapping("simulation-use-case");
            setCurrentStepInUseCase("form-filling");
            if (currentStepInUseCase === "results-view") {
              setHasEditedStep(false);
            }
          } : undefined,
        },
        {
          label: "View Results",
          completed: false,
          current: stepMapping === "simulation-results" || (stepMapping === "simulation-use-case" && currentStepInUseCase === "results-view"),
          icons: <PiEyeLight size={24} />,
          onClick: hasVisitedUseCaseStep("results-view") || stepMapping === "simulation-results" ? () => {
            setStepMapping("simulation-results");
          } : undefined,
        },
      ];
    }
    return [];
  };

  const renderCurrentStep = () => {
    switch (stepMapping) {
      case "landing":
        return <LandingScreen onBuildAudience={handleBuildAudience} onSelectExisting={handleSelectExisting} />;
      case "audience-type":
        return <AudienceTypeSelect onNext={handleNext} onBack={() => { handleBack(); handleReset(); window.location.href = "/"; }} />;
      case "audience-segment":
        return <AudienceSegmentSelect onNext={handleNext} onBack={handleBack} />;
      case "audience-preview":
        return <AudiencePreview onSave={handleReset} onBack={handleBack} />;
      case "existing-audiences":
        return <ExistingAudiences onSelectAudience={handleSelectAudience} onBack={() => { handleReset(); window.location.href = "/"; }} />;
      case "simulation-use-case":
        return (
          <UseCaseSelector
            onComplete={(simulationId) => {
              setCurrentSimulationId(simulationId);
              setStepMapping("simulation-results");
              setVisitedSteps((prev) => new Set([...prev, "simulation-results"]));
            }}
            onBack={() => {
              setStepMapping("existing-audiences");
              setHasEditedStep(false);
            }}
            audienceId={selectedAudienceId || 0}
            onStepChange={handleUseCaseStepChange}
            onEditStep={() => setHasEditedStep(true)}
            currentStep={currentStepInUseCase}
            hasEditedStep={hasEditedStep}
            onFormDataChange={handleFormDataChange}
            formData={formState[audienceData.selectedUseCase?.toLowerCase()] || {}}
          />
        );
      case "simulation-results":
        return (
          <div className="w-full" style={{ overflow: "hidden" }}>
            {currentSimulationId ? (
              <div className="h-full flex flex-col">
                <div className="flex-grow overflow-hidden rounded-tl-[30px]">
                  <SimulationResultsContent simulationId={currentSimulationId} onBack={() => {
                    setStepMapping("simulation-use-case");
                    setCurrentStepInUseCase("form-filling");
                  }} />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No simulation results to display.</p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  setStepMapping("simulation-use-case");
                  setCurrentStepInUseCase("segment-selection");
                }}>
                  Start a new simulation
                </Button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) return <Auth onAuthSuccess={() => {}} />;

  return (
    <Layout noContainer={true}>
      {location.pathname === "/" && (
        <div className="pl-[30px]">
          <LandingScreen onSelectExisting={() => navigate("/simulate")} onBuildAudience={() => navigate("/build-audience")} />
        </div>
      )}
      {stepMapping !== "landing" && (
        <div className="flex items-start gap-[30px] relative">
          <ProgressSteps steps={getProgressSteps()} />
          {renderCurrentStep()}
        </div>
      )}
    </Layout>
  );
};

const AuthRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (isAuthenticated) {
    const state = location.state as { from?: { pathname: string } };
    const from = state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }
  return <Auth onAuthSuccess={() => {}} />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><AppContent /></ProtectedRoute>} />
      <Route path="/build-audience" element={<ProtectedRoute><AppContent /></ProtectedRoute>} />
      <Route path="/simulate" element={<ProtectedRoute><AppContent /></ProtectedRoute>} />
      <Route path="/simulation-results/:simulationId" element={<ProtectedRoute><SimulationResults /></ProtectedRoute>} />
      <Route path="/analysis" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
      <Route path="/analysis/:simulationId" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      <Route path="/chat-with-persona" element={<ProtectedRoute><ChatWithPersona /></ProtectedRoute>} />
      <Route path="/auth" element={<AuthRoute />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AudienceProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AudienceProvider>
    </AuthProvider>
  );
}

export default App;
