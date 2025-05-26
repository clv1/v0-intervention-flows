'use client'

import React, { useEffect } from 'react';
import { PlayerPerformanceMetricCategories } from '@/data/data';
import { useCheckboxItemsStore } from '@/store/useCheckboxItemsStore';
import CheckboxList from '../components/checkboxList';
import './checkBoxLists.css';

export default function CheckboxLists({ mParam }: { mParam: string | undefined }) {
  const { setSelectedItems } = useCheckboxItemsStore();

  const handleSelectAll = () => {
    const allMetrics = PlayerPerformanceMetricCategories.flatMap(
      category => category.metrics.map(metric => metric.name)
    );
    setSelectedItems(allMetrics);
  };

  const handleSelectFromMParam = () => {
    // Only select metrics that are in the selectedMetricNames array
    if (selectedMetricNames.length > 0) {
      setSelectedItems(selectedMetricNames);
    }
  };

  const handleDeselectAll = () => {
    setSelectedItems([]);
  };

  // Parse the mParam to get metric codes if available
  const metricMap = {
    RS: 'Restorative Sleep %',
    SE: 'Sleep Efficiency %',
    SP: 'Sleep Performance %',
    SD: 'Sleep Duration',
    SC: 'Sleep Consistency %',
    RSD: 'Restorative Sleep Duration',
    RHR: 'RHR',
    HRV: 'HRV',
    REC: 'Recovery Score',
    STR: 'Strain'
  };

  // Create an array of metric names from the URL parameter if present
  const selectedMetricNames = mParam?.split('|')
    .flatMap(group => group.split(','))
    .map(code => metricMap[code as keyof typeof metricMap])
    .filter(Boolean) || [];

  // Select metrics from URL params when component mounts
  useEffect(() => {
    if (selectedMetricNames.length > 0) {
      handleSelectFromMParam();
    }
  }, [mParam]);

  return (
    <div id='checkbox-lists' className='d-flex flex-column align-items-center gap-3 w-100'>
      <div className='row w-100'>
        <div className='col-7 d-flex flex-column justify-content-start align-items-center'>
          <CheckboxList
            name={PlayerPerformanceMetricCategories[0].name}
            items={PlayerPerformanceMetricCategories[0].metrics}
          />
        </div>
        <div className='col-5 d-flex flex-column justify-content-start align-items-center'>
          <CheckboxList
            name={PlayerPerformanceMetricCategories[1].name}
            items={PlayerPerformanceMetricCategories[1].metrics}
          />
        </div>
      </div>
      <div className='row w-100'>
        <div className='d-flex justify-content-around'>
          <button className='metric-button' onClick={handleDeselectAll}>
            Reset Metrics
          </button>
          <button className='metric-button' onClick={handleSelectAll}>
            Select All Metrics
          </button>
        </div>
      </div>
    </div>
  );
} 