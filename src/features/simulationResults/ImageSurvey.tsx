import { CloseButton } from "@/icons/SimulationIcons";
import React, { useState } from "react";

function ImageSurvey({ data, contentData }: any) {
  const [popupImageVisible, setPopupImageVisible] = useState<boolean>(false);
  const [popupDetail, setPopupDetail] = useState<any>(null);
  console.log(116165 , data, contentData); // using props to avoid warning
  const table = data?.detailed_response.rankings;
  const images = contentData.images;

  function iamgeSRCFunc(imageIdx: any) {
    const imageSRc = images[imageIdx];
    return imageSRc;
  }
  return (
    <div>
      {table && (
        <div className="bg-white rounded-2xl p-5">
          {/* ranking table */}

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
                  Total Score
                </th>
                <th className="text-left align-top text-sm font-medium text-black py-4">
                  percentage
                </th>
              </tr>
            </thead>
            <tbody>
              {table?.map((row: any, index: number) => (
                <tr
                  key={index}
                  className={`border-[#E8E8E8] ${
                    table?.length !== index + 1 ? "border-b" : ""
                  }`}
                >
                  <td className="text-left align-top font-medium text-xs text-primary2 py-3 w-[80px] pr-[30px]">
                    {index+1}
                  </td>
                  
                  <td className="text-left align-top text-sm text-[#595E64] py-3 w-[110px] pr-[30px]">
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
                  <td className="text-left align-top font-normal text-xs leading-[17px] text-[#595E64] py-3 w-[110px] pr-[30px]">
                    {row?.total_score?.toFixed(2)}
                  </td>
                  <td className="text-left align-top font-normal text-xs leading-[17px] text-[#595E64] py-3">
                    {row?.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
