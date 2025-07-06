import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface LineChartProps {
  data: any[];
  xAxis: string;
  yAxis: string;
  title?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, xAxis, yAxis, title }) => {
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

  return (
    <div className="w-full h-full">
      {title && (
        <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={scaledData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxis} />
          <YAxis domain={[0, 10]} />
          <Tooltip formatter={(value) => [`${value}/10`, 'Score']} />
          <Legend />
          <Line
            type="monotone"
            dataKey={yAxis}
            stroke="#4F46E5"
            strokeWidth={2}
            dot={{ fill: '#4F46E5', strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart; 