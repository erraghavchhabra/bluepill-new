import BlackButton from "@/components/Buttons/BlackButton";
import { DoneCheckWhiteIcon, SelectAllIcon } from "@/icons/ChatPageIcons";
import { CloseXIcon, MessageSendButtonIcon } from "@/icons/Other";
import { UserIcon } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "../../components/ui/dialog.jsx";
import {
  CustomDialogContent as DialogContent,
  CustomDialogClose,
} from "../../components/ui/dialog-custom.jsx";
import {
  BehaviorsIcon,
  BuildingIcon,
  EducationPrimeIcon,
  GeographicsIcon,
  GoalPrimeIcon,
  GoalsPrimeIcon,
  GoalsYellowIcon,
  IncomePrimeIcon,
  InterestsIcon,
  InterestsPerpleIcon,
  LifeStageIcon,
  LocationPrimeIcon,
  MarriedIcon,
  PainPointsIcon,
  PersonaSegmentIcon,
  PetsPrimeIcon,
  PlayIcon,
  PreferredChanelIcon,
  PreferredChannelsIcon,
  PsychographicsIcon,
  PurchasingHabitsIcon,
  RightUniqueArrowIcon,
  SalesMarketingHooksIcon,
  SegmentNameIcon,
  SubsegmentIcon,
  TrustedSourcesIcon,
  ValueDriversIcon,
} from "@/icons/Other.js";
import { LocationIcon, PetsIcon } from "@/icons/simulatePageIcons.js";
import {
  PiBabyLight,
  PiGenderIntersex,
  PiPersonArmsSpread,
  PiSuitcase,
  PiUser,
  PiUsersLight,
} from "react-icons/pi";
import {
  ArrowLeft,
  User,
  Info,
  Building,
  Building2,
  Users,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Search,
  LucideCheck,
  BoneIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
interface Persona {
  id: number;
  name: string;
  [key: string]: any; // for extra details
}

interface Message {
  role: string;
  content: string;
  // Optionally, add timestamp, personaId, etc.
}

interface ChatUIProps {
  personaIds: number[];
  onBlack?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "";

// Recursive JSON tree view
const JsonTree: React.FC<{ data: any; level?: number }> = ({
  data,
  level = 0,
}) => {
  const [open, setOpen] = useState(true);
  if (typeof data !== "object" || data === null) {
    return <span className="text-blue-700">{JSON.stringify(data)}</span>;
  }
  const isArray = Array.isArray(data);
  const entries = isArray
    ? data.map((v: any, i: number) => [i, v])
    : Object.entries(data);
  return (
    <div className={`pl-${level * 4} border-l border-gray-100 ml-1`}>
      {" "}
      {/* Indent */}
      <button
        className="text-xs text-blue-500 hover:underline focus:outline-none mb-1"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        {open ? "▼" : "▶"} {isArray ? "Array" : "Object"} ({entries.length})
      </button>
      {open && (
        <div className="ml-2">
          {entries.map(([k, v]: any) => (
            <div key={k} className="mb-0.5">
              <span className="text-gray-700 font-mono text-xs">
                {isArray ? "" : <span className="text-purple-700">{k}</span>}
                {isArray ? "" : ": "}
              </span>
              {typeof v === "object" && v !== null ? (
                <JsonTree data={v} level={level + 1} />
              ) : (
                <span className="text-blue-700 font-mono text-xs">
                  {JSON.stringify(v)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
const SectionHeader = ({
  icon,
  title,
  number,
  titleColor = "primary2",
}: any) => {
  return (
    <div className="flex items-center w-full mb-3">
      {/* Icon and Title */}
      <div
        style={{ color: titleColor == "primary2" ? "#028B7E" : titleColor }}
        className={`flex items-center   gap-3 font-medium text-lg`}
      >
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
const GreenHeading = ({ text }: any) => {
  return (
    <div
      className="p-[12px_28px]  relative text-primary2 font-semibold text-base"
      style={{
        background:
          "linear-gradient(90deg, rgba(7, 229, 209, 0.05) 0%, rgba(7, 229, 209, 0.013942) 92.88%, rgba(7, 229, 209, 0) 100%)",
      }}
    >
      <div className="absolute left-0 top-0 rounded-r-lg h-full w-[5px] bg-primary2"></div>
      {text || "——————————————"}
    </div>
  );
};
const AdvancedDataContent = ({ title, data }: any) => {
  return (
    <>
      <GreenHeading text={title} />
      <ul className="list-disc pl-[34px] mt-[6px] mb-4">
        {data.map((point: any, idx: number) => (
          <li
            key={idx}
            className="text-[#595E64] text-[12px] leading-[23px] font-normal"
          >
            {point}
          </li>
        ))}
      </ul>
    </>
  );
};
const HabitsDataContent = ({
  title,
  data,
  icon,
  fromColor = "#E6FCFA",
}: any) => {
  return (
    <div className="side-card-shadow">
      <div
        className={`p-4 h-full  bg-gradient-to-b from-[${fromColor}] to-[#FEFEFE] rounded-2xl drop-shadow-md`}
      >
        <div className="flex items-start gap-3">
          <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
            {icon}
          </div>
          <div className="flex items-start flex-col justify-between w-full gap-2">
            <h3 className="text-black text-start font-medium text-sm ">
              {title}
            </h3>
          </div>
        </div>
        <ul className="list-disc pl-[34px] mt-[6px] mb-4">
          {data.map((point: any, idx: number) => (
            <li
              key={idx}
              className="text-[#595E64] text-[12px] leading-[23px] font-normal"
            >
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
const ChatUI: React.FC<ChatUIProps> = ({ personaIds, onBlack }) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<number[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDetailsId, setShowDetailsId] = useState<number | null>(null);

  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [chatHistoryId, setChatHistoryId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPersonasCount, setLoadingPersonasCount] = useState(0);
  const [aiTyping, setAiTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  const visiblePersonas = showAll ? personas : personas.slice(0, 5);

  // Progressive persona loading
  useEffect(() => {
    setPersonas([]);
    setLoading(true);
    setLoadingPersonasCount(personaIds.length);
    let isCancelled = false;

    if (personaIds.length === 0) {
      setLoading(false);

      setLoadingPersonasCount(0);
      return;
    }

    personaIds.forEach((id) => {
      fetch(`${API_URL}/personas/${id}`, {
        credentials: "include",
        signal: AbortSignal.timeout(5 * 60 * 1000), // 5 minute timeout
      })
        .then((res) => (res.ok ? res.json() : { id, name: `Persona ${id}` }))
        .then((data) => {
          if (!isCancelled) {
            setPersonas((prev) => {
              if (prev.some((p) => p.id === id)) return prev;
              return [...prev, { id: data.id, name: data.name }];
            });
            setLoadingPersonasCount((count) => count - 1);
          }
          setLoading(false);
        })
        .catch(() => {
          if (!isCancelled) {
            setPersonas((prev) => {
              if (prev.some((p) => p.id === id)) return prev;
              return [...prev, { id, name: `Persona ${id}` }];
            });
            setLoadingPersonasCount((count) => count - 1);
          }
          setLoading(false);
        });
    });

    return () => {
      isCancelled = true;
    };
  }, [personaIds]);

  // Fetch chat history if chatHistoryId changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!chatHistoryId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_URL}/persona_group_chat/${chatHistoryId}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch chat history");
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (e: any) {
        setError(e.message || "Failed to fetch chat history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [chatHistoryId]);
  useEffect(() => {
    setMessages([]);
  }, [selectedPersonaIds]);
  // Scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, aiTyping]);

  // Fetch full details for modal
  const handleShowDetails = async (id: number) => {
    setShowDetailsId(id);
    setLoadingDetails(true);
    setIsPersonaModalOpen(true);
    try {
      const res = await fetch(`${API_URL}/personas/${id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();

        setSelectedPersona(data);
      } else {
        setSelectedPersona(null);
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePersonaSelect = (id: number, checked: boolean) => {
    setSelectedPersonaIds((prev) =>
      checked ? [...prev, id] : prev.filter((pid) => pid !== id)
    );
  };

  const handleSend = async () => {
    if (!input.trim() || selectedPersonaIds.length === 0) return;
    setSending(true);
    setAiTyping(true);
    setError(null);
    try {
      const body = {
        persona_ids: selectedPersonaIds,
        query: input,
        chat_history_id: chatHistoryId,
      };
      // Add user message immediately for better UX
      setMessages((prev) => [...prev, { role: "user_group", content: input }]);
      setInput("");
      const res = await fetch(`${API_URL}/persona_group_chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send message");
      }
      const data = await res.json();
      setAiTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "group", content: data.response },
      ]);
      if (data.chat_history_id) setChatHistoryId(data.chat_history_id);
    } catch (e: any) {
      setAiTyping(false);
      setError(e.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };
  const PersonalInformationData = [
    {
      key: "age",
      label: "Age",
      icon: <PiPersonArmsSpread size={20} />,
      value: selectedPersona?.age,
    },
    {
      key: "gender",
      label: "Gender",
      icon: <PiGenderIntersex size={20} />,
      value: selectedPersona?.gender,
    },
    {
      key: "location",
      label: "Location",
      icon: <LocationPrimeIcon />,
      value: selectedPersona?.location,
    },
    {
      key: "income",
      label: "Income",
      icon: <IncomePrimeIcon />,
      value: selectedPersona?.income,
    },
    {
      key: "education",
      label: "Education",
      icon: <EducationPrimeIcon />,
      value: selectedPersona?.education,
    },
  ].filter((field) => field.value);
  const ConsumerDetailsData = [
    {
      key: "age_group",
      label: "Age Group",
      icon: <PiPersonArmsSpread size={20} />,
      value: selectedPersona?.data?.age_group,
    },
    {
      key: "household_income",
      label: "Income Range",
      icon: <PiUsersLight />,
      value: selectedPersona?.data?.household_income,
    },
    {
      key: "geo_location",
      label: "Location Type",
      icon: <LocationIcon />,
      value: selectedPersona?.data?.geo_location,
    },
    {
      key: "pets",
      label: "Pets",
      icon: <PetsIcon />,
      value: selectedPersona?.data?.pets,
    },
    {
      key: "children",
      label: "Children",
      icon: <PiBabyLight size={20} />,
      value: selectedPersona?.data?.children,
    },
  ].filter((field) => field.value);
  let count = 1;
  return (
    <div className="flex h-[500px] items-center gap-[30px]  ">
      {/* Sidebar for persona selection */}
      <div className="flex flex-col h-full justify-start gap-[30px] w-full min-w-[180px] max-w-[320px]">
        <div className=" bg-white rounded-2xl p-5 flex flex-col h-[83.5%]">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-black">Personas</h3>
            <button
              className="text-primary2 text-xs font-medium flex items-center gap-2"
              disabled={personas.length === 0}
              onClick={() => {
                if (selectedPersonaIds.length === personas.length) {
                  setSelectedPersonaIds([]);
                } else {
                  setSelectedPersonaIds(personas.map((p) => p.id));
                }
              }}
            >
              <SelectAllIcon />
              {selectedPersonaIds.length === personas.length &&
              personas.length > 0
                ? "Deselect All Segments"
                : "Select All Segments"}
            </button>
          </div>
          <div className="flex items-start flex-col overflow-y-auto scrollbar-hide gap-3 mt-5 ">
            {loading && (
              <div className="flex flex-col justify-center items-center h-full py-8 text-gray-400">
                <svg
                  className="animate-spin h-8 w-8 text-blue-500 mb-2"
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
                <div>Loading personas...</div>
              </div>
            )}
            {/* {!loading && visiblePersonas.length === 0 && (
              <div className="text-gray-400 text-sm">No personas found.</div>
            )} */}
            {visiblePersonas.length > 0 &&
              visiblePersonas.map((p) => (
                <div
                  key={p.id}
                  className={`w-full flex items-center justify-between gap-[10px]  border-l-4 rounded-xl p-[10px] pl-[18px] ${
                    selectedPersonaIds.includes(p.id)
                      ? "border-primary2 bg-[#E6FCFA]"
                      : "bg-[#FAFAFA] border-transparent"
                  }`}
                >
                  <div className={`flex items-center gap-[10px]`}>
                    <div
                      className={`w-9 h-9 relative rounded-full border ${
                        selectedPersonaIds.includes(p.id)
                          ? "bg-primary2 border-primary2"
                          : "bg-transparent "
                      }`}
                    >
                      <div className="absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4">
                        <UserIcon />
                      </div>
                    </div>
                    <div className="flex items-start flex-col gap-1">
                      <label
                        htmlFor={`persona-checkbox-${p.id}`}
                        className={`text-sm text-start ${
                          selectedPersonaIds.includes(p.id)
                            ? "font-semibold text-primary2"
                            : "text-[#595E64] font-medium"
                        }`}
                      >
                        {p.name}
                      </label>
                      <button
                        onClick={() => handleShowDetails(p.id)}
                        className={`text-sm font-normal underline text-start ${
                          selectedPersonaIds.includes(p.id)
                            ? " text-black"
                            : "text-[#595E64] "
                        }`}
                      >
                        View Detail
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={`persona-checkbox-${p.id}`}
                      checked={selectedPersonaIds.includes(p.id)}
                      onChange={(e) =>
                        handlePersonaSelect(p.id, e.target.checked)
                      }
                      className="sr-only" // hides it visually but still accessible
                    />
                    <label
                      htmlFor={`persona-checkbox-${p.id}`}
                      className={`w-5 h-5 rounded-[4px] border flex items-center justify-center cursor-pointer transition-all duration-200 ${
                        selectedPersonaIds.includes(p.id)
                          ? "bg-primary2 border-primary2"
                          : "bg-white border-[#AEAEB2]"
                      }`}
                    >
                      {selectedPersonaIds.includes(p.id) && (
                        <DoneCheckWhiteIcon />
                      )}
                    </label>
                  </div>
                </div>
              ))}
            {/* Show More / Show Less Button */}
            {personas.length > 6 && (
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="text-sm underline text-primary2 mt-2 self-start"
              >
                {showAll ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
        </div>
        <BlackButton onClick={onBlack} className="w-full">
          Back to segment selection
        </BlackButton>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full bg-white rounded-2xl p-[30px]">
        {/* Chat area */}
        <div
          className="flex-1 overflow-y-auto scrollbar-hide"
          ref={chatContainerRef}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg
                className="h-10 w-10 mb-2 animate-spin"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
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
              <div>Loading chat...</div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm flex items-center justify-center h-full">
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full bg-white  rounded-2xl">
              <img src="/images/noMessageImage.png" alt="no-messages-yet" />

              <div className="flex flex-col items-center gap-2">
                <h3 className="text-primary2 text-[28px] font-semibold">
                  No messages yet
                </h3>
                <p className="font-medium text-black text-sm">
                  Start the conversation!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((msg: any, idx: number) => {
                const isUser = msg.role === "user" || msg.role === "user_group";
                const isAI = msg.role === "group";
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
                      isUser ? "justify-end" : "justify-start"
                    } animate-fadeIn`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl border-[1.5px] text-xs  ${
                        isUser
                          ? " text-black rounded-br-none border-[#E6FCFA]"
                          : "text-[#595E64] rounded-bl-none border-[#F5F5F5]"
                      }`}
                    >
                      <div className="flex flex-col items-end gap-3 whitespace-pre-line">
                        {isAI ? (
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        ) : (
                          msg.content
                        )}
                        {msg?.timestamp && (
                          <p className="text-primary2 text-xs font-medium text-end">
                            {formatTo12HourTime(msg?.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {aiTyping && (
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
          )}
        </div>

        {/* Input area */}
        <div className=" w-full flex items-center pl-5 gap-3 bg-gray_light rounded-full justify-between mt-5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="outline-none border-none text-sm font-normal text-[#595E64] w-full bg-gray_light"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            disabled={sending}
          />
          <button
            onClick={handleSend}
            type="button"
            disabled={
              sending || !input.trim() || selectedPersonaIds.length === 0
            }
            className="flex cursor-pointer items-center justify-center min-w-14  max-w-14 w-full h-14 bg-primary rounded-full group"
          >
            <div className="transition-all duration-200 group-hover:translate-x-[2px] group-hover:translate-y-[-2px]">
              <MessageSendButtonIcon />
            </div>
          </button>
        </div>
      </div>
      <Dialog open={isPersonaModalOpen} onOpenChange={setIsPersonaModalOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/40 z-40" />

          <DialogContent
            className={cn(
              "fixed right-0 top-0 z-50 h-screen max-w-[60vw] rounded-none w-full bg-white",
              "overflow-hidden border-l border-gray-200 ",
              "animate-in slide-in-from-right duration-300"
            )}
          >
            {loadingDetails ? (
              <div className="flex flex-col justify-center items-center h-full py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading profiles...</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row h-full p-[30px] pr-[15px] bg-white">
                {/* Left side: Role accordion with personas */}

                {/* Right side: Persona Details */}
                <div className="flex-1 overflow-hidden flex flex-col h-[100vh]">
                  <div className="overflow-y-auto bg-white h-full custom-scrollbar pr-[15px]">
                    {selectedPersona ? (
                      <div className=" relative animate-fadeIn w-full">
                        <div className="flex items-center justify-between pb-5 sticky top-0 left-0 bg-white z-50">
                          <div className="flex items-start flex-col gap-2">
                            <h3 className="text-2xl font-semibold text-primary2">
                              Bone Broth Buyers
                            </h3>
                            <p className="text-base font-medium text-black">
                              Explore detailed profiles for this segment
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setIsPersonaModalOpen(false);
                            }}
                          >
                            <CloseXIcon />
                          </button>
                        </div>
                        {/* Persona Header */}
                        <div className="side-card-shadow mb-4">
                          <div className="bg-gradient-to-b rounded-[16px]  from-[#E6FCFA] to-[#FEFEFE] px-5 py-3   justify-between   flex items-center gap-[10px]">
                            <div className="flex items-center gap-[10px]">
                              <div
                                className={`p-3 relative rounded-full transition-all duration-200 h-[50px] w-[50px] bg-primary `}
                              >
                                <UserIcon className="absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 text-gray-600" />
                              </div>
                              <h3 className="text-2xl  font-semibold text-primary2">
                                {selectedPersona.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-[10px] text-primary2">
                              <PiSuitcase size={24} />
                              <span className="font-medium">
                                {selectedPersona.job_title ||
                                  "No title available"}
                                {selectedPersona.company_name &&
                                  ` at ${selectedPersona.company_name}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white">
                          {/* Main Info Sections Grid */}
                          <div className="grid md:grid-cols-2 gap-x-[25px] gap-y-5">
                            {/* Personal Info Section */}
                            <div
                              className={
                                ConsumerDetailsData?.length > 0
                                  ? ""
                                  : "col-span-2"
                              }
                            >
                              {/* <h4 className="font-medium text-blue-800 mb-4 flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                Personal Information
                              </h4> */}
                              <SectionHeader
                                icon={<PiUser size={24} />}
                                title="Personal Information"
                                number={
                                  PersonalInformationData?.length > 0
                                    ? count++
                                    : count
                                }
                              />
                              <div className="side-card-shadow">
                                <div className="p-4  bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl">
                                  <div className="flex flex-col gap-4">
                                    {PersonalInformationData?.map(
                                      (field: any, index: number) => (
                                        <div
                                          key={index}
                                          className="flex items-start gap-3"
                                        >
                                          <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                            {field.icon}
                                          </div>
                                          <div className="flex items-start justify-between w-full gap-1">
                                            <h3 className="text-black font-medium text-sm ">
                                              {field.label}
                                            </h3>
                                            <span className="text-primary2 font-semibold text-xs text-right ">
                                              {field.value}
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Professional Info Section - Adjust fields for B2C personas */}
                            {ConsumerDetailsData?.length > 0 && (
                              <div className="">
                                <SectionHeader
                                  icon={<BuildingIcon />}
                                  title="Consumer Details"
                                  number={
                                    ConsumerDetailsData?.length > 0
                                      ? count++
                                      : count
                                  }
                                  titleColor="#4F46E5"
                                />
                                <div className="side-card-shadow">
                                  <div className="p-4 bg-gradient-to-b from-[#E0E7FF] to-[#FEFEFE] rounded-2xl">
                                    <div className="flex flex-col gap-4">
                                      {ConsumerDetailsData?.map(
                                        (field, index) => (
                                          <div
                                            key={index}
                                            className="flex items-start gap-3"
                                          >
                                            <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                              {field.icon}
                                            </div>
                                            <div className="flex items-start justify-between w-full gap-1">
                                              <h3 className="text-black font-medium text-sm ">
                                                {field.label}
                                              </h3>
                                              <span className="text-primary2 font-semibold text-xs text-right">
                                                {field.value}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {selectedPersona.goals &&
                              selectedPersona.goals.length > 0 && (
                                <div className="">
                                  <SectionHeader
                                    icon={<GoalPrimeIcon />}
                                    title="Goals"
                                    number={
                                      selectedPersona.goals.length > 0
                                        ? count++
                                        : count
                                    }
                                  />
                                  <div className="side-card-shadow">
                                    <div className="p-4  bg-gradient-to-b from-[#D1FAE5] to-[#FEFEFE] rounded-2xl drop-shadow-md ">
                                      <div className="flex flex-col gap-4">
                                        {selectedPersona.goals.map(
                                          (goal: string, index: number) => (
                                            <div
                                              key={index}
                                              className="flex items-start gap-3"
                                            >
                                              <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                                <GoalsPrimeIcon />
                                              </div>
                                              <div className="flex items-start justify-between w-full gap-1">
                                                <h3 className="text-black font-normal text-xs">
                                                  {goal}
                                                </h3>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                            {selectedPersona.behaviors &&
                              selectedPersona.behaviors.length > 0 && (
                                <div className="">
                                  <SectionHeader
                                    icon={<BehaviorsIcon />}
                                    title="Behaviors"
                                    number={
                                      selectedPersona.behaviors.length > 0
                                        ? count++
                                        : count
                                    }
                                    titleColor="#E9BC3B"
                                  />
                                  <div className="side-card-shadow">
                                    <div className="p-4  bg-gradient-to-b from-[#FFF7E0CC] to-[#FEFEFE] rounded-2xl drop-shadow-md">
                                      <div className="flex flex-col gap-4">
                                        {selectedPersona.behaviors.map(
                                          (behavior: string, index: number) => (
                                            <div
                                              key={index}
                                              className="flex items-start gap-3"
                                            >
                                              <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                                <GoalsYellowIcon />
                                              </div>
                                              <div className="flex items-start justify-between w-full gap-1">
                                                <h3 className="text-black font-normal text-xs">
                                                  {behavior}
                                                </h3>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                            {selectedPersona.interests &&
                              selectedPersona.interests.length > 0 && (
                                <div className="">
                                  <SectionHeader
                                    icon={<InterestsIcon />}
                                    title="Interests"
                                    number={
                                      selectedPersona.interests.length > 0
                                        ? count++
                                        : count
                                    }
                                    titleColor="#8B47C8"
                                  />
                                  <div className="side-card-shadow">
                                    <div className="p-4  bg-gradient-to-b from-[#EEDBFFCC] to-[#FEFEFE] rounded-2xl drop-shadow-md">
                                      <div className="flex flex-col gap-4">
                                        {selectedPersona.interests.map(
                                          (interest: string, index: number) => (
                                            <div
                                              key={index}
                                              className="flex items-start gap-3"
                                            >
                                              <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                                <InterestsPerpleIcon />
                                              </div>
                                              <div className="flex items-start justify-between w-full gap-1">
                                                <h3 className="text-black font-normal text-xs">
                                                  {interest}
                                                </h3>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                            {selectedPersona.preferred_channels &&
                              selectedPersona.preferred_channels.length > 0 && (
                                <div className="">
                                  <SectionHeader
                                    icon={<PreferredChannelsIcon />}
                                    title="Preferred Channels"
                                    number={
                                      selectedPersona.preferred_channels
                                        .length > 0
                                        ? count++
                                        : count
                                    }
                                  />
                                  <div className="side-card-shadow">
                                    <div className="p-4  bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
                                      <div className="flex flex-col gap-4">
                                        {selectedPersona.preferred_channels.map(
                                          (channel: string, index: number) => (
                                            <div
                                              key={index}
                                              className="flex items-start gap-3"
                                            >
                                              <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                                <PreferredChanelIcon />
                                              </div>
                                              <div className="flex items-start justify-between w-full gap-1">
                                                <h3 className="text-black font-normal text-xs">
                                                  {channel}
                                                </h3>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                          <div className="w-full pt-5">
                            {selectedPersona.pain_points &&
                              selectedPersona.pain_points.length > 0 && (
                                <div className="">
                                  <SectionHeader
                                    icon={<PainPointsIcon />}
                                    title="Pain Points"
                                    number={
                                      selectedPersona.pain_points.length > 0
                                        ? count++
                                        : count
                                    }
                                    titleColor="#C84747"
                                  />
                                  <div className="side-card-shadow">
                                    <div className="p-4  bg-gradient-to-b from-[#FFD8D880] to-[#FEFEFE] rounded-2xl drop-shadow-md">
                                      <div className="flex flex-col gap-4">
                                        {selectedPersona.pain_points.map(
                                          (point: string, index: number) => (
                                            <div
                                              key={index}
                                              className="flex items-start gap-3"
                                            >
                                              <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                                <RightUniqueArrowIcon />
                                              </div>
                                              <div className="flex items-start justify-between w-full gap-1">
                                                <h3 className="text-black font-normal text-xs">
                                                  {point}
                                                </h3>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                          {/* Replace the hardcoded sections with dynamic rendering */}
                          <div className="space-y-6 mt-4">
                            {/* Dynamic rendering of additional data (excluding basic fields already shown) */}
                            <div className="mt-10">
                              <h3 className="text-2xl  font-semibold text-black mb-5">
                                Additional Details
                              </h3>
                              {selectedPersona?.children && (
                                <div className="side-card-shadow">
                                  <div className="p-4  bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md ">
                                    <div className="flex items-start gap-3">
                                      <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                        <PiBabyLight size={24} />
                                      </div>
                                      <div className="flex items-center justify-between w-full gap-1">
                                        <h3 className="text-black font-medium text-sm ">
                                          Children
                                        </h3>
                                        <span className="text-primary2 font-semibold text-xs text-right ">
                                          {selectedPersona?.children?.toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className=" border-2 border-[#ECECEC] bg-gradient-to-b from-[#F8F8F8] to-[#FEFEFE] rounded-2xl drop-shadow-md mt-5">
                                <h3 className="p-4 text-xl font-semibold text-black">
                                  Customer Profile Insights
                                </h3>
                                <AdvancedDataContent
                                  title="Concerns And Obstacles:"
                                  data={
                                    selectedPersona?.customer_profile_insights
                                      ?.concerns_and_obstacles
                                  }
                                />
                                <AdvancedDataContent
                                  title="Decision Criteria:"
                                  data={
                                    selectedPersona?.customer_profile_insights
                                      ?.decision_criteria
                                  }
                                />
                                <AdvancedDataContent
                                  title="Expected Outcomes:"
                                  data={
                                    selectedPersona?.customer_profile_insights
                                      ?.expected_outcomes
                                  }
                                />
                                <AdvancedDataContent
                                  title="Path To Purchase:"
                                  data={
                                    selectedPersona?.customer_profile_insights
                                      ?.path_to_purchase
                                  }
                                />
                                <AdvancedDataContent
                                  title="Triggers And Motivations:"
                                  data={
                                    selectedPersona?.customer_profile_insights
                                      ?.triggers_and_motivations
                                  }
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-5 items-center mt-5">
                                {selectedPersona?.geographics && (
                                  <div className="side-card-shadow">
                                    <div className="p-4  bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
                                      <div className="flex items-start gap-3">
                                        <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                          <GeographicsIcon />
                                        </div>
                                        <div className="flex items-start flex-col justify-between w-full gap-2">
                                          <h3 className="text-black text-start font-medium text-sm ">
                                            Geographics
                                          </h3>
                                          <span className="text-primary2 text-start font-semibold text-xs ">
                                            {selectedPersona?.geographics?.toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {selectedPersona?.married && (
                                  <div className="side-card-shadow">
                                    <div className="p-4  bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
                                      <div className="flex items-start gap-3">
                                        <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                          <MarriedIcon />
                                        </div>
                                        <div className="flex items-start flex-col justify-between w-full gap-2">
                                          <h3 className="text-black text-start font-medium text-sm ">
                                            Married
                                          </h3>
                                          <span className="text-primary2 text-start font-semibold text-xs  ">
                                            {selectedPersona?.married?.toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {selectedPersona?.pets && (
                                  <div className="side-card-shadow">
                                    <div className="p-4  bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
                                      <div className="flex items-start gap-3">
                                        <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                          <PetsPrimeIcon />
                                        </div>
                                        <div className="flex items-start flex-col justify-between w-full gap-2">
                                          <h3 className="text-black text-start font-medium text-sm ">
                                            Pets
                                          </h3>
                                          <span className="text-primary2 text-start font-semibold text-xs  ">
                                            {selectedPersona?.pets?.toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-5 items-center mt-5">
                                {selectedPersona?.life_stage && (
                                  <div className="side-card-shadow">
                                    <div className="p-4  bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
                                      <div className="flex items-start gap-3">
                                        <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                          <LifeStageIcon />
                                        </div>
                                        <div className="flex items-start flex-col justify-between w-full gap-2">
                                          <h3 className="text-black text-start font-medium text-sm ">
                                            Life Stage
                                          </h3>
                                          <span className="text-primary2 text-start font-semibold text-xs ">
                                            {selectedPersona?.life_stage?.toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {selectedPersona?.persona_segment && (
                                  <div className="side-card-shadow">
                                    <div className="p-4  bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
                                      <div className="flex items-start gap-3">
                                        <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                          <PersonaSegmentIcon />
                                        </div>
                                        <div className="flex items-start flex-col justify-between w-full gap-2">
                                          <h3 className="text-black text-start font-medium text-sm ">
                                            Persona Segment
                                          </h3>
                                          <span className="text-primary2 text-start font-semibold text-xs  ">
                                            {selectedPersona?.persona_segment?.toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {selectedPersona?.psychographics && (
                                <div className="side-card-shadow mt-5">
                                  <div className="p-4  bg-gradient-to-b from-[#F8F8F8] to-[#FEFEFE] rounded-2xl drop-shadow-md ">
                                    <div className="flex items-start gap-3">
                                      <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                        <PsychographicsIcon />
                                      </div>
                                      <div className="flex items-start flex-col justify-between w-full gap-2">
                                        <h3 className="text-black text-start font-medium text-sm ">
                                          Psychographics
                                        </h3>
                                        <span className="text-[#595E64] text-start font-normal text-xs ">
                                          {selectedPersona?.psychographics}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-5 items-center mt-5">
                                <HabitsDataContent
                                  title="Purchasing Habits"
                                  icon={<PurchasingHabitsIcon />}
                                  fromColor="#F8F8F8"
                                  data={selectedPersona?.purchasing_habits}
                                />
                                <HabitsDataContent
                                  title="Sales Marketing Hooks"
                                  icon={<SalesMarketingHooksIcon />}
                                  fromColor="#F8F8F8"
                                  data={selectedPersona?.sales_marketing_hooks}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-5 items-center mt-5">
                                {selectedPersona?.segment_name && (
                                  <div className="side-card-shadow">
                                    <div className="p-4  bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
                                      <div className="flex items-start gap-3">
                                        <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                          <SegmentNameIcon />
                                        </div>
                                        <div className="flex items-start flex-col justify-between w-full gap-2">
                                          <h3 className="text-black text-start font-medium text-sm ">
                                            Segment Name
                                          </h3>
                                          <span className="text-primary2 text-start font-semibold text-xs ">
                                            {selectedPersona?.segment_name?.toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {selectedPersona?.subsegment && (
                                  <div className="side-card-shadow">
                                    <div className="p-4 bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
                                      <div className="flex items-start gap-3">
                                        <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                          <SubsegmentIcon />
                                        </div>
                                        <div className="flex items-start flex-col justify-between w-full gap-2">
                                          <h3 className="text-black text-start font-medium text-sm ">
                                            Subsegment
                                          </h3>
                                          <span className="text-primary2 text-start font-semibold text-xs  ">
                                            {selectedPersona?.subsegment?.toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-5 items-center mt-5 mb-16">
                                <HabitsDataContent
                                  title="Trusted Sources"
                                  icon={<TrustedSourcesIcon />}
                                  fromColor="#F8F8F8"
                                  data={selectedPersona?.trusted_sources}
                                />
                                <HabitsDataContent
                                  title="Value Drivers"
                                  icon={<ValueDriversIcon />}
                                  fromColor="#F8F8F8"
                                  data={selectedPersona?.value_drivers}
                                />
                              </div>
                              {/* {selectedPersona.data &&
                                renderDynamicPersonaData(selectedPersona.data, [
                                  "age_group",
                                  "household_income",
                                  "geo_location",
                                  "pets",
                                  "children",
                                ])} */}
                              {/* Also render any top-level persona fields we haven't explicitly handled */}
                              {/* {renderDynamicPersonaData(
                                Object.entries(selectedPersona)
                                  .filter(
                                    ([key]) =>
                                      ![
                                        "id",
                                        "name",
                                        "age",
                                        "gender",
                                        "job_title",
                                        "company_name",
                                        "income",
                                        "education",
                                        "location",
                                        "interests",
                                        "goals",
                                        "pain_points",
                                        "behaviors",
                                        "values",
                                        "preferred_channels",
                                        "data",
                                        "created_at",
                                        "updated_at",
                                        "segment_id",
                                      ].includes(key)
                                  )
                                  .reduce(
                                    (obj, [key, value]) => ({
                                      ...obj,
                                      [key]: value,
                                    }),
                                    {}
                                  )
                              )} */}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <div className="bg-red-50 p-6 rounded-full mb-4 border border-red-100">
                          <User className="w-12 h-12 text-red-400" />
                        </div>
                        <p className="text-lg text-gray-600 mb-2 font-semibold">
                          No Data Found
                        </p>
                        <p className="text-sm text-gray-500 text-center">
                          We couldn’t find any profile data. Please try again
                          later or refresh.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
      {/* Details Modal */}
    </div>
  );
};

export default ChatUI;
