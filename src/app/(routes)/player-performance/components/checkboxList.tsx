'use client'

import { useCheckboxItemsStore } from '@/store/useCheckboxItemsStore';
import { useId } from 'react';
import './checkboxList.css';

export default function CheckboxList({ name, items }: { name: string, items: { id: number, name: string, isPercentage: boolean }[] }) {
  const { selectedItems, setSelectedItems } = useCheckboxItemsStore();
  const groupId = useId();

  const handleItemToggle = (itemName: string) => {
    setSelectedItems(
      selectedItems.includes(itemName)
        ? selectedItems.filter((name: string) => name !== itemName)
        : [...selectedItems, itemName]
    );
  }

  return (
    <div className="checkbox-list d-flex flex-column gap-1">
      <p id="title">{name}</p>
      <div>
        {items.map((item, index) => {
          const itemId = `${groupId}-${index}`;
          const isChecked = selectedItems.includes(item.name);

          return (
            <label key={itemId} className="metric-item d-flex align-items-center gap-1" htmlFor={itemId}>
              <div className="metric-label d-flex align-items-center gap-1">
                <div className="player-checkbox">
                  <input
                    type="checkbox"
                    id={itemId}
                    checked={isChecked}
                    onChange={() => handleItemToggle(item.name)}
                  />
                  <span className="checkmark"></span>
                </div>
                <p>{item.name}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
} 