import React from "react";

function ExpertRecommendations({ data , className }: any) {
  return (
    <div>
      <div
        className={`p-[15px_40px]  relative ${className}`}
        style={{
          background:
            "linear-gradient(90deg, rgba(7, 229, 209, 0.05) 0%, rgba(7, 229, 209, 0.013942) 92.88%, rgba(7, 229, 209, 0) 100%)",
        }}
      >
        <div className="absolute left-0 top-0 rounded-r-lg h-full w-[5px] bg-primary2"></div>
        <div className="text-lg font-semibold text-primary2">
          {data?.priority}
        </div>
      </div>
      <div className="px-[60px] pt-3 pb-5">
        {data?.items?.map((item: any, index: number) => (
          <div key={index} className={data?.items?.length !== index+1 ? "pb-3 border-b border-[#F5F5F5]  mb-3" : ""} >
            <h4 className="text-base font-medium mb-2">{item?.title}:</h4>
            <ul className="list-disc pl-5">
              <li className="text-xs leading-[23px] font-normal text-[#595E64]">
                {item?.description}
              </li>
              {Object.entries(item.details || {}).map(([key, value]:any) => (
                <li
                  key={key}
                  className="text-xs leading-[23px] font-normal text-[#595E64]"
                >
                  <span className="font-medium">
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l:any) => l.toUpperCase())}
                    :
                  </span>{" "}
                  {value}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExpertRecommendations;
