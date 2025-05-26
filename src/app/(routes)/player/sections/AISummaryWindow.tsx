'use client'

import './AISummaryWindow.css';

export default function AISummaryWindow() {

  return (
    <div id="ai-summary-window" className='d-flex gap-2 flex-column align-items-center'>
      <p id="title">AI Summary</p>
      <div id="content" className='d-flex gap-2 flex-column align-items-start w-100'>
      </div>
    </div>
  );
}