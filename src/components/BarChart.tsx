import React, { useRef, useState, useMemo } from "react";
import html2canvas from "html2canvas";
import { PiDownload } from "react-icons/pi";
import { CopyCheckIcon } from "@/icons/Other";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import TooltipBox from "./Buttons/TooltipBox";

interface BarChartProps {
  data: any[];
  xAxis: string;
  yAxis: string;
  title?: string;
}

const CustomTooltip = ({
  active,
  payload,
  yAxis,
  xAxis,
  total,
}: {
  active?: boolean;
  payload?: any[];
  yAxis: string;
  xAxis: string;
  total: number;
}) => {
  if (active && payload?.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white p-[10px]  rounded-xl text-xs text-black min-w-[256px] max-h-[60px] min-h-[60px] border border-[#F5F5F5]">
        <span className="font-medium text-primary2">Option:</span> {item[xAxis]}{" "}
        <br className="h-[5px]" />{" "}
        <span className="font-medium text-primary2">Score:</span> {item[yAxis]}/
        {total} ({item[`${yAxis}Percent`].toFixed(2)}%)
      </div>
    );
  }
  return null;
};

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
      {/* <rect x={x} y={y} width={highlightWidth} height={height} fill="#000" /> */}
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
  const [loading, setLoading] = useState(false);

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

  const handleDownload = async () => {
    if (chartRef.current) {
      setLoading(true);
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#fff",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = "chart.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (chartRef.current) {
      setLoading(true);
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#fff",
        scale: 2,
      });
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 1000);
        }
      });
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        {title && (
          <h2 className="text-xl font-semibold text-primary2">{title}</h2>
        )}
        <div className="flex gap-2 no-print">
          <TooltipBox text="Download" disabled={loading}>
            <button
              disabled={loading}
              onClick={handleDownload}
              className="rounded-full bg-gray_light p-2 hover:bg-[#E6FCFA] transition-all"
            >
              <PiDownload size={20} />
            </button>
          </TooltipBox>
          <TooltipBox text="Copy" disabled={loading}>
            <button
              disabled={loading}
              onClick={handleCopy}
              className="rounded-full bg-gray_light p-2 hover:bg-[#E6FCFA] transition-all"
            >
              <CopyCheckIcon />
            </button>
          </TooltipBox>
          {copied && (
            <span className="text-xs text-green-600 font-medium">Copied!</span>
          )}
        </div>
      </div>

      <div ref={chartRef} className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 50, left: 0, bottom: 0 }}
          >
            {/* ✅ Vertical grid lines only */}
            <CartesianGrid
              strokeDasharray="1 1"
              horizontal={false}
              vertical={true}
              color="#E3E3E8"
            />

            {/* ✅ X Axis with percentage ticks */}
            <XAxis
              type="number"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(val) => `${val}%`}
              fontSize={12.8}
              fontWeight={400}
              color="black"
              axisLine={false}
              tickLine={false}
            />

            {/* ✅ Y Axis with truncated label support (already good) */}
            <YAxis
              type="category"
              dataKey={xAxis}
              width={200}
              fontSize={10}
              fontWeight={400}
              color="black"
              axisLine={false}
              tickLine={false}
              tick={({ x, y, payload }) => {
                const text =
                  payload.value.length > 24
                    ? payload.value.slice(0, 24) + "..."
                    : payload.value;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <foreignObject x={-180} y={-10} width={200} height={32}>
                      <div className="text-[10px] font-normal text-black">
                        {text}
                      </div>
                    </foreignObject>
                  </g>
                );
              }}
            />

            {/* Tooltip and Bars (unchanged) */}
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={
                <CustomTooltip xAxis={xAxis} yAxis={yAxis} total={total} />
              }
            />

            <Bar
              dataKey={`${yAxis}Percent`}
              fill="#03e8d3"
              radius={[0, 10, 10, 0]}
              barSize={40}
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
