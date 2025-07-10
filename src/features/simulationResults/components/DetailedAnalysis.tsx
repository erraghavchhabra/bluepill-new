import React, { useEffect, useState } from "react";
import ExpertRecommendations from "./ExpertRecommendations";

function DetailedAnalysis({ data, border, mainIndex }: any) {
  const [showAll, setShowAll] = useState(false);

  const rows = data?.persona_reactions?.rows || [];
  const displayRows = showAll ? rows : rows.slice(0, 10);

  return (
    <div>
      {data?.persona_reactions && (
        <div className="">
          <div
            className="p-[12px_20px]  relative my-[13px] text-primary2 font-semibold text-base"
            style={{
              background:
                "linear-gradient(90deg, rgba(7, 229, 209, 0.05) 0%, rgba(7, 229, 209, 0.013942) 92.88%, rgba(7, 229, 209, 0) 100%)",
            }}
          >
            <div className="absolute left-0 top-0 rounded-r-lg h-full w-[5px] bg-primary2"></div>
            Analysis for Rank #{mainIndex + 1}:{" "}
            {data?.ad_title?.replace(/\*/g, "")}
          </div>

          <p className="text-base mx-5 font-medium text-black pb-4 border-b border-[#E8E8E8]">
            {data?.persona_reactions?.title}
          </p>
          <div className="w-full px-5">
            <table>
              <thead className="border-b border-[#E8E8E8]">
                <tr>
                  {data?.persona_reactions?.headers?.map(
                    (head: string, index: number) => (
                      <th
                        key={index}
                        className="text-left align-top text-sm font-medium text-black py-3"
                      >
                        {head}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {displayRows.map((row: any, index: number) => {
                  const numIdx = row.findIndex(
                    (v: any) => typeof v === "number"
                  );
                  const adjustedRow = [...row];
                  if (numIdx !== -1 && numIdx !== 1) {
                    const [num] = adjustedRow.splice(numIdx, 1); // remove score
                    adjustedRow.splice(1, 0, num); // insert at idx 1
                  }

                  return (
                    <tr
                      key={index}
                      className={`border-[#E8E8E8] ${
                        displayRows.length !== index + 1 ? "border-b" : ""
                      }`}
                    >
                      {/* Serial‑number column: show only if this row really has a score */}
                      <td className="text-left align-top font-medium text-xs text-black py-3 min-w-[50px]">
                        {index + 1 < 10 ? "0" : ""}
                        {index + 1}
                      </td>

                      {/* Rest of the cells */}
                      {adjustedRow.map((item: any, idx: number) => (
                        <td
                          key={idx}
                          className={`align-top  text-xs ${
                            idx == 0 || idx === 1
                              ? "text-primary2 font-medium"
                              : "text-[#595E64] font-normal"
                          } py-3 ${
                            idx == 0
                              ? "min-w-[130px]"
                              : idx == 1
                              ? "min-w-[168px]"
                              : "max-w-full"
                          }  text-left`}
                        >
                          {typeof item === "number" ? item.toFixed(2) : item}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Show More / Less Button */}
          {rows.length > 10 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-primary2 text-sm font-medium hover:underline transition-all duration-300"
              >
                {showAll ? "See Less" : "See More"}
              </button>
            </div>
          )}
        </div>
      )}
      {data?.summary && (
        <div>
          <p className="text-base mx-5 font-medium text-black  py-4 border-b border-[#E8E8E8]">
            {data?.summary?.title?.replace(/\*/g, "")}
          </p>
          <div className="w-full px-5">
            <table>
              <thead className="border-b border-[#E8E8E8]">
                <tr>
                  {data?.summary?.headers?.map(
                    (head: string, index: number) => (
                      <th
                        key={index}
                        className="text-left align-top text-sm font-medium text-black py-3"
                      >
                        {head}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {data?.summary?.rows?.map((row: any, index: number) => (
                  <tr
                    key={index}
                    className={`border-[#E8E8E8] ${
                      data?.summary?.rows?.length !== index + 1
                        ? "border-b"
                        : ""
                    }`}
                  >
                    <td
                      className={`align-top font-normal text-xs  py-3 text-[#595E64] text-left min-w-[130px]`}
                    >
                      {row?.dimension}
                    </td>
                    <td
                      className={`align-top font-medium text-xs  py-3 text-primary2 text-left min-w-[80px]`}
                    >
                      {row?.score?.toFixed(2)}
                    </td>
                    <td
                      className={`align-top font-normal text-xs  py-3 text-[#595E64] text-left min-w-[130px]`}
                    >
                      {row?.justification}
                    </td>
                    {/* {row.map((item: any, idx: number) => (
                  ))} */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.expert_recommendations && (
            <div className="">
              <h5 className="font-semibold text-xl px-5 pb-[13px] pt-[25px] border-t border-[#E8E8E8] mt-[25px] text-black">
                Improvement Recommendations
              </h5>
              <ExpertRecommendations
                className="p-[12px_20px]"
                data={data?.expert_recommendations?.critical_changes}
              />
              <ExpertRecommendations
                data={data?.expert_recommendations?.high_impact_improvements}
              />
              <ExpertRecommendations
                data={data?.expert_recommendations?.optimization_opportunities}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DetailedAnalysis;
