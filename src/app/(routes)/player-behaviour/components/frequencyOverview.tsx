'use client'

import './frequencyOverview.css'
export default function FrequencyOverview() {

  return (
    <div id="frequency-overview" className="d-flex justify-content-between align-items-center w-100">
      <p>Overview</p>
      <p>Circle</p>
      <div className="d-flex flex-column">
        <p>63%</p>
        <p>Score</p>
      </div>
      <div className="d-flex flex-column">
        <p>-7%</p>
        <p>Month</p>
      </div>
      <div className="d-flex flex-column">
        <p>+20%</p>
        <p>Year</p>
      </div>
      <div className="d-flex flex-column">
        <p>210</p>
        <p>Total</p>
      </div>
    </div>

  )
} 