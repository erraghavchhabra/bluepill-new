import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  Search,
  List,
  BarChart2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlarmClock,
  CalendarDays,
} from "lucide-react";
import Button from "../../components/Button";
import Layout from "../../components/Layout";
import SimulationResultsContent from "../simulationResults/SimulationResultsContent";
import { HiOutlineChevronDoubleLeft } from "react-icons/hi";
import Header from "@/components/Header";
import { format } from "date-fns";
import { SearchIcon } from "@/icons/SimulationIcons";
import Footer from "@/components/Footer";

const API_URL = import.meta.env.VITE_API_URL || "";

interface Audience {
  id: number;
  name: string;
}

interface Simulation {
  id: number;
  name: string;
  description: string;
  audience_id: number;
  audience_name: string;
  created_at: string;
  segment_count: number;
  persona_count: number;
}

const AnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { simulationId: urlSimId } = useParams<{ simulationId: string }>();

  // Audience and Simulation Data
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [selectedAudienceId, setSelectedAudienceId] = useState<number | null>(
    null
  );

  // UI state
  const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isSimulationsLoaded, setIsSimulationsLoaded] = useState(false);
  const [simulationLoading, setSimulationLoading] = useState(true);
  const selectedSimRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const el = selectedSimRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const isFullyVisible =
          rect.top >= 0 &&
          rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight);

        if (!isFullyVisible) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [urlSimId, simulations]);

  // Fetch audiences on component mount
  useEffect(() => {
    fetchAudiences();
  }, []);

  // If no simulation ID in URL, just show the list
  useEffect(() => {
    if (!urlSimId) {
      setLoading(false);
    }
  }, [urlSimId]);

  // Load simulations when audience changes
  useEffect(() => {
    fetchSimulations(selectedAudienceId);
  }, [selectedAudienceId]);

  // Animate open on first load
  useEffect(() => {
    if (isSimulationsLoaded && !hasAnimated) {
      // A brief delay to allow the UI to settle before animating open
      const timer = setTimeout(() => {
        setIsListCollapsed(false);
        setHasAnimated(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isSimulationsLoaded, hasAnimated]);

  const fetchAudiences = async () => {
    try {
      const response = await fetch(`${API_URL}/audience`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch audiences");
      }

      const data = await response.json();
      setAudiences(data.map((a: any) => ({ id: a.id, name: a.name })));
    } catch (err) {
      console.error("Error fetching audiences:", err);
    }
  };

  const fetchSimulations = async (audienceId?: number | null) => {
    try {
      let url = `${API_URL}/simulations`;
      if (audienceId) {
        url += `?audience_id=${audienceId}`;
      } else {
        setSimulationLoading(true);
      }

      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch simulations");
      }

      const data = await response.json();
      setSimulations(data);
      setLoading(false);
      setIsSimulationsLoaded(true);
      setSimulationLoading(false);
    } catch (err) {
      console.error("Error fetching simulations:", err);
      setSimulationLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const filteredSimulations = simulations.filter(
    (simulation) =>
      simulation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      simulation.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderSimulationsList = () => (
    <div className="flex flex-col h-full  pt-0 overflow-hidden">
      {/* This container holds all content that will slide out */}
      <div
        className={`transition-all duration-500 ease-in-out flex flex-col h-full  w-full ${
          isListCollapsed
            ? "opacity-0 -translate-x-full"
            : "opacity-100 translate-x-0"
        }`}
      >
        <h1 className="font-semibold text-[24px] py-5">History Overview</h1>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-grow">
            <button
              type="button"
              onClick={() => setIsAudienceDropdownOpen(!isAudienceDropdownOpen)}
              className="w-full flex items-center justify-between h-[50px]  rounded-[12px] px-3 py-2 text-sm  bg-gray-100 hover:bg-gray-50"
            >
              <span className="font-medium">
                {selectedAudienceId
                  ? audiences.find((a) => a.id === selectedAudienceId)?.name
                  : "All Audiences"}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {isAudienceDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-56 overflow-auto py-1 border border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAudienceId(null);
                    setIsAudienceDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  All Audiences
                </button>
                {audiences.map((audience) => (
                  <button
                    type="button"
                    key={audience.id}
                    onClick={() => {
                      setSelectedAudienceId(audience.id);
                      setIsAudienceDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {audience.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search simulations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2 py-2 h-[50px]  rounded-[12px] pl-10 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3  top-1/2 transform -translate-y-1/2 h-5 w-5 text-black-400">
            <SearchIcon />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide mt-4 -mx-2 px-2">
          {filteredSimulations.length === 0 ? (
            simulationLoading ? (
              <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <List className="h-12 w-12 mx-auto opacity-30 mb-3" />
                <p>No simulations found</p>
              </div>
            )
          ) : (
            <div className="space-y-2">
              {filteredSimulations.map((simulation) => {
                const isSelected = urlSimId === simulation.id.toString();
                return (
                  <button
                    type="button"
                    key={simulation.id}
                    ref={isSelected ? selectedSimRef : null}
                    onClick={() => navigate(`/analysis/${simulation.id}`)}
                    className={`w-full text-left rounded-lg sim-btn transition-colors ${
                      isSelected ? "" : "border-gray-200"
                    }`}
                  >
                    <div
                      className={`${
                        isSelected ? "bg-primary" : "bg-[#E8E8E8]"
                      } sim-btn-top rounded`}
                    >
                      <span>{simulation.audience_name}</span>
                    </div>
                    <div className="bg-white border sim-btn-bottom border-gray-200">
                      <div className="font-semibold text-[14px] text-black-600">
                        {simulation.name}
                      </div>
                      <div className="text-[12px] text-gray-600 mt-1">
                        {simulation.description?.substring(0, 60) ||
                          "No description"}
                        {(simulation.description?.length || 0) > 60
                          ? "..."
                          : ""}
                      </div>
                      <div className="flex justify-between items-center border-t mt-2 text-xs text-gray-500">
                        <div className="flex items-center justify-between pt-4 pb-1 bg-white w-full">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="text-primary w-5 h-5" />
                            <span className="text-black text-[12px] font-medium">
                              {format(
                                new Date(simulation?.created_at),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlarmClock className="text-primary w-5 h-5" />
                            <span className="text-black text-[12px] font-medium">
                              {format(
                                new Date(simulation?.created_at),
                                "hh:mm a"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderNoSimulationSelectedState = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <img src="/images/selectSimulationImage.png" alt="select" />
      <p className="text-[28px] font-semibold mb-2">Select a simulation</p>
      <p className="font-medium text-sm text-black">
        Choose a simulation from the list to view its analysis
      </p>
    </div>
  );

  const renderLoadingAnimation = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="animate-spin mb-6">
        <Loader2 className="h-12 w-12 text-blue-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Loading...</h3>
    </div>
  );

  const handleSimulationError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className={`flex-1`}>
        <div className="">
          {error && !urlSimId && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="flex flex-row items-start h-[calc(100vh)] pl-[30px]">
            <div
              className={`relative h-full transition-all duration-500  origin-left ease-[cubic-bezier(0.25,0.8,0.25,1)] transform w-full flex-shrink-0 ${
                isListCollapsed
                  ? "min-w-[0%] max-w-[0%] scale-x-0 opacity-50"
                  : "min-w-[22%] max-w-[22%] scale-x-100 opacity-100"
              }`}
            >
              <div
                className={`
                      h-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                      transform origin-left
                      ${
                        isListCollapsed
                          ? "scale-x-0 opacity-0"
                          : "scale-x-100 opacity-100"
                      }
                      ${isListCollapsed ? "bg-transparent " : "bg-white "}
                    `}
              >
                {loading && !urlSimId
                  ? renderLoadingAnimation()
                  : renderSimulationsList()}
              </div>
            </div>

            <div
              className={`relative w-full h-full transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]   ${
                isListCollapsed
                  ? "max-w-full pl-[5.5rem]"
                  : "max-w-[78%] pl-[30px]"
              }`}
            >
              <div
                className={`absolute top-7 ${
                  isListCollapsed ? "left-[13px]" : "left-[-30px]"
                } z-10 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]`}
              >
                <button
                  className=""
                  onClick={() => setIsListCollapsed((prev) => !prev)}
                  title={
                    isListCollapsed
                      ? "Show Simulation List"
                      : "Collapse Simulation List"
                  }
                >
                  <HiOutlineChevronDoubleLeft
                    className={` transition-all duration-300 h-7 w-7 ${
                      isListCollapsed ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
              </div>
              <div className="flex-1 bg-gray_light relative shadow-sm rounded-tl-[30px] overflow-hidden h-full">
                {urlSimId ? (
                  <SimulationResultsContent
                    simulationId={urlSimId}
                    onError={handleSimulationError}
                    setIsListCollapsed={setIsListCollapsed}
                    isListCollapsed={isListCollapsed ? "chat" : "simulation"}
                  />
                ) : (
                  renderNoSimulationSelectedState()
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AnalysisPage;
