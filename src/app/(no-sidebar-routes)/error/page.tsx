'use client'

import './error.css'

export default function ErrorPage() {
  return (
    <div id="error-page">
      <div className="error-container">
        <i className="bi bi-exclamation-circle-fill"></i>
        <h1>Something Went Wrong</h1>
        <div className="button-group">
          <button 
            className="primary-button"
            onClick={() => window.location.href = "/home"}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}