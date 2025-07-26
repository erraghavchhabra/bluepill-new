import React, { useState, useEffect, useRef } from "react";
import { Calendar, Users, ArrowLeft } from "lucide-react";
import StepContainer from "../../components/StepContainer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  BoneIcon,
  CalendarIcon,
  CookingIcon,
  DiscriptionIcon,
  IndustryIcon,
  RightWhiteArrow,
  SegmentIcon,
  UserICon,
} from "@/icons/simulatePageIcons";
import { PiSelectionBackground } from "react-icons/pi";
import BlackButton from "@/components/Buttons/BlackButton";
import axios from "axios";
type AudienceId = number;
interface Segment {
  id: number;
  name: string;
  persona_count: number;
  sub_industry?: string;
}

interface Audience {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  len: number; // Number of segments
  total_personas?: number;
  segments?: Segment[];
  website?: string;
  business_description?: string;
  industry?: string;
  core_need?: string;
  additional_info?: string;
  audience_purpose?: string;
  customers?: string;
  location?: string;
  age_range?: string;
  income_level?: string;
}

interface ExistingAudiencesProps {
  onSelectAudience: (audienceId: number, audienceName: string) => void;
  onBack: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "";

const ExistingAudiences: React.FC<ExistingAudiencesProps> = ({
  onSelectAudience,
  onBack,
}) => {
  const [selectedAudience, setSelectedAudience] = useState<number | null>(null);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAudiences, setExpandedAudiences] = useState<
    (number | string)[]
  >([]);
  const [loadingAudiences, setLoadingAudiences] = useState<Set<number>>(
    new Set()
  );
  const didFetchRef = useRef(false);
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const fetchAudienceIds = async () => {
      setLoading(true);
      try {
        const res = await axios.get<AudienceId[]>(`${API_URL}/audience/ids`, {
          withCredentials: true,
        });

        const rawIds = res.data;
        const uniqueIds = [...new Set(rawIds)];

        setError(null);
        if (uniqueIds.length > 0) {
          await loadAudiencesSequentially(uniqueIds);
        }
      } catch (err) {
        console.error("Error fetching audience IDs:", err);
        setError("Failed to load audiences. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAudienceIds();
  }, []);

  const loadAudiencesSequentially = async (audienceIds: AudienceId[]) => {
    for (const audienceId of audienceIds) {
      try {
        setLoadingAudiences((prev) => new Set(prev).add(audienceId));

        const res = await axios.get<Audience>(
          `${API_URL}/audience/${audienceId}`,
          {
            withCredentials: true,
          }
        );

        setAudiences((prev) => [...prev, res.data]);
        setLoading(false)
      } catch (err) {
        console.error(`Error fetching audience ${audienceId}:`, err);
      } finally {
        setLoadingAudiences((prev) => {
          const updated = new Set(prev);
          updated.delete(audienceId);
          return updated;
        });
      }
    }
  };

  const handleSelectAudience = (audience: Audience) => {
    setSelectedAudience(audience.id);
    // Allow a small delay to show the selection before navigating
    setTimeout(() => {
      onSelectAudience(audience.id, audience.name);
    }, 300);
  };

  const toggleExpandAudience = (audienceId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card click
    setExpandedAudiences((prev) =>
      prev.includes(audienceId)
        ? prev.filter((id) => id !== audienceId)
        : [...prev, audienceId]
    );
  };

  return (
    <div className="w-full bg-gray_light rounded-tl-[30px] p-[30px] relative pb-16">
      <h3 className="text-[28px] font-semibold text-black mb-3">
        Select an Existing Audience
      </h3>
      <p className="text-xs font-normal text-[#595E64]">
        Choose from your saved audiences to run a simulation
      </p>
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && audiences.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            You don't have any saved audiences yet.
          </p>
          <Button variant="outline" className="mt-4" onClick={onBack}>
            Create Your First Audience
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-[19px] mt-[30px]">
        {audiences.map((audience: any , index:number) => (
          <div key={index} className="bg-[#E6FCFA] rounded-2xl overflow-hidden">
            <div className="  mx-4 mt-2 mb-[7px] flex items-center gap-2 justify-between">
              <h3 className="text-base font-semibold text-black">
                {audience.name}
              </h3>
              <div className="flex items-start gap-2">
                <CalendarIcon />
                <h4 className="text-sm font-medium text-black">
                  {new Date(audience.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </h4>
              </div>
            </div>
            <div className="rounded-2xl p-4 bg-white h-full border-[1.5px] border-[#F5F5F5]">
              <div className="grid grid-cols-3  gap-3 mb-5 ">
                <div className="p-2 flex  items-start justify-start gap-[10px] rounded-[10px] bg-gradient-to-b from-[#E6FCFA] to-[#FEFEFE] border-2 border-[#ECECEC] shadow-xl">
                  <UserICon />
                  <div className="">
                    <p className="text-[#61666E] font-normal text-xs  mb-[6px]">
                      Total Profiles
                    </p>
                    <h3 className="text-sm font-semibold text-black">
                      {audience.total_personas || audience.len * 5 || "N/A"}
                    </h3>
                  </div>
                </div>
                <div className="p-2 rounded-[10px] border-2 border-[#ECECEC] shadow-xl flex items-start justify-start gap-[10px] bg-gradient-to-b from-[#E0E7FF] to-[#FEFEFE]">
                  <SegmentIcon />
                  <div className="">
                    <p className="text-[#61666E] mb-[6px] font-normal text-xs ">
                      Segments
                    </p>
                    <h3 className="text-sm font-semibold text-black">
                      <p className="text-lg font-medium">{audience.len}</p>
                    </h3>
                  </div>
                </div>
                <div className="p-2 rounded-[10px] border-2 border-[#ECECEC] shadow-xl flex items-start justify-start gap-[10px] bg-gradient-to-b from-[#D1FAE5] to-[#FEFEFE]">
                  <IndustryIcon />
                  <div className="">
                    <p className="text-[#61666E] font-normal text-xs mb-[6px]">
                      Industry
                    </p>

                    <h3 className="text-sm font-semibold text-black line-clamp-1">
                      {audience.industry?.includes(",")
                        ? (() => {
                            const industries = audience.industry.split(",");
                            return (
                              <>
                                {industries
                                  .slice(
                                    0,
                                    expandedAudiences.includes(
                                      `ind-${audience.id}`
                                    )
                                      ? industries.length
                                      : 4
                                  )
                                  .map((ind: any, i: number) => (
                                    <span key={i}>
                                      {ind.trim().replace(/_/g, " ")}
                                      {i <
                                      Math.min(
                                        industries.length,
                                        expandedAudiences.includes(
                                          `ind-${audience.id}`
                                        )
                                          ? industries.length
                                          : 4
                                      ) -
                                        1
                                        ? ", "
                                        : ""}
                                    </span>
                                  ))}
                                {industries.length > 4 &&
                                  !expandedAudiences.includes(
                                    `ind-${audience.id}`
                                  ) && (
                                    <span
                                      className="text-blue-600 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedAudiences((prev) => [
                                          ...prev,
                                          `ind-${audience.id}`,
                                        ]);
                                      }}
                                    >
                                      {" "}
                                      +{industries.length - 4} more
                                    </span>
                                  )}
                                {industries.length > 4 &&
                                  expandedAudiences.includes(
                                    `ind-${audience.id}`
                                  ) && (
                                    <span
                                      className="text-blue-600 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedAudiences((prev) =>
                                          prev.filter(
                                            (id) => id !== `ind-${audience.id}`
                                          )
                                        );
                                      }}
                                    >
                                      {" "}
                                      (show less)
                                    </span>
                                  )}
                              </>
                            );
                          })()
                        : audience.industry?.replace(/_/g, " ")}
                    </h3>
                  </div>
                </div>
              </div>
              {audience.segments ? (
                <div className="flex items-start flex-col gap-4 pb-5 border-b border-[#E8E8E8]">
                  {audience.segments
                    .slice(
                      0,
                      expandedAudiences.includes(audience.id)
                        ? audience.segments.length
                        : 3
                    )
                    .map((segment: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 justify-between w-full"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-primary2 pr-2 border-r border-[#E8E8E8]">
                            {segment.name == "Bone Broth Buyers" ? (
                              <BoneIcon />
                            ) : segment.name == "Cooking Broth Buyers" ? (
                              <CookingIcon />
                            ) : (
                              <PiSelectionBackground size={24} />
                            )}
                          </span>
                          <h3 className="text-xs font-normal text-[#61666E]">
                            {segment.name?.replace(/_/g, " ") || "General"}
                          </h3>
                        </div>
                        <p className="text-black text-sm font-medium">
                          {segment.persona_count}
                        </p>
                      </div>
                    ))}
                  {audience.segments.length > 4 && (
                    <div
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
                      onClick={(e) => toggleExpandAudience(audience.id, e)}
                    >
                      {expandedAudiences.includes(audience.id)
                        ? "Show less"
                        : `+ ${audience.segments.length - 4} more segments`}
                    </div>
                  )}
                  {audience.business_description && (
                    <div className="flex items-center gap-2 justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-primary2 pr-2 border-r border-[#E8E8E8]">
                          <DiscriptionIcon />
                        </span>
                        <h3 className="text-xs font-normal text-[#61666E]">
                          Business Description
                        </h3>
                      </div>
                      <p className="text-black text-sm font-medium line-clamp-1">
                        {audience.business_description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-600 py-2 px-3 bg-white rounded border border-gray-100">
                  {audience.industry?.replace(/_/g, " ")} - {audience.len}{" "}
                  industry segments
                </div>
              )}
              <button
                className="w-full mt-5 rounded-full bg-primary flex items-center justify-center gap-2 text-sm font-semibold p-[10.5px] text-white"
                onClick={() => handleSelectAudience(audience)}
              >
                <span>Select This Audience</span>
                <RightWhiteArrow />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-[51px]">
        <BlackButton onClick={onBack}>Back</BlackButton>
      </div>
    </div>
  );
};

export default ExistingAudiences;
