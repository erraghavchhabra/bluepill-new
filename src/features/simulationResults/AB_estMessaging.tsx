import { DetailedAnalysisIcon, DownArrowAnnalysis } from "@/icons/Other";
import React, { useEffect, useRef, useState } from "react";
import AB_estMessagingDetaildAnalysis from "./components/AB_estMessagingDetaildAnalysis";

function AB_estMessaging({ data }: any) {
  if (!data || !data.output) return null;

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

  const detailedAnalysisData = data.analysis;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl bg-white p-5 w-full flex items-start flex-col gap-5">
        <h3 className="font-semibold text-xl text-primary2">
          1. EXECUTIVE DASHBOARD
        </h3>
        <div>
          <div className="flex items-center gap-1">
            <h5 className="font-medium text-xs leading-[23px] text-black">
              Best Original Message Score:
            </h5>
            <p className="font-normal text-xs leading-[23px] text-[#595E64]">
              {data?.output?.best_original_message?.score}/10 "
              {data?.output?.best_original_message?.message_text}"
            </p>
          </div>
          <div className="flex items-center gap-1 mt-[10px]">
            <h5 className="font-medium text-xs leading-[23px] text-black">
              Best Overall Message Score:
            </h5>
            <p className="font-normal text-xs leading-[23px] text-[#595E64]">
              {data?.output?.best_original_message?.score}/10 "
              {data?.output?.best_original_message?.message_text}"
            </p>
          </div>
        </div>
        <div className="overflow-x-auto w-full scrollbar-hide">
          <h4 className="font-medium text-base text-black mb-4">
            Top {data?.output?.top_optimized_messages?.length} Optimized
            Messages
          </h4>
          <table className="w-full table-auto">
            <thead className="border-y border-[#E8E8E8]">
              <tr>
                {[
                  "Priority",
                  "Recommended Message Text",
                  "Score",
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
              {Array.isArray(data.output?.top_optimized_messages) &&
                data.output.top_optimized_messages.map(
                  (row: any, index: number) => (
                    <tr
                      key={index}
                      className={`border-[#E8E8E8] ${
                        data.output.top_optimized_messages.length !== index + 1
                          ? "border-b"
                          : ""
                      }`}
                    >
                      <td className="text-left align-top font-medium text-xs text-primary2 py-3 pr-[30px] w-[80px]">
                        {row?.priority}
                      </td>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px]  py-3 pr-[30px] break-words">
                        {row?.message_text}
                      </td>
                      <td className="text-left align-top font-medium text-xs text-primary2 py-3 pr-[30px] w-[72px]">
                        {row?.score}/10
                      </td>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] py-3 min-w-[334px] max-w-[334px] break-words">
                        {row?.rationale}
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-5 w-full flex items-start flex-col gap-5">
        <h3 className="font-semibold text-xl text-primary2">
          2. ORIGINAL MESSAGE PERFORMANCE RANKING
        </h3>
        <div className="overflow-x-auto w-full scrollbar-hide">
          <h4 className="font-medium text-base text-black mb-4">
            Ranked by Overall Effectiveness
          </h4>
          <table className="w-full min-w-[1252px] table-auto">
            <thead className="border-y border-[#E8E8E8]">
              <tr>
                {[
                  "Priority",
                  "Message Text",
                  "Score",
                  "Rationale",
                  "Best Segment",
                  "Biggest Risk",
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
              {Array.isArray(data.output?.ranked_messages) &&
                data.output.ranked_messages.map((row: any, index: number) => (
                  <tr
                    key={index}
                    className={`border-[#E8E8E8] ${
                      data.output.ranked_messages.length !== index + 1
                        ? "border-b"
                        : ""
                    }`}
                  >
                    <td className="text-left align-top font-medium text-xs text-primary2 py-3 pr-[30px] w-[80px]">
                      {row?.rank}
                    </td>
                    <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] min-w-[330px] max-w-[330px]   py-3 pr-[30px] break-words">
                      {row?.message_text}
                    </td>
                    <td className="text-left align-top font-medium text-xs text-primary2 py-3 pr-[30px] w-[72px] ">
                      {row?.score}/10
                    </td>
                    <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] py-3 min-w-[275px] max-w-[275px] pr-[30px] break-words">
                      {row?.rationale}
                    </td>
                    <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] py-3 min-w-[251px] max-w-[251px] pr-[30px] break-words">
                      {row?.best_segment}
                    </td>
                    <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] py-3 min-w-[244px] max-w-[244px] break-words">
                      {row?.biggest_risk}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="">
            <h3 className="text-base font-medium text-black mt-5 mb-4">
              Ranked by Overall Effectiveness
            </h3>
            <ul className="list-disc pl-5">
              <li className="text-xs leading-[23px] font-normal text-[#595E64]">
                <span className="font-medium text-black">
                  High Performers:{" "}
                </span>
                {data.output.performance_distribution?.high_performers?.count} -{" "}
                {data.output.performance_distribution?.high_performers?.insight}
              </li>
              <li className="text-xs leading-[23px] font-normal text-[#595E64]">
                <span className="font-medium text-black">
                  Moderate Performers:{" "}
                </span>
                {
                  data.output.performance_distribution?.moderate_performers
                    ?.count
                }{" "}
                -{" "}
                {
                  data.output.performance_distribution?.moderate_performers
                    ?.insight
                }
              </li>
              <li className="text-xs leading-[23px] font-normal text-[#595E64]">
                <span className="font-medium text-black">Low Performers: </span>
                {
                  data.output.performance_distribution?.low_performers?.count
                } -{" "}
                {data.output.performance_distribution?.low_performers?.insight}
              </li>
            </ul>
            <p className="text-xs leading-[23px] font-normal text-[#595E64] mt-4">
              <span className="font-medium text-black">
                Strategic Implication:{" "}
              </span>
              {data.output.performance_distribution?.strategic_implication}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-5 w-full flex items-start flex-col gap-5">
        <h3 className="font-semibold text-xl text-primary2">
          3. TOP {data.output?.strategic_insights?.length} STRATEGIC INSIGHTS
        </h3>
        <ul className="list-disc pl-5 flex flex-col gap-[5px]">
          {Array.isArray(data.output?.strategic_insights) &&
            data.output.strategic_insights.map(
              (insight: any, index: number) => (
                <li
                  className="text-xs leading-[23px] font-medium text-black"
                  key={index}
                >
                  {insight?.title}:{" "}
                  <span className="font-normal text-[#595E64]">
                    {insight?.content}
                  </span>
                </li>
              )
            )}
        </ul>
      </div>
      <div className="rounded-2xl bg-white p-5 w-full flex items-start flex-col gap-5">
        <h3 className="font-semibold text-xl text-primary2">
          4. Messaging by Segment
        </h3>
        <div className="overflow-x-auto w-full scrollbar-hide">
          <h4 className="font-medium text-base text-black mb-4">
            Implementation Framework
          </h4>
          <table className="w-full min-w-[1252px] table-auto">
            <thead className="border-y border-[#E8E8E8]">
              <tr>
                {[
                  "Segment",
                  "Message Variant Text",
                  "Key Adaptations",
                  "Score",
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
              {Array.isArray(data.output?.messaging_by_segment) &&
                data.output.messaging_by_segment.map(
                  (row: any, index: number) => (
                    <tr
                      key={index}
                      className={`border-[#E8E8E8] ${
                        data.output.messaging_by_segment.length !== index + 1
                          ? "border-b"
                          : ""
                      }`}
                    >
                      <td className="text-left align-top font-medium text-xs text-primary2 py-3 pr-[30px] w-[231px]">
                        {row?.segment}
                      </td>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] min-w-[555px] max-w-[555px]   py-3 pr-[30px] break-words">
                        {row?.message_variant_text}
                      </td>
                      <td className="text-left align-top font-normal text-xs text-[#595E64] leading-[17px] py-3 min-w-[349px] max-w-[349px] pr-[30px] break-words">
                        {row?.key_adaptations}
                      </td>
                      <td className="text-left align-top font-medium text-xs text-primary2 py-3 w-[177px] ">
                        {row?.expected_score || 0}/10
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
      </div>
      {detailedAnalysisData && (
        <div className="bg-white rounded-2xl">
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
            <p className="text-xl font-semibold border-t border-[#E8E8E8] w-full mx-5 pt-5  text-black ">
              Step 6. ITERATIVE MESSAGE OPTIMIZATION WITH FLUID VARIATION MATRIX
            </p>
            <AB_estMessagingDetaildAnalysis data={detailedAnalysisData} />
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
              <p className="text-xl font-semibold border-t border-[#E8E8E8] w-full mx-5 pt-5  text-black ">
                Step 6. ITERATIVE MESSAGE OPTIMIZATION WITH FLUID VARIATION
                MATRIX
              </p>
              <AB_estMessagingDetaildAnalysis data={detailedAnalysisData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AB_estMessaging;
