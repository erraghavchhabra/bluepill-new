import { CloseButton } from "@/icons/SimulationIcons";
import React, { useState } from "react";

function ChannelEventStrategyDesign({ data, contentData }: any) {
  const [popupImageVisible, setPopupImageVisible] = useState<boolean>(false);
  const [popupDetail, setPopupDetail] = useState<any>(null);
  console.log(1651, data, contentData, typeof data?.output);
  const table = data?.output?.overall_ranking?.ranking_table;
  const summaryTable = data?.output?.winning_ad?.summary;
  const images = contentData.images;

  function iamgeSRCFunc(imageIdx: any) {
    const imageSRc = images[imageIdx];
    return imageSRc;
  }
  return (
    <section>
      {/* ranking table */}
      {table && (
        <div className="bg-white text-primary2 rounded-2xl p-5 mb-5">
          <h4 className="font-semibold text-xl text-primary2 mb-5">
            Overall Ranking & Summary
          </h4>
          {/* ranking table */}
          <div>
            <h5 className="font-semibold text-xl text-black w-full pb-5 border-b border-[#E8E8E8]">
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
                    <td className="text-left align-top text-sm text-gray-700 py-3 w-[110px]">
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
                    <td className="text-left align-top font-normal leading-[17px] text-xs text-gray-700 py-3">
                      {row?.summary_rationale}
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
                    {popupDetail.summary}
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
        <div className="p-5 bg-white rounded-2xl ">
          <h4 className="font-semibold text-xl text-primary2 mb-5">
            Winning Ad Summary & Improvement Recommendations
          </h4>
          <div>
            <h5 className="font-medium text-base text-black w-full pb-4 border-b border-[#E8E8E8]">
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

                    <td className="text-left align-top font-normal leading-[17px] text-xs text-gray-700 py-3">
                      {row?.justification}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default ChannelEventStrategyDesign;
