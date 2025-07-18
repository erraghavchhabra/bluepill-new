import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import html2canvas from "html2canvas";
import { Download, Copy } from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PiDownload } from "react-icons/pi";
import { CopyCheckIcon } from "@/icons/Other";

interface BarChartProps {
  data: any[];
  xAxis: string;
  yAxis: string;
  title?: string;
}

const CustomTooltip = React.memo(
  ({
    active,
    payload,
    yAxis,
    xAxis,
    total,
  }: {
    active?: boolean;
    payload?: any;
    yAxis: string;
    xAxis: string;
    total: number;
  }) => {
    if (active && payload?.length > 0) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-2 border shadow-md rounded text-xs relative">
          <div className="absolute -top-2 left-3 w-3 h-3 rotate-45 bg-white border-l border-t"></div>
          <div>
            <strong>{item[xAxis]}</strong>
          </div>
          <div>
            {item[yAxis]}/{total} ({item[`${yAxis}Percent`].toFixed(2)}%)
          </div>
        </div>
      );
    }
    return null;
  }
);

const BarEndLabel = ({ x, y, width, value }: any) => (
  <text
    x={x + width + 8}
    y={y + 16}
    fill="#000"
    fontSize={12}
    textAnchor="start"
    alignmentBaseline="middle"
  >
    {value.toFixed(1)}%
  </text>
);

const CustomBarShape = ({ x, y, width, height, fill }: any) => {
  const highlightWidth = 2;
  return (
    <g>
      <rect x={x} y={y} width={highlightWidth} height={height} fill="#000" />
      <rect
        x={x + highlightWidth}
        y={y}
        width={width - highlightWidth}
        height={height}
        fill={fill}
        rx={4}
      />
    </g>
  );
};

const BarChart: React.FC<BarChartProps> = ({ data, xAxis, yAxis, title }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [cachedImage, setCachedImage] = useState<string | null>(null);
  const [cachedBlob, setCachedBlob] = useState<Blob | null>(null);

  const processedData = useMemo(() => {
    return data.map((item) => {
      const value = item[yAxis];
      const numericValue =
        typeof value === "string" && value.includes("/")
          ? Number(value.split("/")[0])
          : Number(value);
      return { ...item, [yAxis]: numericValue };
    });
  }, [data, yAxis]);

  const total = useMemo(
    () => processedData.reduce((sum, item) => sum + item[yAxis], 0),
    [processedData, yAxis]
  );

  const chartData = useMemo(() => {
    return processedData.map((item) => ({
      ...item,
      [`${yAxis}Percent`]: total ? (item[yAxis] / total) * 100 : 0,
    }));
  }, [processedData, total, yAxis]);

  const renderImage = useCallback(async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#fff",
        scale: 2,
      });
      setCachedImage(canvas.toDataURL("image/png"));
      canvas.toBlob((blob) => blob && setCachedBlob(blob), "image/png");
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      renderImage();
    }, 500);
    return () => clearTimeout(debounce);
  }, [chartData, renderImage]);

  const handleDownload = () => {
    if (!cachedImage) return;
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = cachedImage;
    link.click();
  };

  const handleCopy = async () => {
    if (!cachedBlob) return;
    await navigator.clipboard.write([
      new window.ClipboardItem({ "image/png": cachedBlob }),
    ]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="p-[15px]">
      <div className="flex justify-between items-center mb-4">
        {title && <h2 className="text-xl font-semibold text-primary2">{title}</h2>}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            title="Download"
            className="rounded-full bg-gray_light p-[10px]  hover:bg-primary transition-all duration-200"
          >
            <PiDownload size={20} />
          </button>
          <button
            onClick={handleCopy}
            title="Copy"
            className="rounded-full bg-gray_light p-[10px]  hover:bg-primary transition-all duration-200"
          >
            <CopyCheckIcon />
          </button>
          {copied && (
            <span className="text-xs text-green-600 font-medium">Copied!</span>
          )}
        </div>
      </div>

      <div ref={chartRef} className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 50, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey={xAxis}
              width={200}
              fontSize={12}
              tick={({ x, y, payload }) => {
                const text =
                  payload.value.length > 24
                    ? payload.value.slice(0, 24) + "..."
                    : payload.value;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <foreignObject x={-180} y={-10} width={200} height={32}>
                      <div className="text-xs text-gray-700">{text}</div>
                    </foreignObject>
                  </g>
                );
              }}
            />
            <Tooltip
              wrapperStyle={{ pointerEvents: "auto" }}
              content={
                <CustomTooltip yAxis={yAxis} xAxis={xAxis} total={total} />
              }
            />
            <Bar
              dataKey={`${yAxis}Percent`}
              fill="#03e8d3"
              barSize={32}
              label={<BarEndLabel />}
              shape={<CustomBarShape />}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(BarChart);
