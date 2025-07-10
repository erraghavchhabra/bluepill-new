import { CloseButton } from "@/icons/SimulationIcons";
import React, { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import DetailedAnalysis from "./components/DetailedAnalysis";
import { DetailedAnalysisIcon, DownArrowAnnalysis } from "@/icons/Other";
import ExpertRecommendations from "./components/ExpertRecommendations";

function ChannelEventStrategyDesign({ data, contentData }: any) {
  const [popupImageVisible, setPopupImageVisible] = useState<boolean>(false);
  const [popupDetail, setPopupDetail] = useState<any>(null);
  const [detailDropDown, setDetailDropDown] = useState(false);
  const [maxHeight, setMaxHeight] = useState("0px");

  console.log(1651, data, contentData, typeof data?.output);
  const table = data?.output?.overall_ranking?.ranking_table;
  const summaryTable = data?.output?.winning_ad?.summary;
  const expert_recommendationsData =
    data?.output?.winning_ad?.expert_recommendations;
  const images = contentData.images;
  const detailedAnalysisData = data?.analysis?.detailed_analysis;

  function iamgeSRCFunc(imageIdx: any) {
    const imageSRc = images[imageIdx];
    return imageSRc;
  }
  const contentRef: any = useRef(null);

  useEffect(() => {
    if (detailDropDown) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight("0px");
    }
  }, [detailDropDown]);

  return (
    <section>
      {/* ranking table */}
      {table && (
        <div className="bg-white rounded-2xl p-5">
          <h4 className="font-semibold text-xl text-black mb-5">
            Overall Ranking & Summary
          </h4>
          {/* ranking table */}
          <div>
            <h5 className="font-semibold text-base text-primary2 w-full pb-5 border-b border-[#E8E8E8]">
              {table?.title}
            </h5>
            <table className="w-full">
              <thead className="border-b border-[#E8E8E8]">
                <tr>
                  <th className="text-left align-top text-sm font-medium text-black py-4 w-[80px]">
                    Rank
                  </th>
                  <th className="text-left align-top text-sm font-medium text-black py-4 w-[110px]">
                    Image
                  </th>
                  <th className="text-left align-top text-sm font-medium text-black py-4">
                    Summary Rationale
                  </th>
                </tr>
              </thead>
              <tbody>
                {table?.rows?.map((row: any, index: number) => (
                  <tr
                    key={index}
                    className={`border-[#E8E8E8] ${
                      table?.rows?.length !== index + 1 ? "border-b" : ""
                    }`}
                  >
                    <td className="text-left align-top font-medium text-xs text-primary2 py-3 w-[80px]">
                      {row?.overall_score?.toFixed(2)}
                    </td>
                    <td className="text-left align-top text-sm text-[#595E64] py-3 w-[110px]">
                      <img
                        className="h-[60px] object-cover cursor-pointer"
                        src={iamgeSRCFunc(row?.ad_index)}
                        onClick={() => {
                          setPopupDetail({
                            score: row?.overall_score?.toFixed(2),
                            summary: row?.summary_rationale,
                            image: iamgeSRCFunc(row?.ad_index),
                          });
                          setTimeout(() => {
                            setPopupImageVisible(true);
                          }, 200);
                        }}
                        alt="channel-event-strategy"
                      />
                    </td>
                    <td className="text-left align-top font-normal leading-[17px] text-xs text-[#595E64] py-3">
                      {row?.summary_rationale?.replace(/\*/g, "")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {popupDetail?.image && (
        <div
          className={`fixed inset-0 z-[100] flex transition-all duration-200 items-center justify-end ${
            popupImageVisible ? " bg-black" : ""
          }  bg-opacity-50`}
          onClick={() => {
            setPopupImageVisible(false);
            setTimeout(() => {
              setPopupDetail(null);
            }, 200);
          }}
        >
          <div
            className={`relative w-full h-full bg-white shadow-xl max-w-md scrollbar-hide overflow-y-auto rounded-none 
                      transform transition-all duration-200 
                      ${
                        popupImageVisible ? "translate-x-0" : "translate-x-full"
                      }
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
                      setPopupDetail(null);
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
              {popupDetail?.score && (
                <div className="bg-gray_light p-[12px_16px] rounded-[20px]">
                  <p className="text-xl font-medium text-black mb-3">Rank</p>
                  <p className="text-base font-semibold text-primary2">
                    {popupDetail?.score}
                  </p>
                </div>
              )}
              {popupDetail?.summary && (
                <div className="bg-gray_light p-[12px_16px] rounded-[20px]">
                  <p className="text-xl font-medium text-black mb-3">
                    Summary Rationale
                  </p>
                  <p className="text-sm font-normal text-[#595E64]">
                    {popupDetail.summary?.replace(/\*/g, "")}
                  </p>
                </div>
              )}
              {/* Image Block with gray_light background */}
              {popupDetail?.image && (
                <div className="bg-gray_light p-4 rounded-lg">
                  <img
                    src={popupDetail?.image}
                    alt="Popup"
                    className="w-full h-auto object-contain rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ad Summary  */}
      {summaryTable && (
        <div className="p-5 bg-white rounded-2xl mt-3">
          <h4 className="font-semibold text-xl text-black mb-5">
            Winning Ad Summary & Improvement Recommendations
          </h4>
          <div>
            <h5 className="font-semibold text-base text-primary2 w-full pb-4 border-b border-[#E8E8E8]">
              {summaryTable?.title}
            </h5>
            <table className="w-full">
              <thead className="border-b border-[#E8E8E8]">
                <tr>
                  {summaryTable?.headers?.map((head: string, index: number) => {
                    return (
                      <th
                        className="text-left align-top text-sm font-medium text-black py-3"
                        key={index}
                      >
                        {head}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {summaryTable?.rows?.map((row: any, index: number) => (
                  <tr
                    key={index}
                    className={`border-[#E8E8E8] ${
                      summaryTable?.rows?.length !== index + 1 ? "border-b" : ""
                    }`}
                  >
                    <td className="text-left align-top font-medium text-xs text-primary2 py-3 w-[130px]">
                      {row?.dimension}
                    </td>
                    <td className="text-left align-top font-medium text-xs text-primary2 py-3 w-[130px]">
                      {row?.score?.toFixed(2)}
                    </td>

                    <td className="text-left align-top font-normal leading-[17px] text-xs text-[#595E64] py-3">
                      {row?.justification}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {expert_recommendationsData && (
        <div className="bg-white rounded-2xl mt-3">
          <h5 className="font-semibold text-xl p-5 text-black">
            Improvement Recommendations
          </h5>
          <ExpertRecommendations
            data={expert_recommendationsData?.critical_changes}
          />
          <ExpertRecommendations
            data={expert_recommendationsData?.high_impact_improvements}
          />
          <ExpertRecommendations
            data={expert_recommendationsData?.optimization_opportunities}
          />
        </div>
      )}
      {detailedAnalysisData && (
        <div className="bg-white rounded-2xl mt-3">
          {/* Header */}
          <div
            className="flex items-center justify-between  p-5 pb-[25px] cursor-pointer"
            onClick={() => setDetailDropDown(!detailDropDown)}
          >
            <div className="flex items-center gap-[10px]">
              <DetailedAnalysisIcon />
              <p className="font-semibold text-xl text-black">
                Detailed Analysis
              </p>
            </div>
            <div
              className={`transition-transform duration-600 ${
                !detailDropDown ? "rotate-180" : "rotate-0"
              }`}
            >
              <DownArrowAnnalysis />
            </div>
          </div>

          {/* Smooth Dropdown Content */}
          <div
            ref={contentRef}
            className="smooth-dropdown "
            style={{
              maxHeight: maxHeight,
              opacity: detailDropDown ? 1 : 0,
              // marginTop: detailDropDown ? "20px" : 0,
            }}
          >
            <p className="text-xl font-semibold border-t   border-[#E8E8E8] w-full mx-5 pt-[25px]  text-black ">
              Detailed Persona Analysis
            </p>
            {detailedAnalysisData?.map((data: any, index: number) => (
              <DetailedAnalysis
                border={
                  detailedAnalysisData?.length !== index + 1 ? true : false
                }
                data={data}
                key={index}
                mainIndex={index}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ChannelEventStrategyDesign;
