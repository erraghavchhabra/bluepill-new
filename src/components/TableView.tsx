import React from 'react';
import { Copy, Download } from 'lucide-react';
import Button from './Button';
import * as XLSX from 'xlsx';

interface TableViewProps {
  headers: string[];
  data: any[];
  title?: string;
  pdfMode?: boolean;
}

const TableView: React.FC<TableViewProps> = ({ headers, data, title, pdfMode = false }) => {
  const [copied, setCopied] = React.useState(false);
  const [cachedMarkdown, setCachedMarkdown] = React.useState<string | null>(null);
  const [cachedExcel, setCachedExcel] = React.useState<Blob | null>(null);
  const [showTooltip, setShowTooltip] = React.useState<string | null>(null);

  // Generate Markdown table
  const generateMarkdown = (headers: string[], data: any[]) => {
    const headerRow = `| ${headers.join(' | ')} |`;
    const separator = `|${headers.map(() => ' --- ').join('|')}|`;
    const rows = data.map(row => {
      return `| ${headers.map(header => {
        const cell = Array.isArray(row) ? row[headers.indexOf(header)] : row[header];
        return (typeof cell === 'number' ? cell.toFixed(1) : (cell ?? ''));
      }).join(' | ')} |`;
    });
    return [headerRow, separator, ...rows].join('\n');
  };

  // Generate Excel file Blob
  const generateExcel = (headers: string[], data: any[]) => {
    const wsData = [headers, ...data.map(row => headers.map(header => Array.isArray(row) ? row[headers.indexOf(header)] : row[header]))];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
    const link = document.createElement('a');
    link.href = url;
    link.download = 'table.xlsx';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="overflow-x-auto relative">
      {/* Buttons */}
      <div className="absolute top-2 right-2 z-1 flex gap-2 no-print">
        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            icon={<Download className="h-4 w-4" />}
            onClick={handleDownload}
            title="Download table as Excel"
            onMouseEnter={() => setShowTooltip('download')}
            onMouseLeave={() => setShowTooltip(null)}
          >
            {''}
          </Button>
          {showTooltip === 'download' && (
            <div className="absolute right-0 mt-2 bg-gray-800 text-white text-xs px-2 py-1 rounded z-20 whitespace-nowrap">
              Download table as Excel
            </div>
          )}
        </div>
        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            icon={<Copy className="h-4 w-4" />}
            onClick={handleCopy}
            title="Copy table as Markdown"
            onMouseEnter={() => setShowTooltip('copy')}
            onMouseLeave={() => setShowTooltip(null)}
          >
            {''}
          </Button>
          {showTooltip === 'copy' && (
            <div className="absolute right-0 mt-2 bg-gray-800 text-white text-xs px-2 py-1 rounded z-20 whitespace-nowrap">
              Copy table as Markdown
            </div>
          )}
        </div>
        {copied && (
          <span className="text-green-600 text-xs ml-1">Copied!</span>
        )}
      </div>
      {title && (
        <div className="py-3 px-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
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
                  const cell = Array.isArray(row) ? row[cellIndex] : row[header];
                  return (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 text-sm text-gray-500 break-words max-w-[300px]"
                    >
                      {typeof cell === 'number' ? cell.toFixed(1) : cell}
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
                    const cell = Array.isArray(row) ? row[cellIndex] : row[header];
                    return (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 text-sm text-gray-500 break-words max-w-[300px]"
                      >
                        {typeof cell === 'number' ? cell.toFixed(1) : cell}
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
  );
};

export default TableView;
