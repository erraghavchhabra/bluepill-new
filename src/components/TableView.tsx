import React from "react";
import * as XLSX from "xlsx";
import TooltipBox from "./Buttons/TooltipBox";
import { PiDownload } from "react-icons/pi";
import { CopyCheckIcon } from "@/icons/Other";

interface TableViewProps {
  headers: string[];
  data: any[];
  title?: string;
  pdfMode?: boolean;
}

const TableView: React.FC<TableViewProps> = ({
  headers,
  data,
  title,
  pdfMode = false,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [cachedMarkdown, setCachedMarkdown] = React.useState<string | null>(
    null
  );
  const [cachedExcel, setCachedExcel] = React.useState<Blob | null>(null);
  const [showAll, setShowAll] = React.useState(false);
  // Generate Markdown table
  const generateMarkdown = (headers: string[], data: any[]) => {
    const headerRow = `| ${headers.join(" | ")} |`;
    const separator = `|${headers.map(() => " --- ").join("|")}|`;
    const rows = data.map((row) => {
      return `| ${headers
        .map((header) => {
          const cell = Array.isArray(row)
            ? row[headers.indexOf(header)]
            : row[header];
          return typeof cell === "number" ? cell.toFixed(1) : cell ?? "";
        })
        .join(" | ")} |`;
    });
    return [headerRow, separator, ...rows].join("\n");
  };

  // Generate Excel file Blob
  const generateExcel = (headers: string[], data: any[]) => {
    const wsData = [
      headers,
      ...data.map((row) =>
        headers.map((header) =>
          Array.isArray(row) ? row[headers.indexOf(header)] : row[header]
        )
      ),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    return new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  };

  // Cache Markdown and Excel on render/data change
  React.useEffect(() => {
    setCachedMarkdown(generateMarkdown(headers, data));
    setCachedExcel(generateExcel(headers, data));
  }, [headers, data]);

  const handleCopy = async () => {
    if (!cachedMarkdown) return;
    try {
      await navigator.clipboard.writeText(cachedMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      // fallback: do nothing
    }
  };

  const handleDownload = () => {
    if (!cachedExcel) return;
    const url = URL.createObjectURL(cachedExcel);
    const link = document.createElement("a");
    link.href = url;
    link.download = "table.xlsx";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const visibleRows = !showAll && data.length > 5 ? data.slice(0, 5) : data;
  return (
    <div className="overflow-x-auto relative">
      {/* Buttons */}
      <div className="flex items-center justify-between gap-2 p-5 ">
        {title && (
          <h3
            className="text-xl font-semibold text-primary2"
            style={{ margin: 0 }}
          >
            {title}
          </h3>
        )}
        <div className="flex items-center gap-2 no-print">
          <TooltipBox text="Download table as Excel">
            <button
              onClick={handleDownload}
              className="rounded-full bg-gray_light p-2 hover:bg-[#E6FCFA] transition-all"
            >
              <PiDownload size={20} />
            </button>
          </TooltipBox>
          <TooltipBox text="Copy table as Markdown" position="bottomLeft">
            <button
              onClick={handleCopy}
              className="rounded-full bg-gray_light p-2 hover:bg-[#E6FCFA] transition-all"
            >
              <CopyCheckIcon />
            </button>
          </TooltipBox>
          {copied && (
            <span className="text-green-600 text-xs ml-1">Copied!</span>
          )}
        </div>
      </div>
      <div className="hidden pdf-print">
        <table className=" divide-y divide-gray-200">
          {pdfMode ? (
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Render header as first row */}
              <tr>
                {headers.map((header, i) => (
                  <th
                    key={i}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((header, cellIndex) => {
                    const cell = Array.isArray(row)
                      ? row[cellIndex]
                      : row[header];
                    return (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 text-sm text-gray-500 break-words max-w-[300px]"
                      >
                        {typeof cell === "number" ? cell.toFixed(1) : cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ) : (
            <>
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header, i) => (
                    <th
                      key={i}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {headers.map((header, cellIndex) => {
                      const cell = Array.isArray(row)
                        ? row[cellIndex]
                        : row[header];
                      return (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 text-sm text-gray-500 break-words max-w-[300px]"
                        >
                          {typeof cell === "number" ? cell.toFixed(1) : cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </table>
      </div>

      <div className="max-w-full overflow-x-auto w-full custom-scrollbar no-print">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visibleRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, cellIndex) => {
                  const cell = Array.isArray(row)
                    ? row[cellIndex]
                    : row[header];
                  return (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 align-top text-sm text-gray-500 break-words max-w-[300px]"
                    >
                      {typeof cell === "number" ? cell.toFixed(1) : cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 5 && (
          <div className="text-center my-4">
            <button
              className="text-sm text-primary2 underline"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "View Less" : "View All"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableView;
