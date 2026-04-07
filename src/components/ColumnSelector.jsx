import { useState, useEffect } from 'react'
import { getMeaningfulColumns } from '../services/ai'

export default function ColumnSelector({ dataset, onApply, loading }) {
  const [selected, setSelected] = useState([])
  const [meaningfulDefaults, setMeaningfulDefaults] = useState([])

  useEffect(() => {
    if (!dataset) return
    const meaningful = getMeaningfulColumns(dataset.columns, dataset.rows)
    const names = meaningful.map(c => c.name)
    setMeaningfulDefaults(names)
    setSelected(names)
  }, [dataset])

  if (!dataset) return null

  const { columns } = dataset

  const numericCols = columns.filter(c => c.type === 'number')
  const textCols = columns.filter(c => c.type === 'text')
  const dateCols = columns.filter(c => c.type === 'date')

  const toggleColumn = (name) => {
    setSelected(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name]
    )
  }

  const selectAll = () => setSelected(columns.map(c => c.name))
  const deselectAll = () => setSelected([])
  const resetDefaults = () => setSelected([...meaningfulDefaults])

  const handleApply = () => {
    const selectedCols = columns.filter(c => selected.includes(c.name))
    onApply(selectedCols)
  }

  const renderGroup = (label, cols, icon) => {
    if (cols.length === 0) return null
    return (
      <div>
        <div className="column-group-label">{icon} {label} ({cols.length})</div>
        <div className="column-chips">
          {cols.map(col => {
            const isSelected = selected.includes(col.name)
            const isMeaningful = meaningfulDefaults.includes(col.name)
            return (
              <button
                key={col.name}
                className={`column-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleColumn(col.name)}
                title={!isMeaningful ? 'Auto-excluded (may be an ID or flag)' : col.name}
              >
                <span className="chip-check">
                  {isSelected ? '✓' : ''}
                </span>
                {col.name}
                {!isMeaningful && (
                  <span style={{ opacity: 0.5, fontSize: '10px', marginLeft: 2 }}>⊘</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="column-selector animate-in">
      <div className="column-selector-header">
        <div>
          <div className="column-selector-title">📊 Select Columns to Visualize</div>
          <div className="column-selector-subtitle">
            {selected.length} of {columns.length} columns selected
            {selected.length !== meaningfulDefaults.length && (
              <span> · <button
                className="btn-inline"
                onClick={resetDefaults}
                style={{
                  background: 'none', border: 'none', color: 'var(--color-primary)',
                  cursor: 'pointer', fontSize: 'inherit', padding: 0, fontWeight: 600
                }}
              >Reset to smart defaults</button></span>
            )}
          </div>
        </div>
        <div className="column-selector-actions">
          <button className="btn btn-ghost btn-sm" onClick={selectAll}>Select All</button>
          <button className="btn btn-ghost btn-sm" onClick={deselectAll}>Deselect All</button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleApply}
            disabled={selected.length === 0 || loading}
          >
            {loading ? (
              <><span className="spinner" /> Analyzing...</>
            ) : (
              '✨ Re-generate Charts'
            )}
          </button>
        </div>
      </div>

      <div className="column-groups">
        {renderGroup('Numeric Fields', numericCols, '🔢')}
        {renderGroup('Text / Category Fields', textCols, '🏷️')}
        {renderGroup('Date Fields', dateCols, '📅')}
      </div>
    </div>
  )
}
