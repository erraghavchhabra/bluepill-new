import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { jsonrepair } from 'jsonrepair'
import {
	ArrowLeft,
	MessageSquare,
	BarChart2,
	Brain,
	User,
	Loader2,
	Send,
	ChevronDown,
	Clock,
	History,
	HelpCircle,
	FileText,
	Calendar,
	Target,
	Briefcase,
	Users,
	Filter,
	Layers,
	ChevronUp,
	Globe,
	Bookmark,
	Building,
	Megaphone,
	CheckCircle2,
	Tag,
	Settings,
	Copy,
	Download,
} from "lucide-react";
import Button from "../../components/Button";
import { useAudience } from "../../context/AudienceContext";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import SimulationHistoryPanel from "../../components/SimulationHistoryPanel";
import Layout from "../../components/Layout";
import Card from "../../components/Card";
import "github-markdown-css/github-markdown.css";
import BarChart from "../../components/BarChart";
import LineChart from "../../components/LineChart";
import PieChart from "../../components/PieChart";
import RadarChart from "../../components/RadarChart";
import HorizontalBarChart from "../../components/HorizontalBarChart";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import TableView from "@/components/TableView";

const API_URL = import.meta.env.VITE_API_URL || "";

interface Persona {
	id: number;
	name: string;
	data: Record<string, unknown>;
}

interface SimulationData {
	id: number;
	audience_id: number;
	simulation_response: string;
	optimization_response: string;
	status: string;
	personas: Persona[];
	created_at: string;
	updated_at: string;
	content?: string; // Optional content field that may contain JSON data
	num_tabs?: number; // Add this field to track number of tabs to show
	segments?: {
		id: number;
		name: string;
	}[];
	source_model?: string; // Add this field for model used
}

interface TableData {
	type: 'bar' | 'line' | 'table' | 'pie' | 'radar' | 'horizontal_chart';
	title?: string;
	data: any[];
	xAxis?: string;
	yAxis?: string;
	headers?: string[];
	nameKey: string;  // Make these required
	valueKey: string; // Make these required
	messages?: { text: string; percentage?: number, score?: number }[]; // For horizontal chat
}

// Type definition for persona info return value
type PersonaInfoType = {
	name: string;
	age: string;
	job_title: string;
	occupation: string;
	behavioral_archetype: string;
	organizational_influence: string;
};

// Interface for persona filters data structure
interface PersonaFilters {
	[segmentId: string]: {
		[filterType: string]: string[] | [];
	};
}

// Interface for content data structure
interface ContentData {
	[key: string]: unknown;
	audience_id?: number;
	audience_name?: string;
	name?: string;
	goal?: string;
	task?: string;
	context?: string;
	content_type?: string;
	content_subject?: string;
	company_context?: string;
	segment_ids?: number[];
	persona_filters?: PersonaFilters;
	model_used?: string; // Add this field for model used
	images?: string[];
}

interface ChatMessage {
	role: string;
	content: string;
	timestamp: string;
}

// ChatHistory interface has been removed as it's not used

interface SimulationResultsProps {
	simulationId?: number; // Optional simulation ID for embedded mode
	embedded?: boolean; // Whether the component is embedded in another page
}

// Add ParsedResponse interface
interface ParsedResponse {
	output: string;
	analysis: string;
	tables: TableData[];
	hasJsonBlock: boolean;
	winner?: number;
    scores?: number[];
}

function blobToDataURL(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
	  const reader = new FileReader();
	  reader.onloadend = () => resolve(reader.result as string);
	  reader.onerror = reject;
	  reader.readAsDataURL(blob);
	});
  }

const SimulationResults: React.FC<SimulationResultsProps> = ({
	simulationId: propSimulationId,
	embedded = false,
}) => {
	const { state } = useLocation();
	const navigate = useNavigate();
	useAudience(); // Using context but not destructuring any values
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
	const [pollingInterval, setPollingInterval] = useState<number | null>(null);
	const [simulationStatus, setSimulationStatus] = useState<
		"pending" | "running" | "completed" | "partial"
	>("pending");
	const [optimizationStatus, setOptimizationStatus] = useState<
		"pending" | "running" | "completed"
	>("pending");
	const [currentStep, setCurrentStep] = useState<string>(
		"Initializing simulation..."
	);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
	const [showTooltip, setShowTooltip] = useState<string>('');
	const [numTabs, setNumTabs] = useState<number>(2); // Default to 2 tabs unless server specifies otherwise
	const [isDetailsDropdownOpen, setIsDetailsDropdownOpen] = useState(false);
	const [isChatCollapsed, setIsChatCollapsed] = useState(false);
	const [copied, setCopied] = useState(false);
	const [showExportModal, setShowExportModal] = useState(false);
	const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
	const [exportError, setExportError] = useState('');
	const [exportEmailTo, setExportEmailTo] = useState('');
	const [exportEmailStatus, setExportEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
	const [exportEmailError, setExportEmailError] = useState('');
	const [rerunLoading, setRerunLoading] = useState(false);
	const [rerunError, setRerunError] = useState('');
	const [cachedPdfUrl, setCachedPdfUrl] = useState<string | null>(null);
	const [pdfGenerating, setPdfGenerating] = useState(false);
	const [popupImage, setPopupImage] = useState<string | null>(null);

	// State for collapsible cards in content summary
	const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
		details: true,
		audience: true,
		additional: false,
		personas: false,
		analysis: false,
	});

	// Function to toggle expanded/collapsed state of cards
	const toggleCard = (cardName: string): void => {
		setExpandedCards((prev) => ({
			...prev,
			[cardName]: !prev[cardName],
		}));
	};

	// Refs for scrolling and input focus
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Simulation ID from props, URL params, or state
	const { simulationId: urlSimId } = useParams<{ simulationId: string }>();
	const simulationId =
		propSimulationId ||
		urlSimId ||
		(state?.simulationId ? state.simulationId : null);

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
			setError("No simulation ID provided");
			setLoading(false);
			return;
		}

		// Clear any existing interval first to avoid multiple intervals
		if (pollingInterval) {
			clearInterval(pollingInterval);
			setPollingInterval(null);
		}

		// Initial fetch - let's determine if we need to start polling
		fetchSimulationStatus(true);

		// Clean up interval on component unmount
		return () => {
			if (pollingInterval) clearInterval(pollingInterval);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [simulationId]); // Only depend on simulationId, not on simulation data

	// Auto-scroll chat to bottom when messages change
	useEffect(() => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
	}, [chatHistory]);

	// Add this effect after the other useEffect hooks
	useEffect(() => {
		// Clear polling interval when history panel is opened
		if (isHistoryPanelOpen && pollingInterval) {
			clearInterval(pollingInterval);
			setPollingInterval(null);
		}
	}, [isHistoryPanelOpen]);

	useEffect(() => {
		if (!loading && simulation) {
			setPdfGenerating(true);
			setCachedPdfUrl(null);
			setTimeout(async () => {
				try {
					const analysisElem = document.getElementById('simulation-analysis-section');
					const divHtml = analysisElem ? analysisElem.outerHTML : '';
					
					// Get all stylesheets and style tags from the document head and convert relative URLs to absolute
					const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
						.map(node => {
							if (node instanceof HTMLLinkElement) {
								const absoluteUrl = new URL(node.href, window.location.origin).href;
								return `<link rel="stylesheet" href="${absoluteUrl}">`;
							}
							return node.outerHTML;
						})
						.join('\n');

					// Add custom print style for PDF
					const customPrintStyle = `
					<style>
					  .no-print { display: none !important; }
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

					// Convert relative URLs in the HTML content to absolute URLs
					const absoluteDivHtml = divHtml.replace(
						/(src|href)=["'](?!http|https|\/\/)([^"']+)["']/g,
						(_, attr, url) => `${attr}="${new URL(url, window.location.origin).href}"`
					);

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
  ${absoluteDivHtml}
</body>
</html>
`;
					const res = await fetch(`${API_URL}/download`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ html: fullHtml, simulationId }),
						credentials: 'include',
					});
					if (!res.ok) throw new Error('Failed to generate PDF');
					const blob = await res.blob();
					const url = URL.createObjectURL(blob);
					setCachedPdfUrl(url);
				} catch (e) {
					setCachedPdfUrl(null);
				} finally {
					setPdfGenerating(false);
				}
			}, 500); // wait for charts to render
		}
		// Clean up cached PDF on unmount or when simulation changes
		return () => {
			if (cachedPdfUrl) {
				URL.revokeObjectURL(cachedPdfUrl);
				setCachedPdfUrl(null);
			}
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading, simulationId, simulation]);

	const fetchSimulationStatus = async (initialFetch = false) => {
		if (!simulationId) return;

		try {
			const response = await fetch(
				`${API_URL}/simulations/${simulationId}`,
				{
					credentials: "include",
				}
			);

			if (!response.ok) {
				throw new Error("Failed to fetch simulation status");
			}

			const data = await response.json();
			setSimulation(data);

			// Set number of tabs from response if available
			if (data.num_tabs !== undefined) {
				setNumTabs(data.num_tabs);
			}

			// If simulation_response is available, show partial results
			if (data.simulation_response) {
				const hasOptimizationResponse =
					data.optimization_response &&
					data.optimization_response.trim() !== "";

				if (hasOptimizationResponse) {
					// Both responses are ready
					setSimulationStatus("completed");
					setOptimizationStatus("completed");
					setLoading(false);
					// Clear the polling interval when both responses are received
					if (pollingInterval) {
						clearInterval(pollingInterval);
						setPollingInterval(null);
					}
				} else {
					// Only simulation_response is ready, optimization still in progress or not needed
					setSimulationStatus("partial");
					setOptimizationStatus("running");
					setLoading(false);

					// If num_tabs is 1, don't poll for optimization response
					if (data.num_tabs === 1) {
						if (pollingInterval) {
							clearInterval(pollingInterval);
							setPollingInterval(null);
						}
					} else if (initialFetch && !isHistoryPanelOpen) {
						// Only continue polling for optimization if num_tabs > 1 and not on history page
						// Clear any existing interval first
						if (pollingInterval) {
							clearInterval(pollingInterval);
						}
						const interval = setInterval(
							() => fetchSimulationStatus(),
							10000
						);
						setPollingInterval(interval);
						console.log(
							"Polling started for optimization status..."
						);
					}
				}
			} else {
				// Simulation is still running
				setSimulationStatus("running");
				setOptimizationStatus("pending");
				setCurrentStep(getSimulationStep(data.status));

				// Only start polling if this is the initial fetch and we need to poll and not on history page
				if (initialFetch && !isHistoryPanelOpen) {
					// Clear any existing interval first
					if (pollingInterval) {
						clearInterval(pollingInterval);
					}
					// Start polling for simulation status
					const interval = setInterval(
						() => fetchSimulationStatus(),
						10000
					);
					setPollingInterval(interval);
					console.log("Polling started for simulation status...");
				}
			}
		} catch (err) {
			console.error("Error fetching simulation status:", err);
			setError("Failed to load simulation status. Please try again.");
			setLoading(false);
			if (pollingInterval) {
				clearInterval(pollingInterval);
				setPollingInterval(null);
			}
		}
	};

	const getSimulationStep = (status: string): string => {
		switch (status) {
			case "initializing":
				return "Initializing simulation...";
			case "segment_processing":
				return "Processing audience segments...";
			case "generating_personas":
				return "Generating audience profiles...";
			case "running_simulation":
				return "Running simulation with profiles...";
			case "analyzing_results":
				return "Analyzing simulation results...";
			case "optimizing":
				return "Optimizing recommendations...";
			case "complete":
				return "Simulation complete!";
			default:
				return "Processing...";
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
				signal: AbortSignal.timeout(300000) // 5 minute timeout
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
			const body = { message: chatMessage };
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
				signal: AbortSignal.timeout(300000) // 5 minute timeout
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

	const extractPersonaInfo = (
		personaData: Record<string, unknown> | string
	): PersonaInfoType => {
		try {
			const data =
				typeof personaData === "string"
					? JSON.parse(personaData)
					: personaData;

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
					if (
						Object.keys(value as Record<string, unknown>).length > 5
					) {
						return `Complex data (${Object.keys(value as Record<string, unknown>).length
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
				organizational_influence: extractField(
					"organizational_influence"
				),
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

	const renderLoadingAnimation = () => (
		<div className="flex flex-col items-center justify-center py-16">
			<div className="animate-spin mb-6">
				<Loader2 className="h-12 w-12 text-blue-500" />
			</div>
			<h3 className="text-xl font-semibold mb-2">
				{simulationStatus === "pending"
					? "Starting simulation..."
					: currentStep}
			</h3>
			<p className="text-gray-500 text-center max-w-md">
				{simulationStatus === "pending"
					? "We are initializing your simulation..."
					: "This process typically takes 2-5 minutes. Please wait while we run your simulation."}
			</p>
		</div>
	);

	// Update the parseSimulationResponse function with proper typing
	const parseSimulationResponse = (response: string): ParsedResponse => {
		// Check if response contains a JSON block
		const jsonBlockMatch = response.match(/```json\n([\s\S]*?)\n```/);
		if (jsonBlockMatch) {
			try {

				const jsonContent = jsonBlockMatch[1];
				let parsedData = JSON.parse(jsonrepair(jsonContent));
				if (Array.isArray(parsedData)) {
					for (const item of parsedData) {
						if (item.output) {
							parsedData = item;
							break;
						}
					}
				}

				if (typeof parsedData.tables === 'string') {
					try {
						parsedData.tables = JSON.parse(jsonrepair(parsedData.tables));
					} catch (error) {
						console.error('Error parsing tables:', error);
					}
				}
				else if (parsedData.tables && !Array.isArray(parsedData.tables)) {
					parsedData.tables = [parsedData.tables];
				}

				console.log('Results file', parsedData.tables);

				return {
					output: parsedData.output || '',
					analysis: parsedData.analysis || '',
					tables: parsedData.tables || [],
					hasJsonBlock: true,
					winner: parsedData.winner,
                    scores: parsedData.scores,
				};
			} catch (error) {
				console.error('Error parsing JSON block:', error);
				return {
					output: response,
					analysis: '',
					tables: [],
					hasJsonBlock: false,
					winner: undefined,
                    scores: undefined,
				};
			}
		} else {
			try {
				let parsedData = JSON.parse(jsonrepair(response));
				if (Array.isArray(parsedData)) {
					for (const item of parsedData) {
						if (item.output) {
							parsedData = item;
							break;
						}
					}
				}

				console.log('Results file', parsedData.tables);

				if (typeof parsedData.tables === 'string') {
					try {
						parsedData.tables = JSON.parse(jsonrepair(parsedData.tables));
					} catch (error) {
						console.error('Error parsing tables:', error);
					}
				}
				else if (parsedData.tables && !Array.isArray(parsedData.tables)) {
					parsedData.tables = [parsedData.tables];
				}

				return {
					output: parsedData.output || '',
					analysis: parsedData.analysis || '',
					tables: parsedData.tables || [],
					hasJsonBlock: true,
					winner: parsedData.winner,
                    scores: parsedData.scores,
				};
			} catch (error) {
				console.error('Error parsing JSON block:', error);
				return {
					output: response,
					analysis: '',
					tables: [],
					hasJsonBlock: false,
					winner: undefined,
                    scores: undefined,
				}
			}
		}

		return {
			output: response,
			analysis: '',
			tables: [],
			hasJsonBlock: false,
			winner: undefined,
            scores: undefined,
		};
	};

	// Add a new function to render tables and visualizations
	const renderTables = (tables: TableData[]) => {
		if (!tables || tables.length === 0) return null;

		// Helper function to convert string values to numbers in data
		const convertDataToNumbers = (data: any[]): any[] => {
			if (!data) return [];
			return data.map(item => {
				const convertedItem: Record<string, any> = {};
				Object.entries(item).forEach(([key, value]) => {
					// Convert numeric strings to numbers, keep other values as is
					if (typeof value === 'string' && !isNaN(Number(value))) {
						convertedItem[key] = Number(value);
					} else if (typeof value === 'number') {
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
					const formattedData = table.type !== 'horizontal_chart' ? convertDataToNumbers(table.data) : [];

					return (
						<div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
						

							{table.type === 'horizontal_chart' && table.messages && (
								<div className="p-4 m-4">
									<HorizontalBarChart
										data={table.messages.map(msg => ({
											name: msg.text,
											value: msg.score || msg.percentage || 0
										}))}
										title={table.title}
									/>
								</div>
							)}

{table.type === 'bar' && table.data && table.xAxis && table.yAxis && (
                <div className="px-4 py-1 mb-10">
                  <div className="h-96 mb-16">
                    <BarChart
                      data={formattedData}
                      xAxis={table.xAxis}
                      yAxis={table.yAxis}
                      title={table.title}
                    />
                  </div>
                </div>
              )}

							{table.type === 'line' && table.data && table.xAxis && table.yAxis && (
								<div className="p-4">
									<div className="h-64">
										<LineChart
											data={formattedData}
											xAxis={table.xAxis}
											yAxis={table.yAxis}
											title={table.title}
										/>
									</div>
								</div>
							)}

							{table.type === 'pie' && table.data && table.nameKey && table.valueKey && (
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

							{table.type === 'radar' && table.data && table.nameKey && (
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

							{table.type === 'table' && table.data && table.headers && (
								<TableView headers={table.headers} data={table.data} title={table.title}  pdfMode={true}  />
							)}
						</div>
					);
				})}
			</div>
		);
	};


	const renderAdvancedAnalysis = () => (
		<div className="h-full overflow-auto p-6">
			{optimizationStatus === "completed" ? (
				<div className="mb-6">
					<Card className="border border-purple-200/50 shadow-md overflow-hidden transition-all duration-200">
						<div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-50 to-purple-50/70 border-b border-purple-100">
							<div className="flex items-center space-x-2.5">
								<div className="p-2 rounded-lg bg-purple-100/80 text-purple-600">
									<Brain className="h-5 w-5" />
								</div>
								<h3 className="text-base font-medium text-purple-800">
									Advanced Recommendations
								</h3>
							</div>
						</div>
						<div className="p-6 bg-white">
							<div className="prose prose-blue max-w-none markdown-body rounded-lg">
								<ReactMarkdown
									remarkPlugins={[remarkGfm]}
									rehypePlugins={[rehypeRaw]}>
									{simulation?.optimization_response ||
										"No advanced analysis available yet."}
								</ReactMarkdown>
								<div className="h-5"></div>
							</div>
						</div>
					</Card>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center h-64">
					<Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
					<h3 className="text-xl font-semibold mb-2 text-purple-800">
						Generating advanced analysis...
					</h3>
					<p className="text-gray-500 text-center max-w-md">
						We're optimizing the recommendations for your
						simulation. This may take a few minutes.
					</p>
				</div>
			)}
		</div>
	);

	const renderChatInterface = () => (
		<div className="flex flex-col h-full">
			<div className="border-b border-gray-200 bg-white">
				<nav className="flex gap-4 px-6" aria-label="Tabs">
					<button
						onClick={() => handleChatTabChange("simulation")}
						className={`py-4 px-1 inline-flex items-center border-b-2 text-sm font-medium ${chatTab === "simulation"
							? "border-blue-500 text-blue-600"
							: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}>
						<Brain className="mr-2 h-4 w-4" />
						Chat with Simulation
					</button>
					{/* <button
            onClick={() => handleChatTabChange('persona')}
            className={`py-4 px-1 inline-flex items-center border-b-2 text-sm font-medium ${
              chatTab === 'persona'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="mr-2 h-4 w-4" />
            Chat with Persona
          </button> */}
				</nav>
			</div>

			{chatTab === "persona" && (
				<div className="border-b border-gray-200 p-3 bg-white">
					<div className="relative">
						<div className="flex items-center mb-1">
							<label className="text-xs font-medium text-gray-700 flex items-center">
								Select a Profile to chat with
								<div
									className="relative ml-1"
									onMouseEnter={() => setShowTooltip(true)}
									onMouseLeave={() => setShowTooltip(false)}>
									<HelpCircle className="h-3 w-3 text-gray-400" />
									{showTooltip && (
										<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
											Pick to change the profile you're
											chatting with
										</div>
									)}
								</div>
							</label>
						</div>
						<button
							onClick={() => setDropdownOpen(!dropdownOpen)}
							className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-md border ${dropdownOpen
								? "border-blue-500 ring-2 ring-blue-500/20"
								: "border-gray-300"
								} bg-white hover:bg-blue-50 transition-colors`}>
							{selectedPersona && simulation?.personas ? (
								(() => {
									const selectedPersonaObj =
										simulation.personas.find(
											(p) => p.id === selectedPersona
										);
									if (selectedPersonaObj) {
										const info = extractPersonaInfo(
											selectedPersonaObj.data
										);
										return (
											<div className="flex items-center">
												<User className="h-4 w-4 mr-2 text-blue-500" />
												<span>
													{info.name} ({info.age},{" "}
													{info.occupation})
												</span>
											</div>
										);
									}
									return "Select a Profile";
								})()
							) : (
								<div className="flex items-center">
									<User className="h-4 w-4 mr-2 text-gray-400" />
									<span>Select a Profile</span>
								</div>
							)}
							<ChevronDown
								className={`h-4 w-4 ml-2 text-blue-500 transition-transform ${dropdownOpen ? "rotate-180" : ""
									}`}
							/>
						</button>

						{!dropdownOpen && (
							<div className="text-xs text-blue-500 mt-1 ml-1 animate-pulse">
								Click to change profile
							</div>
						)}

						{dropdownOpen && (
							<div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-56 overflow-auto py-1 border border-gray-200">
								{simulation?.personas?.map((persona) => {
									const info = extractPersonaInfo(
										persona.data
									);
									return (
										<button
											key={persona.id}
											onClick={() => {
												selectPersona(persona.id);
												setDropdownOpen(false);
											}}
											className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center ${selectedPersona === persona.id
												? "bg-blue-50 text-blue-500"
												: "text-gray-700"
												}`}>
											<User className="h-3 w-3 mr-2" />
											<div>
												<div className="font-medium">
													{info.name}
												</div>
												<div className="text-xs text-gray-500">
													{info.age},{" "}
													{info.occupation}
												</div>
											</div>
										</button>
									);
								})}
							</div>
						)}
					</div>
				</div>
			)}

			<div
				className="flex-1 overflow-auto p-4 bg-gray-50"
				ref={chatContainerRef}>
				<div className="space-y-4">
					{chatHistory.length === 0 ? (
						<div className="text-center text-gray-500 py-12">
							<MessageSquare className="h-12 w-12 mx-auto opacity-30 mb-3" />
							<p>No messages yet. Start the conversation!</p>
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
									: msg.role === "use_persona" ||
									msg.role === "persona";

							// Skip rendering messages that don't belong in this tab
							if (!isValidMessage) return null;

							return (
								<div
									key={idx}
									className={`flex ${isUserMessage
										? "justify-end"
										: "justify-start"
										} animate-fadeIn`}
									data-idx={
										idx
									} /* Use data attribute instead of inline style */
								>
									<div
										className={`max-w-[80%] px-4 py-2 rounded-lg ${isUserMessage
											? "bg-blue-500 text-white rounded-br-none animate-slideInRight"
											: "bg-white border border-gray-200 text-gray-800 rounded-bl-none animate-slideInLeft"
											}`}>
										<div
											className={
												`${isUserMessage
													? "prose prose-invert prose-sm max-w-none"
													: "prose prose-sm max-w-none"
												}` + "markdown-body"
											}>
											<ReactMarkdown
												remarkPlugins={[remarkGfm]}
												rehypePlugins={[rehypeRaw]}>
												{msg.content}
											</ReactMarkdown>
										</div>
									</div>
								</div>
							);
						})
					)}
					{sendingMessage && (
						<div className="flex justify-start animate-pulse">
							<div className="bg-white border border-gray-200 text-gray-500 px-4 py-2 rounded-lg rounded-bl-none max-w-[80%]">
								<div className="flex space-x-2">
									<div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-0"></div>
									<div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
									<div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-500"></div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="p-4 border-t border-gray-200 bg-white">
				<div className="flex items-end gap-2 relative">
					<textarea
						ref={textareaRef}
						value={chatMessage}
						onChange={(e) => setChatMessage(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={`Type your message to ${chatTab === "persona" && selectedPersona
							? (() => {
								const persona =
									simulation?.personas.find(
										(p) => p.id === selectedPersona
									);
								return persona
									? extractPersonaInfo(persona.data)
										.name
									: "";
							})()
							: "the simulation"
							}...`}
						className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						rows={2}
					/>
					<button
						onClick={sendChatMessage}
						disabled={!chatMessage.trim() || sendingMessage}
						aria-label="Send message"
						title="Send message"
						className={`flex items-center justify-center p-3 rounded-full ${chatMessage.trim() && !sendingMessage
							? "bg-blue-500 text-white hover:bg-blue-600"
							: "bg-gray-300 text-gray-500 cursor-not-allowed"
							}`}>
						<Send className="h-4 w-4" />
					</button>
				</div>
				<div className="text-xs text-gray-400 mt-1 text-right">
					Press Enter to send, Shift+Enter for new line
				</div>
			</div>
		</div>
	);

	// Function to handle selection of a simulation from history panel
	const handleSelectHistorySimulation = (simulationId: number) => {
		// Navigate to the selected simulation results page
		navigate(`/simulation-results/${simulationId}`);
		// Close the history panel
		setIsHistoryPanelOpen(false);
		// Reset loading state to fetch the new simulation
		setLoading(true);
		setError(null);
	};

	// Parse the content field from simulation data
	const parseContentField = (): ContentData | null => {
		if (!simulation?.content) return null;

		try {
			const contentData = JSON.parse(simulation.content) as ContentData;
			return contentData;
		} catch (e) {
			console.error("Error parsing content field:", e);
			return null;
		}
	};

	const renderContentSummary = () => {
		const contentData = parseContentField() as ContentData;

		if (!contentData) return null;

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

		const formatValue = (key: string, value: unknown): React.ReactNode => {
			// Format segment_ids
			if (key === "segment_ids" && Array.isArray(value)) {
				if (simulation?.segments) {
					return (
						<div className="flex flex-wrap gap-2 mt-2">
							{value.map((segmentId, idx) => {
								const segment = simulation.segments?.find(
									(s) => s.id === segmentId
								);
								return (
									<span
										key={idx}
										className="px-3 py-1.5 bg-blue-50/80 text-blue-700 border border-blue-200 rounded-full text-xs font-medium flex items-center gap-1.5">
										<Globe className="h-3 w-3" />
										{segment
											? segment.name
											: `Segment ${segmentId}`}
									</span>
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
				const personaFilters = value as Record<
					string,
					Record<string, unknown>
				>;

				return (
					<div className="mt-3 space-y-4">
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
									const hasFilters = Object.entries(
										filters
									).some(
										([, values]) =>
											Array.isArray(values) &&
											values.length > 0
									);

									// If no filters with values, don't render this segment's filter card
									if (!hasFilters) return null;

									return (
										<div
											key={idx}
											className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
											<div className="text-sm font-medium text-green-800 mb-3 pb-2 border-b border-green-50 flex items-center">
												<div className="bg-green-100 p-1.5 rounded-lg mr-2">
													<Layers className="h-4 w-4 text-green-600" />
												</div>
												{segmentName}
											</div>
											<div className="space-y-3">
												{Object.entries(filters)
													.filter(
														([, filterValues]) =>
															// Only include filter categories that have values
															Array.isArray(
																filterValues
															) &&
															filterValues.length >
															0
													)
													.map(
														(
															[
																filterKey,
																filterValues,
															],
															fidx
														) => (
															<div
																key={fidx}
																className="bg-green-50/50 rounded-lg p-3">
																<div className="flex items-center mb-2">
																	<Filter className="h-3.5 w-3.5 mr-1.5 text-green-700" />
																	<span className="text-xs font-semibold text-green-800 uppercase">
																		{
																			filterKey
																		}
																	</span>
																</div>
																<div className="flex flex-wrap gap-2">
																	{(
																		filterValues as string[]
																	).map(
																		(
																			val,
																			vidx
																		) => (
																			<span
																				key={
																					vidx
																				}
																				className="px-2.5 py-1 bg-white text-gray-700 border border-green-200 rounded-full text-xs font-medium shadow-sm">
																				{
																					val
																				}
																			</span>
																		)
																	)}
																</div>
															</div>
														)
													)}
											</div>
										</div>
									);
								}
							)
						)}
					</div>
				);
			}

			// Special handling for attribution_mode - make it more visually appealing
			if (key === "attribution_mode" && typeof value === "string") {
				return (
					<div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-sm font-medium">
						<span className="mr-1.5">⚙️</span> {value}
					</div>
				);
			}

			// Special handling for objective - make it more visually appealing
			if (key === "objective" && typeof value === "string") {
				return (
					<div className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-medium">
						<span className="mr-1.5">🎯</span> {value}
					</div>
				);
			}

			// Format complex objects (objects and arrays) into readable format
			if (
				typeof value === "object" &&
				value !== null &&
				key !== "audience_id" &&
				key !== "image_descriptions" &&
				key !== "task"
			) {
				// Handle empty objects/arrays with a nice message
				if (Object.keys(value).length === 0) {
					return (
						<span className="text-sm text-gray-500 italic py-1 px-2 bg-gray-50 rounded">
							{Array.isArray(value)
								? "Empty list"
								: "Empty object"}
						</span>
					);
				}

				// Handle arrays with visual improvements
				if (Array.isArray(value)) {
					return (
						<div className="mt-2 bg-gray-50/80 rounded-lg p-3 border border-gray-100">
							{value.length === 0 ? (
								<span className="text-sm text-gray-500 italic">
									Empty list
								</span>
							) : (
								<ul className="list-disc pl-5 space-y-2 my-1">
									{value.map((item, idx) => (
										<li
											key={idx}
											className="text-sm text-gray-700">
											{typeof item === "object" &&
												item !== null ? (
												renderNestedObject(item as Record<string, unknown>)
											) : (
												<span className="text-gray-800 font-medium">
													{String(item)}
												</span>
											)}
										</li>
									))}
								</ul>
							)}
						</div>
					);
				}

				// Handle objects with improved styling
				return renderNestedObject(value as Record<string, unknown>);
			}

			// For audience_id - don't show
			if (key === "audience_id") {
				return null;
			}

			// For other simple values
			return (
				<span className="text-sm text-gray-800 font-medium">
					{typeof value === "string" ? value : JSON.stringify(value)}
				</span>
			);
		};

		// Helper function to render nested objects
		const renderNestedObject = (
			obj: Record<string, unknown>,
			depth = 0
		): React.ReactNode => {
			// Skip rendering audience_id anywhere
			if (
				obj.audience_id !== undefined &&
				Object.keys(obj).length === 1
			) {
				return null;
			}

			if (depth > 3) {
				// Limit nesting depth for visual clarity
				return (
					<span className="text-sm text-gray-600 italic">
						Deep nested object
					</span>
				);
			}

			// Check for empty objects/arrays
			if (Object.keys(obj).length === 0) {
				return (
					<span className="text-sm text-gray-500 italic">
						Empty object
					</span>
				);
			}

			// Background color alternates with depth for better visual distinction
			const bgColorClass = depth % 2 === 0 ? "bg-gray-50" : "bg-white";
			const borderColorClass =
				depth % 2 === 0 ? "border-gray-200" : "border-gray-100";

			return (
				<div
					className={`${depth > 0
						? `ml-3 mt-2 ${bgColorClass} p-2 rounded ${borderColorClass} ${depth > 0 ? "border" : ""
						}`
						: "mt-1"
						}`}>
					{Object.entries(obj)
						// Skip audience_id field
						.filter(([key]) => key !== "audience_id" && key !== "task")
						.map(([key, value], idx) => (
							<div
								key={idx}
								className={`mb-3 ${idx < Object.entries(obj).length - 1
									? "pb-2 border-b border-gray-100/60"
									: ""
									}`}>
								<div className="flex items-start">
									<span className="text-sm font-bold text-gray-700 mr-2">
										{key.replace(/_/g, " ")}:
									</span>
									<div className="flex-1">
										{typeof value === "object" &&
											value !== null ? (
											Array.isArray(value) ? (
												value.length === 0 ? (
													<span className="text-sm text-gray-500 italic">
														Empty list
													</span>
												) : (
													<ul className="list-disc pl-5 mt-1 space-y-2">
														{value.map(
															(
																item: unknown,
																idx: number
															) => (
																<li
																	key={idx}
																	className="text-sm text-gray-700">
																	{typeof item ===
																		"object" &&
																		item !==
																		null ? (
																		Array.isArray(
																			item
																		) ? (
																			<div className="mt-1">
																				<ul className="list-circle pl-5 space-y-1">
																					{item.map(
																						(
																							subItem: unknown,
																							subIdx: number
																						) => (
																							<li
																								key={
																									subIdx
																								}
																								className="text-xs text-gray-700">
																								{typeof subItem ===
																									"object" &&
																									subItem !==
																									null
																									? renderNestedObject(
																										subItem as Record<
																											string,
																											unknown
																										>,
																										depth +
																										2
																									)
																									: String(
																										subItem
																									)}
																							</li>
																						)
																					)}
																				</ul>
																			</div>
																		) : (
																			<div className="mt-1 ml-2">
																				{Object.entries(
																					item as Record<
																						string,
																						unknown
																					>
																				).map(
																					(
																						[
																							subKey,
																							subValue,
																						],
																						subIdx
																					) => (
																						<div
																							key={
																								subIdx
																							}
																							className="mb-1">
																							<span className="text-xs font-semibold text-gray-800">
																								{subKey.replace(
																									/_/g,
																									" "
																								)}
																								:{" "}
																							</span>
																							<span className="text-xs text-gray-700">
																								{typeof subValue ===
																									"object" &&
																									subValue !==
																									null
																									? renderNestedObject(
																										subValue as Record<
																											string,
																											unknown
																										>,
																										depth +
																										2
																									)
																									: String(
																										subValue
																									)}
																							</span>
																						</div>
																					)
																				)}
																			</div>
																		)
																	) : (
																		<span className="text-gray-700">
																			{String(
																				item
																			)}
																		</span>
																	)}
																</li>
															)
														)}
													</ul>
												)
											) : (
												<div className="p-2 rounded bg-gray-50/80">
													{Object.entries(
														value as Record<
															string,
															unknown
														>
													).map(
														(
															[subKey, subValue],
															subIdx
														) => (
															<div
																key={subIdx}
																className={`${subIdx > 0
																	? "mt-2"
																	: ""
																	}`}>
																<span className="text-sm font-semibold text-indigo-700">
																	{subKey.replace(
																		/_/g,
																		" "
																	)}
																	:{" "}
																</span>
																{typeof subValue ===
																	"object" &&
																	subValue !==
																	null ? (
																	Array.isArray(
																		subValue
																	) ? (
																		<div className="ml-4 mt-1">
																			{subValue.length ===
																				0 ? (
																				<span className="text-xs text-gray-500 italic">
																					Empty
																					list
																				</span>
																			) : (
																				<ul className="list-disc pl-4 space-y-1">
																					{subValue.map(
																						(
																							item: unknown,
																							itemIdx: number
																						) => (
																							<li
																								key={
																									itemIdx
																								}
																								className="text-sm text-gray-700">
																								{typeof item ===
																									"object" &&
																									item !==
																									null
																									? renderNestedObject(
																										item as Record<
																											string,
																											unknown
																										>,
																										depth +
																										2
																									)
																									: String(
																										item
																									)}
																							</li>
																						)
																					)}
																				</ul>
																			)}
																		</div>
																	) : (
																		renderNestedObject(
																			subValue as Record<
																				string,
																				unknown
																			>,
																			depth +
																			1
																		)
																	)
																) : (
																	<span className="text-sm text-gray-700">
																		{String(
																			subValue
																		)}
																	</span>
																)}
															</div>
														)
													)}
												</div>
											)
										) : (
											<span className="text-sm text-gray-700">
												{String(value)}
											</span>
										)}
									</div>
								</div>
							</div>
						))}
				</div>
			);
		};

		// Extract only the most important fields for the top section
		const topSectionFields = [
			"name",
			"audience_name",
			"goal",
			"task",
			"content_type",
		];
		const topSectionData = Object.fromEntries(
			Object.entries(contentData).filter(([key]) =>
				topSectionFields.includes(key)
			)
		);

		// All other fields for detailed section
		const detailSectionData = Object.fromEntries(
			Object.entries(contentData).filter(
				([key]) =>
					!topSectionFields.includes(key) &&
					key !== "segment_ids" &&
					key !== "audience_id" &&
					key !== "task" &&
					key !== "persona_filters"
			)
		);

		// CardHeader component to keep consistent styling
		const CardHeader: React.FC<{
			icon: JSX.Element;
			title: string;
			cardName: string;
			color: "blue" | "green" | "purple" | "gray";
		}> = ({ icon, title, cardName, color }) => (
			<div
				className={`flex items-center justify-between px-5 py-4 cursor-pointer bg-gradient-to-r ${color === "blue"
					? "from-blue-50 to-blue-50/70 border-b border-blue-100"
					: color === "green"
						? "from-green-50 to-green-50/70 border-b border-green-100"
						: color === "purple"
							? "from-purple-50 to-purple-50/70 border-b border-purple-100"
							: "from-gray-50 to-gray-50/70 border-b border-gray-100"
					}`}
				onClick={() => toggleCard(cardName)}>
				<div className="flex items-center space-x-2.5">
					<div
						className={`p-2 rounded-lg ${color === "blue"
							? "bg-blue-100/80 text-blue-600"
							: color === "green"
								? "bg-green-100/80 text-green-600"
								: color === "purple"
									? "bg-purple-100/80 text-purple-600"
									: "bg-gray-100/80 text-gray-600"
							}`}>
						{React.cloneElement(icon, { className: "h-5 w-5" })}
					</div>
					<h3
						className={`text-base font-medium ${color === "blue"
							? "text-blue-800"
							: color === "green"
								? "text-green-800"
								: color === "purple"
									? "text-purple-800"
									: "text-gray-800"
							}`}>
						{title}
					</h3>
				</div>
				<div
					className={`p-1.5 rounded-full transition-colors ${color === "blue"
						? "text-blue-600 hover:bg-blue-100/50"
						: color === "green"
							? "text-green-600 hover:bg-green-100/50"
							: color === "purple"
								? "text-purple-600 hover:bg-purple-100/50"
								: "text-gray-600 hover:bg-gray-100/50"
						}`}>
					{expandedCards[cardName] ? (
						<ChevronUp className="h-5 w-5" />
					) : (
						<ChevronDown className="h-5 w-5" />
					)}
				</div>
			</div>
		);

		return (
			<div className="space-y-5">
				{/* Top summary section */}
				<Card className="border border-blue-200/50 shadow-md overflow-hidden transition-all duration-200">
					<CardHeader
						icon={<FileText />}
						title="Simulation Details"
						cardName="details"
						color="blue"
					/>

					{expandedCards.details && (
						<div className="p-6 bg-white">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
								{Object.entries(topSectionData).map(
									([key, value], index) => (
										<div
											key={index}
											className="flex items-start bg-blue-50/50 p-4 rounded-lg border border-blue-100 hover:shadow-sm transition-shadow">
											<div className="mr-3.5 bg-blue-100/80 p-2 rounded-lg self-start">
												{getIconForKey(key)}
											</div>
											<div className="flex-1">
												<p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1.5">
													{key.replace(/_/g, " ")}
												</p>
												<div className="text-sm text-gray-800 font-medium">
													{formatValue(key, value)}
												</div>
											</div>
										</div>
									)
								)}
							</div>

							{/* Date info inside details card */}
							<div className="flex justify-between text-xs font-medium text-gray-500 mt-4 border-t border-blue-100/50 pt-3 px-1">
								<div className="flex items-center">
									<Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
									Created:{" "}
									{new Date(
										simulation?.created_at || ""
									).toLocaleString()}
								</div>
								<div className="flex items-center">
									<Clock className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
									Updated:{" "}
									{new Date(
										simulation?.updated_at || ""
									).toLocaleString()}
								</div>
							</div>
						</div>
					)}
				</Card>

				{/* Audience segments and filters section */}
				<Card className="border border-green-200/50 shadow-md overflow-hidden transition-all duration-200">
					<CardHeader
						icon={<Users />}
						title="Target Audience"
						cardName="audience"
						color="green"
					/>

					{expandedCards.audience && (
						<div className="p-6 bg-white">
							{contentData.segment_ids && (
								<div className="mb-5">
									<div className="flex items-center mb-3">
										<div className="bg-green-100 p-1.5 rounded-lg mr-2">
											<Layers className="h-4 w-4 text-green-600" />
										</div>
										<h4 className="text-sm font-semibold text-green-800">
											Selected Segments
										</h4>
									</div>
									<div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
										{formatValue(
											"segment_ids",
											contentData.segment_ids
										)}
									</div>
								</div>
							)}

							{contentData.persona_filters && (
								<div>
									<div className="flex items-center mb-3">
										<div className="bg-green-100 p-1.5 rounded-lg mr-2">
											<Filter className="h-4 w-4 text-green-600" />
										</div>
										<h4 className="text-sm font-semibold text-green-800">
											Filters Applied
										</h4>
									</div>
									<div className="bg-white">
										{formatValue(
											"persona_filters",
											contentData.persona_filters
										)}
									</div>
								</div>
							)}
						</div>
					)}
				</Card>

				{/* Additional details section */}
				{Object.keys(detailSectionData).length > 0 && (
					<Card className="border border-gray-200/70 shadow-md overflow-hidden transition-all duration-200">
						<CardHeader
							icon={<HelpCircle />}
							title="Additional Information"
							cardName="additional"
							color="gray"
						/>

						{expandedCards.additional && (
							<div className="p-6 bg-white">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									{Object.entries(detailSectionData).map(
										([key, value], index) => (
											<div
												key={index}
												className="bg-gray-50/70 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-gray-50 transition-colors duration-200">
												<div className="flex items-center mb-2.5 pb-1.5 border-b border-gray-100">
													<div className="bg-gray-100 p-1.5 rounded-lg">
														{getIconForKey(key)}
													</div>
													<p className="text-xs text-blue-700 font-semibold uppercase ml-2.5 tracking-wider">
														{key.replace(/_/g, " ")}
													</p>
												</div>
												<div className="text-sm font-medium text-gray-800">
													{formatValue(key, value)}
												</div>
											</div>
										)
									)}
								</div>
							</div>
						)}
					</Card>
				)}

				{/* Personas section - if available */}
				{simulation?.personas && simulation.personas.length > 0 && (
					<Card className="border border-purple-200/50 shadow-md overflow-hidden transition-all duration-200">
						<CardHeader
							icon={<User />}
							title="Used Profiles"
							cardName="personas"
							color="purple"
						/>

						{expandedCards.personas && (
							<div className="p-6 bg-white">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									{simulation.personas.map(
										(persona, index) => {
											const personaInfo =
												extractPersonaInfo(
													persona.data
												);
											return (
												<div
													key={index}
													className="bg-purple-50/40 p-4 rounded-lg border border-purple-100 hover:shadow-md transition-all duration-200">
													<div className="flex justify-between items-start mb-3">
														<div className="flex items-center space-x-2">
															<div className="bg-purple-100 p-1.5 rounded-full">
																<User className="h-4 w-4 text-purple-600" />
															</div>
															<p className="font-medium text-gray-800 text-base">
																{
																	personaInfo.name
																}
															</p>
														</div>
														<div className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
															{persona.name
																? persona.name.replace(
																	/_/g,
																	" "
																)
																: "Profile"}
														</div>
													</div>
													<div className="grid grid-cols-2 gap-3 mt-3 border-t border-purple-100 pt-3">
														<div className="flex items-center space-x-1.5">
															<Calendar className="h-3.5 w-3.5 text-purple-600/70" />
															<p className="text-sm">
																<span className="text-gray-600">
																	Age:
																</span>{" "}
																<span className="text-gray-900 font-medium">
																	{
																		personaInfo.age
																	}
																</span>
															</p>
														</div>
														<div className="flex items-center space-x-1.5">
															<Briefcase className="h-3.5 w-3.5 text-purple-600/70" />
															<p className="text-sm">
																<span className="text-gray-600">
																	Role:
																</span>{" "}
																<span className="text-gray-900 font-medium">
																	{
																		personaInfo.job_title
																	}
																</span>
															</p>
														</div>
														{personaInfo.behavioral_archetype !==
															"N/A" && (
																<div className="col-span-2 flex items-center space-x-1.5 mt-1">
																	<Brain className="h-3.5 w-3.5 text-purple-600/70" />
																	<p className="text-sm">
																		<span className="text-gray-600">
																			Archetype:
																		</span>{" "}
																		<span className="text-gray-900 font-medium">
																			{
																				personaInfo.behavioral_archetype
																			}
																		</span>
																	</p>
																</div>
															)}
													</div>
												</div>
											);
										}
									)}
								</div>
							</div>
						)}
					</Card>
				)}
			</div>
		);
	};

	// Render content that can be used in both embedded and standalone modes
	const renderContent = () => {
		return (
			<>
				{loading ? (
					<div className="flex flex-col items-center justify-center h-64">
						<Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
						<p className="text-gray-600">{currentStep}</p>
					</div>
				) : error ? (
					<div className="flex flex-col items-center justify-center h-64">
						<p className="text-red-500 mb-2">Error: {error}</p>
						<Button onClick={() => window.location.reload()}>
							Try Again
						</Button>
					</div>
				) : simulation ? (
					<div
						className={`grid gap-6 ${embedded ? "h-full" : "h-[calc(100vh-240px)]"
							} ${isChatCollapsed
								? "grid-cols-1"
								: "grid-cols-1 md:grid-cols-3"
							}`}>
						{/* Chat panel */}
						<div
							className={`${isChatCollapsed ? "hidden" : "md:col-span-1"
								} bg-white rounded-xl shadow-sm overflow-hidden h-full`}>
							{renderChatInterface()}
						</div>
						{/* Results panel */}
						<div
							className={`${isChatCollapsed ? "md:col-span-1" : "md:col-span-2"
								} bg-white rounded-xl shadow-sm overflow-hidden h-full`}>
							{renderRightPanel()}
						</div>
					</div>
				) : null}
			</>
		);
	};

	// Render tabs for analysis sections
	const renderTabs = () => {
		return (
			<>
				<button
					onClick={() => setActiveTab("simulation")}
					className={`py-4 px-1 inline-flex items-center border-b-2 text-sm font-medium ${activeTab === "simulation"
						? "border-blue-500 text-blue-600"
						: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
						}`}>
					<BarChart2 className="mr-2 h-4 w-4" />
					Simulation Analysis
				</button>

				{/* Only show the Advanced Analysis tab if num_tabs > 1
				{numTabs > 1 && (
					<button
						onClick={() => setActiveTab("advanced")}
						className={`py-4 px-1 inline-flex items-center border-b-2 text-sm font-medium ${activeTab === "advanced"
							? "border-blue-500 text-blue-600"
							: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}>
						<Brain className="mr-2 h-4 w-4" />
						Advanced Analysis
						{optimizationStatus === "running" && (
							<span className="ml-2">
								<Loader2 className="h-3 w-3 animate-spin text-blue-500" />
							</span>
						)}
					</button>
				)} */}
			</>
		);
	};

	// New component for the simulation details dropdown with simplified structure
	const SimulationDetailsDropdown = () => {
		let contentData = parseContentField();
		if (!contentData || !simulation) return null;
		// Always show model used from simulation.source_model
		contentData = {
			...contentData,
			model_used: simulation.source_model || '',
		};

		// Function to render icon based on key
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
		const formatValue = (key: string, value: unknown): React.ReactNode => {
			// Format segment_ids
			if (key === "segment_ids" && Array.isArray(value)) {
				if (simulation?.segments) {
					return (
						<div className="flex flex-wrap gap-2 mt-2">
							{value.map((segmentId, idx) => {
								const segment = simulation.segments?.find(
									(s) => s.id === segmentId
								);
								return (
									<span
										key={idx}
										className="px-3 py-1.5 bg-blue-50/80 text-blue-700 border border-blue-200 rounded-full text-xs font-medium flex items-center gap-1.5">
										<Globe className="h-3 w-3" />
										{segment
											? segment.name
											: `Segment ${segmentId}`}
									</span>
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
				const personaFilters = value as Record<
					string,
					Record<string, unknown>
				>;

				return (
					<div className="mt-3 space-y-4">
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
									const hasFilters = Object.entries(
										filters
									).some(
										([, values]) =>
											Array.isArray(values) &&
											values.length > 0
									);

									// If no filters with values, don't render this segment's filter card
									if (!hasFilters) return null;

									return (
										<div
											key={idx}
											className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
											<div className="text-sm font-medium text-green-800 mb-3 pb-2 border-b border-green-50 flex items-center">
												<div className="bg-green-100 p-1.5 rounded-lg mr-2">
													<Layers className="h-4 w-4 text-green-600" />
												</div>
												{segmentName}
											</div>
											<div className="space-y-3">
												{Object.entries(filters)
													.filter(
														([, filterValues]) =>
															// Only include filter categories that have values
															Array.isArray(
																filterValues
															) &&
															filterValues.length >
															0
													)
													.map(
														(
															[
																filterKey,
																filterValues,
															],
															fidx
														) => (
															<div
																key={fidx}
																className="bg-green-50/50 rounded-lg p-3">
																<div className="flex items-center mb-2">
																	<Filter className="h-3.5 w-3.5 mr-1.5 text-green-700" />
																	<span className="text-xs font-semibold text-green-800 uppercase">
																		{
																			filterKey
																		}
																	</span>
																</div>
																<div className="flex flex-wrap gap-2">
																	{(
																		filterValues as string[]
																	).map(
																		(
																			val,
																			vidx
																		) => (
																			<span
																				key={
																					vidx
																				}
																				className="px-2.5 py-1 bg-white text-gray-700 border border-green-200 rounded-full text-xs font-medium shadow-sm">
																				{
																					val
																				}
																			</span>
																		)
																	)}
																</div>
															</div>
														)
													)}
											</div>
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

		return (
			<div className="absolute z-10 left-0 right-0 mt-2 mx-6 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
				<div className="max-h-[75vh] overflow-y-auto">
					{/* Summary section - Header */}
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
							<div className="flex items-center">
								<span className="text-xs text-gray-600 mr-3">
									{new Date(
										simulation.created_at
									).toLocaleString()}
								</span>
								<button
									onClick={() =>
										setIsDetailsDropdownOpen(false)
									}
									className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500"
									aria-label="Close summary">
									<ChevronUp className="h-5 w-5" />
								</button>
							</div>
						</div>
					</div>

					{/* Main content area */}
					<div className="p-5">
						{/* Key information grid */}
						<div className="grid grid-cols-2 gap-4 mb-6">
							{Object.entries(importantData).map(
								([key, value]) => (
									<div
										key={key}
										className="flex items-center bg-blue-50/50 p-3 rounded-lg border border-blue-100">
										<div className="mr-3 bg-blue-100 p-2 rounded-full">
											{getIconForKey(key === 'model_used' ? 'source_model' : key)}
										</div>
										<div>
											<p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
												{key === 'model_used' ? 'Model Used' : key.replace(/_/g, ' ')}
											</p>
											<p className="text-sm font-medium text-gray-800">
												{value as string}
											</p>
										</div>
									</div>
								)
							)}
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
									{formatValue(
										"segment_ids",
										contentData.segment_ids
									)}
								</div>
							</div>
						)}

						{/* Filters section */}
						{contentData.persona_filters &&
							Object.keys(contentData.persona_filters).length >
							0 && (
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
										{formatValue(
											"persona_filters",
											contentData.persona_filters
										)}
									</div>
								</div>
							)}

						{contentData.images &&
							contentData.images.length > 0 && (
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
										{contentData.images.map(
											(imageData, index) => (
												<img
													key={index}
													src={imageData}
													alt={`Image ${index + 1}`}
													className="w-full h-auto rounded-lg mb-2"
												/>
											)
										)}
									</div>
								</div>
							)}

						{/* Used Personas - COLLAPSIBLE */}
						{simulation.personas &&
							simulation.personas.length > 0 && (
								<div className="mb-6 border border-purple-100 rounded-lg overflow-hidden">
									<div
										className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-50/70 cursor-pointer"
										onClick={() =>
											setExpandedCards((prev) => ({
												...prev,
												personas: !prev.personas,
											}))
										}>
										<div className="flex items-center">
											<div className="mr-2 bg-purple-100 p-1.5 rounded-md">
												<Users className="h-4 w-4 text-purple-600" />
											</div>
											<h3 className="text-base font-medium text-purple-800">
												Used Profiles (
												{simulation.personas.length})
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
												{simulation.personas.map(
													(persona, index) => {
														const personaInfo =
															extractPersonaInfo(
																persona.data
															);
														return (
															<div
																key={index}
																className="bg-purple-50/40 p-3 rounded-lg border border-purple-100">
																<div className="flex justify-between items-start mb-2">
																	<div className="flex items-center space-x-2">
																		<div className="bg-purple-100 p-1 rounded-full">
																			<User className="h-3.5 w-3.5 text-purple-600" />
																		</div>
																		<p className="font-medium text-gray-800">
																			{
																				personaInfo.name
																			}
																		</p>
																	</div>
																	<div className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
																		{persona.name
																			? persona.name.replace(
																				/_/g,
																				" "
																			)
																			: "Profile"}
																	</div>
																</div>
																<div className="grid grid-cols-2 gap-2 mt-2 border-t border-purple-100/60 pt-2 text-xs">
																	<div className="flex items-center space-x-1.5">
																		<Calendar className="h-3 w-3 text-purple-600/70" />
																		<p>
																			<span className="text-gray-600">
																				Age:
																			</span>{" "}
																			<span className="text-gray-900 font-medium">
																				{
																					personaInfo.age
																				}
																			</span>
																		</p>
																	</div>
																	<div className="flex items-center space-x-1.5">
																		<Briefcase className="h-3 w-3 text-purple-600/70" />
																		<p className="text-sm">
																			<span className="text-gray-600">
																				Role:
																			</span>{" "}
																			<span className="text-gray-900 font-medium">
																				{
																					personaInfo.job_title
																				}
																			</span>
																		</p>
																	</div>
																	{personaInfo.behavioral_archetype !==
																		"N/A" && (
																			<div className="col-span-2 flex items-center space-x-1.5">
																				<Brain className="h-3 w-3 text-purple-600/70" />
																				<p className="text-sm">
																					<span className="text-gray-600">
																						Archetype:
																					</span>{" "}
																					<span className="text-gray-900 font-medium">
																						{
																							personaInfo.behavioral_archetype
																						}
																					</span>
																				</p>
																			</div>
																		)}
																</div>
															</div>
														);
													}
												)}
											</div>
										</div>
									)}
								</div>
							)}

						{/* Additional details */}
						{Object.entries(contentData).filter(
							([key]) =>
								!importantFields.includes(key) &&
								key !== "segment_ids" &&
								key !== "persona_filters" &&
								key !== "images" &&
								key !== "audience_id" &&
								key !== "image_descriptions"

							// key !== "task"
						).length > 0 && (
								<div className="mb-3">
									<div className="flex items-center mb-2">
										<div className="mr-2 bg-gray-100 p-1.5 rounded-md">
											<HelpCircle className="h-4 w-4 text-gray-600" />
										</div>
										<h3 className="text-base font-medium text-gray-700">
											Additional Information
										</h3>
									</div>
									<div className="bg-gray-50/70 p-3 rounded-lg border border-gray-200">
										<div className="space-y-3">
											{Object.entries(contentData)
												.filter(
													([key]) =>
														!importantFields.includes(
															key
														) &&
														key !== "segment_ids" &&
														key !== "persona_filters" &&
														key !== "images" &&
														key !== "image_descriptions" &&
														// key !== "task" &&
														key !== "audience_id"
												)
												.map(([key, value], idx) => (
													<div
														key={idx}
														className="flex flex-col bg-white p-3 rounded border border-gray-100">
														<div className="flex items-center mb-1.5">
															<div className="mr-2 bg-gray-100 p-1 rounded">
																{getIconForKey(key)}
															</div>
															<p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
																{key.replace(
																	/_/g,
																	" "
																)}
															</p>
														</div>
														<div className="text-sm ml-7">
															{formatValue(
																key,
																value
															)}
														</div>
													</div>
												))}
										</div>
									</div>
								</div>
							)}
					</div>

					{/* Footer */}
					<div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
						<button
							onClick={() => setIsDetailsDropdownOpen(false)}
							className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-gray-50">
							Close
						</button>
					</div>
				</div>
			</div>
		);
	};

	// Update the right panel to include the dropdown button and content
	const renderRightPanel = () => {

		const parsedResponse = parseSimulationResponse(simulation?.simulation_response || '');
    const contentData = parseContentField();
    const images = contentData?.images;
    const { winner, scores } = parsedResponse;

    // Custom table component to find "Rank" column and render images
    const CustomTableComponent = (props: any) => {
		const tableNode = props.node;
		if (!tableNode || !images || images.length === 0) {
		  return <table {...props} />;
		}
	  
		let rankColumnIndex = -1;
		let adIndexColumn = -1;
	  
		try {
		  const thead = tableNode.children.find((child: any) => child.tagName === 'thead');
		  if (thead) {
			const headerRow = thead.children.find((child: any) => child.tagName === 'tr');
			if (headerRow) {
			  headerRow.children.forEach((headerCell: any, index: number) => {
				if (headerCell.tagName === 'th') {
				  const headerContent = (headerCell.children[0]?.value || '').trim().toLowerCase();
				  if (headerContent.toLowerCase() === 'rank') {
					rankColumnIndex = index;
				  }
				  if (headerContent.toLowerCase() === 'ad index') {
					adIndexColumn = index;
				  }
				}
			  });
			}
		  }
		} catch (e) {
		  console.error("Error processing table headers for rank/ad_index column", e);
		}
	  
		if (rankColumnIndex === -1) {
		  return <table {...props} />;
		}
	  
		return (
		  <table {...props}>
			{React.Children.map(props.children, (child) => {
			  if (child.type === 'thead') {
				return (
				  <thead>
					{React.Children.map(child.props.children, (row) => (
					  <tr {...row.props}>
						{React.Children.map(row.props.children, (cell, cellIndex) => {
						  if (cellIndex === adIndexColumn) return null;
						  return cell;
						})}
					  </tr>
					))}
				  </thead>
				);
			  }
			  if (child.type === 'tbody') {
				return (
				  <tbody>
					{React.Children.map(child.props.children, (row) => (
					  <tr {...row.props}>
						{React.Children.map(row.props.children, (cell, cellIndex) => {
						  // Skip ad_index column in rendering
						  if (cellIndex === adIndexColumn) return null;
	  
						  if (cellIndex === rankColumnIndex) {
							// Get ad index if available
							let adIdx = null;
							if (adIndexColumn !== -1) {
							  const adIndexCell = row.props.children[adIndexColumn];
							  adIdx = parseInt(String(adIndexCell?.props?.children), 10);
							}
							const rankText = cell.props.children;
							const rank = parseInt(String(rankText), 10);
							const imageIdx = adIdx !== null && !isNaN(adIdx) ? adIdx : (rank - 1);
							if (!isNaN(imageIdx) && imageIdx >= 0 && imageIdx < images.length) {
							  const imageSrc = images[imageIdx];
							  return (
								<td {...cell.props}>
								  <div className="flex items-center justify-start gap-2" style={{ minWidth: 80, maxWidth: 180 }}>
									<span>{rankText}</span>
									<div className="relative group" style={{ display: 'inline-block' }}>
									  <img
										src={imageSrc}
										alt={`Ad ${imageIdx + 1}`}
										className="max-w-[80px] max-h-[60px] w-auto h-auto object-contain bg-gray-100 cursor-pointer rounded-md border"
										onClick={() => setPopupImage(imageSrc)}
									  />
									  <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-lg">
										Click to preview
									  </div>
									</div>
								  </div>
								</td>
							  );
							}
						  }
						  return cell;
						})}
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
  

    const abTestSection = images && typeof winner === 'number' && scores ? (
      <div className="p-6 bg-white border-b border-indigo-100">
          <div className="flex items-center space-x-2.5 mb-6">
              <Megaphone className="h-5 w-5 text-green-600" />
              <h4 className="text-base font-medium text-green-800">
                  Ad Creative Analysis
              </h4>
          </div>
          <div className="flex justify-center items-end gap-12 flex-wrap p-4">
              {images.map((imgSrc, index) => {
                  const isWinner = index === winner;
                  const score = scores[index];
                  const label = String.fromCharCode(65 + index);

                  return (
                      <div key={index} className={`flex flex-col items-center gap-4 transition-transform duration-300 ${isWinner ? 'scale-110' : 'scale-100'}`}>
                          <div className={`flex items-center text-2xl font-bold p-2 rounded-lg ${score > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {score > 0 ? '↑' : '↓'} {Math.abs(score)}
                          </div>
                          <div className={`relative rounded-lg p-2 shadow-lg transition-all duration-300 ease-in-out ${isWinner ? 'border-2 border-green-500 shadow-2xl bg-white' : 'border border-gray-300 bg-white'}`}>
                              <div className="absolute -top-4 -right-4 bg-white border-2 border-gray-300 rounded-full h-10 w-10 flex items-center justify-center font-bold text-gray-800 text-lg shadow-md">
                                  {label}
                              </div>

                              {isWinner && (
                                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1.5 text-sm font-bold rounded-full flex items-center shadow-lg z-10 whitespace-nowrap">
                                      <CheckCircle2 className="w-5 h-5 mr-2" />
                                      WINNER
                                  </div>
                              )}
                              
                              <img src={imgSrc} alt={`Ad Creative ${label}`} className="rounded-md max-w-sm mx-auto" />
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>
    ) : null;

		if (typeof simulation?.simulation_response === 'string' && simulation.simulation_response.toLowerCase().includes('sorry')) {
			return (
				<div className="flex flex-col items-center justify-center h-64">
					<p className="text-red-500 mb-4 text-lg font-semibold">{simulation.simulation_response}</p>
					<button
						className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
						disabled={rerunLoading}
						onClick={async () => {
							setRerunLoading(true);
							setRerunError('');
							try {
								const res = await fetch(`${API_URL}/simulations/${simulation.id}/rerun`, {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({ simulation_id: simulation.id }),
									credentials: 'include',
									signal: AbortSignal.timeout(300000) // 5 minute timeout
								});
								if (!res.ok) throw new Error('Failed to rerun simulation');
								const data = await res.json();
								if (!data.simulation_id) throw new Error('No new simulation id returned');
								// Start polling for the new simulation id
								navigate(`/simulation-results/${data.simulation_id}`);
							} catch (err: any) {
								setRerunError(err.message || 'Failed to rerun simulation');
							} finally {
								setRerunLoading(false);
							}
						}}
					>
						{rerunLoading ? 'Rerunning...' : 'Rerun Simulation'}
					</button>
					{rerunError && <div className="mt-2 text-red-600 text-sm font-medium">{rerunError}</div>}
				</div>
			);
		}
		console.log(showExportModal);
		return (
			<div className="md:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden h-full relative">

				{/* Simulation details button */}
				<div className="border-b border-gray-200 bg-white">
					<div className="px-1 py-2 flex justify-between items-center">
						<div className="flex items-center gap-4">
							<nav className="flex gap-4" aria-label="Tabs">
								<button
									onClick={() => setIsChatCollapsed(!isChatCollapsed)}
									className="flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors">
									<MessageSquare className="h-4 w-4" />
								</button>
								{renderTabs()}
							</nav>
						</div>
						<div className="flex items-center space-x-2">
							{/* Copy Output Button */}
							<button
								onClick={async () => {
									if (!simulation?.simulation_response) return;
									const parsed = parseSimulationResponse(simulation.simulation_response);
									// Copy output and tables as HTML and plain text
									let htmlToCopy = '';
									let textToCopy = '';
									// Output
									if (parsed.output) {
										htmlToCopy += `<div>${parsed.output}</div>`;
										textToCopy += parsed.output + '\n';
									}
									// Tables
									if (parsed.tables && parsed.tables.length > 0) {
										parsed.tables.forEach((table, idx) => {
											if (table.type === 'table' && table.headers && table.data) {
												htmlToCopy += '<table border="1" style="border-collapse:collapse;margin:8px 0;">';
												htmlToCopy += '<thead><tr>' + table.headers.map(h => `<th style="padding:4px 8px;background:#f0f0f0;">${h}</th>`).join('') + '</tr></thead>';
												htmlToCopy += '<tbody>' + table.data.map(row => '<tr>' + table.headers!.map(h => `<td style="padding:4px 8px;">${Array.isArray(row) ? row[table.headers!.indexOf(h)] : row[h]}</td>`).join('') + '</tr>').join('') + '</tbody>';
												htmlToCopy += '</table>';
												// Plain text
												textToCopy += '\n' + (table.title || `Table ${idx + 1}`) + '\n';
												textToCopy += table.headers.join('\t') + '\n';
												textToCopy += table.data.map(row => table.headers!.map(h => Array.isArray(row) ? row[table.headers!.indexOf(h)] : row[h]).join('\t')).join('\n') + '\n';
											}
										});
									}
									await navigator.clipboard.write([
										new window.ClipboardItem({
											'text/html': new Blob([htmlToCopy], { type: 'text/html' }),
											'text/plain': new Blob([textToCopy], { type: 'text/plain' })
										})
									]);
									setCopied(true);
									setTimeout(() => setCopied(false), 1200);
								}}
								className={`p-2 rounded-md border border-blue-200 bg-white hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${copied ? 'text-green-600 border-green-300 bg-green-50' : 'text-blue-700'}`}
								title="Copy simulation output and tables"
								aria-label="Copy simulation output and tables"
								onMouseEnter={() => setShowTooltip('copy')}
								onMouseLeave={() => setShowTooltip('')}
							>
								<Copy className="h-5 w-5" />
							</button>
							{showTooltip === 'copy' && (
								<div className="absolute left-1/2 -translate-x-1/2 mt-12 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 shadow-lg">
									Copy simulation output and tables
								</div>
							)}
							{copied && (
								<span className="text-green-600 text-xs ml-1 transition-opacity duration-200">Copied!</span>
							)}
							{/* Export Button */}
							<button
								onClick={() => setShowExportModal(true)}
								className="p-2 rounded-md border border-blue-200 bg-white hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-700"
								title="Export simulation analysis"
								aria-label="Export simulation analysis"
								onMouseEnter={() => setShowTooltip('export')}
								onMouseLeave={() => setShowTooltip('')}
							>
								<Download className="h-5 w-5" />
							</button>
							{showTooltip === 'export' && (
								<div className="absolute left-1/2 -translate-x-1/2 mt-12 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 shadow-lg">
									Export simulation analysis
								</div>
							)}
							{/* Simulation Inputs Button (existing) */}
							<button
								onClick={() => setIsDetailsDropdownOpen(!isDetailsDropdownOpen)}
								className="flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors">
								<FileText className="h-4 w-4" />
								<span>Simulation Inputs</span>
								{isDetailsDropdownOpen ? (
									<ChevronUp className="h-4 w-4" />
								) : (
									<ChevronDown className="h-4 w-4" />
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Dropdown for simulation details */}
				{isDetailsDropdownOpen && <SimulationDetailsDropdown />}		      
							  {/* Export Modal */}
							  {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
			
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setShowExportModal(false);
                setExportStatus('idle');
                setExportError('');
                setExportEmailStatus('idle');
                setExportEmailError('');
              }}
              aria-label="Close"
              onMouseEnter={() => setShowTooltip('closeExport')}
              onMouseLeave={() => setShowTooltip('')}
            >
              <ChevronDown className="h-5 w-5 rotate-180" />
            </button>
            {showTooltip === 'closeExport' && (
              <div className="absolute right-10 top-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                Close export modal
              </div>
            )}
            <h2 className="text-lg font-semibold mb-4 text-blue-800 flex items-center">
              <Download className="h-5 w-5 mr-2" /> Export Simulation Analysis
            </h2>
            <div className="space-y-3">
              <div className="relative">
                <button
                  className={`w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center ${pdfGenerating || !cachedPdfUrl ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={pdfGenerating || !cachedPdfUrl}
                  onClick={() => {
                    if (cachedPdfUrl) {
                      const link = document.createElement('a');
                      link.href = cachedPdfUrl;
                      link.download = 'simulation-analysis.pdf';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  onMouseEnter={() => setShowTooltip('exportPDF')}
                  onMouseLeave={() => setShowTooltip('')}
                >
                  {(!cachedPdfUrl || pdfGenerating)
                    ? (<><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Preparing PDF...</>)
                    : 'Export as PDF'}
                </button>
				{showTooltip === 'exportPDF' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setShowExportModal(false);
                setExportStatus('idle');
                setExportError('');
                setExportEmailStatus('idle');
                setExportEmailError('');
              }}
              aria-label="Close"
              onMouseEnter={() => setShowTooltip('closeExport')}
              onMouseLeave={() => setShowTooltip('')}
            >
              <ChevronDown className="h-5 w-5 rotate-180" />
            </button>
            {showTooltip === 'closeExport' && (
              <div className="absolute right-10 top-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                Close export modal
              </div>
            )}
            <h2 className="text-lg font-semibold mb-4 text-blue-800 flex items-center">
              <Download className="h-5 w-5 mr-2" /> Export Simulation Analysis
            </h2>
            <div className="space-y-3">
              <div className="relative">
                <button
                  className={`w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center ${pdfGenerating || !cachedPdfUrl ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={pdfGenerating || !cachedPdfUrl}
                  onClick={() => {
                    if (cachedPdfUrl) {
                      const link = document.createElement('a');
                      link.href = cachedPdfUrl;
                      link.download = 'simulation-analysis.pdf';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  onMouseEnter={() => setShowTooltip('exportPDF')}
                  onMouseLeave={() => setShowTooltip('')}
                >
                  {(!cachedPdfUrl || pdfGenerating)
                    ? (<><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Preparing PDF...</>)
                    : 'Export as PDF'}
                </button>
                {showTooltip === 'exportPDF' && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                    Download simulation analysis as PDF
                  </div>
                )}
              </div>
              <div className="text-center text-gray-400 text-xs">or</div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Send PDF to Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="recipient@example.com"
                  value={exportEmailTo}
                  onChange={e => setExportEmailTo(e.target.value)}
                  disabled={exportEmailStatus === 'sending'}
                />
                <div className="relative">
                  <button
                    className={`w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors ${exportEmailStatus === 'sending' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={exportEmailStatus === 'sending' || !exportEmailTo || !cachedPdfUrl}
                    onClick={async () => {
                      setExportEmailStatus('sending');
                      setExportEmailError('');
                      try {
                        if (!cachedPdfUrl) throw new Error('PDF not ready');
                        // Fetch the blob from the object URL
                        const pdfBlob = await fetch(cachedPdfUrl).then(res => res.blob());
                        const pdfDataUrl = await blobToDataURL(pdfBlob);
                        // Send to backend
                        const res = await fetch(`${API_URL}/send-simulation-pdf`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            to: exportEmailTo,
                            subject: 'Simulation Analysis PDF',
                            pdfDataUrl,
                          }),
                          credentials: 'include',
                          signal: AbortSignal.timeout(300000) // 5 minute timeout
                        });
                        if (!res.ok) throw new Error('Failed to send email');
                        setExportEmailStatus('success');
                      } catch (err: any) {
                        setExportEmailStatus('error');
                        setExportEmailError(err.message || 'Failed to send email');
                      }
                    }}
                    onMouseEnter={() => setShowTooltip('sendEmail')}
                    onMouseLeave={() => setShowTooltip('')}
                  >
                    {exportEmailStatus === 'sending' ? 'Sending...' : 'Send PDF to Email'}
                  </button>
                  {showTooltip === 'sendEmail' && (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                      Send PDF to the specified email address
                    </div>
                  )}
                </div>
                {exportEmailStatus === 'success' && (
                  <div className="mt-2 text-green-600 text-sm font-medium">Email sent successfully!</div>
                )}
                {exportEmailStatus === 'error' && (
                  <div className="mt-2 text-red-600 text-sm font-medium">{exportEmailError}</div>
                )}
              </div>
              {exportStatus === 'error' && (
                <div className="mt-2 text-red-600 text-sm font-medium">{exportError}</div>
              )}
            </div>
          </div>
        </div>
      )}
              </div>
              <div className="text-center text-gray-400 text-xs">or</div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Send PDF to Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="recipient@example.com"
                  value={exportEmailTo}
                  onChange={e => setExportEmailTo(e.target.value)}
                  disabled={exportEmailStatus === 'sending'}
                />
                <div className="relative">
                  <button
                    className={`w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors ${exportEmailStatus === 'sending' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={exportEmailStatus === 'sending' || !exportEmailTo || !cachedPdfUrl}
                    onClick={async () => {
                      setExportEmailStatus('sending');
                      setExportEmailError('');
                      try {
                        if (!cachedPdfUrl) throw new Error('PDF not ready');
                        // Fetch the blob from the object URL
                        const pdfBlob = await fetch(cachedPdfUrl).then(res => res.blob());
                        const pdfDataUrl = await blobToDataURL(pdfBlob);
                        // Send to backend
                        const res = await fetch(`${API_URL}/send-simulation-pdf`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            to: exportEmailTo,
                            subject: 'Simulation Analysis PDF',
                            pdfDataUrl,
                          }),
                          credentials: 'include',
                          signal: AbortSignal.timeout(300000) // 5 minute timeout
                        });
                        if (!res.ok) throw new Error('Failed to send email');
                        setExportEmailStatus('success');
                      } catch (err: any) {
                        setExportEmailStatus('error');
                        setExportEmailError(err.message || 'Failed to send email');
                      }
                    }}
                    onMouseEnter={() => setShowTooltip('sendEmail')}
                    onMouseLeave={() => setShowTooltip('')}
                  >
                    {exportEmailStatus === 'sending' ? 'Sending...' : 'Send PDF to Email'}
                  </button>
                  {showTooltip === 'sendEmail' && (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                      Send PDF to the specified email address
                    </div>
                  )}
                </div>
                {exportEmailStatus === 'success' && (
                  <div className="mt-2 text-green-600 text-sm font-medium">Email sent successfully!</div>
                )}
                {exportEmailStatus === 'error' && (
                  <div className="mt-2 text-red-600 text-sm font-medium">{exportEmailError}</div>
                )}
              </div>
              {exportStatus === 'error' && (
                <div className="mt-2 text-red-600 text-sm font-medium">{exportError}</div>
              )}
            </div>
          </div>
        </div>
      )}

				{activeTab === "simulation" ? (
					<div className="h-full overflow-auto p-1 max-h-[calc(90vh-120px)]" id="simulation-analysis-section">
						{/* No need to show content summary cards now that we have the dropdown */}
						<div className="mb-6 mt-2">
							<Card className="border border-indigo-200/50 shadow-md overflow-hidden transition-all duration-200">
								<div className="flex items-center justify-between px-1 py-4 bg-gradient-to-r from-indigo-50 to-indigo-50/70 border-b border-indigo-100">
									<div className="flex items-center">
										<div className="p-1 rounded-lg bg-indigo-100/80 text-indigo-600">
											<BarChart2 className="h-5 w-8" />
										</div>
										<h3 className="text-base font-medium text-indigo-800">
											Simulation Analysis
										</h3>
									</div>
								</div>
								<div className="bg-white">
									<div className="prose prose-blue max-w-none mb-3 markdown-body rounded-lg">
										
											
												
													{parsedResponse.tables && parsedResponse.tables.length > 0 && parsedResponse.tables.some((table: TableData) => table.type !== 'table') && (
														renderTables(parsedResponse.tables.filter((table: TableData) => table.type !== 'table'))
													)}



													<ReactMarkdown
														remarkPlugins={[remarkGfm]}
														rehypePlugins={[rehypeRaw]}
														components={{
															table: CustomTableComponent
														}}>
														{parsedResponse.output}
													</ReactMarkdown>

													{parsedResponse.tables && parsedResponse.tables.length > 0 && parsedResponse.tables.some((table: TableData) => table.type === 'table') && (
														renderTables(parsedResponse.tables.filter((table: TableData) => table.type === 'table'))
													)}


													{parsedResponse.hasJsonBlock && parsedResponse.analysis && (
														<div className="mt-6">
															<div className="border-t border-gray-200 pt-4">
																<button
																	onClick={() => setExpandedCards(prev => ({ ...prev, analysis: !prev.analysis }))}
																	className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900">
																	<div className="flex items-center">
																		<Brain className="h-4 w-4 mr-2 text-indigo-600" />
																		<span>Detailed Analysis</span>
																	</div>
																	{expandedCards.analysis ? (
																		<ChevronUp className="h-4 w-4" />
																	) : (
																		<ChevronDown className="h-4 w-4" />
																	)}
																</button>

																{expandedCards.analysis && (
																	<div className="mt-4 prose prose-sm prose-indigo max-w-none">
																		<ReactMarkdown
																			remarkPlugins={[remarkGfm]}
																			rehypePlugins={[rehypeRaw]}>
																			{parsedResponse.analysis}
																		</ReactMarkdown>
																	</div>
																)}
															</div>
														</div>
													)}								
									</div>
								</div>
							</Card>
						</div>
					</div>
				): (null)}
			</div>
		);
	};

	// Return different layouts based on embedded status
	return embedded ? (
		<div className="h-full">{renderContent()}</div>
	) : (
		<>
			<Layout>
				<style>{`
        .markdown-body table {
          display: table !important;
          width: 100% !important;
          table-layout: auto !important;
          overflow: visible !important;
        }
      `}</style>
				<div className="flex justify-between mb-6 items-center">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate("/")}
						icon={<ArrowLeft className="w-4 h-4 mr-1" />}>
						Back to Home
					</Button>

					{/* <Button
						variant="ghost"
						size="sm"
						onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
						icon={<History className="w-4 h-4 mr-1" />}>
						History
					</Button> */}
				</div>

				{/* Simulation History Panel */}
				<SimulationHistoryPanel
					isOpen={isHistoryPanelOpen}
					onClose={() => setIsHistoryPanelOpen(false)}
					onSelectSimulation={handleSelectHistorySimulation}
				/>

				{/* Overlay to close panel when clicking outside */}
				{isHistoryPanelOpen && (
					<div
						className="fixed inset-0 bg-black bg-opacity-30 z-20"
						onClick={() => setIsHistoryPanelOpen(false)}
					/>
				)}

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
						{error}
					</div>
				)}

				{loading ? (
					renderLoadingAnimation()
				) : (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
						{/* Swapped positions - Chat on the left, Results on the right */}
						<div className="md:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden h-full">
							{renderChatInterface()}
						</div>
						{renderRightPanel()}
					</div>
				)}
			</Layout>
			{popupImage && (
				<div
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-75"
					onClick={() => setPopupImage(null)}
				>
					<div className="relative p-4 bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
						<img
							src={popupImage}
							alt="Popup"
							className="max-w-screen-md max-h-[80vh] object-contain"
						/>
						<button
							onClick={() => setPopupImage(null)}
							className="absolute -top-3 -right-3 text-white bg-gray-800 rounded-full h-8 w-8 flex items-center justify-center text-lg font-bold hover:bg-black"
							aria-label="Close image popup"
						>
							&times;
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default SimulationResults;