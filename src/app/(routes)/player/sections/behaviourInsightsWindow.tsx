'use client'

import { BehaviourInsightsData, BehaviourAnalysisSelectors } from '@/data/data';
import { useState } from 'react';
import ProgressBarComponent from '../../../components/progressBarComponent';
import './behaviourInsightsWindow.css';
import { useParams, useRouter } from 'next/navigation';
import '@/styles/global.css';

export default function BehaviourInsightsWindow() {
  const [insightsData] = useState(BehaviourInsightsData);
  const router = useRouter();
  const { id } = useParams();

  return (
    <div
      id="behaviour-insights-window"
      className="d-flex flex-column gap-2 w-100"
      onClick={() => router.push(`/player-behaviour/${id}/${BehaviourAnalysisSelectors[0].name}`)}
      style={{ cursor: 'pointer' }}
    >
      <p>Behaviour Insights</p>
      <div className="insights-list d-flex flex-column gap-2 w-100">
        {insightsData.map((data) => (
          <div key={data.id}>
            <ProgressBarComponent name={data.name} value={data.change} limits={{ min: 25, max: 25 }} />
          </div>
        ))}
      </div>
    </div>
  );
}