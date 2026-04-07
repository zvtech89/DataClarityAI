import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export default function ShareBar({ charts, dataset }) {
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleCopyLink = async () => {
    try {
      // Encode a minimal shareable state in hash
      const state = {
        charts: charts.map((c) => ({ id: c.id, type: c.type, title: c.title })),
        meta: {
          rows: dataset.rows.length,
          columns: dataset.columns.length,
        },
      }
      const encoded = btoa(encodeURIComponent(JSON.stringify(state)))
      const url = `${window.location.origin}${window.location.pathname}#shared=${encoded}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
      alert('Could not copy to clipboard')
    }
  }

  const handleExportPNG = async () => {
    setExporting(true)
    try {
      const dashboardEl = document.querySelector('.chart-grid')
      if (!dashboardEl) return
      const canvas = await html2canvas(dashboardEl, {
        backgroundColor: '#f5f6fa',
        scale: 2,
      })
      const link = document.createElement('a')
      link.download = 'clarity-dashboard.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('PNG export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const dashboardEl = document.querySelector('.chart-grid')
      if (!dashboardEl) return
      const canvas = await html2canvas(dashboardEl, {
        backgroundColor: '#f5f6fa',
        scale: 2,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save('clarity-dashboard.pdf')
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="share-bar animate-in">
      <span className="text-secondary" style={{ fontSize: 'var(--font-size-sm)', marginRight: 'auto' }}>
        {charts.length} chart{charts.length !== 1 ? 's' : ''} generated
      </span>

      <button className="btn btn-secondary btn-sm" onClick={handleCopyLink}>
        {copied ? '✓ Copied!' : '🔗 Copy Link'}
      </button>

      <button
        className="btn btn-secondary btn-sm"
        onClick={handleExportPNG}
        disabled={exporting}
      >
        📷 Export PNG
      </button>

      <button
        className="btn btn-secondary btn-sm"
        onClick={handleExportPDF}
        disabled={exporting}
      >
        📄 Export PDF
      </button>
    </div>
  )
}
