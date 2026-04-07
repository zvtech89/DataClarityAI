import { useState } from 'react'
import DataUploader from './components/DataUploader'
import DataPreview from './components/DataPreview'
import InsightDashboard from './components/InsightDashboard'
import QAPanel from './components/QAPanel'
import ShareBar from './components/ShareBar'

const NAV_ITEMS = [
  { id: 'upload', label: 'Upload', icon: '📂' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'qa', label: 'Ask a Question', icon: '💬' },
]

const FUTURE_ITEMS = [
  { id: 'connectors', label: 'API Connectors', icon: '🔌', disabled: true },
  { id: 'saved', label: 'Saved Dashboards', icon: '💾', disabled: true },
  { id: 'settings', label: 'Settings', icon: '⚙️', disabled: true },
]

export default function App() {
  const [activeView, setActiveView] = useState('upload')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [dataset, setDataset] = useState(null) // { columns, rows }
  const [charts, setCharts] = useState([])
  const [fileName, setFileName] = useState('')

  const handleDataLoaded = (data, name) => {
    setDataset(data)
    setFileName(name || 'Pasted data')
    setActiveView('dashboard')
  }

  const handleChartsGenerated = (newCharts) => {
    setCharts(newCharts)
  }

  const handleNewUpload = () => {
    setDataset(null)
    setCharts([])
    setFileName('')
    setActiveView('upload')
  }

  return (
    <div className="app-layout">
      {/* ─── Sidebar ─── */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">C</div>
          {!sidebarCollapsed && (
            <div className="sidebar-logo-text">
              Clarity<span>AI</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">
            {!sidebarCollapsed && 'Workspace'}
          </div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && item.label}
            </button>
          ))}

          <div className="nav-section-label">
            {!sidebarCollapsed && 'Coming Soon'}
          </div>
          {FUTURE_ITEMS.map((item) => (
            <button
              key={item.id}
              className="nav-item"
              disabled
              style={{ opacity: 0.4, cursor: 'not-allowed' }}
              title={`${item.label} (Coming Soon)`}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {sidebarCollapsed ? '→' : '← Collapse'}
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="main-content">
        {/* Upload View */}
        {activeView === 'upload' && (
          <div className="page-container animate-in">
            <div className="page-header">
              <h1>Upload Your Data</h1>
              <p>Drop a file, paste your data, or connect a source — insights in seconds.</p>
            </div>
            <DataUploader onDataLoaded={handleDataLoaded} />
          </div>
        )}

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="page-container animate-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1>{fileName || 'Dashboard'}</h1>
                <p>
                  {dataset
                    ? `${dataset.rows.length} rows × ${dataset.columns.length} columns`
                    : 'Upload data to get started'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button className="btn btn-secondary btn-sm" onClick={handleNewUpload}>
                  ↑ New Upload
                </button>
              </div>
            </div>

            {dataset && (
              <>
                <DataPreview dataset={dataset} />
                <div style={{ marginTop: 'var(--space-6)' }}>
                  <InsightDashboard
                    dataset={dataset}
                    charts={charts}
                    onChartsGenerated={handleChartsGenerated}
                  />
                </div>
                {charts.length > 0 && (
                  <div style={{ marginTop: 'var(--space-5)' }}>
                    <ShareBar charts={charts} dataset={dataset} />
                  </div>
                )}
              </>
            )}

            {!dataset && (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-9)' }}>
                <p className="text-secondary">No data loaded yet.</p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 'var(--space-4)' }}
                  onClick={() => setActiveView('upload')}
                >
                  Upload Data
                </button>
              </div>
            )}
          </div>
        )}

        {/* Q&A View */}
        {activeView === 'qa' && (
          <div className="page-container animate-in">
            <div className="page-header">
              <h1>Ask a Question</h1>
              <p>Ask anything about your data in plain language.</p>
            </div>
            <QAPanel dataset={dataset} />
          </div>
        )}
      </main>
    </div>
  )
}
