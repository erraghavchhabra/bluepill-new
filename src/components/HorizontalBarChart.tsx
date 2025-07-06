import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface HorizontalBarChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  title?: string;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="w-full h-full">
      {/* {title && (
        <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>
      )} */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          barCategoryGap={20}
       
          margin={{
            top: 40,
            right: 40,
            left: 40,
            bottom: 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number"
            domain={[0, total]}
            // tickFormatter={(value) => `${Math.round((value/total) * 100)}%`}
          />
          <YAxis dataKey="name" type="category" width={100} />
          <Tooltip 
            formatter={(value) => [`${value}/${total} (${Math.round((value/total) * 100)}%)`]}
          />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HorizontalBarChart;