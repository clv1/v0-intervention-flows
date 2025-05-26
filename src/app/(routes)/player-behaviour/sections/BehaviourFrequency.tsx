'use client'

import { useBehaviourListStore } from "@/store/useBehaviourListStore"
import FrequencyOverview from "../components/frequencyOverview"
import ProgressBarComponent from "@/components/progressBarComponent"
import { LineChartComponent } from "@/components/lineChart"
import './BehaviourFrequency.css'

export default function BehaviourFrequency() {
  const { selectedBehaviour } = useBehaviourListStore()
  
  if (!selectedBehaviour) return null

  return (
    <div id="behaviour-frequency" className="d-flex flex-column gap-4 w-100">
      <div className="container">
        <p id="title">Behaviour Frequency</p>
      </div>
      <div className="container">
        <FrequencyOverview />
      </div>
      <div className="container">
        <ProgressBarComponent name="Impact on Recovery" value={63} limits={{min: 0, max: 100}} valueLabel={true} />
      </div>
      <div className="container">
        <div className="linechart">
          <LineChartComponent
            lineNames={['value']}
            data={[
              { name: 'Jan', value: 65 },
              { name: 'Feb', value: 75 },
              { name: 'Mar', value: 70 },
              { name: 'Apr', value: 65 },
              { name: 'May', value: 80 },
              { name: 'Jun', value: 85 },
              { name: 'Jul', value: 90 }
            ]} 
            legend={false}
          />
        </div>
      </div>
    </div>
  )
} 