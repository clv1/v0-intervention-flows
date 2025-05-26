'use client'

import Collapsible from 'react-collapsible';
import './collapsibleComponent.css';

interface CollapsibleComponentProps {
  name: string;
  subcategories: string[];
  selectedBehaviour: string | null;
  onSelect: (behaviour: string | null) => void;
  defaultOpen?: boolean;
}

export default function CollapsibleComponent({ name, subcategories, selectedBehaviour, onSelect, defaultOpen = false }: CollapsibleComponentProps) {
  const stableId = `collapsible-${name.toLowerCase().replace(/\s+/g, '-')}`;
  
  const toggleItem = (subcategory: string) => {
    const fullId = `${name}:${subcategory}`;
    if (selectedBehaviour !== fullId) {
      onSelect(fullId);
    }
  };

  return (
    <Collapsible 
      trigger={
        <div className="trigger-content">
          <span>{name}</span>
          <span className="arrow-icon">▼</span>
        </div>
      }
      contentElementId={stableId}
      open={defaultOpen}
      triggerClassName="trigger"
      triggerOpenedClassName="trigger is-open"
      triggerElementProps={{
        id: `${stableId}-trigger`
      }}
    >
      <div id="subcategories-list">
        {subcategories.map((subcategory) => (
          <div 
            id="subcategory-item"
            key={subcategory}
            onClick={() => toggleItem(subcategory)}
          >
            <span>{selectedBehaviour === `${name}:${subcategory}` ? '•' : ''}</span>
            <span>{subcategory}</span>
          </div>
        ))}
      </div>
    </Collapsible>
  )
}