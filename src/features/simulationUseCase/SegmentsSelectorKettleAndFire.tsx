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
  BoneIcon,
} from "lucide-react";
import Button from "../../components/Button";
import StepContainer from "../../components/StepContainer";
import { useAudience } from "../../context/AudienceContext";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog.jsx";
import {
  CustomDialogContent as DialogContent,
  CustomDialogClose,
} from "../../components/ui/dialog-custom.jsx";
import { cn } from "../../lib/utils";
import {
  LocationIcon,
  PetsIcon,
  RightWhiteArrow,
} from "@/icons/simulatePageIcons.js";
import { PiBabyLight, PiBuildingsLight, PiUsers, PiUsersLight } from "react-icons/pi";
import { HiOutlineUserGroup } from "react-icons/hi";

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

const SubSegments: Record<string, string[]> = {
  "Bone Broth Buyers": [
    "Wellness-Focused Ritualists",
    "Convenience-Driven Professionals",
    "Health-Conscious Flavor Enthusiasts",
    "First-Time or Skeptical Buyers",
  ],
  "Cooking Broth Buyers": [
    "Home Chefs & Recipe Enhancers",
    "Family-Focused Meal Planners",
    "Older Wellness Seekers",
    "Ethical Pantry Builders",
  ],
};

const AGE_GROUPS = [
  "Millenials(24 - 37)",
  "Generation X(38 - 53)",
  "Baby boomers(54 - 72)",
];

const HOUSEHOLD_INCOME = ["70k and more"];

const GEO_LOCATIONS = ["Urban", "Suburban", "Rural"];

const PETS = ["Yes", "No"];

const MARITAL_STATUS = ["Yes", "No"];

const CHILDREN = ["Yes", "No"];

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

const SegmentsSelectorKettleAndFire: React.FC<SegmentsSelectorProps> = ({
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

  // Add state for info tooltip
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
        subSegments: [],
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

      // Transform filters to match the required keys for Kettle and fire
      const transformedFilters = {
        age_group: filters.ageGroups || [],
        household_income: filters.householdIncome || [],
        geo_location: filters.geoLocation || [],
        pets: filters.pets || [],
        children: filters.children || [],
        subsegment: filters.subSegments || [],
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
        industryL1: [seg?.name || ""],
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
        marital_status: filters.maritalStatus?.length
          ? filters.maritalStatus
          : [...MARITAL_STATUS],
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
        subSegments: [],
        householdIncome: [],
        geoLocation: [],
        pets: [],
        children: [],
      };

      // Transform filters to match the required keys for fire
      const transformedFilters = {
        subsegment: segmentFilters.subSegments || [],

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
        audience_name: audienceData?.audienceName || "Kettle And Fire",
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

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
          subSegments: SubSegments[segment.name] || [],
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
            Select Audience Segments (Kettle & Fire)
          </h3>
          <p className="text-xs font-normal text-[#595E64]">
            Choose which segments of Kettle & Fire - v3 to include
          </p>
        </div>
        <button
          className=" mt-5 rounded-full bg-primary flex items-center justify-center gap-2 text-sm font-semibold p-[13px_30px] text-white"
          onClick={handleSelectAll}
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
                          className={`w-5 h-5 border rounded-[4px] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0 transition-all
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
                          className="font-semibold text-gray-900 text-lg break-words"
                          title={segment.name}
                        >
                          {segment.name.length > 35
                            ? `${segment.name.substring(0, 32)}...`
                            : segment.name}
                        </h3>
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        <div
                          className={`flex items-center ${
                            selectedSegments.includes(segment.id)
                              ? "text-white"
                              : "text-primary2"
                          } gap-2`}
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
                            <span
                              className="underline text-sm font-medium text-black"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPersonas(segment.id);
                              }}
                            >
                              {segmentPersonaCounts[segment.id] !== undefined
                                ? segmentPersonaCounts[segment.id]
                                : segment.len}{" "}
                              profiles
                              {segmentPersonaCounts[segment.id] !== undefined &&
                                segmentPersonaCounts[segment.id] !==
                                  segment.len &&
                                " (filtered)"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <div
                    className="flex justify-between mb-4 cursor-pointer"
                    onClick={() => toggleSegment(segment.id)}
                  >
                    <div className="relative">
                      <Info
                        className="w-4 h-4 text-gray-400 flex-shrink-0 cursor-pointer hover:text-gray-600 mt-1"
                        onMouseEnter={(e) => handleInfoHover(e, segment)}
                        onMouseLeave={handleInfoLeave}
                      />
                      {showInfoTooltip.segmentId === segment.id && (
                        <div
                          className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md animate-fadeIn tooltip-container"
                          style={{
                            left: "50%",
                            top: "100%",
                            transform: "translateX(-50%)",
                            marginTop: "8px",
                          }}
                          onMouseEnter={(e) => e.stopPropagation()}
                          onMouseLeave={handleInfoLeave}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {segment.name}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            {segment.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div> */}

                  {!selectedSegments.includes(segment.id) && (
                    <div
                      className="rounded-2xl p-4 bg-white h-full  border-[1.5px] border-[#F5F5F5]"
                      onClick={() => toggleSegment(segment.id)}
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
                            className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#E6FCFACC] to-[#FEFEFE]"
                          >
                            {age}
                          </span>
                        ))}
                        {AGE_GROUPS.length > 2 && (
                          <span className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-[#FAFAFA] shadow-2xl">
                            +{AGE_GROUPS.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Household Income Tags */}
                      <div className="flex flex-wrap gap-3 mt-3 mb-4">
                        {HOUSEHOLD_INCOME.slice(0, 2).map((income, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#E0E7FFCC] to-[#FEFEFE]"
                          >
                            {income}
                          </span>
                        ))}
                        {HOUSEHOLD_INCOME.length > 2 && (
                          <span className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-[#FAFAFA] shadow-2xl">
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
                            className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#D1FAE5CC] to-[#FEFEFE]"
                          >
                            {loc}
                          </span>
                        ))}
                        {GEO_LOCATIONS.length > 2 && (
                          <span className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-[#FAFAFA] shadow-2xl">
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
                              className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#FFF7E0CC] to-[#FEFEFE]"
                            >
                              {item}
                            </span>
                          )
                        )}
                        {[...PETS, ...CHILDREN].length > 2 && (
                          <span className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-[#FAFAFA] shadow-2xl">
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
                                subSegments: [],
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
                                subSegments: SubSegments[segment.name] || [],
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

                      {/* Subsegment Filter - Moved to top */}
                      {SubSegments[segment.name] && (
                        <div>
                          <div className="flex items-center mb-2 gap-2 mt-4">
                            <span className="text-primary2 pr-2 border-r border-[#E8E8E8]">
                              <PiBuildingsLight size={20} />
                            </span>
                            <h3 className="text-sm font-medium text-black">
                              Segment Sub-Categories
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {SubSegments[segment.name].map((subSegment, i) => (
                              <div
                                key={i}
                                className="relative inline-flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  id={`subSegment-${segment.id}-${i}`}
                                  checked={isFilterSelected(
                                    segment.id,
                                    "subSegments",
                                    subSegment
                                  )}
                                  className="peer absolute opacity-0 w-0 h-0 cursor-pointer"
                                  onChange={(e) =>
                                    toggleFilter(
                                      segment.id,
                                      "subSegments",
                                      subSegment,
                                      e.target.checked
                                    )
                                  }
                                />
                                <label
                                  htmlFor={`subSegment-${segment.id}-${i}`}
                                  // className="inline-block px-3 py-1 cursor-pointer select-none
                                  //           peer-checked:bg-teal-100 peer-checked:text-teal-800 peer-checked:border-teal-300
                                  //           peer-not-checked:bg-gray-50 peer-not-checked:text-gray-600 peer-not-checked:border-gray-200
                                  //           text-xs font-medium rounded-full border transition-colors"
                                  className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#E6FCFACC]  to-[#FEFEFE] peer-checked:to-[#81fef4]"
                                >
                                  {subSegment}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rest of the filters */}
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
                                className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#FFF7E0CC]  to-[#FEFEFE] peer-checked:to-[#ebdcae]"
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
                                className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#E0E7FFCC]  to-[#FEFEFE] peer-checked:to-[#beccfa]"
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
                                className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#D1FAE5CC]  to-[#FEFEFE] peer-checked:to-[#96ecbf]"
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
                                className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#EEDBFFCC]  to-[#FEFEFE] peer-checked:to-[#c69cea]"
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
                                className="text-xs font-medium rounded-full p-[6px_16px]  border-white border bg-gradient-to-b shadow-2xl from-[#E6FCFACC]  to-[#FEFEFE] peer-checked:to-[#adfdf7]"
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
            <button
              onClick={onBack}
              className="text-white bg-black p-[14px_30px] text-base font-semibold rounded-full"
            >
              Back
            </button>
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
                <button
                  disabled={true}
                  className=" rounded-full bg-primary flex items-center justify-center gap-2 text-base font-semibold p-[14px_30px] text-white"
                >
                  {btn_text}
                  <RightWhiteArrow />
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                disabled={selectedSegments.length === 0 || isAnySegmentLoading}
                className="  rounded-full bg-primary flex items-center justify-center gap-2 text-base font-semibold p-[14px_30px] text-white"
              >
                {btn_text}
                <RightWhiteArrow />
              </button>
            );
          })()}
        </div>
      </div>

      {/* Persona Viewing Modal */}
      <Dialog open={isPersonaModalOpen} onOpenChange={setIsPersonaModalOpen}>
        <DialogContent
          className="h-[80vh] w-[90vw] md:w-[85vw] max-w-[1400px] !p-0 rounded-xl overflow-hidden border border-gray-200 shadow-xl relative"
          style={{ maxWidth: "1400px", margin: "auto" }}
        >
          <CustomDialogClose onClick={() => setIsPersonaModalOpen(false)}>
            <X className="h-5 w-5" />
          </CustomDialogClose>
          <DialogHeader className="border-b pb-4 pt-5 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center">
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center">
                  <User className="w-5 h-5 mr-3 text-blue-600" />
                  {selectedSegmentForPersonas &&
                    segments.find((s) => s.id === selectedSegmentForPersonas)
                      ?.name}
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1 ml-8">
                  Explore detailed profiles for this segment
                </p>
              </div>
            </div>
          </DialogHeader>

          {loadingPersonas || loadingPersonaIds ? (
            <div className="flex flex-col justify-center items-center h-full py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading profiles...</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row h-full">
              {/* Left side: Role accordion with personas */}
              <div className="md:w-[340px] border-r overflow-hidden flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
                <div className="p-5 border-b">
                  <h3 className="text-sm font-medium text-gray-800 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    Profiles by Role
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Select a role to explore detailed profiles
                  </p>
                </div>

                <div className="overflow-y-auto h-[58vh] custom-scrollbar">
                  {Object.keys(rolePersonaMap).length > 0 ? (
                    <div className="divide-y">
                      {Object.entries(rolePersonaMap).map(
                        ([role, personaIds]) => (
                          <div key={role} className="border-b">
                            <button
                              onClick={() => toggleRoleExpansion(role)}
                              className={cn(
                                "w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-all duration-200 focus:outline-none",
                                expandedRoles[role] && "bg-blue-50/70"
                              )}
                            >
                              <div className="flex items-center">
                                {expandedRoles[role] ? (
                                  <ChevronDown className="w-4 h-4 mr-3 text-blue-600 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                                )}
                                <div className="text-left">
                                  <span className="font-medium text-gray-800">
                                    {role}
                                  </span>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {personaIds?.length || 0}{" "}
                                    {personaIds?.length === 1
                                      ? "profile"
                                      : "profiles"}
                                  </div>
                                </div>
                              </div>
                            </button>
                            {expandedRoles[role] && (
                              <div className="bg-blue-50/40 py-2 px-4">
                                <div>
                                  {getPersonasForRole(role).length > 0 ? (
                                    getPersonasForRole(role).map((persona) => (
                                      <button
                                        key={persona.id}
                                        onClick={() =>
                                          setSelectedPersona(persona)
                                        }
                                        className={cn(
                                          "w-full text-left px-4 py-3 my-1.5 rounded-lg hover:bg-white transition-all duration-150 ml-4",
                                          selectedPersona?.id === persona.id
                                            ? "bg-white shadow-sm border border-blue-200 ring-1 ring-blue-100"
                                            : "border border-transparent"
                                        )}
                                      >
                                        <div className="font-medium text-gray-800">
                                          {persona.name}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate mt-1 flex items-center">
                                          <Briefcase className="w-3 h-3 mr-1.5 text-gray-400" />
                                          {persona.job_title ||
                                            persona.occupation ||
                                            "No title"}
                                          {persona.company_name &&
                                            ` • ${persona.company_name}`}
                                        </div>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="p-4 text-xs text-gray-500 italic text-center">
                                      Loading profiles...
                                    </div>
                                  )}
                                </div>
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
              <div className="flex-1 overflow-hidden flex flex-col h-[69vh]">
                <div className="overflow-y-auto p-6 bg-gradient-to-br from-gray-50/70 to-white h-full custom-scrollbar">
                  {selectedPersona ? (
                    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fadeIn max-w-4xl mx-auto">
                      {/* Persona Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                        <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
                          <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 border border-blue-200">
                            {selectedPersona.name.charAt(0)}
                          </span>
                          {selectedPersona.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-3 ml-1">
                          <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="font-medium">
                            {selectedPersona.job_title || "No title available"}
                            {selectedPersona.company_name &&
                              ` at ${selectedPersona.company_name}`}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-6">
                        {/* Main Info Sections Grid */}
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          {/* Personal Info Section */}
                          <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100">
                            <h4 className="font-medium text-blue-800 mb-4 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Personal Information
                            </h4>
                            <div className="space-y-3">
                              {selectedPersona.age && (
                                <div className="flex items-start">
                                  <span className="text-sm font-medium text-gray-600 w-28">
                                    Age:
                                  </span>
                                  <span className="text-sm text-gray-800">
                                    {selectedPersona.age}
                                  </span>
                                </div>
                              )}
                              {selectedPersona.gender && (
                                <div className="flex items-start">
                                  <span className="text-sm font-medium text-gray-600 w-28">
                                    Gender:
                                  </span>
                                  <span className="text-sm text-gray-800">
                                    {selectedPersona.gender}
                                  </span>
                                </div>
                              )}
                              {selectedPersona.location && (
                                <div className="flex items-start">
                                  <span className="text-sm font-medium text-gray-600 w-28">
                                    Location:
                                  </span>
                                  <span className="text-sm text-gray-800">
                                    {selectedPersona.location}
                                  </span>
                                </div>
                              )}
                              {selectedPersona.income && (
                                <div className="flex items-start">
                                  <span className="text-sm font-medium text-gray-600 w-28">
                                    Income:
                                  </span>
                                  <span className="text-sm text-gray-800">
                                    {selectedPersona.income}
                                  </span>
                                </div>
                              )}
                              {selectedPersona.education && (
                                <div className="flex items-start">
                                  <span className="text-sm font-medium text-gray-600 w-28">
                                    Education:
                                  </span>
                                  <span className="text-sm text-gray-800">
                                    {selectedPersona.education}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Professional Info Section - Adjust fields for B2C personas */}
                          <div className="bg-indigo-50/50 p-5 rounded-lg border border-indigo-100">
                            <h4 className="font-medium text-indigo-800 mb-4 flex items-center">
                              <Building className="w-4 h-4 mr-2" />
                              Consumer Details
                            </h4>
                            <div className="space-y-3">
                              {selectedPersona.data?.age_group && (
                                <div className="flex items-start">
                                  <span className="text-sm font-medium text-gray-600 w-28">
                                    Age Group:
                                  </span>
                                  <span className="text-sm text-gray-800">
                                    {selectedPersona.data.age_group}
                                  </span>
                                </div>
                              )}
                              {selectedPersona.data?.household_income && (
                                <div className="flex items-start">
                                  <span className="text-sm font-medium text-gray-600 w-28">
                                    Income Range:
                                  </span>
                                  <span className="text-sm text-gray-800">
                                    {selectedPersona.data.household_income}
                                  </span>
                                </div>
                              )}
                              {selectedPersona.data?.geo_location && (
                                <div className="flex items-start">
                                  <span className="text-sm font-medium text-gray-600 w-28">
                                    Location Type:
                                  </span>
                                  <span className="text-sm text-gray-800">
                                    {selectedPersona.data.geo_location}
                                  </span>
                                </div>
                              )}
                              {selectedPersona.data?.pets && (
                                <div className="flex items-start">
                                  <span className="text-sm font-medium text-gray-600 w-28">
                                    Pets:
                                  </span>
                                  <span className="text-sm text-gray-800">
                                    {selectedPersona.data.pets}
                                  </span>
                                </div>
                              )}
                              {selectedPersona.data?.children && (
                                <div className="flex items-start">
                                  <span className="text-sm font-medium text-gray-600 w-28">
                                    Children:
                                  </span>
                                  <span className="text-sm text-gray-800">
                                    {selectedPersona.data.children}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Replace the hardcoded sections with dynamic rendering */}
                        <div className="space-y-6 mt-4">
                          {/* Common persona details like goals, pain_points, etc. */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-5">
                              {selectedPersona.goals &&
                                selectedPersona.goals.length > 0 && (
                                  <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-100">
                                    <h4 className="font-medium text-emerald-800 mb-3 flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                      Goals
                                    </h4>
                                    <ul className="list-disc ml-5 space-y-1.5">
                                      {selectedPersona.goals.map(
                                        (goal: string, idx: number) => (
                                          <li
                                            key={idx}
                                            className="text-sm text-gray-700"
                                          >
                                            {goal}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                              {selectedPersona.pain_points &&
                                selectedPersona.pain_points.length > 0 && (
                                  <div className="bg-rose-50 p-5 rounded-lg border border-rose-100">
                                    <h4 className="font-medium text-rose-800 mb-3 flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                      </svg>
                                      Pain Points
                                    </h4>
                                    <ul className="list-disc ml-5 space-y-1.5">
                                      {selectedPersona.pain_points.map(
                                        (point: string, idx: number) => (
                                          <li
                                            key={idx}
                                            className="text-sm text-gray-700"
                                          >
                                            {point}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                              {selectedPersona.interests &&
                                selectedPersona.interests.length > 0 && (
                                  <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
                                    <h4 className="font-medium text-purple-800 mb-3 flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                        />
                                      </svg>
                                      Interests
                                    </h4>
                                    <ul className="list-disc ml-5 space-y-1.5">
                                      {selectedPersona.interests.map(
                                        (interest: string, idx: number) => (
                                          <li
                                            key={idx}
                                            className="text-sm text-gray-700"
                                          >
                                            {interest}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>

                            <div className="space-y-5">
                              {selectedPersona.behaviors &&
                                selectedPersona.behaviors.length > 0 && (
                                  <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                                    <h4 className="font-medium text-amber-800 mb-3 flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                      </svg>
                                      Behaviors
                                    </h4>
                                    <ul className="list-disc ml-5 space-y-1.5">
                                      {selectedPersona.behaviors.map(
                                        (behavior: string, idx: number) => (
                                          <li
                                            key={idx}
                                            className="text-sm text-gray-700"
                                          >
                                            {behavior}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                              {selectedPersona.values &&
                                selectedPersona.values.length > 0 && (
                                  <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                                    <h4 className="font-medium text-green-800 mb-3 flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                        />
                                      </svg>
                                      Values
                                    </h4>
                                    <ul className="list-disc ml-5 space-y-1.5">
                                      {selectedPersona.values.map(
                                        (value: string, idx: number) => (
                                          <li
                                            key={idx}
                                            className="text-sm text-gray-700"
                                          >
                                            {value}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                              {selectedPersona.preferred_channels &&
                                selectedPersona.preferred_channels.length >
                                  0 && (
                                  <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                                    <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                      Preferred Channels
                                    </h4>
                                    <ul className="list-disc ml-5 space-y-1.5">
                                      {selectedPersona.preferred_channels.map(
                                        (channel: string, idx: number) => (
                                          <li
                                            key={idx}
                                            className="text-sm text-gray-700"
                                          >
                                            {channel}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* Dynamic rendering of additional data (excluding basic fields already shown) */}
                          <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">
                              Additional Details
                            </h3>
                            {selectedPersona.data &&
                              renderDynamicPersonaData(selectedPersona.data, [
                                "age_group",
                                "household_income",
                                "geo_location",
                                "pets",
                                "children",
                              ])}

                            {/* Also render any top-level persona fields we haven't explicitly handled */}
                            {renderDynamicPersonaData(
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
                            )}
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SegmentsSelectorKettleAndFire;
