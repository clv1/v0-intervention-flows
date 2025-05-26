'use client'

import { useSwitchTogglesStore } from '@/store/useSwitchTogglesStore';
import SwitchToggle from '../components/switchToggle';
import './switchToggles.css';

export default function SwitchToggles({ column }: { column: boolean }) {
  const { overlayMode, chartMode, averageType, setOverlayMode, setChartMode, setAverageType } = useSwitchTogglesStore();

  return (
    <div className={`switch-toggles ${column ? 'column' : 'row'}`}>
      <h3 id='toggles-title'>Chart Toggles</h3>
      <div>
        <SwitchToggle
          name='Separate'
          name2='Overlay'
          checked={overlayMode}
          onChange={(value) => setOverlayMode(value)}
        />
        <SwitchToggle
          name='Line Chart'
          name2='Bar Chart'
          checked={chartMode}
          onChange={(value) => setChartMode(value)}
        />
        <SwitchToggle
          name='Current Period'
          name2='All Time'
          checked={averageType}
          onChange={(value) => setAverageType(value)}
        />
      </div>
    </div>
  );
} 