import React from 'react';
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface RadarChartProps {
  data: any[];
  nameKey: string;
  title?: string;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, nameKey, title }) => {
  // Parse and validate data
  const parseAndValidateData = (data: any[]): any[] => {
    return data.map(item => {
      const parsedItem: Record<string, any> = {};
      
      // Copy all properties
      Object.keys(item).forEach(key => {
        const value = item[key];
        
        // Handle "X/10" format
        if (typeof value === 'string' && value.includes('/')) {
          const [numerator] = value.split('/');
          parsedItem[key] = Number(numerator);
        }
        // Handle regular numbers
        else if (typeof value === 'number' || !isNaN(Number(value))) {
          parsedItem[key] = Number(value);
        }
        // Keep other values as is
        else {
          parsedItem[key] = value;
        }
      });
      
      return parsedItem;
    });
  };

  const parsedData = parseAndValidateData(data);

  // Get all numeric keys except the nameKey
  const numericKeys = Object.keys(parsedData[0] || {}).filter(key => 
    key !== nameKey && 
    (typeof parsedData[0][key] === 'number' || !isNaN(Number(parsedData[0][key])))
  );

  return (
    <div className="w-full h-full">
      {title && (
        <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart
          data={parsedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey={nameKey} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} />
          <Tooltip formatter={(value) => [`${value}/10`, 'Score']} />
          <Legend />
          {numericKeys.map((key, index) => (
            <Radar
              key={key}
              name={key}
              dataKey={key}
              stroke={`hsl(${(index * 360) / numericKeys.length}, 70%, 50%)`}
              fill={`hsla(${(index * 360) / numericKeys.length}, 70%, 50%, 0.2)`}
            />
          ))}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart; 