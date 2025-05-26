'use client'

import { BehaviourAnalysisSelectors } from '@/data/data';
import { useBehaviourSelectorStore } from '@/store/useBehaviourSelectorStore';
import { useParams, useRouter } from 'next/navigation';
import './behaviourAnalysisSelector.css';

export default function BehaviourAnalysisSelector() {
  const router = useRouter();
  const { id } = useParams();
  const { selectedBehaviour, setSelectedBehaviour } = useBehaviourSelectorStore();
  
  const handleSelect = (selector: string) => {
    setSelectedBehaviour(selector);
    router.push(`/player-behaviour/${id}/${selector}`);
  };

  return (
    <div id='behaviour-analysis-selector' className='d-flex align-items-center gap-3'>
      <div className='d-flex gap-3'>
        {BehaviourAnalysisSelectors.map(selector => (
          <div
            key={selector.id}
            onClick={() => handleSelect(selector.name)}
            className={`selector-name cursor-pointer ${
              selector.name === selectedBehaviour ? 'selected' : undefined
            }`}
          >
            {selector.name}
          </div>
        ))}
      </div>
    </div>
  );
} 