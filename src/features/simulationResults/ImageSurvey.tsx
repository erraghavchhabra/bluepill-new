import React, { useEffect, useRef, useState } from "react";
import { CloseButton } from "@/icons/SimulationIcons";
import { DetailedAnalysisIcon, DownArrowAnnalysis } from "@/icons/Other";
const GreenHeading = ({ text }: any) => {
  return (
    <div
      className="p-[9px_20px]  relative text-primary2 font-semibold text-base"
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
function ImageSurvey({ data, contentData }: any) {
  const [popupImageVisible, setPopupImageVisible] = useState(false);
  const [popupDetail, setPopupDetail] = useState<any>(null);
  const [detailDropDown, setDetailDropDown] = useState(false);
  const [maxHeight, setMaxHeight] = useState("0px");
  const contentRef: any = useRef(null);

  useEffect(() => {
    if (detailDropDown) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight("0px");
    }
  }, [detailDropDown]);

  const rankings = data?.detailed_response?.rankings || [];
  const personas = data?.detailed_response?.persona_choices || [];
  const insights = data?.detailed_response?.overall_insights || {};
  const leastPopular = insights?.least_popular_image || {};
  const keyFindings = insights?.key_findings || [];
  const segmentPrefs = insights?.segment_preferences || {};
  const images = contentData.images;

  function iamgeSRCFunc(index: number) {
    return images[index];
  }

  return (
    <div className="flex flex-col gap-3 items-start">
      {/* Rankings Table */}
      <div className="bg-white rounded-2xl p-5 w-full">
        <h2 className="text-xl font-semibold mb-4">Image Rankings</h2>
        <table className="w-full">
          <thead className="border-b border-[#E8E8E8]">
            <tr>
              {["Rank", "Image", "Total Score", "Percentage"].map((h, i) => (
                <th
                  key={i}
                  className="text-left align-top text-sm font-medium text-black py-4"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rankings.map((row: any, index: number) => (
              <tr
                key={index}
                className={`border-[#E8E8E8] ${
                  rankings.length !== index + 1 ? "border-b" : ""
                }`}
              >
                <td className="text-xs align-top font-medium text-primary2 py-3 pr-[30px] w-[80px]">
                  {index + 1}
                </td>
                <td className="py-3 pr-[30px] w-[110px]">
                  <img
                    className="h-[60px] object-cover cursor-pointer"
                    src={iamgeSRCFunc(row.ad_index)}
                    alt="ad"
                    onClick={() => {
                      setPopupDetail({
                        score: row.total_score?.toFixed(2),
                        percentage: row.percentage,
                        image: iamgeSRCFunc(row?.ad_index),
                      });
                      setTimeout(() => {
                        setPopupImageVisible(true);
                      }, 200);
                    }}
                  />
                </td>
                <td className="text-xs align-top text-[#595E64] py-3 pr-6">
                  {row.total_score?.toFixed(2)}
                </td>
                <td className="text-xs align-top text-[#595E64] py-3">
                  {row.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {personas && (
        <div className="bg-white rounded-2xl w-full">
          <div
            className="flex items-center justify-between  p-5 cursor-pointer no-print"
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
          <div
            ref={contentRef}
            className="smooth-dropdown no-print"
            style={{
              maxHeight: maxHeight,
              opacity: detailDropDown ? 1 : 0,
            }}
          >
            <p className="text-xl font-semibold border-t border-[#E8E8E8] w-full mx-5 pt-5 mb-3 text-black ">
              Detailed Persona Analysis
            </p>
            {/* Persona Choices */}
            {keyFindings && <GreenHeading text="Overall Analysis" />}
            <div className="px-5 mb-5">
              {keyFindings?.map((item: string, index: any) => {
                return (
                  <p
                    key={index}
                    className="text-xs text-[#595E64] py-1   break-words"
                  >
                    {item}
                  </p>
                );
              })}
            </div>
            {personas && <GreenHeading text="Persona Choice Table" />}
            <div className="bg-white rounded-2xl p-5 overflow-x-auto w-full scrollbar-hide">
              <table className="w-full min-w-[1000px] table-auto">
                <thead className="border-b border-[#E8E8E8]">
                  <tr>
                    {["#", "Name", "Image Choice", "Justification"].map(
                      (h, i) => (
                        <th
                          key={i}
                          className="text-left align-top text-sm font-medium text-black py-3 pr-5"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {personas.map((p: any, i: number) => (
                    <tr key={i} className="border-b border-[#E8E8E8]">
                      <td className="text-xs align-top font-medium text-black py-3 w-[50px] pr-[30px]">
                        {i + 1 < 10 ? "0" : ""}
                        {i + 1}
                      </td>
                      <td className="text-xs align-top text-primary2 font-medium py-3 w-[130px] pr-[30px]">
                        {p.persona_name}
                      </td>
                      <td className="text-xs align-top text-primary2 font-medium py-3 w-[130px] pr-[30px]">
                        Image {p.image_choice}
                      </td>
                      <td className="text-xs align-top text-[#595E64] py-3  max-w-[600px] break-words">
                        {p.justification}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
            <div className="">
              <p className="text-xl font-semibold border-t border-[#E8E8E8] w-full mx-5 pt-5 mb-3 text-black ">
                Detailed Persona Analysis
              </p>
              {/* Persona Choices */}
              {keyFindings && <GreenHeading text="Overall Analysis" />}
              <div className="px-5 mb-5">
                {keyFindings?.map((item: string, index: any) => {
                  return (
                    <p
                      key={index}
                      className="text-xs text-[#595E64] py-1   break-words"
                    >
                      {item}
                    </p>
                  );
                })}
              </div>
              {personas && <GreenHeading text="Persona Choice Table" />}
              <div className="bg-white rounded-2xl p-5 overflow-x-auto w-full scrollbar-hide">
                <table className="w-full min-w-[1000px] table-auto">
                  <thead className="border-b border-[#E8E8E8]">
                    <tr>
                      {["#", "Name", "Image Choice", "Justification"].map(
                        (h, i) => (
                          <th
                            key={i}
                            className="text-left align-top text-sm font-medium text-black py-3 pr-5"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {personas.map((p: any, i: number) => (
                      <tr key={i} className="border-b border-[#E8E8E8]">
                        <td className="text-xs align-top font-medium text-black py-3 w-[50px] pr-[30px]">
                          {i + 1 < 10 ? "0" : ""}
                          {i + 1}
                        </td>
                        <td className="text-xs align-top text-primary2 font-medium py-3 w-[130px] pr-[30px]">
                          {p.persona_name}
                        </td>
                        <td className="text-xs align-top text-primary2 font-medium py-3 w-[130px] pr-[30px]">
                          Image {p.image_choice}
                        </td>
                        <td className="text-xs align-top text-[#595E64] py-3  max-w-[600px] break-words">
                          {p.justification}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup */}
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
                              popupImageVisible
                                ? "translate-x-0"
                                : "translate-x-full"
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
              {popupDetail?.percentage && (
                <div className="bg-gray_light p-[12px_16px] rounded-[20px]">
                  <p className="text-xl font-medium text-black mb-3">
                    Percentage
                  </p>
                  <p className="text-base font-semibold text-primary2">
                    {popupDetail?.percentage}%
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
    </div>
  );
}

export default ImageSurvey;
