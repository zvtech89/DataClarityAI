import { useState, useRef } from 'react'
import { parseFile, parsePaste } from '../utils/parsers'

export default function DataUploader({ onDataLoaded }) {
  const [dragOver, setDragOver] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPaste, setShowPaste] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = async (file) => {
    setLoading(true)
    setError(null)
    try {
      const data = await parseFile(file)
      onDataLoaded(data, file.name)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handlePaste = async () => {
    if (!pasteText.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await parsePaste(pasteText)
      onDataLoaded(data, 'Pasted data')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".csv,.tsv,.xlsx,.xls,.json"
          onChange={(e) => {
            if (e.target.files[0]) handleFile(e.target.files[0])
          }}
        />
        <div className="upload-zone-icon">📊</div>
        <div className="upload-zone-title">
          {loading ? 'Parsing your data...' : 'Drop your file here'}
        </div>
        <div className="upload-zone-subtitle">
          or click to browse
        </div>
        <div className="upload-zone-formats">
          <span className="format-badge">CSV</span>
          <span className="format-badge">Excel</span>
          <span className="format-badge">JSON</span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="card animate-in"
          style={{
            marginTop: 'var(--space-4)',
            borderColor: 'var(--color-coral)',
            color: 'var(--color-coral)',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Paste toggle */}
      <div style={{ marginTop: 'var(--space-5)', textAlign: 'center' }}>
        <button
          className="btn btn-ghost"
          onClick={() => setShowPaste(!showPaste)}
        >
          {showPaste ? '✕ Hide paste area' : '📋 Paste data instead'}
        </button>
      </div>

      {/* Paste area */}
      {showPaste && (
        <div className="animate-in" style={{ marginTop: 'var(--space-4)' }}>
          <textarea
            className="paste-area"
            placeholder="Paste your data here (tab-separated from Excel or comma-separated)..."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={8}
          />
          <div style={{ marginTop: 'var(--space-3)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={handlePaste}
              disabled={!pasteText.trim() || loading}
            >
              {loading ? 'Parsing...' : 'Parse & Continue →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
