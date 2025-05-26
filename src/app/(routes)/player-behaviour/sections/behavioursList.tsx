'use client'

import { ListOfBehaviours } from "@/data/data";
import { useBehaviourListStore } from "@/store/useBehaviourListStore";
import CollapsibleComponent from "../components/collapsibleComponent";
import './behavioursList.css';

export default function BehavioursList() {
  const { selectedBehaviour, setSelectedBehaviour } = useBehaviourListStore();

  return (
    <div id="behaviours-list" className="d-flex flex-column gap-2 w-100">
      <p>
        List of Behaviours
      </p>
      <div id="content">
        {ListOfBehaviours.map((behaviour, index) => (
          <CollapsibleComponent
            key={behaviour.name}
            name={behaviour.name}
            subcategories={behaviour.subcategories}
            selectedBehaviour={selectedBehaviour}
            onSelect={setSelectedBehaviour}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </div>
  );
}