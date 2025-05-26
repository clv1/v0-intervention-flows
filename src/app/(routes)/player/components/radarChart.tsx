'use client';

import { Legend, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import './radarChart.css';
import { useEffect, useRef } from "react";

export default function RaderChart({ averageMetrics, athleteMentalScore }: { averageMetrics: { recovery: number | undefined; strain: number | undefined }, athleteMentalScore: number }) {

  const data = [
    {
      "subject": "Recovery Score",
      "Current": averageMetrics?.recovery || 0,
      "fullMark": 100
    },
    {
      "subject": "Mental State",
      "Current": athleteMentalScore,
      "fullMark": 100
    },
    {
      "subject": "Strain",
      "Current": averageMetrics?.strain ? (averageMetrics.strain * 100 / 21) : 0,
      "fullMark": 100
    },
    {
      "subject": "Positive Behaviour",
      "Current": 85,
      "fullMark": 100
    },
    {
      "subject": "Fitness Score",
      "Current": 65,
      "fullMark": 100
    },
    {
      "subject": "Sleep Score",
      "Current": 90,
      "fullMark": 100
    }
  ];

  return (
    <div id='radar-chart'>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius={90} width={730} height={250} data={data}>
          <Legend
            verticalAlign="top"
            align="center"
            height={36}
          />
          <PolarGrid />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ dy: 5 }}
          />
          <Radar
            name="Current"
            dataKey="Current"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
      {athleteMentalScore === 0 && <div className="mental-alert">
        Missing data
      </div>}
    </div>
  );
}