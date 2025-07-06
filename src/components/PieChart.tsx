import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PieChartProps {
  data: any[];
  nameKey: string;
  valueKey: string;
  title?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const PieChart: React.FC<PieChartProps> = ({ data, nameKey, valueKey, title }) => {
  // Format the data to ensure values are numbers
  const formattedData = data.map(item => ({
    ...item,
    [valueKey]: Number(item[valueKey]) || 0
  }));

  // Custom tooltip formatter
  const formatTooltip = (value: number) => {
    return value.toFixed(1);
  };

  return (
    <div className="w-full h-full px-10">

      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={formattedData}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={formatTooltip} />
    
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart; 