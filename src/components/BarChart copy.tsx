import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Copy } from 'lucide-react';
import Button from './Button';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface BarChartProps {
  data: any[];
  xAxis: string;
  yAxis: string;
  title?: string;
}

// Custom tooltip to show original value as fraction
const CustomTooltip = ({ active, payload, yAxis, xAxis, total }: { active?: boolean, payload?: any[], yAxis: string, xAxis: string, total: number }) => {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload;
    return (
      <div className="bg-white p-2 border rounded shadow text-xs">
        <div>Option: {item[xAxis]}</div>
        <div>Score: {item[yAxis]}/{total} ({item[`${yAxis}Percent`].toFixed(2)}%)</div>
      </div>
    );
  }
  return null;
};

// Custom label for percentage at end of bar
const BarEndLabel = (props: any) => {
  const { x, y, width, value } = props;
  return (
    <text
      x={x + width + 8}
      y={y + 16}
      fill="#222"
      fontSize={12}
      textAnchor="start"
      alignmentBaseline="middle"
    >
      {value.toFixed(1)}%
    </text>
  );
};

// Custom bar shape to color the first 2px as Y-axis color
const CustomBarShape = (props: any) => {
  const { x, y, width, height, fill } = props;
  // If width is less than or equal to 2, just use the Y-axis color
  const p=1;
  if (width <= p) {
    return <rect x={x} y={y} width={width} height={height} fill="#000" />;
  }
  return (
    <g>
      {/* Y-axis color segment */}
      <rect x={x} y={y} width={p} height={height} fill="#000" />
      {/* Main bar */}
      <rect x={x + p} y={y} width={width - p} height={height} fill={fill} />
    </g>
  );
};

const BarChart: React.FC<BarChartProps> = ({ data, xAxis, yAxis, title }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [cachedImage, setCachedImage] = useState<string | null>(null);
  const [cachedBlob, setCachedBlob] = useState<Blob | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Parse and scale values
  const parseAndScaleData = (data: any[]): any[] => {
    return data.map(item => {
      const scaledItem = { ...item };
      const value = item[yAxis];
      
      // Handle "X/10" format
      if (typeof value === 'string' && value.includes('/')) {
        const [numerator] = value.split('/');
        scaledItem[yAxis] = Number(numerator);
      } 
      // Handle regular numbers
      else if (typeof value === 'number' || !isNaN(Number(value))) {
        scaledItem[yAxis] = Number(value);
      }
      
      return scaledItem;
    });
  };

  const scaledData = parseAndScaleData(data);
  const total = scaledData.reduce((acc, item) => acc + item[yAxis], 0);

  // Calculate percentage data for Y axis
  const percentData = scaledData.map(item => ({
    ...item,
    [`${yAxis}Percent`]: total > 0 ? (item[yAxis] / total) * 100 : 0
  }));

  // Cache the chart image on render/data change
  React.useEffect(() => {
    let isMounted = true;
    const cacheImage = async () => {
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, { backgroundColor: '#fff', scale: 2 });
        if (!isMounted) return;
        setCachedImage(canvas.toDataURL('image/png'));
        canvas.toBlob((blob) => {
          if (isMounted) setCachedBlob(blob);
        }, 'image/png');
      }
    };
    // Delay to ensure chart is rendered
    setTimeout(cacheImage, 100);
    return () => { isMounted = false; };
  }, [data, xAxis, yAxis, title]);

  const handleDownload = async () => {
    if (!cachedImage) return;
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.download = 'chart.png';
      link.href = cachedImage;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!cachedBlob) return;
    try {
      await navigator.clipboard.write([
        new window.ClipboardItem({ 'image/png': cachedBlob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      // fallback: do nothing
    }
  };

  return (
    <div className="w-full h-full relative">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <div className="flex gap-2 no-print">
            <div className="relative no-print">
              <Button
                size="sm"
                variant="ghost"
                icon={<Download className="h-4 w-4" />}
                onClick={handleDownload}
                disabled={downloading}
                title="Download chart as image"
                onMouseEnter={() => setShowTooltip('download')}
                onMouseLeave={() => setShowTooltip(null)}
                className='no-print'
              >
                {''}
              </Button>
              {showTooltip === 'download' && (
                <div className="absolute right-0 mt-2 bg-gray-800 text-white text-xs px-2 py-1 rounded z-20 whitespace-nowrap">
                  Download chart as image
                </div>
              )}
            </div>
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                icon={<Copy className="h-4 w-4" />}
                onClick={handleCopy}
                title="Copy chart as image"
                onMouseEnter={() => setShowTooltip('copy')}
                onMouseLeave={() => setShowTooltip(null)}
                className='no-print'
              >
                {''}
              </Button>
              {showTooltip === 'copy' && (
                <div className="absolute right-0 mt-2 bg-gray-800 text-white text-xs px-2 py-1 rounded z-20 whitespace-nowrap">
                  Copy chart as image
                </div>
              )}
            </div>
            {copied && (
              <span className="text-green-600 text-xs ml-1">Copied!</span>
            )}
          </div>
        </div>
      )}
      

      <div ref={chartRef} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={percentData}
            layout="vertical"
            margin={{
              top: 0,
              right: 52,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              fontSize={12}
              axisLine={{ stroke: "#000", strokeWidth: 2 }}
              // horizontal axis is now percentage
            />
            <YAxis 
              type="category"
              dataKey={xAxis}
              width={200}
              fontSize={12}
              stroke="#000"
              strokeWidth={2}
              interval={0}
              tick={({ x, y, payload }) => {
                const label = payload.value;
                const maxLen = 24;
                const displayLabel =
                  typeof label === 'string' && label.length > maxLen
                    ? label.slice(0, maxLen) + '...'
                    : label;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <foreignObject x={-180} y={-10} width={200} height={32}>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#666',
                          textAlign: 'left',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-line',
                          lineHeight: 1,
                          maxHeight: 32,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start'
                        }}
                      >
                        {displayLabel}
                      </div>
                    </foreignObject>
                  </g>
                );
              }}
            />
            {/* Tooltip is interactive/hover only, so add no-print class */}
            <Tooltip 
              wrapperStyle={{ pointerEvents: 'auto' }}
              content={<CustomTooltip yAxis={yAxis} xAxis={xAxis} total={total} />}
            />
            {/* <Legend /> */}
            <Bar dataKey={`${yAxis}Percent`} fill="#03e8d3" barSize={30} label={<BarEndLabel />} shape={<CustomBarShape />} />
          </RechartsBarChart>
        </ResponsiveContainer>
        {/* Overlay custom Y axis line on top of bars */}
        {/* <svg className="pointer-events-none absolute top-10 left-0" width="100%" height="100%" style={{zIndex: 10}}>
          <line x1="120" y1="0" x2="120" y2="93%" stroke="#000" strokeWidth="2" />
        </svg> */}
      </div>
    </div> 
  );
};

export default BarChart; 