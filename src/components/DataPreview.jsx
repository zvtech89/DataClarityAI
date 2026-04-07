import { useState } from 'react'

export default function DataPreview({ dataset }) {
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const MAX_PREVIEW = 50

  if (!dataset) return null

  const { columns, rows } = dataset

  const handleSort = (colName) => {
    if (sortCol === colName) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(colName)
      setSortDir('asc')
    }
  }

  let displayRows = [...rows].slice(0, MAX_PREVIEW)
  if (sortCol) {
    displayRows.sort((a, b) => {
      const va = a[sortCol]
      const vb = b[sortCol]
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va
      }
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va))
    })
  }

  return (
    <div className="card animate-in">
      <div className="card-header">
        <div>
          <div className="card-title">Data Preview</div>
          <div className="card-subtitle">
            Showing {Math.min(MAX_PREVIEW, rows.length)} of {rows.length} rows
          </div>
        </div>
      </div>
      <div className="data-table-container" style={{ maxHeight: '360px', overflowY: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.name}
                  onClick={() => handleSort(col.name)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  {col.name}
                  <span className={`col-type-badge ${col.type}`}>{col.type}</span>
                  {sortCol === col.name && (
                    <span style={{ marginLeft: 4 }}>
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.name}>
                    {row[col.name] !== null && row[col.name] !== undefined
                      ? String(row[col.name])
                      : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
