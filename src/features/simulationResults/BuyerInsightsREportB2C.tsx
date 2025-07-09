import { PortsIcon } from "@/icons/Other";
import React from "react";

function BuyerInsightsREportB2C({ data }: any) {
  const formatKeyToTitle = (key: string): string =>
    key
      .replace(/_/g, " ")
      .replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substring(1)
      );

  const MarketContextSection = ({
    data,
    heading,
  }: {
    data: any;
    heading?: string;
  }) => {
    if (!data) return null;

    const sectionData = data;

    return (
      <div className="p-6 bg-white rounded-xl mb-3">
        <h2 className="text-xl font-semibold text-black pb-4 border-b border-[#E8E8E8] ">
          {heading}
        </h2>
        <div className="flex items-start flex-col gap-4 py-4 px-5">
          {Object.entries(sectionData).map(
            ([key, value]: any, index: number) => (
              <div
                key={index}
                className={`grid grid-cols-[100px_auto] md:grid-cols-[150px_auto] xl:grid-cols-[200px_auto]  gap-3 items-start  border-[#E8E8E8] w-full ${
                  Object.entries(sectionData)?.length !== index + 1
                    ? "pb-4 border-b "
                    : ""
                }`}
              >
                <div className="text-base max-w-[200px] w-full  font-medium text-primary2">
                  {formatKeyToTitle(key)}:
                </div>
                <div className="text-[#595E64] text-xs font-normal">
                  {value}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  };
  const InsightsTable = ({
    data,
    heading,
  }: {
    data: any;
    heading?: string;
  }) => {
    if (!data) return null;

    return (
      <div className="relative">
        {/* Definition */}
        <div
          className="p-[15px_40px] relative mb-3"
          style={{
            background:
              "linear-gradient(90deg, rgba(7, 229, 209, 0.05) 0%, rgba(7, 229, 209, 0.013942) 92.88%, rgba(7, 229, 209, 0) 100%)",
          }}
        >
          <div className="absolute left-0 top-0 rounded-r-lg h-full w-[5px] bg-primary2"></div>
          <div className="text-lg   font-semibold text-primary2 mb-[2px] ">
            {heading}
          </div>
          <div className="text-[#595E64] text-sm font-medium">
            <span className="font-semibold text-black">
              {data.definition?.split(" ").slice(0, 2).join(" ")}
            </span>{" "}
            {data.definition?.split(" ").slice(2).join(" ")}
          </div>
        </div>

        {/* Insights List */}
        <div className="p-5">
          <div className="grid grid-cols-[80px_auto] md:grid-cols-[130px_auto] xl:grid-cols-[180px_auto]  gap-3 border-b border-[#E8E8E8] mx-10 pb-4">
            <div className="text-base  w-full font-medium text-primary2">
              Insights:
            </div>
            <ul className="list-none list-inside text-[#595E64] text-xs font-normal">
              {data.insights?.map((insight: string, idx: number) => (
                <li className="text-xs font-normal leading-7" key={idx}>
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          {/* Elaborations */}
          <div className="flex flex-col gap-4 px-10 pt-4">
            {data.elaborations?.map((group: any, groupIdx: number) => {
              const [insightKey, quotes]: any = Object.entries(group)[0];

              return (
                <div key={groupIdx} className="flex flex-col gap-2">
                  <h2 className="text-base font-medium text-primary2">
                    {insightKey}
                  </h2>
                  <div className={`grid grid-cols-3 gap-5 pt-[25px] border-[#EBEBEB] ${data.elaborations?.length !== groupIdx+1 ? "border-b pb-4" : "" }`}>
                    {quotes.map((quote: any, quoteIdx: number) => (
                      <div
                        key={quoteIdx}
                        className="text-[#595E64] text-xs font-normal relative bg-[#E6FCFA] p-5"
                      >
                        <div className="absolute top-0 -translate-y-2/4 left-[14px]">
                          <PortsIcon />
                        </div>
                        <p className="mb-2 text-xs leading-[18px] font-normal italic">
                          "{quote.text}"
                        </p>
                        <p className="text-xs leading-[18px] font-medium  text-primary2">
                          — {quote.source}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  const SummerySection = ({ data, heading }: any) => {
    if (!data) return null;

    return (
      <div className="p-6 bg-white rounded-xl mb-3">
        {/* Section Heading */}
        <h2 className="text-xl font-semibold text-primary2 pb-4 border-b border-[#E8E8E8]">
          {heading}
        </h2>

        {/* Summary */}
        {data.summary && (
          <p className="text-base font-medium text-black pt-4 pb-2">
            {data.summary}
          </p>
        )}

        {/* Recommendations */}
        {data.recommendations && (
          <p className="text-sm text-[#595E64] font-normal leading-relaxed">
            {data.recommendations}
          </p>
        )}
      </div>
    );
  };
  return (
    <div>
      {/* heading - band name */}
      <h4 className="text-primary2 font-semibold text-xl mb-4">
        {data?.brand_name}
      </h4>
      <div className="bg-white rounded-2xl p-5 mb-3">
        <p className="text-primary2 font-semibold text-2xl">
          {data?.product_category}
        </p>
      </div>
      <SummerySection
        data={data?.strategic_recommendations}
        heading="Strategic recommendations"
      />
      <MarketContextSection
        data={{ ...data?.market_context_analysis }}
        heading={"Market context analysis"}
      />
      <MarketContextSection
        data={{ ...data?.composite_consumer_profile }}
        heading={"Composite consumer profile"}
      />
      <div className="bg-white rounded-2xl mb-4">
        <h2 className="text-xl font-semibold text-black p-5">
          Detailed Consumer Insights from Provided Personas
        </h2>

        <InsightsTable
          data={data?.purchase_triggers}
          heading="Purchase triggers"
        />
        <InsightsTable
          data={data?.value_expectations}
          heading="Value expectations"
        />
        <InsightsTable
          data={data?.purchase_hesitations}
          heading="Purchase hesitations"
        />
        <InsightsTable
          data={data?.evaluation_factors}
          heading="Evaluation factors"
        />
        <InsightsTable
          data={data?.shopping_journey}
          heading="Shopping journey"
        />
      </div>
    </div>
  );
}
export default BuyerInsightsREportB2C;
