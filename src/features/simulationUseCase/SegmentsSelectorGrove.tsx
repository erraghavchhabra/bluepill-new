import React, { useState, useEffect } from "react";
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
  UserIcon,
  FunctionSquare,
  RollerCoaster,
  Shield,
  ArrowBigRight,
} from "lucide-react";
import Button from "../../components/Button";
import StepContainer from "../../components/StepContainer";
import { useAudience } from "../../context/AudienceContext";
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
import { cn } from "../../lib/utils";
import TooltipBox from "@/components/Buttons/TooltipBox.js";
import { PiBabyLight, PiGenderIntersex, PiPersonArmsSpread, PiSuitcase, PiUser, PiUsers, PiUsersLight } from "react-icons/pi";
import {
  BoneIcon,
  IndustryIcon,
  LocationIcon,
  PetsIcon,
  RightWhiteArrow,
} from "@/icons/simulatePageIcons.js";
import { HiOutlineUserGroup } from "react-icons/hi";
import PrimaryButton from "@/components/Buttons/PrimaryButton.js";
import BlackButton from "@/components/Buttons/BlackButton.js";
import {
  BehaviorsIcon,
  BuildingIcon,
  CloseXIcon,
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
interface SegmentsSelectorProps {
  btn_text?: string; // Optional prop with default value "Continue to Use Cases"
  audienceId: number;
  onBack: () => void;
  onNext: (
    selectedSegments: number[],
    personaFilters: Record<number, any>
  ) => void;
  onEditStep?: () => void;
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

// Updated constants with industry-standard values for B2C demographic targeting
// const AGE_GROUPS = [
//     "35 - 44",
//     '45 - 55',
//     '55 & above'
// ];

// const HOUSEHOLD_INCOME = [
//     '100k - 150k',
//     '150k & above'
// ];

// const GEO_LOCATIONS = [
//   'Urban',
//   'Suburban',
//   'Rural'
// ];

// const PETS = [
//   'Has Pets',
//   'No Pets'
// ];

// const CHILDREN = [
//   'Has Children',
//   'No Children',
// ];

const AGE_GROUPS = [
  "Generation Z(18 - 23)",
  "Millenials(24 - 37)",
  "Generation X(38 - 53)",
  "Baby boomers(54 - 72)",
  "Retirees(73 and over)",
];

const HOUSEHOLD_INCOME = ["100k - 150k", "150k and over"];

const GEO_LOCATIONS = ["Urban", "Suburban", "Rural"];

const PETS = ["Yes", "No"];

const MARITAL_STATUS = ["Yes", "No"];

const CHILDREN = ["1", "2", "3", "4 and over"];

// Interface for persona type
interface PersonaType {
  id: number;
  name: string;
  age?: number | string;
  gender?: string;
  job_title?: string;
  company_name?: string;
  income?: string;
  education?: string;
  location?: string;
  interests?: string[];
  goals?: string[];
  pain_points?: string[];
  behaviors?: string[];
  values?: string[];
  preferred_channels?: string[];
  purchasing_habits?: string[];
  customer_profile_insights?: {
    triggers_and_motivations?: string[];
    concerns_and_obstacles?: string[];
    decision_criteria?: string[];
    expected_outcomes?: string[];
    path_to_purchase?: string[];
  };
  created_at: string;
  updated_at: string;
  segment_id?: number;
  data?: any;
  [key: string]: any; // For any other fields
}
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
    <div
      className={`p-4 border-2 h-full border-[#ECECEC] bg-gradient-to-b from-[${fromColor}] to-[#FEFEFE] rounded-2xl drop-shadow-md`}
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
        {data?.map((point: any, idx: number) => (
          <li
            key={idx}
            className="text-[#595E64] text-[12px] leading-[23px] font-normal"
          >
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
};
const SegmentsSelectorGrove: React.FC<SegmentsSelectorProps> = ({
  btn_text = "Continue to Use Cases",
  audienceId,
  onBack,
  onNext,
  onEditStep,
}) => {
  const { audienceData, updateAudienceData } = useAudience();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<number[]>([]);
  const [personaFilters, setPersonaFilters] = useState<Record<number, any>>({});
  const [segmentPersonaCounts, setSegmentPersonaCounts] = useState<
    Record<number, number>
  >({});
  const [loading, setLoading] = useState(false);
  const [initialSelectedSegments, setInitialSelectedSegments] = useState<
    number[]
  >([]);
  const [initialPersonaFilters, setInitialPersonaFilters] = useState<
    Record<number, any>
  >({});
  const [loadingCounts, setLoadingCounts] = useState<Record<number, boolean>>(
    {}
  );

  // State for persona modal
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [selectedSegmentForPersonas, setSelectedSegmentForPersonas] = useState<
    number | null
  >(null);
  const [segmentPersonas, setSegmentPersonas] = useState<PersonaType[]>([]);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(
    null
  );
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>(
    {}
  );
  const [rolePersonaMap, setRolePersonaMap] = useState<
    Record<string, number[]>
  >({});
  const [fetchedPersonasMap, setFetchedPersonasMap] = useState<
    Record<number, PersonaType>
  >({});
  const [loadingPersonaIds, setLoadingPersonaIds] = useState(false);
  const [selectAllLoading, setSelectAllLoading] = useState(false);

  // Update state for info tooltip
  const [showInfoTooltip, setShowInfoTooltip] = useState<{
    segmentId: number | null;
    x: number;
    y: number;
  }>({ segmentId: null, x: 0, y: 0 });

  useEffect(() => {
    const fetchSegments = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/audience/${audienceId}/segments`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setSegments(data);

        // Initialize from audience data if available
        if (audienceData.selectedSegments) {
          setSelectedSegments(audienceData.selectedSegments);
          setInitialSelectedSegments(audienceData.selectedSegments);
        }

        if (audienceData.personaFilters) {
          setPersonaFilters(audienceData.personaFilters);
          setInitialPersonaFilters(
            JSON.parse(JSON.stringify(audienceData.personaFilters))
          );
        }
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchSegments();
  }, [audienceId]);

  // Initialize persona counts for segments
  useEffect(() => {
    // Initialize counts for all segments
    segments.forEach((segment) => {
      setSegmentPersonaCounts((prev) => ({
        ...prev,
        [segment.id]: segment.len,
      }));
    });

    // Update counts for selected segments
    segments.forEach(async (segment) => {
      if (selectedSegments.includes(segment.id)) {
        const currentFilters = personaFilters[segment.id] || {
          ageGroups: [],
          householdIncome: [],
          geoLocation: [],
          pets: [],
          children: [],
        };

        await updateSegmentPersonaCount(segment.id, currentFilters);
      }
    });
  }, [segments]);

  const toggleSegment = (segmentId: number) => {
    setSelectedSegments((prev) =>
      prev.includes(segmentId)
        ? prev.filter((id) => id !== segmentId)
        : [...prev, segmentId]
    );

    // Check if this is a change from initial state
    if (
      (initialSelectedSegments.includes(segmentId) &&
        !selectedSegments.includes(segmentId)) ||
      (!initialSelectedSegments.includes(segmentId) &&
        selectedSegments.includes(segmentId))
    ) {
      if (onEditStep) onEditStep();
    }

    // If adding a segment, initialize filters and update count
    if (!selectedSegments.includes(segmentId)) {
      const emptyFilters = {
        ageGroups: [],
        householdIncome: [],
        geoLocation: [],
        pets: [],
        children: [],
      };

      // Initialize filters if they don't exist
      if (!personaFilters[segmentId]) {
        setPersonaFilters((prev) => ({
          ...prev,
          [segmentId]: emptyFilters,
        }));
      }

      // Update persona count
      updateSegmentPersonaCount(
        segmentId,
        personaFilters[segmentId] || emptyFilters
      );
    }
  };

  const toggleFilter = (
    segmentId: number,
    filterType: string,
    value: string,
    checked: boolean
  ) => {
    setPersonaFilters((prev) => {
      const seg = prev[segmentId] || {
        ageGroups: [],
        householdIncome: [],
        geoLocation: [],
        pets: [],
        children: [],
      };

      const arr = seg[filterType] || [];
      const updated = checked
        ? [...arr, value]
        : arr.filter((v: string) => v !== value);

      const newFilters = {
        ...prev,
        [segmentId]: { ...seg, [filterType]: updated },
      };

      // Update persona count whenever filters change
      updateSegmentPersonaCount(segmentId, newFilters[segmentId]);

      return newFilters;
    });

    // Check if this is a change from initial state
    const initialFilters = initialPersonaFilters[segmentId]?.[filterType] || [];
    const isAdding = checked && !initialFilters.includes(value);
    const isRemoving = !checked && initialFilters.includes(value);

    if ((isAdding || isRemoving) && onEditStep) {
      onEditStep();
    }
  };

  // Function to update segment persona count based on filters
  const updateSegmentPersonaCount = async (segmentId: number, filters: any) => {
    try {
      // Set loading state for this segment
      setLoadingCounts((prev) => ({
        ...prev,
        [segmentId]: true,
      }));

      // Transform filters to match the required keys for Grove
      const transformedFilters = {
        age_group: filters.ageGroups || [],
        household_income: filters.householdIncome || [],
        geo_location: filters.geoLocation || [],
        pets: filters.pets || [],
        children: filters.children || [],
      };

      const filterRequest = {
        segments: [segmentId],
        filters: {
          [segmentId]: transformedFilters,
        },
        audience_name: audienceData?.audienceName || "",
      };

      const response = await fetch(`${API_URL}/filter_personas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(filterRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch filtered personas for count update");
      }

      const roleToPersonaIdsMap = await response.json();

      // Calculate total personas across all roles
      let totalPersonas = 0;
      Object.values(roleToPersonaIdsMap).forEach((personaIds) => {
        totalPersonas += personaIds.length;
      });

      // Update the count for this segment
      setSegmentPersonaCounts((prev) => ({
        ...prev,
        [segmentId]: totalPersonas,
      }));

      return totalPersonas;
    } catch (error) {
      console.error("Error updating persona count:", error);
      return 0;
    } finally {
      // Clear loading state for this segment
      setLoadingCounts((prev) => ({
        ...prev,
        [segmentId]: false,
      }));
    }
  };

  const handleNext = () => {
    // Always use all filters if none selected for a segment
    const selectedFilters: Record<number, any> = {};
    selectedSegments.forEach((segmentId) => {
      const seg = segments.find((s) => s.id === segmentId);
      const filters = personaFilters[segmentId] || {};

      // For each segment, check if any filters were selected
      // If no filters are selected, use all possible values
      selectedFilters[segmentId] = {
        // industryL1: [seg?.name || ''],
        age_group: filters.ageGroups?.length
          ? filters.ageGroups
          : [...AGE_GROUPS],
        household_income: filters.householdIncome?.length
          ? filters.householdIncome
          : [...HOUSEHOLD_INCOME],
        geo_location: filters.geoLocation?.length
          ? filters.geoLocation
          : [...GEO_LOCATIONS],
        pets: filters.pets?.length ? filters.pets : [...PETS],
        children: filters.children?.length ? filters.children : [...CHILDREN],
        // marital_status: filters.maritalStatus?.length ? filters.maritalStatus : [...MARITAL_STATUS]
      };
    });

    updateAudienceData({
      selectedSegments,
      personaFilters: selectedFilters,
    });

    onNext(selectedSegments, selectedFilters);
  };

  // Function to check if a filter is selected
  const isFilterSelected = (
    segmentId: number,
    filterType: string,
    value: string
  ): boolean => {
    if (!personaFilters[segmentId]) return false;
    return personaFilters[segmentId][filterType]?.includes(value) || false;
  };

  // Helper function to determine if any filters are selected for a segment
  const hasAnyFilters = (segmentId: number): boolean => {
    if (!personaFilters[segmentId]) return false;

    const filters = personaFilters[segmentId];
    return (
      filters.ageGroups?.length > 0 ||
      filters.householdIncome?.length > 0 ||
      filters.geoLocation?.length > 0 ||
      filters.pets?.length > 0 ||
      filters.children?.length > 0
    );
  };

  // Add helper method to get filter count for a segment (for UI display)
  const getFilterCount = (segmentId: number): number => {
    if (!personaFilters[segmentId]) return 0;

    const filters = personaFilters[segmentId];
    return (
      (filters.ageGroups?.length || 0) +
      (filters.householdIncome?.length || 0) +
      (filters.geoLocation?.length || 0) +
      (filters.pets?.length || 0) +
      (filters.children?.length || 0)
    );
  };

  // Function to handle viewing personas for a segment
  const handleViewPersonas = async (segmentId: number) => {
    setSelectedSegmentForPersonas(segmentId);
    setLoadingPersonas(true);

    // Reset persona selection
    setSelectedPersona(null);

    // Ensure all dropdowns are closed when dialog opens
    setExpandedRoles({});

    // Reset selected role
    setSelectedRole(null);

    try {
      // Fetch filtered persona IDs first
      const rolePersonaMap = await fetchFilteredPersonaIds(segmentId);

      // Clear previous persona data
      setSegmentPersonas([]);

      // Open the modal after data is ready
      setIsPersonaModalOpen(true);
    } catch (error) {
      console.error("Error viewing personas:", error);
    } finally {
      setLoadingPersonas(false);
    }
  };

  // Function to fetch filtered persona IDs
  const fetchFilteredPersonaIds = async (segmentId: number) => {
    setLoadingPersonaIds(true);

    try {
      // Create a filter request specific to this segment
      const segmentFilters = personaFilters[segmentId] || {
        ageGroups: [],
        householdIncome: [],
        geoLocation: [],
        pets: [],
        children: [],
      };

      // Transform filters to match the required keys for Grove
      const transformedFilters = {
        age_group: segmentFilters.ageGroups || [],
        household_income: segmentFilters.householdIncome || [],
        geo_location: segmentFilters.geoLocation || [],
        pets: segmentFilters.pets || [],
        children: segmentFilters.children || [],
      };

      const filterRequest = {
        segments: [segmentId],
        filters: {
          [segmentId]: transformedFilters,
        },
        audience_name: audienceData?.audienceName || "grove",
      };

      const response = await fetch(`${API_URL}/filter_personas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(filterRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch filtered personas");
      }

      // Expected response format: { role1: [id1, id2, ...], role2: [...], ... }
      const roleToPersonaIdsMap = await response.json();

      setRolePersonaMap(roleToPersonaIdsMap);

      // Pre-fetch personas for all roles
      const roles = Object.keys(roleToPersonaIdsMap);
      if (roles.length > 0) {
        for (const role of roles) {
          if (
            roleToPersonaIdsMap[role] &&
            roleToPersonaIdsMap[role].length > 0
          ) {
            // Fetch personas in the background
            fetchPersonasByIds(roleToPersonaIdsMap[role]);
          }
        }
      }

      return roleToPersonaIdsMap;
    } catch (error) {
      console.error("Error fetching filtered persona IDs:", error);
      return {};
    } finally {
      setLoadingPersonaIds(false);
    }
  };

  // Function to fetch personas by their IDs
  const fetchPersonasByIds = async (personaIds: number[]) => {
    if (!personaIds || personaIds.length === 0) return;

    const idsToFetch = personaIds.filter((id) => !fetchedPersonasMap[id]);
    if (idsToFetch.length === 0) return;

    try {
      const fetchPromises = idsToFetch.map((id) =>
        fetch(`${API_URL}/personas/${id}`, { credentials: "include" })
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch persona ${id}`);
            return res.json();
          })
          .then((data) => {
            // Process the persona data
            try {
              return {
                ...data,
                data:
                  typeof data.data === "string"
                    ? JSON.parse(data.data)
                    : data.data,
              };
            } catch (error) {
              console.error(
                `Error parsing persona data for ${data.name}:`,
                error
              );
              return data;
            }
          })
      );

      const personas = await Promise.all(fetchPromises);

      // Update the fetchedPersonasMap with new personas
      const newPersonasMap = { ...fetchedPersonasMap };
      personas.forEach((persona) => {
        newPersonasMap[persona.id] = persona;
      });

      setFetchedPersonasMap(newPersonasMap);
    } catch (error) {
      console.error("Error fetching personas by IDs:", error);
    }
  };

  // Function to toggle role expansion
  const toggleRoleExpansion = (role: string) => {
    // Close all other roles first to implement exclusive expansion
    const newExpandedRoles: Record<string, boolean> = {};

    // Toggle the clicked role
    newExpandedRoles[role] = !expandedRoles[role];

    // Update the expanded roles state
    setExpandedRoles(newExpandedRoles);

    // If opening this role and we haven't fetched personas yet, fetch them
    if (!expandedRoles[role]) {
      const personaIdsForRole = rolePersonaMap[role] || [];
      if (personaIdsForRole.length > 0) {
        fetchPersonasByIds(personaIdsForRole);
      }
    }
  };

  // Function to get personas for a specific role
  const getPersonasForRole = (role: string): PersonaType[] => {
    if (!rolePersonaMap[role]) return [];

    // Get the persona IDs for this role
    const personaIds = rolePersonaMap[role] || [];

    // Return only personas that we've already fetched
    return personaIds
      .map((id) => fetchedPersonasMap[id])
      .filter((persona) => persona !== undefined);
  };

  // Add these styles to the <head> section to ensure the custom scrollbar works
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #a1a1a1;
      }
      .animate-fadeIn {
        animation: fadeIn 0.4s ease-in-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(styleElement);

    // Add click outside listener for tooltip
    const handleClickOutside = (e: MouseEvent) => {
      if (showInfoTooltip.segmentId) {
        const tooltip = document.querySelector(".tooltip-container");
        if (tooltip && !tooltip.contains(e.target as Node)) {
          handleInfoLeave();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.head.removeChild(styleElement);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInfoTooltip.segmentId]);

  // Function to dynamically render persona data based on its structure
  const renderDynamicPersonaData = (data: any, excludeKeys: string[] = []) => {
    if (!data) return null;

    // Filter out the keys we want to exclude
    const filteredEntries = Object.entries(data).filter(
      ([key]) => !excludeKeys.includes(key)
    );

    if (filteredEntries.length === 0) return null;

    return (
      <div className="space-y-4">
        {filteredEntries.map(([key, value]) => {
          // Format key for display (capitalize, replace underscores with spaces)
          const formattedKey = key
            .replace(/_/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          // Render based on value type
          return (
            <div
              key={key}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <h4 className="font-medium text-gray-800 mb-3 capitalize">
                {formattedKey}
              </h4>
              {renderValueBasedOnType(value)}
            </div>
          );
        })}
      </div>
    );
  };

  // Helper function to render values based on their type
  const renderValueBasedOnType = (value: any) => {
    if (value === null || value === undefined) {
      return (
        <span className="text-gray-500 italic text-sm">Not specified</span>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-500 italic text-sm">No items</span>;
      }

      return (
        <ul className="list-disc ml-5 space-y-1.5">
          {value.map((item, index) => (
            <li key={index} className="text-sm text-gray-700">
              {typeof item === "object" ? renderObjectValue(item) : item}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object") {
      return renderObjectValue(value);
    }

    return <p className="text-sm text-gray-700">{value.toString()}</p>;
  };

  // Helper function to render object values
  const renderObjectValue = (obj: object) => {
    return (
      <div className="pl-2 border-l-2 border-gray-200 mt-2 space-y-2">
        {Object.entries(obj).map(([key, value], index) => {
          // Format nested key
          const formattedKey = key
            .replace(/_/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          return (
            <div key={index} className="text-sm">
              <span className="font-medium text-gray-700">
                {formattedKey}:{" "}
              </span>
              {typeof value === "object" && value !== null ? (
                Array.isArray(value) ? (
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    {value.map((item, i) => (
                      <li key={i} className="text-gray-700">
                        {typeof item === "object"
                          ? renderObjectValue(item)
                          : item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  renderObjectValue(value)
                )
              ) : (
                <span className="text-gray-700">{value?.toString()}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Function to select all segments and all filters
  const handleSelectAll = async () => {
    setSelectAllLoading(true);

    try {
      // First, select all segments
      setSelectedSegments(segments.map((segment) => segment.id));

      // Then, select all filters for each segment
      const allFiltersObj: Record<number, any> = {};

      for (const segment of segments) {
        // Create an object with all possible filters selected
        allFiltersObj[segment.id] = {
          ageGroups: [...AGE_GROUPS],
          householdIncome: [...HOUSEHOLD_INCOME],
          geoLocation: [...GEO_LOCATIONS],
          pets: [...PETS],
          children: [...CHILDREN],
        };

        // Update persona count for this segment with all filters
        await updateSegmentPersonaCount(segment.id, allFiltersObj[segment.id]);
      }

      // Update filters state
      setPersonaFilters(allFiltersObj);

      // If this is a change from initial state, call onEditStep
      if (
        segments.length !== initialSelectedSegments.length ||
        JSON.stringify(allFiltersObj) !== JSON.stringify(initialPersonaFilters)
      ) {
        if (onEditStep) onEditStep();
      }
    } catch (error) {
      console.error("Error selecting all segments:", error);
    } finally {
      setSelectAllLoading(false);
    }
  };

  // Replace handleInfoClick with handleInfoHover
  const handleInfoHover = (e: React.MouseEvent, segment: Segment) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setShowInfoTooltip({
      segmentId: segment.id,
      x: rect.left,
      y: rect.bottom + window.scrollY + 10,
    });
  };

  // Replace closeInfoTooltip with handleInfoLeave
  const handleInfoLeave = () => {
    setShowInfoTooltip({ segmentId: null, x: 0, y: 0 });
  };

  return (
    <div className="w-full bg-gray_light rounded-tl-[30px] p-[30px] relative pb-16">
      <div className="flex items-center gap-1 justify-between">
        <div>
          <h3 className="text-[28px] font-semibold text-black mb-3">
            Select Audience Segments
          </h3>
          <p className="text-xs font-normal text-[#595E64]">
            Choose which segments of{" "}
            {audienceData?.audienceName || "your audience"} to include
          </p>
        </div>
        <button
          className=" mt-5 rounded-full bg-primary flex items-center justify-center gap-2 text-sm font-semibold p-[13px_30px] text-white"
          onClick={handleSelectAll}
          disabled={loading || selectAllLoading || segments.length === 0}
        >
          {selectAllLoading ? "Selecting all..." : "Select All Segments"}
        </button>
      </div>

      <div className=" mt-[30px]">
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-5">
            {segments.map((segment) => (
              <div key={segment.id} className="relative">
                <div
                  className={`rounded-2xl ${
                    selectedSegments.includes(segment.id)
                      ? "bg-primary "
                      : "bg-[#E6FCFA]"
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex items-center gap-2 justify-between w-full mx-4 my-[10px]">
                      <div className="flex items-center gap-2">
                        <div
                          onClick={() => toggleSegment(segment.id)}
                          className={`w-5 cursor-pointer h-5 border rounded-[4px] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0 transition-all
                        ${
                          selectedSegments.includes(segment.id)
                            ? "bg-white border-white text-primary2"
                            : "border-[#595E64] bg-transparent"
                        }`}
                        >
                          {selectedSegments.includes(segment.id) && (
                            <LucideCheck size={14} />
                          )}
                        </div>
                        <h3
                          className="font-semibold text-gray-900 text-lg break-words cursor-pointer"
                          onClick={() => toggleSegment(segment.id)}
                          title={segment.name}
                        >
                          {segment.name.length > 35
                            ? `${segment.name.substring(0, 32)}...`
                            : segment.name}
                        </h3>
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        <TooltipBox text="View profiles">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPersonas(segment.id);
                            }}
                            className={`flex items-center cursor-pointer ${
                              selectedSegments.includes(segment.id)
                                ? "text-white"
                                : "text-primary2"
                            } gap-2 cursor-pointer`}
                          >
                            <PiUsersLight size={20} />
                            {loadingCounts[segment.id] ? (
                              <span className="font-medium text-blue-600 flex items-center">
                                <div className="flex space-x-1 items-center ml-1">
                                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                                  <div
                                    className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"
                                    style={{ animationDelay: "0.2s" }}
                                  ></div>
                                  <div
                                    className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"
                                    style={{ animationDelay: "0.4s" }}
                                  ></div>
                                </div>
                              </span>
                            ) : (
                              <span className="underline text-sm font-medium text-black">
                                {segmentPersonaCounts[segment.id] !== undefined
                                  ? segmentPersonaCounts[segment.id]
                                  : segment.len}{" "}
                                profiles
                                {segmentPersonaCounts[segment.id] !==
                                  undefined &&
                                  segmentPersonaCounts[segment.id] !==
                                    segment.len &&
                                  " (filtered)"}
                              </span>
                            )}
                          </div>
                        </TooltipBox>
                      </div>
                    </div>
                  </div>

                  {!selectedSegments.includes(segment.id) && (
                    <div
                      className="rounded-2xl p-4 bg-white h-full  border-[1.5px] border-[#F5F5F5]"
                      // onClick={() => toggleSegment(segment.id)}
                    >
                      <div className="flex items-center mb-2 gap-2">
                        <span className="text-primary2 pr-2 border-r border-[#E8E8E8]">
                          <BoneIcon size={20} />
                        </span>
                        <h3 className="text-sm font-medium text-black">
                          Demographics
                        </h3>
                      </div>

                      {/* Age Groups Tags */}
                      <div className="flex flex-wrap gap-3 mt-3">
                        {AGE_GROUPS.slice(0, 2).map((age, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#E6FCFACC] to-[#FEFEFE] text-primary2  pill-shadow"
                          >
                            {age}
                          </span>
                        ))}
                        {AGE_GROUPS.length > 2 && (
                          <span className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-[#FAFAFA] shadow-2xl text-[#595E64]  pill-shadow">
                            +{AGE_GROUPS.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Household Income Tags */}
                      <div className="flex flex-wrap gap-3 mt-3 mb-4">
                        {HOUSEHOLD_INCOME.slice(0, 2).map((income, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#E0E7FFCC] to-[#FEFEFE] text-[#4F46E5]  pill-shadow"
                          >
                            {income}
                          </span>
                        ))}
                        {HOUSEHOLD_INCOME.length > 2 && (
                          <span className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-[#FAFAFA] shadow-2xl text-[#595E64]  pill-shadow">
                            +{HOUSEHOLD_INCOME.length - 2}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center mt-4 mb-2 pt-4 border-t border-[#F5F5F5]">
                        <div className="flex items-center mb-2 gap-2">
                          <span className="text-primary2 pr-2 border-r border-[#E8E8E8]">
                            <PiUsers size={20} />
                          </span>
                          <h3 className="text-sm font-medium text-black">
                            Household
                          </h3>
                        </div>
                      </div>

                      {/* Geo Location Tags */}
                      <div className="flex flex-wrap gap-3 mb-3">
                        {GEO_LOCATIONS.slice(0, 2).map((loc, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#D1FAE5CC] to-[#FEFEFE] text-[#059669]  pill-shadow"
                          >
                            {loc}
                          </span>
                        ))}
                        {GEO_LOCATIONS.length > 2 && (
                          <span className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-[#FAFAFA] shadow-2xl text-[#595E64]  pill-shadow">
                            +{GEO_LOCATIONS.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Pets & Children Tags */}
                      <div className="flex flex-wrap gap-3">
                        {[...PETS.slice(0, 1), ...CHILDREN.slice(0, 1)].map(
                          (item, i) => (
                            <span
                              key={i}
                              className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#FFF7E0CC] to-[#FEFEFE] text-[#BE8D00]  pill-shadow"
                            >
                              {item}
                            </span>
                          )
                        )}
                        {[...PETS, ...CHILDREN].length > 2 && (
                          <span className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-[#FAFAFA] shadow-2xl text-[#595E64]  pill-shadow">
                            +{[...PETS, ...CHILDREN].length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedSegments.includes(segment.id) && (
                    <div className="rounded-2xl p-4 bg-white h-full  border-[1.5px] border-[#F5F5F5]">
                      <div className="  flex justify-between gap-3 items-center">
                        <p className="text-xs font-medium text-black ">
                          Select filters to apply to this segment:
                        </p>
                        <div className="flex gap-5 items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Clear all filters for this segment
                              const emptyFilters = {
                                ageGroups: [],
                                householdIncome: [],
                                geoLocation: [],
                                pets: [],
                                children: [],
                              };

                              setPersonaFilters((prev) => ({
                                ...prev,
                                [segment.id]: emptyFilters,
                              }));

                              // Update persona count
                              updateSegmentPersonaCount(
                                segment.id,
                                emptyFilters
                              );

                              if (onEditStep) onEditStep();
                            }}
                            className="text-xs font-medium text-[#A3AAB3] hover:text-gray-700 hover:underline"
                          >
                            Clear
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Select all filters for this segment
                              const allFilters = {
                                ageGroups: [...AGE_GROUPS],
                                householdIncome: [...HOUSEHOLD_INCOME],
                                geoLocation: [...GEO_LOCATIONS],
                                pets: [...PETS],
                                children: [...CHILDREN],
                              };

                              setPersonaFilters((prev) => ({
                                ...prev,
                                [segment.id]: allFilters,
                              }));

                              // Update persona count
                              updateSegmentPersonaCount(segment.id, allFilters);

                              if (onEditStep) onEditStep();
                            }}
                            className="text-xs text-[#028B7E] font-medium hover:underline"
                          >
                            Select All
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#F5F5F5] mt-4">
                        <div className="flex items-center mb-2 gap-2 mt-4">
                          <span className="text-primary2 pr-2 border-r border-[#E8E8E8]">
                            <HiOutlineUserGroup size={20} />
                          </span>
                          <h3 className="text-sm font-medium text-black">
                            Age Groups
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {AGE_GROUPS.map((age, i) => (
                            <div
                              key={i}
                              className="relative inline-flex items-center"
                            >
                              <input
                                type="checkbox"
                                id={`age-${segment.id}-${i}`}
                                checked={isFilterSelected(
                                  segment.id,
                                  "ageGroups",
                                  age
                                )}
                                className="peer absolute opacity-0 w-0 h-0 cursor-pointer"
                                onChange={(e) =>
                                  toggleFilter(
                                    segment.id,
                                    "ageGroups",
                                    age,
                                    e.target.checked
                                  )
                                }
                              />
                              <label
                                htmlFor={`age-${segment.id}-${i}`}
                                className="text-xs font-medium cursor-pointer rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#FFF7E0CC]  to-[#FEFEFE] peer-checked:to-[#ebdcae] text-[#BE8D00]  pill-shadow"
                              >
                                {age}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#F5F5F5] mt-4">
                        <div className="flex items-center mb-2 gap-2 mt-4">
                          <span className="text-primary2 pr-2 border-r border-[#E8E8E8]">
                            <PiUsersLight size={20} />
                          </span>
                          <h3 className="text-sm font-medium text-black">
                            Household Income
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {HOUSEHOLD_INCOME.map((income, i) => (
                            <div
                              key={i}
                              className="relative inline-flex items-center"
                            >
                              <input
                                type="checkbox"
                                id={`income-${segment.id}-${i}`}
                                checked={isFilterSelected(
                                  segment.id,
                                  "householdIncome",
                                  income
                                )}
                                className="peer absolute opacity-0 w-0 h-0 cursor-pointer"
                                onChange={(e) =>
                                  toggleFilter(
                                    segment.id,
                                    "householdIncome",
                                    income,
                                    e.target.checked
                                  )
                                }
                              />
                              <label
                                htmlFor={`income-${segment.id}-${i}`}
                                className="text-xs font-medium cursor-pointer rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#E0E7FFCC]  to-[#FEFEFE] peer-checked:to-[#beccfa] text-[#4F46E5]  pill-shadow"
                              >
                                {income}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#F5F5F5] mt-4">
                        <div className="flex items-center mb-2 gap-2 mt-4">
                          <span className="text-primary2 pr-2 border-r border-[#E8E8E8]">
                            <LocationIcon />
                          </span>
                          <h3 className="text-sm font-medium text-black">
                            Geo Location
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {GEO_LOCATIONS.map((location, i) => (
                            <div
                              key={i}
                              className="relative inline-flex items-center"
                            >
                              <input
                                type="checkbox"
                                id={`location-${segment.id}-${i}`}
                                checked={isFilterSelected(
                                  segment.id,
                                  "geoLocation",
                                  location
                                )}
                                className="peer absolute opacity-0 w-0 h-0 cursor-pointer"
                                onChange={(e) =>
                                  toggleFilter(
                                    segment.id,
                                    "geoLocation",
                                    location,
                                    e.target.checked
                                  )
                                }
                              />
                              <label
                                htmlFor={`location-${segment.id}-${i}`}
                                className="text-xs font-medium cursor-pointer rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#D1FAE5CC]  to-[#FEFEFE] peer-checked:to-[#96ecbf] text-[#059669]  pill-shadow"
                              >
                                {location}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#F5F5F5] mt-4">
                        <div className="flex items-center mb-2 gap-2 mt-4">
                          <span className="text-primary2 pr-2 border-r border-[#E8E8E8]">
                            <PetsIcon />
                          </span>
                          <h3 className="text-sm font-medium text-black">
                            Pets
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {PETS.map((pet, i) => (
                            <div
                              key={i}
                              className="relative inline-flex items-center"
                            >
                              <input
                                type="checkbox"
                                id={`pet-${segment.id}-${i}`}
                                checked={isFilterSelected(
                                  segment.id,
                                  "pets",
                                  pet
                                )}
                                className="peer absolute opacity-0 w-0 h-0 cursor-pointer"
                                onChange={(e) =>
                                  toggleFilter(
                                    segment.id,
                                    "pets",
                                    pet,
                                    e.target.checked
                                  )
                                }
                              />
                              <label
                                htmlFor={`pet-${segment.id}-${i}`}
                                className="text-xs font-medium cursor-pointer rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#EEDBFFCC]  to-[#FEFEFE] peer-checked:to-[#c69cea] text-[#9333EA]  pill-shadow"
                              >
                                {pet}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#F5F5F5] mt-4">
                        <div className="flex items-center mb-2 gap-2 mt-4">
                          <span className="text-primary2 pr-2 border-r border-[#E8E8E8]">
                            <PiBabyLight size={20} />
                          </span>
                          <h3 className="text-sm font-medium text-black">
                            Children
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {CHILDREN.map((child, i) => (
                            <div
                              key={i}
                              className="relative inline-flex items-center"
                            >
                              <input
                                type="checkbox"
                                id={`child-${segment.id}-${i}`}
                                checked={isFilterSelected(
                                  segment.id,
                                  "children",
                                  child
                                )}
                                className="peer absolute opacity-0 w-0 h-0 cursor-pointer"
                                onChange={(e) =>
                                  toggleFilter(
                                    segment.id,
                                    "children",
                                    child,
                                    e.target.checked
                                  )
                                }
                              />
                              <label
                                htmlFor={`child-${segment.id}-${i}`}
                                className="text-xs font-medium cursor-pointer rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#E6FCFACC]  to-[#FEFEFE] peer-checked:to-[#adfdf7] text-primary2  pill-shadow"
                              >
                                {child}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            <BlackButton onClick={onBack}>Back</BlackButton>
            {selectedSegments.length > 0 && (
              <div className="text-xs mt-1">
                {(() => {
                  // Check if any segments are currently loading
                  const isAnySegmentLoading = selectedSegments.some(
                    (segmentId) => loadingCounts[segmentId]
                  );

                  if (isAnySegmentLoading) {
                    return (
                      <div className="flex items-center">
                        <span>Total: </span>
                        <div className="flex space-x-1 items-center ml-1">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                          <div
                            className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    );
                  } else {
                    const totalPersonas = selectedSegments.reduce(
                      (sum, segmentId) =>
                        sum +
                        (segmentPersonaCounts[segmentId] !== undefined
                          ? segmentPersonaCounts[segmentId]
                          : 0),
                      0
                    );
                    return `Total: ${totalPersonas} profiles`;
                  }
                })()}
              </div>
            )}
          </div>

          {/* Check if total personas is less than or equal to 50 */}
          {(() => {
            const totalPersonas = selectedSegments.reduce(
              (sum, segmentId) =>
                sum +
                (segmentPersonaCounts[segmentId] !== undefined
                  ? segmentPersonaCounts[segmentId]
                  : 0),
              0
            );

            const isAnySegmentLoading = selectedSegments.some(
              (segmentId) => loadingCounts[segmentId]
            );
            const tooManyPersonas = totalPersonas > 300 && !isAnySegmentLoading;

            return tooManyPersonas ? (
              <div className="flex flex-col items-end">
                <div className="text-red-600 text-sm mb-2">
                  You've selected {totalPersonas} profiles. Please select fewer
                  than 300 profiles.
                </div>
                <PrimaryButton disabled={true} icon={<RightWhiteArrow />}>
                  {btn_text}
                </PrimaryButton>
              </div>
            ) : (
              // <button
              //   onClick={handleNext}
              //   disabled={selectedSegments.length === 0 || isAnySegmentLoading}
              //   className="  rounded-full bg-primary flex items-center justify-center gap-2 text-base font-semibold p-[14px_30px] text-white"
              // >
              //   {btn_text}
              //   <RightWhiteArrow />
              // </button>
              <PrimaryButton
                onClick={handleNext}
                disabled={selectedSegments.length === 0 || isAnySegmentLoading}
                icon={<RightWhiteArrow />}
              >
                {btn_text}
              </PrimaryButton>
            );
          })()}
        </div>
      </div>

      {/* Persona Viewing Modal */}
      <Dialog open={isPersonaModalOpen} onOpenChange={setIsPersonaModalOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/40 z-40" />

          <DialogContent
            className={cn(
              "fixed right-0 top-0 z-50 h-screen max-w-[90vw] rounded-none w-full bg-white",
              "overflow-hidden border-l border-gray-200 ",
              "animate-in slide-in-from-right duration-300"
            )}
          >
            {loadingPersonas || loadingPersonaIds ? (
              <div className="flex flex-col justify-center items-center h-full py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading profiles...</p>
              </div>
            ) : (
              <div className=" bg-white p-[30px] pr-[15px] h-full">
                <div className="flex items-center justify-between mb-10">
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
                <div className="flex flex-col md:flex-row h-full ">
                  {/* Left side: Role accordion with personas */}
                  <div className="md:w-[320px] border-r border-[#EBEBEB] pr-5 overflow-hidden flex flex-col h-full bg-white">
                    {/* <div className="p-5 border-b">
                         <h3 className="text-sm font-medium text-gray-800 flex items-center">
                           <Users className="w-4 h-4 mr-2 text-blue-600" />
                           Profiles by Role
                         </h3>
                         <p className="text-xs text-gray-500 mt-1 ml-6">
                           Select a role to explore detailed profiles
                         </p>
                       </div> */}

                    <div className="overflow-y-auto h-full scrollbar-hide">
                      {Object.keys(rolePersonaMap).length > 0 ? (
                        <div className="flex flex-col gap-3 items-start">
                          {Object.entries(rolePersonaMap).map(
                            ([role, personaIds]) => (
                              <div key={role} className="w-full">
                                <button
                                  onClick={() => toggleRoleExpansion(role)}
                                  className={cn(
                                    "w-full bg-[#FAFAFA] text-start border-transparent border-l-4 p-3 pl-5 rounded-xl justify-between text-sm flex gap-[10px] items-center",
                                    expandedRoles[role]
                                      ? "bg-[#E6FCFA] border-primary2 font-semibold text-primary2 "
                                      : "font-medium text-[#595E64]"
                                  )}
                                >
                                  {role}
                                  <span className="text-primary2">
                                    {personaIds?.length < 10 ? "0" : ""}
                                    {personaIds?.length || 0}
                                  </span>
                                </button>
                                {expandedRoles[role] && (
                                  <div className="mt-3 flex flex-col gap-3 items-end pl-5 pb-5">
                                    {getPersonasForRole(role).length > 0 ? (
                                      getPersonasForRole(role).map(
                                        (persona) => (
                                          <button
                                            key={persona.id}
                                            onClick={() =>
                                              setSelectedPersona(persona)
                                            }
                                            className={cn(
                                              "p-[10px] pl-[18px] border-l-4 group flex items-center justify-between max-w-[280px] w-full rounded-xl transition-all duration-200",
                                              selectedPersona?.id === persona.id
                                                ? "border-primary2  bg-[#E6FCFA]"
                                                : "border-transparent bg-[#FAFAFA]"
                                            )}
                                          >
                                            <div className="flex items-center gap-[10px]">
                                              <div
                                                className={`p-2 relative rounded-full transition-all duration-200 h-[32px] w-[32px] group-hover:bg-[#E6FCFA]  ${
                                                  selectedPersona?.id ===
                                                    persona.id && "bg-[#E6FCFA]"
                                                }`}
                                              >
                                                <UserIcon className="absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 text-gray-600" />
                                              </div>
                                              <div className="flex flex-col items-start gap-1">
                                                <h3
                                                  className={`text-sm text-start${
                                                    selectedPersona?.id ===
                                                    persona.id
                                                      ? "text-primary2 font-semibold"
                                                      : " text-[#595E64] font-medium"
                                                  }`}
                                                >
                                                  {persona.name}
                                                </h3>
                                                <p
                                                  className={`text-xs font-normal text-start${
                                                    selectedPersona?.id ===
                                                    persona.id
                                                      ? "text-black "
                                                      : " text-[#595E64] "
                                                  }`}
                                                >
                                                  {persona.job_title ||
                                                    persona.occupation ||
                                                    "No title"}
                                                </p>
                                              </div>
                                            </div>
                                            <div
                                              className={`transition-all duration-200 ${
                                                selectedPersona?.id ===
                                                persona.id
                                                  ? "opacity-100 "
                                                  : "opacity-0"
                                              }`}
                                            >
                                              <PlayIcon />
                                            </div>
                                            {/* <div className="font-medium text-gray-800"></div>
                                             <div className="text-xs text-gray-500 truncate mt-1 flex items-center">
                                               <Briefcase className="w-3 h-3 mr-1.5 text-gray-400" />
     
                                               {persona.company_name &&
                                                 ` • ${persona.company_name}`}
                                             </div> */}
                                          </button>
                                        )
                                      )
                                    ) : (
                                      <div className="p-4 text-xs text-gray-500 italic text-center">
                                        Loading profiles...
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                          <Users className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="text-sm">
                            No roles found for the selected filters
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side: Persona Details */}
                  <div className="flex-1 overflow-hidden flex flex-col h-full">
                    <div className="overflow-y-auto pl-5 bg-white h-full custom-scrollbar pr-[15px] pb-12">
                      {selectedPersona ? (
                        <div className="overflow-hidden animate-fadeIn w-full">
                          {/* Persona Header */}
                          <div className="bg-gradient-to-b rounded-2xl drop-shadow-md from-[#E6FCFA] mb-5 to-[#FEFEFE] px-5 py-3 border-[#ECECEC] border-2  justify-between   flex items-center gap-[10px]">
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

                          <div className="bg-white">
                            {/* Main Info Sections Grid */}
                            <div className="grid md:grid-cols-2 gap-x-[25px] gap-y-5">
                              {/* Personal Info Section */}
                              <div className="">
                                {/* <h4 className="font-medium text-blue-800 mb-4 flex items-center">
                                     <User className="w-4 h-4 mr-2" />
                                     Personal Information
                                   </h4> */}
                                <SectionHeader
                                  icon={<PiUser size={24} />}
                                  title="Personal Information"
                                  number={1}
                                />
                                <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
                                  <div className="flex flex-col gap-4">
                                    {[
                                      {
                                        key: "age",
                                        label: "Age",
                                        icon: <PiPersonArmsSpread size={20} />,
                                        value: selectedPersona.age,
                                      },
                                      {
                                        key: "gender",
                                        label: "Gender",
                                        icon: <PiGenderIntersex size={20} />,
                                        value: selectedPersona.gender,
                                      },
                                      {
                                        key: "location",
                                        label: "Location",
                                        icon: <LocationPrimeIcon />,
                                        value: selectedPersona.location,
                                      },
                                      {
                                        key: "income",
                                        label: "Income",
                                        icon: <IncomePrimeIcon />,
                                        value: selectedPersona.income,
                                      },
                                      {
                                        key: "education",
                                        label: "Education",
                                        icon: <EducationPrimeIcon />,
                                        value: selectedPersona.education,
                                      },
                                    ]
                                      .filter((field) => field.value)
                                      .map((field: any, index: number) => (
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
                                      ))}
                                  </div>
                                </div>
                              </div>

                              {/* Professional Info Section - Adjust fields for B2C personas */}
                              <div className="">
                                <SectionHeader
                                  icon={<BuildingIcon />}
                                  title="Consumer Details"
                                  number={2}
                                  titleColor="#4F46E5"
                                />
                                <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#E0E7FF] to-[#FEFEFE] rounded-2xl drop-shadow-md">
                                  <div className="flex flex-col gap-4">
                                    {[
                                      {
                                        key: "industry",
                                        label: "Industry",
                                        icon: <IndustryIcon size={20} />,
                                        value: selectedPersona?.industry_l1,
                                      },
                                      {
                                        key: "subIndustry",
                                        label: "Sub-Industry",
                                        icon: <IndustryIcon size={20} />,
                                        value: selectedPersona?.sub_industry_l2,
                                      },
                                      {
                                        key: "function",
                                        label: "Function",
                                        icon: <FunctionSquare size={20} />,
                                        value: selectedPersona?.function,
                                      },
                                      {
                                        key: "role",
                                        label: "Role",
                                        icon: <RollerCoaster size={20} />,
                                        value: selectedPersona?.role,
                                      },
                                    ]
                                      .filter((field) => field.value)
                                      .map((field, index) => (
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
                                      ))}
                                  </div>
                                </div>
                              </div>

                              {selectedPersona.goals &&
                                selectedPersona.goals.length > 0 && (
                                  <div className="">
                                    <SectionHeader
                                      icon={<GoalPrimeIcon />}
                                      title="Goals"
                                      number={3}
                                    />
                                    <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#D1FAE5] to-[#FEFEFE] rounded-2xl drop-shadow-md">
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
                                )}

                              {selectedPersona.behaviors &&
                                selectedPersona.behaviors.length > 0 && (
                                  <div className="">
                                    <SectionHeader
                                      icon={<BehaviorsIcon />}
                                      title="Behaviors"
                                      number={4}
                                      titleColor="#E9BC3B"
                                    />
                                    <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#FFF7E0CC] to-[#FEFEFE] rounded-2xl drop-shadow-md">
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
                                )}

                              {selectedPersona.interests &&
                                selectedPersona.interests.length > 0 && (
                                  <div className="">
                                    <SectionHeader
                                      icon={<InterestsIcon />}
                                      title="Interests"
                                      number={5}
                                      titleColor="#8B47C8"
                                    />
                                    <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#EEDBFFCC] to-[#FEFEFE] rounded-2xl drop-shadow-md">
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
                                )}

                              {selectedPersona.preferred_channels &&
                                selectedPersona.preferred_channels.length >
                                  0 && (
                                  <div className="">
                                    <SectionHeader
                                      icon={<PreferredChannelsIcon />}
                                      title="Preferred Channels"
                                      number={6}
                                    />
                                    <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
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
                                )}
                            </div>
                            <div className="w-full pt-5">
                              {selectedPersona.pain_points &&
                                selectedPersona.pain_points.length > 0 && (
                                  <div className="">
                                    <SectionHeader
                                      icon={<PainPointsIcon />}
                                      title="Pain Points"
                                      number={7}
                                      titleColor="#C84747"
                                    />
                                    <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#FFD8D880] to-[#FEFEFE] rounded-2xl drop-shadow-md">
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
                                )}
                              {selectedPersona.values &&
                                selectedPersona.values.length > 0 && (
                                  <div className="mt-5">
                                    <SectionHeader
                                      icon={
                                        <Shield size={24} color="#028B7E" />
                                      }
                                      title="Values"
                                      number={8}
                                      titleColor="#028B7E"
                                    />
                                    <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
                                      <div className="flex flex-col gap-4">
                                        {selectedPersona.values.map(
                                          (point: string, index: number) => (
                                            <div
                                              key={index}
                                              className="flex items-start gap-3"
                                            >
                                              <div className="text-primary2 pr-3 border-r border-[#DBDDE0]">
                                                <ArrowBigRight size={24} />
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
                                  <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
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
                                    <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
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
                                  )}
                                  {selectedPersona?.married && (
                                    <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
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
                                  )}
                                  {selectedPersona?.pets && (
                                    <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
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
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-5 items-center mt-5">
                                  {selectedPersona?.life_stage && (
                                    <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
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
                                  )}
                                  {selectedPersona?.persona_segment && (
                                    <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
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
                                  )}
                                </div>
                                {selectedPersona?.psychographics && (
                                  <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#F8F8F8] to-[#FEFEFE] rounded-2xl drop-shadow-md mt-5">
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
                                    data={
                                      selectedPersona?.sales_marketing_hooks
                                    }
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-5 items-center mt-5">
                                  {selectedPersona?.segment_name && (
                                    <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
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
                                  )}
                                  {selectedPersona?.subsegment && (
                                    <div className="p-4 border-2 border-[#ECECEC] bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] rounded-2xl drop-shadow-md">
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
                          <div className="bg-blue-50 p-6 rounded-full mb-4 border border-blue-100">
                            <User className="w-12 h-12 text-blue-400" />
                          </div>
                          <p className="text-lg text-gray-600 mb-2">
                            Select a profile
                          </p>
                          <p className="text-sm text-gray-500">
                            Choose from the list on the left to view detailed
                            information
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
};

export default SegmentsSelectorGrove;
