'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';
import './lineChart.css';
import { MatchDayChartIndicator } from './MatchDayChartIndicator';

interface LineChartComponentProps {
  lineNames: string[];
  data: Array<{
    name: string;
    [key: string]: string | number | null;
  }>;
  legend?: boolean;
  isDays?: boolean;
}

import { ImplicitLabelType } from 'recharts/types/component/Label';

export function LineChartComponent({ lineNames, data, legend = true, isDays = false }: LineChartComponentProps) {
  const colors = {
    value: "#8884d8",
    Recovery: "#8884d8",
    Strain: "#82ca9d"
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          id="line-chart"
          data={data}
          margin={{
            top: 8,
            right: 16,
            left: 0,
            bottom: isDays ? 45 : 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="name" stroke="var(--gray)" />
          <YAxis
            stroke="var(--gray)"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--dark-purple-3)',
              border: 'none',
              borderRadius: '8px',
              color: 'var(--white)'
            }}
            formatter={(value) => [`${value}%`]}
          />
          {legend && (
            <Legend
              verticalAlign="top"
              align="center"
              wrapperStyle={{
                paddingTop: '0',
                marginLeft: '0',
                marginRight: '0',
                top: '0',
                height: 'fit-content',
                width: '100%'
              }}
              height={36}
            />
          )}
          {lineNames?.map((lineName) => (
            <Line
              key={lineName}
              type="monotone"
              name={lineName}
              dataKey={lineName.toLowerCase()}
              stroke={colors[lineName as keyof typeof colors]}
              strokeWidth={3}
              dot={true}
              connectNulls={false}
            />
          ))}
          {isDays && data.map((item, index) => (
            <ReferenceLine
              key={index}
              x={item.name}
              stroke="none"
              label={(props) => MatchDayChartIndicator({ ...props, index })}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
