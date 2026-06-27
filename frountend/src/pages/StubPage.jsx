import React from 'react'

export default function StubPage({ title = 'Coming Soon', icon = 'tools' }) {
  return (
    <div>
      <h4 className="text-white fw-bold mb-4">{title}</h4>
      <div className="card">
        <div className="card-body text-center py-5">
          <i className={`bi bi-${icon} display-4 text-muted d-block mb-3`} />
          <h5 className="text-white fw-semibold">Module Ready</h5>
          <p className="text-muted mb-0">All API endpoints are built in the backend. UI coming soon.</p>
        </div>
      </div>
    </div>
  )
}
