import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { jsonrepair } from "jsonrepair";
import stringWidth from "string-width";
import {
  MessageSquare,
  BarChart2,
  Brain,
  User,
  Loader2,
  ChevronDown,
  HelpCircle,
  FileText,
  Target,
  Briefcase,
  Users,
  Calendar,
  Filter,
  Layers,
  Bookmark,
  CheckCircle2,
  ChevronUp,
  Globe,
  Megaphone,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  ChevronLeft,
  Copy,
  Send as SendIcon,
  Download,
  RefreshCw,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import Card from "../../components/Card";
import "github-markdown-css/github-markdown.css";
import BarChartComponent from "../../components/BarChart";
import LineChartComponent from "../../components/LineChart";
import PieChart from "../../components/PieChart";
import RadarChart from "../../components/RadarChart";
import HorizontalBarChart from "../../components/HorizontalBarChart";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import TableView from "@/components/TableView";
import {
  ChatMsend,
  CloseButton,
  CopyIcon,
  DownloadIcon,
  NoChatIcon,
  ReloadIcon,
  SimulationInputIcon,
} from "@/icons/SimulationIcons";
import {
  PiAddressBook,
  PiImagesLight,
  PiLineSegments,
  PiPerson,
  PiUser,
  PiUsers,
} from "react-icons/pi";
import { BiFilterAlt } from "react-icons/bi";
import { FaRegUser } from "react-icons/fa";
import {
  CloseXIcon,
  DetailedAnalysisIcon,
  PortsIcon,
  SMS_MailIcon,
} from "@/icons/Other";
import ChannelEventStrategyDesign from "./ChannelEventStrategyDesign";
import BuyerInsightsREportB2C from "./BuyerInsightsREportB2C";
import ImageSurvey from "./ImageSurvey";
import AB_estMessaging from "./AB_estMessaging";
import BlackButton from "@/components/Buttons/BlackButton";
import TooltipBox from "@/components/Buttons/TooltipBox";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "";

interface Persona {
  id: number;
  name: string;
  data: any;
}

interface SimulationData {
  id: number;
  audience_id: number;
  simulation_response: string;
  source_model: string;
  optimization_response: string;
  status: string;
  personas: Persona[];
  created_at: string;
  updated_at: string;
  content?: string; // Optional content field that may contain JSON data
  segments?: {
    id: number;
    name: string;
  }[];
  num_tabs?: number;
}

interface ChatMessage {
  role: string;
  content: string;
  timestamp: string;
}

interface SimulationResultsContentProps {
  simulationId: string | number;
  onError?: (error: string) => void;
  isListCollapsed?: string;
  setIsListCollapsed?: (collapsed: boolean) => void;
  onBack?: () => void;
}

// Update TableData interface to include horizontal chart type
interface TableData {
  type: "bar" | "line" | "table" | "pie" | "radar" | "horizontal_chart";
  title?: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
  headers?: string[];
  nameKey: string; // Required for pie and radar charts
  valueKey: string; // Required for pie and radar charts
  messages?: { text: string; percentage?: number; score?: number }[]; // For horizontal chart
}

// Add type definitions for chart components
interface ChartProps {
  data: any[];
  xAxis: string;
  yAxis: string;
  title?: string;
}

// Add type for parsed response
interface ParsedResponse {
  output: string;
  analysis: string;
  tables: TableData[];
  hasJsonBlock: boolean;
  winner?: number;
  scores?: number[];
  allData?: any;
}

interface PersonaFilters {
  [segmentId: string]: {
    [filterType: string]: string[] | [];
  };
}

interface ContentData {
  [key: string]: unknown;
  audience_id?: number;
  audience_name?: string;
  name?: string;
  goal?: string;
  source_model?: string;
  task?: string;
  context?: string;
  content_type?: string;
  content_subject?: string;
  company_context?: string;
  segment_ids?: number[];
  persona_filters?: PersonaFilters;
  images?: string[];
}

// Add helper function at the top-level of the component (or file)
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const SimulationResultsContent: React.FC<SimulationResultsContentProps> = ({
  simulationId,
  onError,
  isListCollapsed,
  setIsListCollapsed,
  onBack,
}): React.ReactElement => {
  const { state } = useLocation();
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"simulation" | "advanced">(
    "simulation"
  );
  const [chatTab, setChatTab] = useState<"simulation" | "persona">(
    "simulation"
  );

  const [selectedPersona, setSelectedPersona] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const [showHoverMessage, setShowHoverMessage] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<
    "pending" | "running" | "completed" | "partial"
  >("pending");
  const [optimizationStatus, setOptimizationStatus] = useState<
    "pending" | "running" | "completed"
  >("pending");
  const [currentStep, setCurrentStep] = useState<string>("Loading simulation");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState("");
  const [copied, setCopied] = useState(false);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "exporting" | "success" | "error"
  >("idle");
  const [exportError, setExportError] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportEmailTo, setExportEmailTo] = useState("");
  const [exportEmailStatus, setExportEmailStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [exportEmailError, setExportEmailError] = useState("");
  const [rerunLoading, setRerunLoading] = useState(false);
  const [rerunError, setRerunError] = useState("");
  const [activeChatTab, setActiveChatTab] = useState("simulation");
  const [sliderStyle, setSliderStyle] = useState({});
  const chatRef = useRef(null);
  const simulationRef = useRef(null);
  const [showInputAllProfiles, setShowInputAllProfiles] = useState(false);
  const visibleCount = 6;
  const personasToShow = showInputAllProfiles
    ? simulation?.personas
    : simulation?.personas.slice(0, visibleCount);

  useEffect(() => {
    if (isListCollapsed === "simulation") {
      // setActiveChatTab("chat");
      setActiveChatTab("simulation");
      setIsChatCollapsed(true);
    }
  }, [isListCollapsed]);
  useEffect(() => {
    const el: any =
      activeChatTab === "chat" ? chatRef.current : simulationRef.current;
    if (el) {
      setSliderStyle({
        width: `${el.offsetWidth}px`,
        transform: `translateX(${el.offsetLeft}px)`,
      });
    }
  }, [activeChatTab, isListCollapsed]);
  const navigate = useNavigate();

  const [popupImage, setPopupImage] = useState<string | null>(null);
  const [popupImageVisible, setPopupImageVisible] = useState<boolean>(false);
  const [popupText, setPopupText] = useState<any>(null);
  // const [simulationJsonData , setSimulationJsonData] = useState<any>(null);

  // State for collapsible cards in content summary
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    details: true,
    audience: false,
    additional: false,
    personas: false,
    analysis: false,
  });

  // State for dropdown
  const [isDetailsDropdownOpen, setIsDetailsDropdownOpen] = useState(false);

  // Function to toggle expanded/collapsed state of cards
  const toggleCard = (cardName: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardName]: !prev[cardName],
    }));
  };

  // Refs for scrolling and input focus
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Add at the top with other useState
  const [cachedPdfUrl, setCachedPdfUrl] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const POLL_INTERVAL = 10000; // 5 seconds
  const intervalRef = useRef<any>(null); // =======>Change<=======

  const clearPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // =======>Change<=======
      intervalRef.current = null; // =======>Change<=======
    }
  };

  const startPolling = () => {
    if (intervalRef.current) return; // Avoid multiple intervals
    intervalRef.current = setInterval(() => {
      fetchSimulationStatus(false); // =======>Change<=======
    }, POLL_INTERVAL);
  };
  useEffect(() => {
    // Reset state when simulationId changes
    setSimulation(null);
    setLoading(true);
    setError(null);
    setChatHistory([]);
    setSelectedPersona(null);
    setActiveTab("simulation");
    setChatTab("simulation");

    if (!simulationId) {
      const errorMsg = "No simulation ID provided";
      setError(errorMsg);
      if (onError) onError(errorMsg);
      setLoading(false);
      return;
    }
    clearPolling();
    // Initial fetch - let's determine if we need to start polling
    fetchSimulationStatus(true);

    // Clean up interval on component unmount
    return () => {
      clearPolling();
    };
  }, [simulationId]); // Only depend on simulationId, not on simulation data

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (!isChatCollapsed) {
      fetchChatHistory();
    }
  }, [isChatCollapsed]);

  const fetchSimulationStatus = async (initialFetch = false) => {
    if (!simulationId) return;

    try {
      const response = await fetch(`${API_URL}/simulations/${simulationId}`, {
        credentials: "include",
      });
      console.log();

      if (!response.ok) {
        throw new Error("Failed to fetch simulation status");
      }

      const data = await response.json();
      setSimulation(data);

      // If simulation_response is available, show partial results
      if (data.simulation_response) {
        // Check if optimization_response is empty or just spaces
        const hasOptimizationResponse =
          data.optimization_response &&
          data.optimization_response.trim() !== "";

        if (hasOptimizationResponse) {
          // Both responses are ready
          setSimulationStatus("completed");
          setOptimizationStatus("completed");
          setLoading(false);
          clearPolling();
        } else {
          // Only simulation_response is ready, optimization still in progress or not needed
          setSimulationStatus("partial");
          setOptimizationStatus("running");
          setLoading(false);
          clearPolling();
          // if (data.num_tabs === 1) {
          // }
          // If num_tabs is 1, don't poll for optimization response
          if (data.num_tabs === 1) {
          } else if (initialFetch) {
          }
        }
      } else {
        // Simulation is still running
        setSimulationStatus("running");
        setOptimizationStatus("pending");
        setCurrentStep(getSimulationStep(data.status));

        // Only start polling if this is the initial fetch and we need to poll
        if (initialFetch) {
          startPolling();
        }
      }
    } catch (err) {
      console.error("Error fetching simulation status:", err);
      setError("Failed to load simulation status. Please try again.");
      setLoading(false);
      clearPolling();
    }
  };

  const getSimulationStep = (status: string): string => {
    switch (status) {
      case "initializing":
        return "Loading";
      case "segment_processing":
        return "Processing audience segments";
      case "generating_personas":
        return "Generating audience profiles";
      case "running_simulation":
        return "Running simulation with profiles";
      case "analyzing_results":
        return "Analyzing simulation results";
      case "optimizing":
        return "Optimizing recommendations";
      case "complete":
        return "Simulation complete!";
      default:
        return "Processing";
    }
  };

  const fetchChatHistory = async (personaId?: number) => {
    if (!simulationId) return;

    try {
      let url = "";
      if (chatTab === "simulation") {
        url = `${API_URL}/chat/simulation/${simulationId}`;
      } else if (chatTab === "persona" && personaId) {
        url = `${API_URL}/chat/simulation/marketing/${simulationId}/persona/${personaId}`;
      } else {
        return;
      }

      const response = await fetch(url, {
        credentials: "include",
        signal: AbortSignal.timeout(300000), // 5 minute timeout
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No chat history yet, set empty array
          setChatHistory([]);
          return;
        }
        throw new Error("Failed to fetch chat history");
      }

      const data = await response.json();
      setChatHistory(data.messages || []);
    } catch (err) {
      console.error("Error fetching chat history:", err);
      setChatHistory([]);
    }
  };

  const sendChatMessage = async () => {
    if (!simulationId || !chatMessage.trim() || sendingMessage) return;

    setSendingMessage(true);

    try {
      let url = "";
      let body = { message: chatMessage };
      let newUserMessage: ChatMessage;

      // Set the correct URL and user message role based on the active chat tab
      if (chatTab === "simulation") {
        url = `${API_URL}/chat/simulation/${simulationId}`;
        // For simulation chat, use 'use' role
        newUserMessage = {
          role: "use",
          content: chatMessage,
          timestamp: new Date().toISOString(),
        };
      } else if (chatTab === "persona" && selectedPersona) {
        url = `${API_URL}/chat/simulation/${simulationId}/persona/${selectedPersona}`;
        // For persona chat, use 'user' role
        newUserMessage = {
          role: "use_persona",
          content: chatMessage,
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new Error("Invalid chat target");
      }

      // Add user message immediately for better UX
      setChatHistory((prev) => [...prev, newUserMessage]);
      setChatMessage(""); // Clear input field immediately

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(300000), // 5 minute timeout
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      setChatHistory(data.chat_history || []);

      // Focus back to textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err) {
      console.error("Error sending chat message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  const selectPersona = (personaId: number) => {
    setSelectedPersona(personaId);
    fetchChatHistory(personaId);
  };

  const handleChatTabChange = (tab: "simulation" | "persona") => {
    setChatTab(tab);
    if (tab === "simulation") {
      fetchChatHistory();
    } else if (tab === "persona" && simulation?.personas?.length) {
      // Select first persona by default if none selected
      const personaId = selectedPersona || simulation.personas[0].id;
      setSelectedPersona(personaId);
      fetchChatHistory(personaId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  // Define an interface for persona info
  interface PersonaInfo {
    name: string;
    age: string;
    job_title: string;
    occupation: string;
    behavioral_archetype: string;
    organizational_influence: string;
  }

  const extractPersonaInfo = (
    personaData: string | Record<string, unknown>
  ): PersonaInfo => {
    try {
      const data =
        typeof personaData === "string" ? JSON.parse(personaData) : personaData;

      // Process each field, handling complex nested structures if present
      const extractField = (
        field: string,
        defaultValue: string = "N/A"
      ): string => {
        const value = data[field];

        // If the field is missing or null/undefined
        if (value === undefined || value === null) return defaultValue;

        // If the field is a simple value, return it as a string
        if (typeof value !== "object") return String(value);

        // For complex objects, JSON stringify them with formatting
        try {
          // Don't fully expand very deep objects to avoid UI clutter
          if (Object.keys(value as Record<string, unknown>).length > 5) {
            return `Complex data (${
              Object.keys(value as Record<string, unknown>).length
            } properties)`;
          }
          return JSON.stringify(value, null, 2);
        } catch (error) {
          console.error("Error processing complex data:", error);
          return "Complex data";
        }
      };

      return {
        name: extractField("name", "Unknown"),
        age: extractField("age"),
        job_title: extractField("job_title"),
        occupation: extractField("occupation"),
        behavioral_archetype: extractField("behavioral_archetype"),
        organizational_influence: extractField("organizational_influence"),
      };
    } catch (error) {
      console.error("Error parsing persona data:", error);
      return {
        name: "Unknown",
        age: "N/A",
        job_title: "N/A",
        occupation: "N/A",
        behavioral_archetype: "N/A",
        organizational_influence: "N/A",
      };
    }
  };

  // Update the parseContentField function with proper typing
  const parseContentField = (): ContentData => {
    if (!simulation?.content) {
      return {};
    }

    try {
      return JSON.parse(simulation.content) as ContentData;
    } catch (error) {
      console.error("Error parsing content field:", error);
      return {};
    }
  };

  const renderSimulationSummaryDropdown = () => {
    const contentData = parseContentField();

    if (!contentData || !simulation) return null;

    // Function to render icon based on the key
    const getIconForKey = (key: string): JSX.Element => {
      switch (key) {
        case "audience_id":
        case "audience_name":
          return <Users className="h-4 w-4 text-blue-600" />;
        case "task":
          return <Brain className="h-4 w-4 text-indigo-600" />;
        case "name":
          return <FileText className="h-4 w-4 text-teal-600" />;
        case "goal":
          return <Target className="h-4 w-4 text-green-600" />;
        case "context":
          return <MessageSquare className="h-4 w-4 text-amber-600" />;
        case "content_type":
          return <FileText className="h-4 w-4 text-purple-600" />;
        case "content_subject":
          return <Bookmark className="h-4 w-4 text-pink-600" />;
        case "company_context":
          return <Briefcase className="h-4 w-4 text-gray-600" />;
        case "segment_ids":
          return <Layers className="h-4 w-4 text-blue-600" />;
        case "persona_filters":
          return <Filter className="h-4 w-4 text-orange-600" />;
        default:
          return <FileText className="h-4 w-4 text-blue-600" />;
      }
    };

    // Extract important fields for the summary section
    const importantFields = ["name", "audience_name", "goal", "content_type"];
    const importantData = Object.fromEntries(
      Object.entries(contentData).filter(([key]) =>
        importantFields.includes(key)
      )
    );

    // Additional fields that aren't segments, filters, or personas
    const additionalFields = Object.fromEntries(
      Object.entries(contentData).filter(
        ([key]) =>
          !importantFields.includes(key) &&
          key !== "segment_ids" &&
          key !== "persona_filters" &&
          key !== "audience_id"
      )
    );

    const formatValue = (key: string, value: unknown): React.ReactNode => {
      if (value === null || value === undefined) {
        return <span className="text-gray-400">Not specified</span>;
      }

      if (typeof value === "string") {
        return <span>{value}</span>;
      }

      if (typeof value === "number") {
        return <span>{value}</span>;
      }

      if (typeof value === "boolean") {
        return <span>{value ? "Yes" : "No"}</span>;
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          return <span className="text-gray-400">None</span>;
        }
        return (
          <ul className="list-disc list-inside space-y-1">
            {value.map((item, index) => (
              <li key={index} className="text-sm">
                {typeof item === "object" ? JSON.stringify(item) : String(item)}
              </li>
            ))}
          </ul>
        );
      }

      if (typeof value === "object") {
        return (
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(value, null, 2)}
          </pre>
        );
      }

      return <span>{String(value)}</span>;
    };

    return (
      <div className="absolute z-10 left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-h-[75vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 bg-blue-500 p-2 rounded-full text-white">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-blue-800">
                Simulation Inputs
              </h2>
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="mr-2 h-3.5 w-3.5" />
              <span>{new Date(simulation.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-5">
          {/* Key information grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Object.entries(importantData).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center bg-blue-50/50 p-3 rounded-lg border border-blue-100"
              >
                <div className="mr-3 bg-blue-100 p-2 rounded-full">
                  {getIconForKey(key)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {value as string}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Segments section */}
          {contentData.segment_ids && (
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <div className="mr-2 bg-green-100 p-1.5 rounded-md">
                  <Layers className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-base font-medium text-green-800">
                  Audience Segments
                </h3>
              </div>
              <div className="bg-green-50/30 p-3 rounded-lg border border-green-100">
                {formatValue("segment_ids", contentData.segment_ids)}
              </div>
            </div>
          )}

          {/* Filters section */}
          {contentData.persona_filters &&
            Object.keys(contentData.persona_filters).length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <div className="mr-2 bg-amber-100 p-1.5 rounded-md">
                    <Filter className="h-4 w-4 text-amber-600" />
                  </div>
                  <h3 className="text-base font-medium text-amber-800">
                    Applied Filters
                  </h3>
                </div>
                <div className="bg-amber-50/30 rounded-lg border border-amber-100">
                  {formatValue("persona_filters", contentData.persona_filters)}
                </div>
              </div>
            )}

          {contentData.images && contentData.images.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center mb-2">
                {/* <div className="mr-2 bg-purple-100 p-1.5 rounded-md">
											<Image className="h-4 w-4 text-purple-600" />
										</div> */}
                <h3 className="text-base font-medium text-purple-800">
                  Images
                </h3>
              </div>
              <div className="bg-purple-50/30 p-3 rounded-lg border border-purple-100">
                {contentData.images.map((imageData, index) => (
                  <img
                    key={index}
                    src={imageData}
                    alt={`Image ${index + 1}`}
                    className="w-full h-auto rounded-lg mb-2"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Used Personas - COLLAPSIBLE */}
          {simulation.personas && simulation.personas.length > 0 && (
            <div className="mb-6 border border-purple-100 rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-50/70 cursor-pointer"
                onClick={() => toggleCard("personas")}
              >
                <div className="flex items-center">
                  <div className="mr-2 bg-purple-100 p-1.5 rounded-md">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="text-base font-medium text-purple-800">
                    Used Profiles ({simulation.personas.length})
                  </h3>
                </div>
                <div className="text-purple-600">
                  {expandedCards.personas ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </div>

              {expandedCards.personas && (
                <div className="p-3 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {simulation.personas.map((persona, index) => {
                      const personaInfo = extractPersonaInfo(persona.data);
                      return (
                        <div
                          key={index}
                          className="bg-purple-50/40 p-3 rounded-lg border border-purple-100"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="bg-purple-100 p-1 rounded-full">
                                <User className="h-3.5 w-3.5 text-purple-600" />
                              </div>
                              <p className="font-medium text-gray-800">
                                {personaInfo.name}
                              </p>
                            </div>
                            <div className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              {persona.name
                                ? persona.name.replace(/_/g, " ")
                                : "Profile"}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2 border-t border-purple-100/60 pt-2 text-xs">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="h-3 w-3 text-purple-600/70" />
                              <p>
                                <span className="text-gray-600">Age:</span>{" "}
                                <span className="text-gray-900 font-medium">
                                  {personaInfo.age}
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <Briefcase className="h-3 w-3 text-purple-600/70" />
                              <p>
                                <span className="text-gray-600">Role:</span>{" "}
                                <span className="text-gray-900 font-medium">
                                  {personaInfo.job_title}
                                </span>
                              </p>
                            </div>
                            {personaInfo.behavioral_archetype !== "N/A" && (
                              <div className="col-span-2 flex items-center space-x-1.5">
                                <Brain className="h-3 w-3 text-purple-600/70" />
                                <p>
                                  <span className="text-gray-600">
                                    Archetype:
                                  </span>{" "}
                                  <span className="text-gray-900 font-medium">
                                    {personaInfo.behavioral_archetype}
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Additional Information */}
          {Object.keys(additionalFields).length > 0 && (
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <div className="mr-2 bg-gray-100 p-1.5 rounded-md">
                  <HelpCircle className="h-4 w-4 text-gray-600" />
                </div>
                <h3 className="text-base font-medium text-gray-800">
                  Additional Information
                </h3>
              </div>

              <div className="space-y-3">
                {Object.entries(additionalFields).map(([key, value], idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50/70 p-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center mb-1.5 pb-1.5 border-b border-gray-100">
                      <div className="bg-gray-100 p-1.5 rounded mr-2">
                        {getIconForKey(key)}
                      </div>
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {key.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="text-sm ml-1 mt-2">
                      {formatValue(key, value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={() => setIsDetailsDropdownOpen(false)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  const renderLoadingAnimation = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <img src="/images/loadingSimulationImage.png" alt="" />
      <h3 className="text-[28px] mt-4 font-semibold mb-2 flex items-center text-primary2">
        <span className="flex items-center space-x-1 text-primary2 text-2xl font-bold">
          <span>
            {simulationStatus === "pending"
              ? "Starting simulation"
              : currentStep}
          </span>
          <span className="animate-beep [animation-delay:0ms]">.</span>
          <span className="animate-beep [animation-delay:200ms]">.</span>
          <span className="animate-beep [animation-delay:400ms]">.</span>
        </span>
      </h3>
      <p className="text-gray-500 text-center max-w-md">
        {simulationStatus === "pending"
          ? "We are initializing your simulation..."
          : currentStep == "Loading simulation"
          ? "Please wait for some time"
          : "This process typically takes 2-5 minutes. Please wait while we run your simulation."}
      </p>
    </div>
  );

  // Update the parseSimulationResponse function with proper typing
  const parseSimulationResponse = (response: string): ParsedResponse => {
    // Check if response contains a JSON block
    const jsonBlockMatch = response.match(
      /((\[[^\}]{3,})?\{s*[^\}\{]{3,}?:.*\}([^\{]+\])?)/
    );
    if (jsonBlockMatch) {
      try {
        const jsonContent = jsonBlockMatch[1];
        console.log(1);
        let parsedData = JSON.parse(jsonContent);

        if (Array.isArray(parsedData)) {
          for (const item of parsedData) {
            if (item.output) {
              parsedData = item;
              break;
            }
          }
        }

        if (typeof parsedData.tables === "string") {
          try {
            console.log(2);
            parsedData.tables = parsedData.tables
              .replace(/```json/g, "")
              .replace(/```/g, "")
              .replace(/\n/g, "")
              .replace(/\r/g, "");
            parsedData.tables = JSON.parse(jsonrepair(parsedData.tables));
          } catch (error) {
            console.error("Error parsing tables:", error);
          }
        } else if (parsedData.tables && !Array.isArray(parsedData.tables)) {
          parsedData.tables = [parsedData.tables];
        }

        console.log("Content file", parsedData.tables);

        return {
          output: parsedData.output || "",
          analysis: parsedData.analysis || "",
          tables: parsedData.tables || [],
          hasJsonBlock: true,
          winner: parsedData.winner,
          scores: parsedData.scores,
          allData: parsedData,
        };
      } catch (error) {
        console.error("Error parsing JSON block:", error);
        return {
          output: response,
          analysis: "",
          tables: [],
          hasJsonBlock: false,
          winner: undefined,
          scores: undefined,
        };
      }
    } else {
      try {
        console.log(3);
        let parsedData = JSON.parse(jsonrepair(response));
        if (Array.isArray(parsedData)) {
          for (const item of parsedData) {
            if (item.output) {
              parsedData = item;
              break;
            }
          }
        }

        if (typeof parsedData.tables === "string") {
          try {
            console.log(4);
            parsedData.tables = parsedData.tables
              .replace(/```json/g, "")
              .replace(/```/g, "")
              .replace(/\n/g, "")
              .replace(/\r/g, "");
            parsedData.tables = JSON.parse(jsonrepair(parsedData.tables));
          } catch (error) {
            console.error("Error parsing tables:", error);
          }
        } else if (Array.isArray(parsedData.tables)) {
          console.log(5);
          parsedData.tables = parsedData.tables.map((table: any) => {
            if (typeof table === "string") {
              table = table
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .replace(/\n/g, "")
                .replace(/\r/g, "");
              console.log(table);
              return JSON.parse(jsonrepair(table));
            }
            return table;
          });
        } else if (parsedData.tables && !Array.isArray(parsedData.tables)) {
          parsedData.tables = [parsedData.tables];
        }

        console.log("Content file", parsedData.tables);
        console.log("Content file", parsedData.output);

        return {
          output: parsedData.output || "",
          analysis: parsedData.analysis || "",
          tables: parsedData.tables || [],
          hasJsonBlock: true,
          winner: parsedData.winner,
          scores: parsedData.scores,
          allData: parsedData,
        };
      } catch (error) {
        console.error("Error parsing JSON block:", error);
        return {
          output: response,
          analysis: "",
          tables: [],
          hasJsonBlock: false,
          winner: undefined,
          scores: undefined,
        };
      }
    }

    return {
      output: response,
      analysis: "",
      tables: [],
      hasJsonBlock: false,
      winner: undefined,
      scores: undefined,
    };
  };

  // Update the renderTables function to handle horizontal charts
  const renderTables = (tables: TableData[]): React.ReactElement | null => {
    if (!tables || tables.length === 0) return null;

    // Helper function to convert string values to numbers in data
    const convertDataToNumbers = (data: any[]): any[] => {
      if (!data) return [];
      return data.map((item) => {
        const convertedItem: Record<string, any> = {};
        Object.entries(item).forEach(([key, value]) => {
          // Convert numeric strings to numbers, keep other values as is
          if (typeof value === "string" && !isNaN(Number(value))) {
            convertedItem[key] = Number(value);
          } else if (typeof value === "number") {
            convertedItem[key] = value;
          } else {
            convertedItem[key] = value;
          }
        });
        return convertedItem;
      });
    };

    return (
      <div className="mt-6 space-y-6 mb-3">
        {tables.map((table: TableData, index: number) => {
          // Only convert data to numbers for chart types that need it
          const formattedData =
            table.type !== "horizontal_chart"
              ? convertDataToNumbers(table.data)
              : [];

          return (
            <div
              key={index}
              className="bg-white m-3 rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              {table.type === "horizontal_chart" && table.messages && (
                <div className="p-4">
                  <HorizontalBarChart
                    data={table.messages.map((msg) => ({
                      name: msg.text,
                      value: msg.score || msg.percentage || 0,
                    }))}
                    title={table.title}
                  />
                </div>
              )}

              {table.type === "bar" &&
                table.data &&
                table.xAxis &&
                table.yAxis && (
                  <div className="px-4 py-1 mb-10">
                    <div className="h-96 mb-16">
                      <BarChartComponent
                        data={formattedData}
                        xAxis={table.xAxis}
                        yAxis={table.yAxis}
                        title={table.title}
                      />
                    </div>
                  </div>
                )}

              {table.type === "line" &&
                table.data &&
                table.xAxis &&
                table.yAxis && (
                  <div className="p-4">
                    <div className="h-64">
                      <LineChartComponent
                        data={formattedData}
                        xAxis={table.xAxis}
                        yAxis={table.yAxis}
                        title={table.title}
                      />
                    </div>
                  </div>
                )}

              {table.type === "pie" &&
                table.data &&
                table.nameKey &&
                table.valueKey && (
                  <div className="p-4">
                    <div className="h-64">
                      <PieChart
                        data={formattedData}
                        nameKey={table.nameKey}
                        valueKey={table.valueKey}
                        title={table.title}
                      />
                    </div>
                  </div>
                )}

              {table.type === "radar" && table.data && table.nameKey && (
                <div className="p-4">
                  <div className="h-64">
                    <RadarChart
                      data={formattedData}
                      nameKey={table.nameKey}
                      title={table.title}
                    />
                  </div>
                </div>
              )}

              {table.type === "table" && table.data && table.headers && (
                <TableView
                  headers={table.headers}
                  data={table.data}
                  title={table.title}
                  pdfMode={true}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderSimulationAnalysis = (): React.ReactElement => {
    const parsedResponse = parseSimulationResponse(
      simulation?.simulation_response || ""
    );

    const contentData = parseContentField();
    const images = contentData.images;
    const { winner, scores } = parsedResponse;

    const abTestSection =
      images && typeof winner === "number" && scores ? (
        <div className="p-6 bg-white border-b border-indigo-100">
          <div className="flex items-center space-x-2.5 mb-6">
            <Megaphone className="h-5 w-5 text-green-600" />
            <h4 className="text-base font-medium text-green-800">
              Ad Creative Analysis
            </h4>
          </div>
          <div className="flex justify-center items-end gap-12 flex-wrap p-4">
            {images
              .map((imgSrc, index) => ({
                imgSrc,
                score: scores[index],
                isWinner: index === winner,
              }))
              .sort((a, b) => b.score - a.score)
              .map(({ imgSrc, score, isWinner }, index) => {
                const rank = index + 1;
                const rankStyling: { [key: number]: string } = {
                  1: "bg-green-500 text-white border-green-600", // Gold
                  2: "bg-blue-500 text-white border-blue-600", // Silver
                  3: "bg-indigo-500 text-white border-indigo-600", // Bronze
                };
                const defaultRankStyling =
                  "bg-white text-gray-800 border-gray-300";
                const rankClasses = rankStyling[rank] || defaultRankStyling;

                return (
                  <div
                    key={imgSrc}
                    className={`flex flex-col items-center gap-4 transition-transform duration-300 ${
                      isWinner ? "scale-110" : "scale-100"
                    }`}
                  >
                    <div
                      className={`flex items-center text-2xl font-bold p-2 rounded-lg ${
                        score > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {score > 0 ? "↑" : "↓"} {Math.abs(score)}
                    </div>
                    <div
                      className={`relative rounded-lg p-2 shadow-lg transition-all duration-300 ease-in-out ${
                        isWinner
                          ? "border-2 border-green-500 shadow-2xl bg-white"
                          : "border border-gray-300 bg-white"
                      }`}
                    >
                      <div
                        className={`absolute -top-4 -right-4 border-2 rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg shadow-md ${rankClasses}`}
                      >
                        #{rank}
                      </div>

                      {isWinner && (
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1.5 text-sm font-bold rounded-full flex items-center shadow-lg z-10 whitespace-nowrap">
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          WINNER
                        </div>
                      )}

                      <img
                        src={imgSrc}
                        alt={`Ad Creative Rank ${rank}`}
                        className="rounded-md max-w-sm mx-auto"
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : null;

    const innerParsedResponse = parseSimulationResponse(
      simulation?.simulation_response || ""
    );
    const extractSummaryFromRow = (cells: any[]) => {
      try {
        let summary = "";
        let score: number | null = null;

        const abc: any = cells;
        const isSummary = (text: any) => {
          if (!text || typeof text !== "string") return false;

          const cleanText = text.replace(/^"(.*)"$/, "$1").trim();

          const wordCount = cleanText.split(/\s+/).length;
          const hasPunctuation = /[.,;!?]/.test(cleanText);
          const isNumber = !isNaN(Number(cleanText));

          return wordCount > 10 && hasPunctuation && !isNumber;
        };
        if (typeof abc[2]?.props?.children == "object") {
          score = Number(abc[1]?.props?.children);
          summary =
            abc[2]?.props?.children[0]?.props?.children +
            String(abc[2]?.props?.children[1]).trim();
        } else {
          if (isSummary(abc[2]?.props?.children)) {
            score = Number(abc[1]?.props?.children);
            summary = String(abc[2]?.props?.children).trim();
          } else {
            score = Number(abc[2]?.props?.children);
            summary = "";
          }
        }

        return { score, summary };
      } catch (e) {
        return {
          score: null,
          summary: "",
        };
      }
    };

    // Custom table component to find "Rank" column and render images
    const CustomTableComponent = (props: any) => {
      const tableNode = props.node;
      if (!tableNode || !images || images.length === 0) {
        return <table {...props} />;
      }

      let rankColumnIndex = -1;
      let adIndexColumn = -1;

      try {
        const thead = tableNode.children.find(
          (child: any) => child.tagName === "thead"
        );
        if (thead) {
          const headerRow = thead.children.find(
            (child: any) => child.tagName === "tr"
          );
          if (headerRow) {
            headerRow.children.forEach((headerCell: any, index: number) => {
              if (headerCell.tagName === "th") {
                const headerContent = (headerCell.children[0]?.value || "")
                  .trim()
                  .toLowerCase();
                if (headerContent.toLowerCase() === "rank") {
                  rankColumnIndex = index;
                }
                if (headerContent.toLowerCase() === "ad index") {
                  adIndexColumn = index;
                }
              }
            });
          }
        }
      } catch (e) {
        console.error(
          "Error processing table headers for rank/ad_index column",
          e
        );
      }

      if (rankColumnIndex === -1) {
        return <table {...props} />;
      }

      return (
        <table {...props}>
          {React.Children.map(props.children, (child) => {
            if (child.type === "thead") {
              return (
                <thead>
                  {React.Children.map(child.props.children, (row) => (
                    <tr {...row.props}>
                      {React.Children.map(
                        row.props.children,
                        (cell, cellIndex) => {
                          if (cellIndex === adIndexColumn) return null;
                          return cell;
                        }
                      )}
                    </tr>
                  ))}
                </thead>
              );
            }
            if (child.type === "tbody") {
              return (
                <tbody>
                  {React.Children.map(child.props.children, (row) => (
                    <tr {...row.props}>
                      {React.Children.map(
                        row.props.children,
                        (cell, cellIndex) => {
                          // Skip ad_index column in rendering
                          if (cellIndex === adIndexColumn) return null;

                          if (cellIndex === rankColumnIndex) {
                            // Get ad index if available
                            let adIdx = null;
                            if (adIndexColumn !== -1) {
                              const adIndexCell =
                                row.props.children[adIndexColumn];
                              adIdx = parseInt(
                                String(adIndexCell?.props?.children),
                                10
                              );
                            }
                            const rankText = cell.props.children;
                            const rank = parseInt(String(rankText), 10);
                            const imageIdx =
                              adIdx !== null && !isNaN(adIdx)
                                ? adIdx
                                : rank - 1;
                            if (
                              !isNaN(imageIdx) &&
                              imageIdx >= 0 &&
                              imageIdx < images.length
                            ) {
                              const imageSrc = images[imageIdx];
                              return (
                                <td {...cell.props}>
                                  <div
                                    className="flex items-center justify-start gap-2"
                                    style={{ minWidth: 80, maxWidth: 180 }}
                                  >
                                    {/* <span>{rankText}</span> */}
                                    <TooltipBox text="Click to preview">
                                      <div
                                        className="relative group"
                                        style={{ display: "inline-block" }}
                                      >
                                        <img
                                          src={imageSrc}
                                          alt={`Ad ${imageIdx + 1}`}
                                          className="max-w-[80px] max-h-[60px] w-auto h-auto object-contain bg-gray-100 cursor-pointer rounded-md border"
                                          onClick={() => {
                                            setPopupImage(imageSrc);
                                            setPopupText(
                                              extractSummaryFromRow(
                                                row.props.children
                                              )
                                            );
                                            setTimeout(() => {
                                              setPopupImageVisible(true);
                                            }, 200);
                                          }}
                                        />
                                      </div>
                                    </TooltipBox>
                                  </div>
                                </td>
                              );
                            }
                          }
                          return cell;
                        }
                      )}
                    </tr>
                  ))}
                </tbody>
              );
            }
            return child;
          })}
        </table>
      );
    };
    console.log("jsonData:", innerParsedResponse?.allData);
    console.log("contentData:", contentData);

    return (
      <div
        id="simulation-analysis-section"
        className="h-full overflow-auto max-h-[calc(90vh-120px)]"
      >
        <div className="mb-6">
          <div>{SimulationDetailsDropdown()}</div>
          <div>
            <ReactMarkdown
              remarkPlugins={[[remarkGfm, { stringLength: stringWidth }]]}
              rehypePlugins={[rehypeRaw]}
              remarkRehypeOptions={{ passThrough: ["link"] }}
              components={{
                table: CustomTableComponent,
              }}
            >
              {innerParsedResponse.output[1]}
            </ReactMarkdown>
          </div>
          {contentData?.task == "buyer-insights-report-b2c" &&
            typeof innerParsedResponse?.allData?.output == "object" && (
              <BuyerInsightsREportB2C data={innerParsedResponse?.allData} />
            )}
          {contentData?.task == "image-survey" &&
            (!innerParsedResponse?.allData?.output ||
              typeof innerParsedResponse?.allData?.output == "object") && (
              <ImageSurvey
                data={innerParsedResponse?.allData}
                contentData={contentData}
              />
            )}
          {contentData?.task == "ab-test-messaging" &&
            typeof innerParsedResponse?.allData?.output == "object" && (
              <AB_estMessaging data={innerParsedResponse?.allData} />
            )}
          {(contentData?.task == "channel-event-strategy" ||
            contentData?.task == "ab-test-creatives") &&
            typeof innerParsedResponse?.allData?.output == "object" && (
              <ChannelEventStrategyDesign
                data={innerParsedResponse?.allData}
                contentData={contentData}
              />
            )}
          {typeof innerParsedResponse?.allData?.output == "string" && (
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="ms-content">
                {/* {abTestSection} */}
                <div className="prose prose-blue max-w-none p-4 markdown-body ">
                  {/* Only render non-table charts if present */}
                  {innerParsedResponse.tables &&
                    innerParsedResponse.tables.length > 0 &&
                    innerParsedResponse.tables.some(
                      (table: TableData) => table.type !== "table"
                    ) &&
                    renderTables(
                      innerParsedResponse.tables.filter(
                        (table: TableData) => table.type !== "table"
                      )
                    )}

                  <ReactMarkdown
                    remarkPlugins={[[remarkGfm, { stringLength: stringWidth }]]}
                    rehypePlugins={[rehypeRaw]}
                    remarkRehypeOptions={{ passThrough: ["link"] }}
                    components={{
                      table: CustomTableComponent,
                    }}
                  >
                    {innerParsedResponse.output}
                  </ReactMarkdown>

                  {/* Only render table type tables if present */}
                  {innerParsedResponse.tables &&
                    innerParsedResponse.tables.length > 0 &&
                    innerParsedResponse.tables.some(
                      (table: TableData) => table.type === "table"
                    ) &&
                    renderTables(
                      innerParsedResponse.tables.filter(
                        (table: TableData) => table.type === "table"
                      )
                    )}

                  {/* Only render analysis if present */}
                  {innerParsedResponse.hasJsonBlock &&
                    innerParsedResponse.analysis && (
                      <div className="mt-6">
                        <div className="border-t border-gray-200 pt-4">
                          <button
                            onClick={() =>
                              setExpandedCards((prev) => ({
                                ...prev,
                                analysis: !prev.analysis,
                              }))
                            }
                            className="flex items-center justify-between w-full no-print"
                          >
                            <div className="flex items-center gap-[10px]">
                              <DetailedAnalysisIcon />
                              <p
                                className="font-semibold text-xl text-primary2"
                                style={{ margin: "0" }}
                              >
                                Detailed Analysis
                              </p>
                            </div>
                            {expandedCards.analysis ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                          {/* pdf  */}
                          <div className="hidden pdf-print">
                            <h3
                              style={{
                                color: "#028B7E",
                                fontSize: "25px",
                                fontWeight: "600",
                              }}
                            >
                              Detailed Analysis
                            </h3>
                          </div>
                          <div className="mt-4 prose prose-sm prose-indigo max-w-none markdown-body hidden pdf-print">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                            >
                              {innerParsedResponse.analysis}
                            </ReactMarkdown>
                          </div>
                          {/* --------------------------------------- */}
                          {expandedCards.analysis && (
                            <div className="mt-4 prose prose-sm prose-indigo max-w-none markdown-body no-print">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                              >
                                {innerParsedResponse.analysis}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAdvancedAnalysis = (): React.ReactElement => (
    <div className="h-full overflow-auto">
      {optimizationStatus === "completed" ? (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Advanced Analysis
          </h3>
          <div className="prose prose-blue max-w-none mb-3 markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {simulation?.optimization_response ||
                "No advanced analysis available yet."}
            </ReactMarkdown>
            <div className="h-5"></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Generating advanced analysis...
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            We're optimizing the recommendations for your simulation. This may
            take a few minutes.
          </p>
        </div>
      )}
    </div>
  );

  const renderChatInterface = (): React.ReactElement => (
    <div className="flex flex-col h-full">
      <h3 className="font-semibold text-2xl mb-5">Chat with Simulation</h3>
      {/* <div className="border-b border-gray-200 bg-white">
        <nav className="flex gap-4 px-6" aria-label="Tabs">
          <button
            onClick={() => handleChatTabChange("simulation")}
            className={`py-4 px-1 inline-flex items-center border-b-2 text-sm font-medium ${
              chatTab === "simulation"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Brain className="mr-2 h-4 w-4" />
            Chat with Simulation
          </button>
        </nav>
      </div> */}

      <div
        className="flex-1 overflow-auto p-5 pb-0 scrollbar-hide bg-white rounded-t-2xl"
        ref={chatContainerRef}
      >
        <div className="space-y-4 relative">
          {chatHistory.length === 0 ? (
            // <div className="text-center absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 gap-5 max-w-0 items-center text-black">
            //   <NoChatIcon />
            //   <p>No messages yet. Start the conversation!</p>
            // </div>
            <div className="text-center text-gray-500 py-12">
              <div className="mx-auto inline-block">
                <NoChatIcon />
              </div>
              <p className="text-black text-[14px] mt-4 font-medium">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            chatHistory.map((msg, idx) => {
              // For simulation tab, only show messages with role 'use' (user) or 'sim' (simulation)
              // For persona tab, only show messages with role 'user' or 'persona'
              const isUserMessage =
                chatTab === "simulation"
                  ? msg.role === "use"
                  : msg.role === "use_persona";

              const isValidMessage =
                chatTab === "simulation"
                  ? msg.role === "use" || msg.role === "sim"
                  : msg.role === "use_persona" || msg.role === "persona";

              // Skip rendering messages that don't belong in this tab
              if (!isValidMessage) return null;
              function formatTo12HourTime(isoString: any) {
                const date = new Date(isoString);
                return date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });
              }

              return (
                <div
                  key={idx}
                  className={`flex ${
                    isUserMessage ? "justify-end" : "justify-start"
                  } animate-fadeIn`}
                  data-idx={
                    idx
                  } /* Use data attribute instead of inline style */
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl border-[1.5px] text-xs  ${
                      isUserMessage
                        ? " text-black rounded-br-none border-[#E6FCFA]"
                        : "text-[#595E64] rounded-bl-none border-[#F5F5F5]"
                    }`}
                  >
                    <div
                      className={
                        `flex flex-col items-end gap-3 ${
                          isUserMessage
                            ? "prose prose-invert prose-sm max-w-none"
                            : "prose prose-sm max-w-none"
                        }` + "markdown-body"
                      }
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      {msg?.timestamp && (
                        <p className="text-primary2 text-xs font-medium text-end">
                          {formatTo12HourTime(msg?.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {sendingMessage && (
            <div className=" rounded-bl-none border-[#F5F5F5] max-w-[95px] p-3 pl-[22px] rounded-2xl border-[1.5px] text-xs ">
              <span className="flex items-center space-x-[1px] text-transparent bg-clip-text bg-gradient-to-r from-[#07E5D1] via-[#07E5D1] to-[#E6FCFA] ">
                <span>Typing</span>
                <span className="animate-beep text-primary2 text-lg mb-[5px] [animation-delay:0ms]">
                  .
                </span>
                <span className="animate-beep text-primary2  text-lg mb-[5px] [animation-delay:200ms]">
                  .
                </span>
                <span className="animate-beep text-primary2  text-lg mb-[5px] [animation-delay:400ms]">
                  .
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 bg-white rounded-b-2xl">
        <div className="flex bg-gray-100 height-[60px] rounded-full items-center  gap-2 relative">
          <textarea
            ref={textareaRef}
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Type your message to ${
              chatTab === "persona" && selectedPersona
                ? (() => {
                    const persona = simulation?.personas.find(
                      (p) => p.id === selectedPersona
                    );
                    return persona ? extractPersonaInfo(persona.data).name : "";
                  })()
                : "the simulation"
            }...`}
            className="flex-1 scrollbar-hide px-3 py-2 pt-[17px] pl-3 text-[14px] h-[60px] bg-transparent rounded-full resize-none focus:outline-none"
            rows={2}
          />
          <button
            onClick={sendChatMessage}
            disabled={!chatMessage.trim() || sendingMessage}
            aria-label="Send message"
            title="Send message"
            className={`flex items-center justify-center h-[60px] w-[60px] p-3 pt-4 pl-2 rounded-full ${
              chatMessage.trim() && !sendingMessage
                ? "bg-primary text-white  hover:bg-blue-600"
                : "bg-primary text-white cursor-not-allowed"
            }`}
          >
            <ChatMsend />
          </button>
        </div>
        {/* <div className="text-xs text-gray-400 mt-1 text-right">
          Press Enter to send, Shift+Enter for new line
        </div> */}
      </div>
    </div>
  );

  // New component for the simulation details dropdown with simplified structure
  const SimulationDetailsDropdown = (): React.ReactElement | null => {
    let contentData = parseContentField();
    if (!contentData || !simulation) return null;
    // Always show model used from simulation.source_model
    contentData = {
      ...contentData,
      model_used: simulation.source_model || "",
    };

    // Function to render icon based on key
    const SectionHeader = ({ icon, title, number }: any) => {
      return (
        <div className="flex items-center w-full mb-3">
          {/* Icon and Title */}
          <div className="flex items-center  text-primary2 gap-3 font-medium text-lg">
            {icon}
            <span>{title}</span>
          </div>

          {/* Line */}
          <div className="flex-grow border-t border-black mx-4" />

          {/* Number */}
          <div className="font-medium text-base">
            {number < 10 ? "0" : ""}
            {number}
          </div>
        </div>
      );
    };
    const getIconForKey = (key: string): JSX.Element => {
      switch (key) {
        case "audience_id":
        case "audience_name":
          return <Users className="h-4 w-4 text-blue-600" />;
        case "task":
          return <Brain className="h-4 w-4 text-indigo-600" />;
        case "name":
          return <FileText className="h-4 w-4 text-teal-600" />;
        case "goal":
          return <Target className="h-4 w-4 text-green-600" />;
        case "context":
          return <MessageSquare className="h-4 w-4 text-amber-600" />;
        case "content_type":
          return <FileText className="h-4 w-4 text-purple-600" />;
        case "content_subject":
          return <Bookmark className="h-4 w-4 text-pink-600" />;
        case "company_context":
          return <Briefcase className="h-4 w-4 text-gray-600" />;
        case "segment_ids":
          return <Layers className="h-4 w-4 text-blue-600" />;
        case "persona_filters":
          return <Filter className="h-4 w-4 text-orange-600" />;
        default:
          return <FileText className="h-4 w-4 text-blue-600" />;
      }
    };

    // Define the formatValue function inside the component to fix the reference error
    const formatValue = (key: string, value: any): React.ReactNode => {
      // Format segment_ids
      if (key === "segment_ids" && Array.isArray(value)) {
        if (simulation?.segments) {
          return (
            <div className="bg-[#FAFAFA] p-4 flex flex-col gap-3 items-center rounded-[20px] mb-6">
              {value.map((segmentId, idx) => {
                const segment = simulation.segments?.find(
                  (s) => s.id === segmentId
                );
                return (
                  <div
                    key={key}
                    className={`${
                      value.length == idx + 1 ? "" : "border-b pb-3"
                    } flex items-center gap-3 justify-between border-[#E8E8E8]  w-full`}
                  >
                    <span className="text-right text-sm font-semibold text-gray-900">
                      {segment ? segment.name : `Segment ${segmentId}`}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        }
      }

      // Format persona_filters
      if (
        key === "persona_filters" &&
        typeof value === "object" &&
        value !== null
      ) {
        const personaFilters = value as Record<string, Record<string, unknown>>;

        return (
          <div
            className={`mt-3 grid items-start ${
              Object.keys(personaFilters).length > 1
                ? "grid-cols-2"
                : "grid-cols-1"
            } gap-3`}
          >
            {Object.entries(personaFilters).length === 0 ? (
              <div className="text-sm text-gray-500 italic text-center p-3">
                No filters have been applied
              </div>
            ) : (
              Object.entries(personaFilters).map(
                ([segmentId, filters], idx) => {
                  // Find the segment name from the simulation segments
                  const segmentName =
                    simulation?.segments?.find(
                      (s) => s.id === parseInt(segmentId)
                    )?.name || `Segment ${segmentId}`;

                  // Check if the segment has any non-empty filter arrays
                  const hasFilters = Object.entries(filters).some(
                    ([, values]) => Array.isArray(values) && values.length > 0
                  );

                  // If no filters with values, don't render this segment's filter card
                  if (!hasFilters) return null;

                  return (
                    <div
                      key={segmentId}
                      className={`bg-[#FAFAFA] p-4 rounded-[20px] w-full h-full `}
                    >
                      <h3 className="text-base font-semibold text-gray-900 mb-4">
                        {segmentName}
                      </h3>

                      {Object.entries(filters)
                        .filter(
                          ([, values]) =>
                            Array.isArray(values) && values.length > 0
                        )
                        .map(([key, values], index, arr) => (
                          <div
                            key={key}
                            className={`w-full flex justify-between items-start text-sm text-gray-700 ${
                              index < arr.length - 1
                                ? "border-b border-[#E8E8E8] pb-3 mb-3"
                                : ""
                            }`}
                          >
                            <span className="text-[#595E64] font-medium capitalize">
                              {key.replace(/_/g, " ")}
                            </span>
                            <div
                              className={`
                                      text-right font-semibold text-gray-900
                                      ${
                                        key === "age_group"
                                          ? "flex flex-col items-end space-y-1"
                                          : "flex flex-row flex-wrap justify-end items-end gap-2"
                                      }
                                    `}
                            >
                              {key === "geo_location"
                                ? (values as string[])
                                    .flatMap((val) =>
                                      val
                                        .split(",")
                                        .map((v) => v.trim().replace(/_/g, " "))
                                    )
                                    .map((val, i, arr) => (
                                      <span key={i}>
                                        {val}
                                        {i < arr.length - 1 && ", "}
                                      </span>
                                    ))
                                : (values as string[]).map((val, i) => (
                                    <span key={i} className="">
                                      {val}
                                    </span>
                                  ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  );
                }
              )
            )}
          </div>
        );
      }

      // Handle special values
      if (key === "audience_id") return null;
      if (key == "questions") {
        return (
          <div className="flex flex-col gap-1 items-start">
            {value?.map((question: any, index: number) => (
              <p
                key={index}
                className={`text-start ${
                  question?.startsWith("Q")
                    ? "text-base font-medium text-blue-600" // Highlighted Q-type
                    : "text-xs font-normal text-gray-800 indent-2" // Normal text
                }`}
              >
                {question}
              </p>
            ))}
          </div>
        );
      }
      if (key == "marketing_copies") {
        return (
          <div className="flex flex-col gap-1 items-start">
            {value?.map((question: any, index: number) => (
              <p
                key={index}
                className={`text-start text-sm font-normal text-gray-800 indent-2`}
              >
                {question}
              </p>
            ))}
          </div>
        );
      }
      if (key == "selected_products") {
        return (
          <div className="flex flex-col gap-1 items-end">
            {value?.map((question: any, index: number) => (
              <p
                key={index}
                className={`text-start text-sm font-normal text-gray-800 indent-2`}
              >
                {question}
              </p>
            ))}
          </div>
        );
      }
      if (key == "additional_data") {
        console.log(65151, value);

        return (
          <div className="flex flex-col gap-1 items-end">
            {value?.product_name && (
              <p
                className={`text-start text-sm font-normal text-gray-800 indent-2`}
              >
                Product name:{" "}
                <span className="text-gray-600">{value?.product_name}</span>
              </p>
            )}
            {value?.website_url && (
              <p
                className={`text-start text-sm font-normal text-gray-800 indent-2`}
              >
                Website url:{" "}
                <span className="text-gray-600">{value?.website_url}</span>
              </p>
            )}
          </div>
        );
      }
      if (key == "products_data") {
        return (
          <div className="flex flex-col gap-4">
            {value?.map((item: any, index: number) => (
              <div
                key={index}
                className="flex gap-4 items-start p-4 rounded-xl border border-gray-200 shadow-sm bg-white"
              >
                {/* Image */}
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.brand || "Product image"}
                    className="w-28 h-28 object-contain rounded-md border"
                  />
                )}

                {/* Textual Info */}
                <div className="flex flex-col gap-1 text-sm text-gray-700 w-full">
                  <div className="font-semibold text-base text-gray-900">
                    {item.brand}
                  </div>

                  <div>
                    <span className="font-medium">ASIN:</span> {item.asin}
                  </div>
                  <div>
                    <span className="font-medium">BSR:</span>{" "}
                    {item.bsr ?? "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Origin:</span>{" "}
                    {item.origin ?? "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span>{" "}
                    {item.price ?? "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Ratings:</span> {item.ratings}{" "}
                    ⭐
                  </div>
                  <div>
                    <span className="font-medium">Review Count:</span>{" "}
                    {item.review_count}
                  </div>

                  {/* Product Details */}
                  {item.product_details && (
                    <p className="text-gray-600 mt-2 text-sm">
                      <span className="font-medium">Details:</span>{" "}
                      {item.product_details}
                    </p>
                  )}

                  {/* Link */}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary2 hover:underline mt-1 text-sm font-medium"
                    >
                      View on Amazon →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      }
      // For other simple values
      return (
        <span className="text-sm text-gray-800 font-medium">
          {typeof value === "string" ? value : JSON.stringify(value)}
        </span>
      );
    };

    // Important fields to show in summary section (top)
    const importantFields = [
      "name",
      "model_used",
      "audience_name",
      "goal",
      "content_type",
    ];
    const importantData = Object.fromEntries(
      Object.entries(contentData).filter(([key]) =>
        importantFields.includes(key)
      )
    );
    let count = 1;
    return (
      <div
        className={`fixed inset-0  flex transition-all duration-200 items-center justify-end ${
          isDetailsDropdownOpen ? " bg-black z-[100]" : "-z-50"
        }  bg-opacity-50`}
        onClick={() => {
          setIsDetailsDropdownOpen(false);
        }}
      >
        <div
          className={`absolute top-0 right-0 z-50 h-full w-1/2 max-w-[100vw] bg-white shadow-lg border-l border-gray-200
          transition-transform duration-500 ease-in-out overflow-auto scrollbar-hide  
          ${isDetailsDropdownOpen ? "translate-x-0" : "translate-x-full"}
        `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Summary section - Header */}
          {/* Header */}
          <div className="p-[30px]  bg-white sticky right-0 top-0 z-10   flex items-center gap-3 justify-between">
            <h2 className="text-2xl font-semibold text-primary2 ">
              Simulation Inputs
            </h2>
            <button onClick={() => setIsDetailsDropdownOpen(false)}>
              <X />
            </button>
          </div>

          {/* Main content area */}
          <div className="p-5">
            {/* Key information grid */}
            {Object.entries(importantData).length > 0 && (
              <>
                <SectionHeader
                  icon={<PiUser size={24} />}
                  title="Creator Detail"
                  number={
                    Object.entries(importantData).length > 0 ? count++ : count
                  }
                />
                <div className="bg-[#FAFAFA] p-4 flex flex-col gap-3 items-center rounded-[20px] mb-6">
                  {Object.entries(importantData).map(
                    ([key, value], index: number) => (
                      <div
                        key={key}
                        className={`${
                          Object.entries(importantData).length == index + 1
                            ? ""
                            : "border-b pb-3"
                        } flex items-center gap-3 justify-between border-[#E8E8E8]  w-full`}
                      >
                        <span className="text-[#595E64] text-sm font-medium capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-right text-sm font-semibold text-gray-900">
                          {value as string}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </>
            )}

            {/* Segments section */}

            {contentData.segment_ids && (
              <div className="mb-6">
                <SectionHeader
                  icon={<PiLineSegments size={24} />}
                  title="Audience Segments"
                  number={contentData.segment_ids ? count++ : count}
                />
                {formatValue("segment_ids", contentData.segment_ids)}
              </div>
            )}

            {/* Filters section */}
            {contentData.persona_filters &&
              Object.keys(contentData.persona_filters).length > 0 && (
                <div className="mb-6">
                  <SectionHeader
                    icon={<BiFilterAlt size={24} />}
                    title="Applied Filters"
                    number={
                      Object.keys(contentData.persona_filters).length > 0
                        ? count++
                        : count
                    }
                  />
                  <div className="">
                    {formatValue(
                      "persona_filters",
                      contentData.persona_filters
                    )}
                  </div>
                </div>
              )}

            {/* {contentData?.images && contentData?.images?.length > 0 && (
            <div className="mb-6">
              
              <SectionHeader
                icon={<PiImagesLight size={24} />}
                title="Images"
                number={4}
              />
              <div className="bg-[#FAFAFA] p-3 rounded-lg">
                {contentData?.images?.map((imageData: any, index: number) => (
                  <img
                    key={index}
                    src={imageData}
                    alt={`Image ${index + 1}`}
                    className="w-full h-auto rounded-lg mb-2"
                  />
                ))}
              </div>
            </div>
          )} */}

            {/* Used Personas - COLLAPSIBLE */}
            {simulation.personas && simulation.personas.length > 0 && (
              <div className="mb-6">
                <SectionHeader
                  icon={<PiUsers size={24} />}
                  title={`User Profile (${simulation.personas.length})`}
                  number={simulation.personas.length > 0 ? count++ : count}
                />
                {simulation?.personas && (
                  <div className="p-3 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {personasToShow?.map((persona, index) => {
                        const personaInfo: any = extractPersonaInfo(
                          persona.data
                        );
                        return (
                          <div
                            key={index}
                            className="flex flex-col gap-3 p-4 rounded-[20px] border-[#F5F5F5] border bg-[#FAFAFA]"
                          >
                            {/* Top Row: Avatar + Name + Segment */}
                            <div className="flex justify-between items-center  border-b border-[#E8E8E8] pb-3">
                              <div className="flex items-center gap-3">
                                <div className="h-[30px] w-[30px] rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-500">
                                  {personaInfo?.avatar ? (
                                    <img
                                      src={personaInfo?.avatar}
                                      alt={personaInfo?.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <FaRegUser className="h-5 w-5" />
                                  )}
                                </div>
                                <p className="text-[#595E64] font-medium text-sm">
                                  {personaInfo.name}
                                </p>
                              </div>
                              <span className="bg-primary3 text-black text-[10px] font-semibold px-3 py-[5px] rounded-full capitalize">
                                {persona.name?.replace(/_/g, " ") || "Profile"}
                              </span>
                            </div>

                            {/* Bottom Row: Age & Role */}
                            <div className="flex items-center justify-between text-xs text-gray-700">
                              <div className="flex items-center gap-1.5">
                                <PiPerson className="h-5 w-5 text-primary" />
                                <span>
                                  Age:{" "}
                                  <span className="font-semibold text-gray-900">
                                    {personaInfo.age?.match(
                                      /\(([^)]+)\)/
                                    )?.[1] || "N/A"}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <PiAddressBook className="h-5 w-5 text-primary" />
                                <span>
                                  Role:{" "}
                                  <span className="font-semibold text-gray-900">
                                    {personaInfo.job_title || "N/A"}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* View All / View Less Button */}
                    {simulation.personas.length > visibleCount && (
                      <div className="text-center mt-4">
                        <button
                          onClick={() =>
                            setShowInputAllProfiles((prev) => !prev)
                          }
                          className="text-primary2 underline text-sm font-medium"
                        >
                          {showInputAllProfiles
                            ? "View Less"
                            : `View All (${simulation.personas.length})`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Additional Information */}
            {Object.entries(contentData).filter(
              ([key]) =>
                !importantFields.includes(key) &&
                key !== "segment_ids" &&
                key !== "persona_filters" &&
                key !== "images" &&
                key !== "audience_id" &&
                key !== "image_descriptions"
            ).length > 0 && (
              <div className="mb-6">
                <SectionHeader
                  icon={<HelpCircle size={24} />}
                  title="Additional Information"
                  number={count}
                />

                <div className="bg-[#FAFAFA] p-4 flex flex-col gap-3 items-center rounded-[20px] mb-6">
                  {Object.entries(contentData)
                    .filter(
                      ([key]) =>
                        !importantFields.includes(key) &&
                        key !== "segment_ids" &&
                        key !== "persona_filters" &&
                        key !== "images" &&
                        key !== "audience_id" &&
                        key !== "image_descriptions"
                    )
                    .map(([key, value], idx, arr) => (
                      <div
                        key={idx}
                        className={`${
                          arr.length === idx + 1 ? "" : "border-b pb-3"
                        } flex items-start gap-3 justify-between border-[#E8E8E8] w-full`}
                      >
                        <p className="text-[#595E64] text-xs font-medium mb-1 capitalize">
                          {key.replace(/_/g, " ")}
                        </p>
                        <div className="text-black font-semibold text-right text-sm whitespace-pre-line max-w-[70%]">
                          {formatValue(key, value)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {/* <div className="p-3 bg-gray-50 border-t mb-10 border-gray-200 flex justify-end">
          <button
            onClick={() => setIsDetailsDropdownOpen(false)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>
        </div> */}
        </div>
      </div>
    );
  };

  // Render tabs based on simulation data and actual content
  const renderTabs = () => {
    const showAdvancedTab = simulation?.num_tabs !== 1;

    return (
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab("simulation")}
          className={`py-2 inline-flex items-center border-b-2 text-sm font-medium ${
            activeTab === "simulation"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <BarChart2 className="mr-2 h-4 w-4" />
          Simulation Analysis
        </button>

        {/* {showAdvancedTab && (
          <button
            onClick={() => setActiveTab('advanced')}
            className={`py-2 inline-flex items-center border-b-2 text-sm font-medium ${activeTab === 'advanced'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Brain className="mr-2 h-4 w-4" />
            Advanced Analysis
            {optimizationStatus === 'running' && (
              <span className="ml-2">
                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
              </span>
            )}
          </button>
        )} */}
      </div>
    );
  };

  // When rendering the interface, if we're on the advanced tab but it shouldn't be shown,
  // automatically switch to simulation tab
  useEffect(() => {
    if (activeTab === "advanced" && simulation?.num_tabs === 1) {
      setActiveTab("simulation");
    }
  }, [simulation, activeTab]);

  // Add useEffect for background PDF generation
  useEffect(() => {
    if (!loading && simulationId) {
      setPdfGenerating(true);
      setCachedPdfUrl(null);
      setTimeout(async () => {
        try {
          const analysisElem = document.getElementById(
            "simulation-analysis-section"
          );
          const divHtml = analysisElem ? analysisElem.outerHTML : "";
          // Get all stylesheets and style tags from the document head and convert relative URLs to absolute
          const styles = Array.from(
            document.querySelectorAll('link[rel="stylesheet"], style')
          )
            .map((node) => {
              if (node instanceof HTMLLinkElement) {
                const absoluteUrl = new URL(node.href, window.location.origin)
                  .href;
                return `<link rel="stylesheet" href="${absoluteUrl}">`;
              }
              return node.outerHTML;
            })
            .join("\n");

          // Add custom print style for PDF
          const customPrintStyle = `
  <style>
    .no-print { display: none !important; }
    .pdf-print { display: block !important; }
    .recharts-tooltip-wrapper { display: none !important; }
    table { border-collapse: collapse; width: 100%; table-layout: fixed; }
    th, td {
      word-break: break-word;
      white-space: pre-line;
      vertical-align: top;
      padding: 8px;
      font-size: 12px;
      border: 1px solid #ddd;
      max-width: 200px;
      overflow-wrap: break-word;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  </style>
`;
          // Compose a full HTML document
          const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Simulation Analysis</title>
  ${styles}
  ${customPrintStyle}
</head>
<body>
  ${divHtml}
</body>
</html>
`;
          const res = await fetch(`${API_URL}/download`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ html: fullHtml, simulationId }),
            credentials: "include",
          });
          if (!res.ok) throw new Error("Failed to generate PDF");
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setCachedPdfUrl(url);
        } catch (e) {
          setCachedPdfUrl(null);
        } finally {
          setPdfGenerating(false);
        }
      }, 500); // wait 1 second to ensure graphs are loaded
    }
    // Clean up cached PDF on unmount or when simulation changes
    return () => {
      if (cachedPdfUrl) {
        URL.revokeObjectURL(cachedPdfUrl);
        setCachedPdfUrl(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, simulationId]);

  return (
    <div className={`bg-gray_light p-[30px] pb-[60px]`}>
      <div className="flex items-center gap-[22px] pb-5 border-b border-[#E8E8E8]">
        {onBack && <BlackButton onClick={onBack}>Back</BlackButton>}
        <div className="flex items-center w-full justify-between gap-3 ">
          {/* Tab group with animated background */}
          <div className="relative flex w-fit p-1 bg-cyan-50 rounded-full transition-all duration-300">
            {/* Animated background slider */}
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-primary transition-all duration-300"
              style={sliderStyle}
            />

            {/* Tabs */}
            <div className="relative z-10 flex">
              <div
                ref={chatRef}
                onClick={() => {
                  if (loading) {
                    toast.success("Please wait...");
                    return;
                  }
                  setActiveChatTab("chat");
                  setIsListCollapsed?.(true);
                  setIsChatCollapsed(false);
                }}
                className={`px-4 py-2 w-[74px] cursor-pointer rounded-full font-medium text-sm transition-all duration-300 ${
                  activeChatTab === "chat" ? "text-white" : "text-black"
                }`}
              >
                Chat
              </div>
              <div
                ref={simulationRef}
                onClick={() => {
                  setActiveChatTab("simulation");
                  setIsChatCollapsed(true);
                }}
                className={`px-4 py-2 w-[172px] cursor-pointer rounded-full  text-sm transition-all duration-300 ${
                  activeChatTab === "simulation"
                    ? "text-white font-semibold"
                    : "text-black font-medium"
                }`}
              >
                Simulation Analysis
              </div>
            </div>
          </div>
          <h3 className="text-[28px] font-semibold">Analysis Dashboard</h3>
        </div>
      </div>
      <style>{`
        .markdown-body table {
          display: table !important;
          width: 100% !important;
          table-layout: auto !important;
          overflow: visible !important;
        }
      `}</style>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        renderLoadingAnimation()
      ) : (
        <div
          className={`flex h-full pt-5 items-start ${
            !isChatCollapsed ? "gap-5" : ""
          }`}
          style={{ height: "80vh" }}
        >
          <div
            className={`bg-gray_light rounded-xl shadow-sm overflow-hidden h-full relative transition-all duration-300 ease-in-out ${
              isChatCollapsed ? "w-0" : "max-w-[400px] lg:min-w-[400px] w-full"
            }`}
          >
            {renderChatInterface()}
          </div>
          <div
            className={` rounded-xl overflow-hidden w-full h-full flex flex-col transition-all duration-300 ease-in-out `}
          >
            <div className="">
              <div className="flex justify-between items-center pb-5">
                {/* <div className="flex items-center">
                  <button
                    onClick={() => setIsChatCollapsed(!isChatCollapsed)}
                    onMouseEnter={() => setShowHoverMessage(true)}
                    onMouseLeave={() => setShowHoverMessage(false)}
                    className="relative flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors mr-8"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Chat</span>
                    {showHoverMessage && (
                      <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                        {isChatCollapsed
                          ? "Click to open chat"
                          : "Click to collapse chat"}
                      </div>
                    )}
                  </button>
                  <nav className="flex gap-4" aria-label="Tabs">
                    {renderTabs()}
                  </nav>
                </div> */}
                <h3 className="text-[28px] font-semibold">
                  Simulation Analysis
                </h3>
                <div className="flex items-center  space-x-2">
                  {/* Export Button */}
                  <TooltipBox text="Click to export as PDF">
                    <div className="">
                      <button
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-white hover:bg-[#07E5D1] transition-all duration-300 hover:shadow-lg"
                        aria-label="Export simulation analysis"
                      >
                        <DownloadIcon className="h-5 w-5 text-black" />
                      </button>
                      {showTooltip === "export" && (
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20"></div>
                      )}
                    </div>
                  </TooltipBox>
                  {/* Copy Output Button */}
                  <TooltipBox text="Click to copy output">
                    <div className="relative">
                      <button
                        onClick={async () => {
                          if (!simulation?.simulation_response) return;
                          const parsed = parseSimulationResponse(
                            simulation.simulation_response
                          );
                          await navigator.clipboard.writeText(
                            parsed.output || ""
                          );
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1200);
                        }}
                        className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-white hover:bg-[#07E5D1] transition-all duration-300 hover:shadow-lg"
                        aria-label="Copy simulation output"
                      >
                        <CopyIcon className="h-5 w-5 text-black" />
                      </button>
                    </div>
                  </TooltipBox>
                  {copied && (
                    <span className="text-green-600 text-xs ml-1 transition-opacity duration-200">
                      Copied!
                    </span>
                  )}

                  {/* Rerun Button */}
                  <TooltipBox text="Click to rerun simulation">
                    <div className="relative">
                      <button
                        onClick={async () => {
                          if (!simulation?.id) return;
                          setLoading(true);
                          setRerunError("");
                          try {
                            const res = await fetch(
                              `${API_URL}/simulations/${simulation.id}/rerun`,
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                signal: AbortSignal.timeout(300000), // 5 minute timeout
                              }
                            );
                            if (!res.ok)
                              throw new Error("Failed to rerun simulation");
                            const data = await res.json();
                            if (!data.simulation_id)
                              throw new Error("No new simulation id returned");
                            window.location.href = `/analysis/${data.simulation_id}`;
                          } catch (err: any) {
                            setRerunError(
                              err?.message || "Failed to rerun simulation"
                            );
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-white hover:bg-[#07E5D1] transition-all duration-300 hover:shadow-lg"
                        disabled={rerunLoading}
                      >
                        <ReloadIcon className="h-5 w-5 text-black" />
                      </button>
                    </div>
                  </TooltipBox>
                  {/* Simulation Inputs Button */}
                  <TooltipBox
                    text="Click to view simulation inputs"
                    position="bottomLeft"
                  >
                    <div className="relative">
                      <button
                        onClick={() => setIsDetailsDropdownOpen(true)}
                        className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-white hover:bg-[#07E5D1] transition-all duration-300 hover:shadow-lg"
                      >
                        <SimulationInputIcon className="h-5 w-5 text-black" />
                      </button>
                    </div>
                  </TooltipBox>
                  {rerunError && (
                    <span className="text-red-600 text-xs ml-2">
                      {rerunError}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-grow overflow-hidden relative">
              {activeTab === "simulation"
                ? renderSimulationAnalysis()
                : renderAdvancedAnalysis()}
            </div>
          </div>
        </div>
      )}
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-[30px] p-[30px] w-full max-w-[500px] flex items-start flex-col gap-[30px] relative">
            <div className="w-full flex justify-between items-center gap-3">
              <h2 className="text-2xl font-semibold text-primary2">
                Export Simulation Analysis
              </h2>
              <button
                className="hover:text-primary2"
                onClick={() => {
                  setShowExportModal(false);
                  setExportStatus("idle");
                  setExportError("");
                  setExportEmailStatus("idle");
                  setExportEmailError("");
                }}
                aria-label="Close"
              >
                <CloseXIcon />
              </button>
            </div>

            <button
              className={`w-full py-3 rounded-full bg-primary2 text-white font-semibold text-base flex items-center justify-center ${
                pdfGenerating || !cachedPdfUrl
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
              disabled={pdfGenerating || !cachedPdfUrl}
              onClick={() => {
                if (cachedPdfUrl) {
                  const link = document.createElement("a");
                  link.href = cachedPdfUrl;
                  link.download = "simulation-analysis.pdf";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
            >
              {!cachedPdfUrl || pdfGenerating ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  Preparing PDF...
                </>
              ) : (
                "Export as PDF"
              )}
            </button>
            <div className="w-full bg-[#F5F5F5] p-[12px_16px] rounded-[20px]">
              <label
                htmlFor="emailpdf"
                className=" text-xl font-medium text-black "
              >
                Send PDF to Email
              </label>
              <div className="bg-white p-[6px] pl-4 flex rounded-full items-center gap-[10px] mt-3">
                <SMS_MailIcon className="min-w-6" />
                <input
                  type="email"
                  id="emailpdf"
                  className="w-full text-sm  text-[#595E64] font-normal outline-none border-none"
                  placeholder="recipient@example.com"
                  value={exportEmailTo}
                  onChange={(e) => setExportEmailTo(e.target.value)}
                  disabled={exportEmailStatus === "sending"}
                />
                <button
                  className={`p-[13px_20px] bg-primary2 text-white text-base font-semibold rounded-full ${
                    exportEmailStatus === "sending"
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    exportEmailStatus === "sending" ||
                    !exportEmailTo ||
                    !cachedPdfUrl
                  }
                  onClick={async () => {
                    setExportEmailStatus("sending");
                    setExportEmailError("");
                    try {
                      if (!cachedPdfUrl) throw new Error("PDF not ready");
                      // Fetch the blob from the object URL
                      const pdfBlob = await fetch(cachedPdfUrl).then((res) =>
                        res.blob()
                      );
                      const pdfDataUrl = await blobToDataURL(pdfBlob);
                      // Send to backend
                      const res = await fetch(
                        `${API_URL}/send-simulation-pdf`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            to: exportEmailTo,
                            subject: "Simulation Analysis PDF",
                            pdfDataUrl,
                          }),
                          credentials: "include",
                          signal: AbortSignal.timeout(300000), // 5 minute timeout
                        }
                      );
                      if (!res.ok) throw new Error("Failed to send email");
                      setExportEmailStatus("success");
                    } catch (err: any) {
                      setExportEmailStatus("error");
                      setExportEmailError(
                        err.message || "Failed to send email"
                      );
                    }
                  }}
                >
                  {exportEmailStatus === "sending" ? "Sending..." : "Send"}
                </button>
              </div>
              {/* {exportEmailStatus === "success" && (
                <div className="mt-2 text-green-600 text-sm font-medium">
                  Email sent successfully!
                </div>
              )}
              {exportEmailStatus === "error" && (
                <div className="mt-2 text-red-600 text-sm font-medium">
                  {exportEmailError}
                </div>
              )} */}
            </div>
            {/* {exportStatus === "error" && (
              <div className="mt-2 text-red-600 text-sm font-medium">
                {exportError}
              </div>
            )} */}
          </div>
        </div>
      )}
      {popupImage && (
        <div
          className={`fixed inset-0 z-[100] flex transition-all duration-200 items-center justify-end ${
            popupImageVisible ? " bg-black" : ""
          }  bg-opacity-50`}
          onClick={() => {
            setPopupImageVisible(false);
            setTimeout(() => {
              setPopupImage(null);
            }, 200);
          }}
        >
          <div
            className={`relative w-full h-full bg-white shadow-xl max-w-md scrollbar-hide overflow-y-auto rounded-none 
                transform transition-all duration-200 
                ${popupImageVisible ? "translate-x-0" : "translate-x-full"}
              `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}

            {/* Content */}
            <div className="h-full flex flex-col p-[30px] space-y-5 ">
              {" "}
              {/* top padding because of close button */}
              <div className="flex items-center gap-7 ">
                <button
                  onClick={() => {
                    setPopupImageVisible(false);
                    setTimeout(() => {
                      setPopupImage(null);
                    }, 200);
                  }}
                  aria-label="Close popup"
                >
                  <CloseButton />
                </button>
                <h2 className="text-2xl font-semibold text-primary2">
                  Product Effectiveness
                </h2>
              </div>
              {popupText?.score && (
                <div className="bg-gray_light p-[12px_16px] rounded-[20px]">
                  <p className="text-xl font-medium text-black mb-3">Rank</p>
                  <p className="text-base font-semibold text-primary2">
                    {popupText?.score}
                  </p>
                </div>
              )}
              {popupText?.summary && (
                <div className="bg-gray_light p-[12px_16px] rounded-[20px]">
                  <p className="text-xl font-medium text-black mb-3">
                    Summary Rationale
                  </p>
                  <p className="text-sm font-normal text-[#595E64]">
                    {popupText.summary}
                  </p>
                </div>
              )}
              {/* Image Block with gray_light background */}
              {popupImage && (
                <div className="bg-gray_light p-4 rounded-lg">
                  <img
                    src={popupImage}
                    alt="Popup"
                    className="w-full h-auto object-contain rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationResultsContent;
