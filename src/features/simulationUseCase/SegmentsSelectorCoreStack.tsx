import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  Info,
  ArrowLeft,
  Briefcase,
  Building,
  Users,
  Building2,
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronRight,
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
import { formatPersonaFilterRequest } from "../../lib/utils";
import { cn } from "../../lib/utils";
import {
  IndustryIcon,
  LocationIcon,
  PetsIcon,
  RightWhiteArrow,
} from "@/icons/simulatePageIcons.js";
import PrimaryButton from "@/components/Buttons/PrimaryButton.js";
import BlackButton from "@/components/Buttons/BlackButton.js";
import TooltipBox from "@/components/Buttons/TooltipBox.js";
import {
  PiBabyLight,
  PiBuildingsLight,
  PiGenderIntersex,
  PiPersonArmsSpread,
  PiSuitcase,
  PiUser,
  PiUsers,
  PiUsersLight,
} from "react-icons/pi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { BiFilterAlt } from "react-icons/bi";
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
import { FaIndustry } from "react-icons/fa";

interface SegmentsSelectorProps {
  btn_text?: string; // Optional prop with default value "Continue to Use Cases"
  audienceId: number;
  onBack: () => void;
  onNext: (
    selectedSegments: number[],
    personaFilters: Record<number, SegmentPersonaFilters>
  ) => void;
  onEditStep?: () => void; // Add this prop to notify parent of edits
}

interface Segment {
  id: number;
  name: string;
  description: string;
  len: number; // Number of personas
  created_at: string;
  updated_at: string;
  // Persona filter attributes
  industryL1: string[];
  industryL2: string[];
  functions: string[];
  roles: string[];
  titles: string[];
}

// Filter options interface
interface FilterOption {
  id: string;
  label: string;
  selected: boolean;
  count: number;
}

// Interface to track persona filters within each segment
interface SegmentPersonaFilters {
  industryL1: string[];
  industryL2: string[];
  functions: string[];
  roles: string[];
}

const API_URL = import.meta.env.VITE_API_URL || "";
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
const SegmentsSelectorCoreStack: React.FC<SegmentsSelectorProps> = ({
  btn_text = "Continue to Use Cases",
  audienceId,
  onBack,
  onNext,
  onEditStep,
}) => {
  const { audienceData, updateAudienceData } = useAudience();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track persona filters for each segment
  const [personaFilters, setPersonaFilters] = useState<
    Record<number, SegmentPersonaFilters>
  >({});
  const [initialSelectedSegments, setInitialSelectedSegments] = useState<
    number[]
  >([]);
  const [initialPersonaFilters, setInitialPersonaFilters] = useState<
    Record<number, SegmentPersonaFilters>
  >({});
  // Filter states
  const [industryL1Filters, setIndustryL1Filters] = useState<FilterOption[]>(
    []
  );
  const [industryL2Filters, setIndustryL2Filters] = useState<FilterOption[]>(
    []
  );
  const [functionFilters, setFunctionFilters] = useState<FilterOption[]>([]);
  const [roleFilters, setRoleFilters] = useState<FilterOption[]>([]);
  const [titleSearchValue, setTitleSearchValue] = useState("");
  const [filteredSegments, setFilteredSegments] = useState<Segment[]>([]);

  // States for persona modal
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [selectedSegmentForPersonas, setSelectedSegmentForPersonas] = useState<
    number | null
  >(null);
  const [segmentPersonas, setSegmentPersonas] = useState<PersonaType[]>([]);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(
    null
  ); // Add state for expanded roles in the persona modal
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>(
    {}
  );
  // Add state to track persona counts for each segment
  const [segmentPersonaCounts, setSegmentPersonaCounts] = useState<
    Record<number, number>
  >({});
  // Add state to track which segments are currently loading their count
  const [loadingCounts, setLoadingCounts] = useState<Record<number, boolean>>(
    {}
  );

  // Add state for info tooltip
  const [showInfoTooltip, setShowInfoTooltip] = useState<{
    segmentId: number | null;
    x: number;
    y: number;
  }>({ segmentId: null, x: 0, y: 0 });

  // Define a Persona type to avoid "any" type errors
  interface PersonaType {
    id: number;
    name: string;
    age?: number | string;
    gender?: string;
    job_title?: string;
    company_name?: string;
    industry_l1?: string;
    sub_industry_l2?: string;
    function?: string;
    role?: string;
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
    [key: string]: any; // For any other fields
  }

  // Standard functions and roles that are common across all segments
  const standardFunctions = useMemo(
    () => ["Engineering", "Operations", "Finance", "Security and Compliance"],
    []
  );
  const standardRoles = useMemo(
    () => [
      "CXO",
      "Decision Maker/Leaders",
      "Mid Level Managers",
      "Individual contributors",
    ],
    []
  );
  // Define industry taxonomies - L1 industries and their corresponding L2 industries using useMemo
  // These are predefined industry categories that we'll try to match against segment names
  const industries = useMemo(
    () => [
      "Industrial",
      "Healthcare And Life Sciences",
      "Public Sector",
      "Retail And Consumer Goods",
      "Tmt And Consulting",
      "Banking Financial Services And Insurance",
    ],
    []
  );

  // Mapping of industry L1 to their L2 subcategories
  const industryL2Map: any = useMemo(
    () => ({
      "Managed Service Providers": ["SecOps", "FinOps", "CloudOps"],
      Industrial: [
        "Manufacturing",
        "Automotive",
        "Transportation",
        "Energy And Utilities",
        "Construction",
      ],
      "Public Sector": [
        "Government Contractors",
        "Federal Government",
        "Higher Education",
        "State and Local Government",
      ],
      "Healthcare And Life Sciences": [
        "Payers",
        "Providers",
        "Medical Technology",
        "Pharma",
      ],
      "Retail And Consumer Goods": [
        "Retail",
        "Consumer Goods",
        "Wholesale Distribution",
      ],
      "Tmt And Consulting": [
        "Technology",
        "Telecom",
        "Media",
        "Consulting And IT Services",
      ],
      "Banking Financial Services And Insurance": [
        "Banking",
        "Insurance",
        "Financial Service Institutions",
        "Lending and Credit Services",
      ],
    }),
    []
  ); // Initialize persona filters when segments change - but with empty arrays for filters
  useEffect(() => {
    // Only initialize filters for segments that don't already have them
    setPersonaFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };

      // Go through all segments, not just selected ones
      segments.forEach((segment) => {
        // If this segment doesn't have filters yet, initialize them with empty arrays
        if (!updatedFilters[segment.id]) {
          updatedFilters[segment.id] = {
            industryL1: [], // Empty array instead of all values
            industryL2: [], // Empty array instead of all values
            functions: [], // Empty array instead of all values
            roles: [], // Empty array instead of all values
          };

          // Initialize persona counts for each segment with their default len value
          setSegmentPersonaCounts((prev) => ({
            ...prev,
            [segment.id]: segment.len,
          }));
        }
      });

      return updatedFilters;
    });

    // Also initialize persona counts for selected segments
    segments.forEach(async (segment) => {
      if (selectedSegments.includes(segment.id)) {
        // Get the current filters for this segment
        const currentFilters = personaFilters[segment.id] || {
          industryL1: [],
          industryL2: [],
          functions: [],
          roles: [],
        };

        // Update count if segment is selected and has filters
        await updateSegmentPersonaCount(segment.id, currentFilters);
      }
    });
  }, [segments]);
  useEffect(() => {
    const fetchSegments = async () => {
      if (!audienceId) return;

      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/audience/${audienceId}/segments`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch segments");
        }

        const data = await response.json();
        // Enhance data with example hierarchical attributes for personas
        // In production, this should come from your API
        const enhancedData = data.map(
          (
            segment: Omit<
              Segment,
              "industryL1" | "industryL2" | "functions" | "roles" | "titles"
            >
          ) => {
            // Use our standardized functions and roles
            const titles = [
              "CEO",
              "CFO",
              "CTO",
              "CMO",
              "COO",
              "VP of Sales",
              "Director of Marketing",
              "Project Manager",
            ];
            // Use the segment name as the L1 industry directly
            const segmentNameL1 = segment.name;
            const selectedIndustries = [segmentNameL1];
            // Get L2 industries for the L1 industry if it exists in our mapping
            // Check if the segment name matches or contains any of our predefined industries
            const matchedIndustry = industries.find(
              (ind) => segmentNameL1 === ind || segmentNameL1.includes(ind)
            );
            const selectedL2 =
              matchedIndustry &&
              Object.prototype.hasOwnProperty.call(
                industryL2Map,
                matchedIndustry
              )
                ? industryL2Map[
                    matchedIndustry as keyof typeof industryL2Map
                  ] || []
                : [];

            // Use all our standardized functions (no random subset)
            const selectedFunctions = [...standardFunctions];

            // Use all our standardized roles (no random subset)
            const selectedRoles = [...standardRoles];

            // Select 1-3 titles
            const selectedTitles = [
              ...new Set(
                Array(1 + Math.floor(Math.random() * 3))
                  .fill(0)
                  .map(() => titles[Math.floor(Math.random() * titles.length)])
              ),
            ];

            return {
              ...segment,
              industryL1: selectedIndustries,
              industryL2: selectedL2,
              functions: selectedFunctions,
              roles: selectedRoles,
              titles: selectedTitles,
            };
          }
        );

        setSegments(enhancedData);
        setFilteredSegments(enhancedData);

        // IMPORTANT: Always use audienceData to initialize selections
        // This ensures selections persist across navigation
        if (
          audienceData.selectedSegments &&
          audienceData.selectedSegments.length > 0
        ) {
          setSelectedSegments(audienceData.selectedSegments);
          setInitialSelectedSegments(audienceData.selectedSegments);

          // Also initialize filters from audienceData if available
          if (Object.keys(audienceData.personaFilters || {}).length > 0) {
            setPersonaFilters(audienceData.personaFilters || {});
            setInitialPersonaFilters(
              JSON.parse(JSON.stringify(audienceData.personaFilters || {}))
            );
          }
        }

        // Initialize filters from all segments
        initializeFilters(enhancedData);

        setError(null);
      } catch (err) {
        console.error("Error fetching segments:", err);
        setError("Failed to load segments. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchSegments();
  }, [
    audienceId,
    industries,
    industryL2Map,
    standardFunctions,
    standardRoles,
    audienceData.selectedSegments,
    audienceData.personaFilters,
  ]);

  // Extract and initialize filter options
  const initializeFilters = (segments: Segment[]) => {
    // Get all unique values and their counts across all segments
    const l1Map: Record<string, number> = {};
    const l2Map: Record<string, number> = {};
    const functionMap: Record<string, number> = {};
    const roleMap: Record<string, number> = {};

    segments.forEach((segment) => {
      // Count Industry L1
      segment.industryL1.forEach((ind) => {
        l1Map[ind] = (l1Map[ind] || 0) + 1;
      });

      // Count Industry L2
      segment.industryL2.forEach((ind) => {
        l2Map[ind] = (l2Map[ind] || 0) + 1;
      });

      // Count Functions
      segment.functions.forEach((func) => {
        functionMap[func] = (functionMap[func] || 0) + 1;
      });

      // Count Roles
      segment.roles.forEach((role) => {
        roleMap[role] = (roleMap[role] || 0) + 1;
      });
    });

    // Convert to filter options
    setIndustryL1Filters(
      Object.entries(l1Map).map(([label, count]) => ({
        id: label,
        label,
        selected: false,
        count,
      }))
    );

    setIndustryL2Filters(
      Object.entries(l2Map).map(([label, count]) => ({
        id: label,
        label,
        selected: false,
        count,
      }))
    );

    setFunctionFilters(
      Object.entries(functionMap).map(([label, count]) => ({
        id: label,
        label,
        selected: false,
        count,
      }))
    );

    setRoleFilters(
      Object.entries(roleMap).map(([label, count]) => ({
        id: label,
        label,
        selected: false,
        count,
      }))
    );
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    // Get selected filters
    const selectedL1 = industryL1Filters
      .filter((f) => f.selected)
      .map((f) => f.label);
    const selectedL2 = industryL2Filters
      .filter((f) => f.selected)
      .map((f) => f.label);
    const selectedFunctions = functionFilters
      .filter((f) => f.selected)
      .map((f) => f.label);
    const selectedRoles = roleFilters
      .filter((f) => f.selected)
      .map((f) => f.label);

    // Check if any filters are active
    const hasActiveFilters =
      selectedL1.length > 0 ||
      selectedL2.length > 0 ||
      selectedFunctions.length > 0 ||
      selectedRoles.length > 0 ||
      titleSearchValue.length > 0;

    // If no filters active, show all segments
    if (!hasActiveFilters) {
      setFilteredSegments(segments);
      return;
    }

    // Filter segments based on selected criteria
    const filtered = segments.filter((segment) => {
      // Industry L1 match (if any L1 filters are selected)
      const l1Match =
        selectedL1.length === 0 ||
        segment.industryL1.some((ind) => selectedL1.includes(ind));

      // Industry L2 match (if any L2 filters are selected)
      const l2Match =
        selectedL2.length === 0 ||
        segment.industryL2.some((ind) => selectedL2.includes(ind));

      // Function match (if any function filters are selected)
      const functionMatch =
        selectedFunctions.length === 0 ||
        segment.functions.some((func) => selectedFunctions.includes(func));

      // Role match (if any role filters are selected)
      const roleMatch =
        selectedRoles.length === 0 ||
        segment.roles.some((role) => selectedRoles.includes(role));

      // Title search match (if search text entered)
      const titleMatch =
        titleSearchValue === "" ||
        segment.titles.some((title) =>
          title.toLowerCase().includes(titleSearchValue.toLowerCase())
        );

      return l1Match && l2Match && functionMatch && roleMatch && titleMatch;
    });

    setFilteredSegments(filtered);
  }, [
    industryL1Filters,
    industryL2Filters,
    functionFilters,
    roleFilters,
    titleSearchValue,
    segments,
  ]);
  // Filter toggling functionality - can be implemented if needed
  // For now using direct filtering in the useEffect hook above    // Toggle segment selection
  const toggleSegment = (segmentId: number) => {
    if (selectedSegments.includes(segmentId)) {
      // Remove segment from selection
      const newSelectedSegments = selectedSegments.filter(
        (id) => id !== segmentId
      );
      setSelectedSegments(newSelectedSegments);

      // Check if this is a change from the initial state and notify parent if needed
      if (initialSelectedSegments.includes(segmentId) && onEditStep) {
        onEditStep();
      }
    } else {
      // Add segment to selection
      const newSelectedSegments = [...selectedSegments, segmentId];
      setSelectedSegments(newSelectedSegments);

      // Check if this is a change from the initial state and notify parent if needed
      if (!initialSelectedSegments.includes(segmentId) && onEditStep) {
        onEditStep();
      }

      // Make sure filters are initialized with empty arrays if they don't exist yet
      if (!personaFilters[segmentId]) {
        const emptyFilters = {
          industryL1: [],
          industryL2: [],
          functions: [],
          roles: [],
        };

        setPersonaFilters((prev) => ({
          ...prev,
          [segmentId]: emptyFilters,
        }));

        // Update persona count for the newly selected segment
        updateSegmentPersonaCount(segmentId, emptyFilters);
      } else {
        // Update persona count with existing filters
        updateSegmentPersonaCount(segmentId, personaFilters[segmentId]);
      }
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setIndustryL1Filters((prev) =>
      prev.map((f) => ({ ...f, selected: false }))
    );
    setIndustryL2Filters((prev) =>
      prev.map((f) => ({ ...f, selected: false }))
    );
    setFunctionFilters((prev) => prev.map((f) => ({ ...f, selected: false })));
    setRoleFilters((prev) => prev.map((f) => ({ ...f, selected: false })));
    setTitleSearchValue("");
  };
  // Helper function to check if a filter value is selected
  const isFilterSelected = (
    segmentId: number,
    filterType: keyof SegmentPersonaFilters,
    value: string
  ): boolean => {
    if (!personaFilters[segmentId]) return false;
    return personaFilters[segmentId][filterType].includes(value);
  };
  // Toggle a persona filter value
  const togglePersonaFilter = (
    segmentId: number,
    filterType: keyof SegmentPersonaFilters,
    value: string,
    checked: boolean
  ) => {
    setPersonaFilters((prev) => {
      const segmentFilters = prev[segmentId] || {
        industryL1: [],
        industryL2: [],
        functions: [],
        roles: [],
      };

      const updatedFilters = checked
        ? [...segmentFilters[filterType], value]
        : segmentFilters[filterType].filter((item) => item !== value);

      // Check if this is a change from the initial state
      const initialFilters =
        initialPersonaFilters[segmentId]?.[filterType] || [];
      const isAdding = checked && !initialFilters.includes(value);
      const isRemoving = !checked && initialFilters.includes(value);

      if ((isAdding || isRemoving) && onEditStep) {
        onEditStep();
      }

      const updatedPersonaFilters = {
        ...prev,
        [segmentId]: {
          ...segmentFilters,
          [filterType]: updatedFilters,
        },
      };

      // After updating filters, fetch the filtered personas count
      updateSegmentPersonaCount(segmentId, updatedPersonaFilters[segmentId]);

      return updatedPersonaFilters;
    });
  };
  // Handle next step
  const handleNext = () => {
    if (selectedSegments.length > 0) {
      // Only pass filters for selected segments
      const selectedFilters: Record<number, SegmentPersonaFilters> = {};

      // Use the current filter state for each selected segment
      selectedSegments.forEach((segmentId) => {
        // If this segment already has filters in our state, use those
        if (personaFilters[segmentId]) {
          // If no filters were selected at all for this segment, select all filters by default
          const currentFilters = personaFilters[segmentId];
          const hasAnyFilterSelected =
            currentFilters.industryL1.length > 0 ||
            currentFilters.industryL2.length > 0 ||
            currentFilters.functions.length > 0 ||
            currentFilters.roles.length > 0;

          if (hasAnyFilterSelected) {
            // User selected some filters, use those
            selectedFilters[segmentId] = currentFilters;
          } else {
            // No filters selected, use all values from the segment
            const segment = segments.find((s) => s.id === segmentId);
            if (segment) {
              selectedFilters[segmentId] = {
                industryL1: [...segment.industryL1],
                industryL2: [...segment.industryL2],
                functions: [...segment.functions],
                roles: [...segment.roles],
              };
            }
          }
        }
      });

      updateAudienceData({
        selectedSegments: selectedSegments,
        personaFilters: selectedFilters,
      });

      onNext(selectedSegments, selectedFilters);
    } else {
      console.error("SegmentsSelector: No segments selected!");
    }
  }; // We can calculate the number of applied filters here if needed for the UI
  // Example: const appliedFiltersCount = industryL1Filters.filter(f => f.selected).length + ...;
  // Function to handle viewing personas for a segment
  const handleViewPersonas = async (segmentId: number) => {
    setSelectedSegmentForPersonas(segmentId);
    setLoadingPersonas(true);

    // Reset persona selection
    setSelectedPersona(null);

    // Ensure all dropdowns are closed when dialog opens
    setExpandedRoles({});

    // Reset selected role to ensure no section is pre-selected
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

  // Function to get personas filtered by selected role
  const getPersonasByRole = (): PersonaType[] => {
    if (!selectedRole) return segmentPersonas;
    return segmentPersonas.filter(
      (persona) => persona.data?.role === selectedRole
    );
  };

  // Extract unique roles from personas for dropdown
  const getUniqueRoles = (): string[] => {
    const roles: string[] = [];
    segmentPersonas.forEach((persona) => {
      if (persona.data?.role && !roles.includes(persona.data.role)) {
        roles.push(persona.data.role);
      }
    });
    return roles;
  };

  // Helper function to render persona detail sections for array data
  const renderPersonaDataSection = (title: string, items?: string[]) => {
    if (!items || items.length === 0) return null;

    return (
      <div key={title} className="mb-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-1 capitalize">
          {title}
        </h4>
        <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
          {items.map((item, idx) => (
            <li key={`${title}-${idx}`}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Add these new state variables for filtered personas
  const [rolePersonaMap, setRolePersonaMap] = useState<
    Record<string, number[]>
  >({});
  const [fetchedPersonasMap, setFetchedPersonasMap] = useState<
    Record<number, PersonaType>
  >({});
  const [loadingPersonaIds, setLoadingPersonaIds] = useState(false);
  // Function to update segment persona count based on filters
  const updateSegmentPersonaCount = async (
    segmentId: number,
    filters: SegmentPersonaFilters
  ) => {
    try {
      // Set loading state for this segment
      setLoadingCounts((prev) => ({
        ...prev,
        [segmentId]: true,
      }));

      const filterRequest = {
        audience_name: "icertis",
        segments: [segmentId],
        filters: {
          [segmentId]: filters,
        },
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
      Object.values(roleToPersonaIdsMap).forEach((personaIds: any) => {
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

  // New function to fetch filtered persona IDs
  const fetchFilteredPersonaIds = async (segmentId: number) => {
    setLoadingPersonaIds(true);

    try {
      // Create a filter request specific to this segment
      const segmentFilters = personaFilters[segmentId] || {
        industryL1: [],
        industryL2: [],
        functions: [],
        roles: [],
      };

      const filterRequest = {
        audience_name: "icertis",
        segments: [segmentId],
        filters: {
          [segmentId]: segmentFilters,
        },
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
      // Pre-fetch all persona IDs but don't auto-select any role
      // This will allow all personas to be available when a role is clicked
      const roles = Object.keys(roleToPersonaIdsMap);
      if (roles.length > 0) {
        // Pre-fetch all personas for all roles to ensure they're available when needed
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

  // Modified function to handle role selection in the modal
  const handleRoleChange = async (role: string) => {
    setSelectedRole(role);

    // Fetch personas for this role if they haven't been fetched yet
    const personaIdsForRole = rolePersonaMap[role] || [];
    await fetchPersonasByIds(personaIdsForRole);

    // Reset selected persona
    setSelectedPersona(null);
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

  // Add state for the Select All button loading indicator
  const [selectAllLoading, setSelectAllLoading] = useState(false);

  // Function to select all segments and all filters
  const handleSelectAll = async () => {
    setSelectAllLoading(true);

    try {
      // First, select all segments
      setSelectedSegments(filteredSegments.map((segment) => segment.id));

      // Then, select all filters for each segment
      const allFiltersObj: Record<number, SegmentPersonaFilters> = {};

      for (const segment of filteredSegments) {
        // Create an object with all possible filters selected for this segment
        const updatedFilters = {
          industryL1: [...segment.industryL1],
          industryL2: [...segment.industryL2],
          functions: [...segment.functions],
          roles: [...segment.roles],
        };

        allFiltersObj[segment.id] = updatedFilters;

        // Update persona count for this segment with all filters
        await updateSegmentPersonaCount(segment.id, updatedFilters);
      }

      // Update filters state
      setPersonaFilters(allFiltersObj);

      // If this is a change from initial state, call onEditStep
      if (
        filteredSegments.length !== initialSelectedSegments.length ||
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

  // Add these functions before the return statement
  const handleInfoHover = (e: React.MouseEvent, segment: Segment) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setShowInfoTooltip({
      segmentId: segment.id,
      x: rect.left,
      y: rect.bottom + window.scrollY + 10,
    });
  };

  const handleInfoLeave = () => {
    setShowInfoTooltip({ segmentId: null, x: 0, y: 0 });
  };

  return (
    <div className="w-full bg-gray_light rounded-tl-[30px] p-[30px] relative">
      <div className="flex items-center gap-1 justify-between">
        <div>
          <h3 className="text-[28px] font-semibold text-black mb-3">
            Select Audience Segments
          </h3>
          <p className="text-xs font-normal text-[#595E64]">
            Choose which segments of{" "}
            {audienceData?.audienceName || "your audience"} to include in this
            simulation
          </p>
        </div>
        <button
          className=" mt-5 rounded-full bg-primary flex items-center justify-center gap-2 text-sm font-semibold p-[13px_30px] text-white"
          onClick={handleSelectAll}
        >
          {selectAllLoading ? "Selecting all..." : "Select All Segments"}
        </button>
      </div>

      {/* Segment Cards Grid */}
      <div className="mt-[30px]">
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 mb-3">{error}</div>
        ) : filteredSegments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No segments match your filters</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="mt-2"
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredSegments.map((segment) => (
              <div key={segment.id} className="relative">
                <div
                  className={`rounded-2xl ${
                    selectedSegments.includes(segment.id)
                      ? "bg-primary "
                      : "bg-[#E6FCFA]"
                  }`}
                >
                  {" "}
                  <div className="flex items-start">
                    <div className="flex items-center gap-2 justify-between w-full mx-4 my-[10px]">
                      <div className="flex items-center gap-2">
                        <div
                          onClick={() => toggleSegment(segment.id)}
                          className={`w-5 cursor-pointer h-5 border rounded-[4px] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0 transition-all
                                              ${
                                                selectedSegments.includes(
                                                  segment.id
                                                )
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
                  {/* Preview tags shown when not selected */}
                  {!selectedSegments.includes(segment.id) && (
                    <div
                      className="rounded-2xl p-4 bg-white h-full  border-[1.5px] border-[#F5F5F5]"
                      // onClick={() => toggleSegment(segment.id)}
                    >
                      <div className="flex items-center mb-2 gap-2">
                        <span className="text-primary2 pr-2 border-r border-[#E8E8E8]">
                          <PiBuildingsLight size={20} />
                        </span>
                        <h3 className="text-sm font-medium text-black">
                          Industries & Functions
                        </h3>
                      </div>

                      {/* Industry L1 Tags */}
                      <div className="flex flex-wrap gap-3 mt-3">
                        {segment.industryL1.slice(0, 2).map((ind, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#E6FCFACC] to-[#FEFEFE]"
                          >
                            {ind}
                          </span>
                        ))}
                        {segment.industryL1.length > 2 && (
                          <span className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-[#FAFAFA] shadow-2xl">
                            +{segment.industryL1.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Sub-Industry Tags */}
                      <div className="flex flex-wrap gap-3 mt-3 mb-4">
                        {segment.industryL2.slice(0, 2).map((ind, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#E0E7FFCC] to-[#FEFEFE]"
                          >
                            {ind}
                          </span>
                        ))}
                        {segment.industryL2.length > 2 && (
                          <span className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-[#FAFAFA] shadow-2xl">
                            +{segment.industryL2.length - 2}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center mt-4 mb-2 pt-4 border-t border-[#F5F5F5]">
                        <div className="flex items-center mb-2 gap-2">
                          <span className="text-primary2 pr-2 border-r border-[#E8E8E8]">
                            <PiUsers size={20} />
                          </span>
                          <h3 className="text-sm font-medium text-black">
                            Functions & Roles
                          </h3>
                        </div>
                      </div>

                      {/* Functions Tags */}
                      <div className="flex flex-wrap gap-3 mb-3">
                        {segment.functions.slice(0, 2).map((func, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#D1FAE5CC] to-[#FEFEFE]"
                          >
                            {func}
                          </span>
                        ))}
                        {segment.functions.length > 2 && (
                          <span className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-[#FAFAFA] shadow-2xl">
                            +{segment.functions.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Roles Tags */}
                      <div className="flex flex-wrap gap-3">
                        {segment.roles.slice(0, 2).map((role, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#FFF7E0CC] to-[#FEFEFE]"
                          >
                            {role}
                          </span>
                        ))}
                        {segment.roles.length > 2 && (
                          <span className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-[#FAFAFA] shadow-2xl">
                            +{segment.roles.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}{" "}
                  {/* Filter fields shown when selected */}
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
                                industryL1: [],
                                industryL2: [],
                                functions: [],
                                roles: [],
                              };

                              // Update the filters state
                              setPersonaFilters((prev) => ({
                                ...prev,
                                [segment.id]: emptyFilters,
                              }));

                              // Update persona count with empty filters
                              updateSegmentPersonaCount(
                                segment.id,
                                emptyFilters
                              );

                              // Notify parent of edit if needed
                              if (onEditStep) {
                                onEditStep();
                              }
                            }}
                            className="text-xs font-medium text-[#A3AAB3] hover:text-gray-700 hover:underline"
                          >
                            Clear
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Select all filters for this segment
                              const segmentData = segments.find(
                                (s) => s.id === segment.id
                              );
                              if (segmentData) {
                                // Create the updated filters object
                                const updatedFilters = {
                                  industryL1: [...segmentData.industryL1],
                                  industryL2: [...segmentData.industryL2],
                                  functions: [...segmentData.functions],
                                  roles: [...segmentData.roles],
                                };

                                // Update the filters state
                                setPersonaFilters((prev) => ({
                                  ...prev,
                                  [segment.id]: updatedFilters,
                                }));

                                // Update persona count for this segment with all filters selected
                                // This should restore the count to the original total
                                updateSegmentPersonaCount(
                                  segment.id,
                                  updatedFilters
                                );

                                // Notify parent of edit if needed
                                if (onEditStep) {
                                  onEditStep();
                                }
                              }
                            }}
                            className="text-xs text-[#028B7E] font-medium hover:underline"
                          >
                            Select All
                          </button>
                        </div>
                      </div>
                      {/* Show all L2 industries for the selected L1 industries */}
                      <div>
                        <div className="flex items-center mb-2 gap-2 mt-4">
                          <span className="text-primary2 pr-2 border-r border-[#E8E8E8]">
                            <PiBuildingsLight size={20} />
                          </span>
                          <h3 className="text-sm font-medium text-black">
                            Filter by Sub-Industry
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {/* Display all L2 industries for this segment's L1 industry */}
                          {segment.industryL1.map((l1) => {
                            // Get all possible L2 industries for this L1 industry
                            const possibleL2Industries =
                              industryL2Map[l1] || [];

                            return possibleL2Industries.map(
                              (l2: any, i: number) => (
                                <div
                                  key={`${l1}-${l2}-${i}`}
                                  className="relative inline-flex items-center"
                                >
                                  <input
                                    type="checkbox"
                                    id={`subind-${segment.id}-${l1}-${i}`}
                                    checked={isFilterSelected(
                                      segment.id,
                                      "industryL2",
                                      l2
                                    )}
                                    className="peer absolute opacity-0 w-0 h-0 cursor-pointer"
                                    onChange={(e) =>
                                      togglePersonaFilter(
                                        segment.id,
                                        "industryL2",
                                        l2,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    htmlFor={`subind-${segment.id}-${l1}-${i}`}
                                    className="cursor-pointer text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#E6FCFACC]  to-[#FEFEFE] peer-checked:to-[#81fef4]"
                                  >
                                    {l2}
                                  </label>
                                </div>
                              )
                            );
                          })}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-[#F5F5F5] mt-4">
                        <div className="flex items-center mb-2 gap-2 mt-4">
                          <span className="text-primary2 pr-2 border-r border-[#E8E8E8]">
                            <BiFilterAlt size={20} />
                          </span>
                          <h3 className="text-sm font-medium text-black">
                            Filter by Function
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {/* Use standardized functions list that's common for all segments */}
                          {standardFunctions.map((func, i) => (
                            <div
                              key={i}
                              className="relative inline-flex items-center"
                            >
                              <input
                                type="checkbox"
                                id={`func-${segment.id}-${i}`}
                                checked={isFilterSelected(
                                  segment.id,
                                  "functions",
                                  func
                                )}
                                className="peer absolute opacity-0 w-0 h-0 cursor-pointer"
                                onChange={(e) =>
                                  togglePersonaFilter(
                                    segment.id,
                                    "functions",
                                    func,
                                    e.target.checked
                                  )
                                }
                              />
                              <label
                                htmlFor={`func-${segment.id}-${i}`}
                                className="text-xs cursor-pointer font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#FFF7E0CC]  to-[#FEFEFE] peer-checked:to-[#ebdcae]"
                              >
                                {func}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-[#F5F5F5] mt-4">
                        <div className="flex items-center mb-2 gap-2 mt-4">
                          <span className="text-primary2 pr-2 border-r border-[#E8E8E8]">
                            <PiUsers size={20} />
                          </span>
                          <h3 className="text-sm font-medium text-black">
                            Filter by Role
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {/* Use standardized roles list that's common for all segments */}
                          {standardRoles.map((role, i) => (
                            <div
                              key={i}
                              className="relative inline-flex items-center"
                            >
                              <input
                                type="checkbox"
                                id={`role-${segment.id}-${i}`}
                                checked={isFilterSelected(
                                  segment.id,
                                  "roles",
                                  role
                                )}
                                className="peer absolute opacity-0 w-0 h-0 cursor-pointer"
                                onChange={(e) =>
                                  togglePersonaFilter(
                                    segment.id,
                                    "roles",
                                    role,
                                    e.target.checked
                                  )
                                }
                              />
                              <label
                                htmlFor={`role-${segment.id}-${i}`}
                                className="text-xs font-medium cursor-pointer rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#E0E7FFCC]  to-[#FEFEFE] peer-checked:to-[#beccfa]"
                              >
                                {role}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}{" "}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
      {/* Improved Persona Viewing Modal */}

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
                                {selectedPersona?.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-[10px] text-primary2">
                              <PiSuitcase size={24} />
                              <span className="font-medium">
                                {selectedPersona?.job_title ||
                                  "No title available"}
                                {selectedPersona?.company_name &&
                                  ` at ${selectedPersona?.company_name}`}
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
                                      // {
                                      //   key: "children",
                                      //   label: "Children",
                                      //   icon: <PiBabyLight size={20} />,
                                      //   value: selectedPersona.data?.children,
                                      // },
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
                                      number={7}
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
                                  {selectedPersona?.purchasing_habits && (
                                    <HabitsDataContent
                                      title="Purchasing Habits"
                                      icon={<PurchasingHabitsIcon />}
                                      fromColor="#F8F8F8"
                                      data={selectedPersona?.purchasing_habits}
                                    />
                                  )}
                                  {selectedPersona?.sales_marketing_hooks && (
                                    <HabitsDataContent
                                      title="Sales Marketing Hooks"
                                      icon={<SalesMarketingHooksIcon />}
                                      fromColor="#F8F8F8"
                                      data={
                                        selectedPersona?.sales_marketing_hooks
                                      }
                                    />
                                  )}
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
                                  {selectedPersona?.trusted_sources && (
                                    <HabitsDataContent
                                      title="Trusted Sources"
                                      icon={<TrustedSourcesIcon />}
                                      fromColor="#F8F8F8"
                                      data={selectedPersona?.trusted_sources}
                                    />
                                  )}
                                  {selectedPersona?.value_drivers && (
                                    <HabitsDataContent
                                      title="Value Drivers"
                                      icon={<ValueDriversIcon />}
                                      fromColor="#F8F8F8"
                                      data={selectedPersona?.value_drivers}
                                    />
                                  )}
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

export default SegmentsSelectorCoreStack;
