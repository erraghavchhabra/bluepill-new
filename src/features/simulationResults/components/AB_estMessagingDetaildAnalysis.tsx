import React from "react";
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
function AB_estMessagingDetaildAnalysis({ data }: any) {
  const formatKeyToTitle = (key: string): string =>
    key
      .replace(/_/g, " ")
      .replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substring(1)
      );
  return (
    <div className="pb-5">
      <h3 className="pt-5 pb-[11px] text-xs leading-[23px] font-normal text-[#595E64] px-5">
        <span className="font-medium text-black">Target Score: </span>
        {data?.target_score || 0}/10 Optimization Gap:{" "}
        {data?.optimization_gap || "0.0"} points from current best score
      </h3>
      {(data?.discovered_dimensions ||
        data?.initial_prioritized_dimensions) && (
        <>
          <GreenHeading text="A. FLUID STRATEGIC VARIATION MATRIX" />
          <div className="overflow-x-auto w-full scrollbar-hide px-5 mt-[6px]">
            <h4 className="font-medium text-base text-black mb-4">
              Phase 1: Dimension Discovery From the initial analysis, I've
              identified these influential message dimensions:
            </h4>
            <table className="w-full min-w-[1252px] table-auto">
              <thead className="border-y border-[#E8E8E8]">
                <tr>
                  {[
                    "Discovered Dimension",
                    "Evidence from Analysis",
                    "Initial Impact Score",
                  ].map((item: string, index: number) => (
                    <th
                      key={index}
                      className="text-left align-top text-sm font-medium text-black py-3 "
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.discovered_dimensions?.map((row: any, index: number) => (
                  <tr
                    key={index}
                    className={`border-[#E8E8E8] ${
                      data?.discovered_dimensions?.length !== index + 1
                        ? "border-b"
                        : ""
                    }`}
                  >
                    <td className="text-left align-top font-medium text-xs text-primary2 py-3 pr-[30px] w-[176px]">
                      {row?.dimension_name}
                    </td>
                    <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] min-w-[555px]    py-3 pr-[30px] break-words">
                      {row?.evidence}
                    </td>
                    <td className="text-left align-top font-medium text-xs text-primary2 py-3 w-[128px] ">
                      {row?.initial_impact_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto w-full scrollbar-hide px-5 mt-[15px] mb-[11px]">
            <h4 className="font-medium text-base text-black mb-4">
              Phase 2: Dimension Prioritization & Definition
            </h4>
            <table className="w-full min-w-[1252px] table-auto">
              <thead className="border-y border-[#E8E8E8]">
                <tr>
                  {[
                    "Dimension",
                    "Impact Weight",
                    "Variable Spectrum",
                    "Rationale",
                  ].map((item: string, index: number) => (
                    <th
                      key={index}
                      className="text-left align-top text-sm font-medium text-black py-3 "
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.initial_prioritized_dimensions?.map(
                  (row: any, index: number) => (
                    <tr
                      key={index}
                      className={`border-[#E8E8E8] ${
                        data?.initial_prioritized_dimensions?.length !==
                        index + 1
                          ? "border-b"
                          : ""
                      }`}
                    >
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] min-w-[176px] max-w-[176px]    py-3 pr-[30px] break-words">
                        {row?.dimension}
                      </td>
                      <td className="text-left align-top font-medium text-xs text-primary2 py-3 pr-[30px] w-[125px]">
                        {row?.impact_weight}
                      </td>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] min-w-[560px]    py-3 pr-[30px] break-words">
                        {row?.variable_spectrum}
                      </td>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] py-3 min-w-[200px] ">
                        {row?.rationale}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      {data?.iterations?.map((iteration: any, index: number) => {
        return (
          <>
            <GreenHeading
              text={`B. ITERATION ${index + 1}: STRATEGIC VARIATIONS`}
            />
            <div className="overflow-x-auto w-full scrollbar-hide px-5 mt-[6px] mb-[11px]">
              <h4 className="font-medium text-base text-black mb-4">
                Updated Variation Matrix (based on learnings):
              </h4>
              <table className="w-full min-w-[1252px] table-auto">
                <thead className="border-y border-[#E8E8E8]">
                  <tr>
                    {[
                      "Dimension",
                      "Impact Weight",
                      "Variable Spectrum",
                      "Rationale",
                    ].map((item: string, index: number) => (
                      <th
                        key={index}
                        className="text-left align-top text-sm font-medium text-black py-3 "
                      >
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {iteration?.dimensions?.map((row: any, index: number) => (
                    <tr key={index} className={`border-[#E8E8E8] border-b `}>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] min-w-[176px] max-w-[176px]    py-3 pr-[30px] break-words">
                        {row?.dimension}
                      </td>
                      <td className="text-left align-top font-medium text-xs text-primary2 py-3 pr-[30px] w-[125px]">
                        {row?.impact_weight}
                      </td>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] min-w-[560px]    py-3 pr-[30px] break-words">
                        {row?.variable_spectrum}
                      </td>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] py-3 min-w-[200px] ">
                        {row?.rationale}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto w-full scrollbar-hide px-5 mt-[15px] mb-[11px]">
              <h4 className="font-medium text-base text-black mb-4">
                Variation Design Matrix:
              </h4>
              <table className="w-full min-w-[1252px] table-auto">
                <thead className="border-y border-[#E8E8E8]">
                  <tr>
                    {[
                      "Variation Message Text",
                      "Dimensional Profile",
                      "Hypothesis",
                      "Target Segments",
                    ].map((item: string, index: number) => (
                      <th
                        key={index}
                        className="text-left align-top text-sm font-medium text-black py-3 "
                      >
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {iteration?.variations?.map((row: any, index: number) => (
                    <tr key={index} className={`border-[#E8E8E8] border-b `}>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] min-w-[433px] max-w-[433px]    py-3 pr-[30px] break-words">
                        {row?.message_text}
                      </td>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] min-w-[342px] max-w-[342px]    py-3 pr-[30px] break-words">
                        {row?.dimensional_profile}
                      </td>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] min-w-[312px] max-w-[312px]    py-3 pr-[30px] break-words">
                        {row?.hypothesis}
                      </td>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] min-w-[165px] max-w-[165px]    py-3 break-words">
                        {row?.target_segments}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto w-full scrollbar-hide px-5 mt-[15px] mb-[11px]">
              <h4 className="font-medium text-base text-black mb-4">
                Iteration {index + 1} Results:
              </h4>

              <table className="w-full min-w-[1250px] table-auto">
                <thead className="border-y border-[#E8E8E8]">
                  <tr>
                    {[
                      "Variation Message Text",
                      "Overall Score",
                      "Score Range",
                      "Std Dev",
                      "Top Performers",
                      "Bottom Performers",
                      "Key Learning",
                    ].map((item: string, index: number) => (
                      <th
                        key={index}
                        className="text-left align-top text-sm font-medium text-black py-3 "
                      >
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {iteration?.results?.map((row: any, index: number) => (
                    <tr key={index} className={`border-[#E8E8E8] border-b`}>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] py-3 pr-[30px] w-[420px] break-words">
                        {row?.message_text}
                      </td>
                      <td className="text-left align-top font-medium text-xs text-primary2 py-3 pr-[30px] w-[83px]">
                        {row?.overall_score}
                      </td>
                      <td className="text-left align-top font-medium text-xs text-primary2 py-3 pr-[30px] w-[83px]">
                        {row?.score_range}
                      </td>
                      <td className="text-left align-top font-medium text-xs text-primary2 py-3 pr-[30px] w-[83px]">
                        {row?.std_dev || "—"}
                      </td>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] py-3 pr-[30px] w-[300px] break-words">
                        {row?.top_performers}
                      </td>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] py-3 pr-[30px] w-[280px] break-words">
                        {row?.bottom_performers}
                      </td>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] py-3  w-[200px] break-words">
                        {row?.key_learning}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      })}
      <GreenHeading text="C. FINAL OPTIMIZATION ROUND" />
      <div className="mt-[6px] px-5">
        <h4 className="text-black  text-sm leading-[23px] font-medium mb-[10px]">
          Iteration 3: Final Refinement
        </h4>
        <div className="flex flex-col gap-[5px]">
          <p className="text-[#595E64] text-xs leading-[23px] font-normal  ">
            {data?.winning_variation_name}
          </p>
          <p className="text-[#595E64] text-xs leading-[23px] font-normal  ">
            Variation Message Text: {data?.optimized_message_text}
          </p>
          <p className="text-[#595E64] text-xs leading-[23px] font-normal  ">
            Final Score: {data?.final_score}/10 (Improvement: +
            {data?.improvement_from_original} from original)
          </p>
        </div>
        <h4 className="text-black  text-xs leading-[23px] font-medium mt-[10px] mb-[5px]">
          Winning Dimensional Profile:
        </h4>
        <div className="flex flex-col gap-[5px]">
          {data?.key_success_factors?.map((item: any, index: number) => (
            <p className="text-[#595E64] text-xs leading-[23px] font-normal ml-2 ">
              {index + 1}. {item?.element}: {item?.achievement_method}
            </p>
          ))}
        </div>
        <div className="overflow-x-auto w-full scrollbar-hide mt-4">
          <h4 className="font-medium text-base text-black mb-4">
            Iteration 2 Results:
          </h4>
          <table className="w-full min-w-[1252px] table-auto">
            <thead className="border-y border-[#E8E8E8]">
              <tr>
                {[
                  "Segment",
                  "Original Score",
                  "Optimized Score",
                  "Improvement",
                  "Reaction Change",
                ].map((item: string, index: number) => (
                  <th
                    key={index}
                    className="text-left align-top text-sm font-medium text-black py-3 "
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.performance_breakdown?.map((row: any, index: number) => (
                <tr key={index} className={`border-[#E8E8E8] border-b `}>
                  <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] min-w-[428px] max-w-[428px]    py-3 pr-[30px] break-words">
                    {row?.segment}
                  </td>
                  <td className="text-left align-top font-medium text-xs text-primary2 py-3 pr-[30px] w-[164px]">
                    {row?.original_score}
                  </td>
                  <td className="text-left align-top font-medium text-xs text-primary2 py-3 pr-[30px] w-[164px]">
                    {row?.optimized_score}
                  </td>
                  <td className="text-left align-top font-medium text-xs text-primary2 py-3 pr-[30px] w-[164px]">
                    {row?.improvement}
                  </td>
                  <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] min-w-[332px]    py-3 pr-[30px] break-words">
                    {row?.reaction_change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h4 className="text-black  text-xs leading-[23px] font-medium mt-4 mb-[5px]">
          Key Success Factors:
        </h4>
        <div className="flex flex-col ">
          {data?.winning_dimensional_profile?.map(
            (item: any, index: number) => (
              <p className="text-[#595E64] text-xs leading-[23px] font-normal  ml-2">
                {index + 1}. {item?.dimension}: {item?.setting} -{" "}
                {item?.rationale}
              </p>
            )
          )}
        </div>
        <h4 className="text-black  text-xs leading-[23px] font-medium mt-4 mb-[5px]">
          Implementation Guide:
        </h4>
        <div className="flex flex-col mb-[10px]">
          {Object.entries(data?.implementation_guide).map(
            ([key, value]: any, index: number) => (
              <p
                key={index}
                className="text-[#595E64] text-xs leading-[23px] font-normal  ml-2"
              >
                {index + 1}. <span>{formatKeyToTitle(key)}:</span>
                {value?.map((item: any, idx: number) => (
                  <span key={idx}>
                    {item}
                    {value?.length !== idx + 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            )
          )}
        </div>
      </div>
      {data?.exit_strategy_description && (
        <>
          <GreenHeading text="D. OPTIMIZATION EXIT STRATEGY" />
          <div className="mt-[6px] px-5">
            <h4 className="text-black  text-xs leading-[23px] font-medium mb-[10px]">
              {data?.exit_strategy_description}
            </h4>
          </div>
        </>
      )}
      {data?.optimization_summary && (
        <>
          <GreenHeading text="E. OPTIMIZATION SUMMARY" />
          <div className="mt-[6px] px-5">
            <h4 className="text-black  text-xs leading-[23px] font-medium mb-[5px]">
              Optimization Journey:
            </h4>
            <div className="flex flex-col mb-[10px]">
              <p className="text-[#595E64] text-xs leading-[23px] font-normal  ml-2">
                1. Starting Score: {data?.optimization_summary?.starting_score}
                /10
              </p>
              <p className="text-[#595E64] text-xs leading-[23px] font-normal  ml-2">
                2. Best Achieved: {data?.optimization_summary?.best_achieved}/10
              </p>
              <p className="text-[#595E64] text-xs leading-[23px] font-normal  ml-2">
                3. Total Improvement:{" "}
                {data?.optimization_summary?.total_improvement} points (35%
                increase)
              </p>
              <p className="text-[#595E64] text-xs leading-[23px] font-normal  ml-2">
                4. Iterations Completed:{" "}
                {data?.optimization_summary?.iterations_completed}
              </p>
              <p className="text-[#595E64] text-xs leading-[23px] font-normal  ml-2">
                5. Exit Reason: {data?.optimization_summary?.exit_reason}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AB_estMessagingDetaildAnalysis;
