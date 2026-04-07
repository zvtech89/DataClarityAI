import { useState } from 'react'
import { askQuestion } from '../services/ai'
import ChartCard from './ChartCard'

export default function QAPanel({ dataset }) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  const handleAsk = async () => {
    if (!question.trim() || !dataset) return
    setLoading(true)
    try {
      const answer = await askQuestion(question, dataset.columns, dataset.rows)
      const entry = { question, ...answer }
      setResult(entry)
      setHistory((prev) => [entry, ...prev])
      setQuestion('')
    } catch (err) {
      setResult({ question, answer: 'Sorry, something went wrong.', chart: null })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  if (!dataset) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-9)' }}>
        <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-3)' }}>💬</p>
        <p className="text-secondary">Upload data first, then ask questions about it.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Input */}
      <div className="qa-input-container">
        <input
          className="qa-input"
          placeholder="Ask anything — 'What's my best month?' or 'Top 5 customers by revenue'..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={handleAsk}
          disabled={!question.trim() || loading}
        >
          {loading ? '...' : 'Ask'}
        </button>
      </div>

      {/* Suggestion chips */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
        {[
          'What\'s my best performing item?',
          'Show me the total',
          'What\'s the average?',
        ].map((suggestion) => (
          <button
            key={suggestion}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 'var(--font-size-sm)' }}
            onClick={() => {
              setQuestion(suggestion)
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Result */}
      {result && (
        <div className="animate-in" style={{ marginTop: 'var(--space-6)' }}>
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)' }}>
              You asked: "{result.question}"
            </div>
            <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 500 }}>
              {result.answer}
            </div>
          </div>

          {result.chart && (
            <ChartCard chart={result.chart} />
          )}
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div style={{ marginTop: 'var(--space-7)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
            Previous Questions
          </h3>
          {history.slice(1).map((entry, i) => (
            <div key={i} className="card" style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-4)' }}>
              <div className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
                {entry.question}
              </div>
              <div style={{ marginTop: 'var(--space-1)' }}>{entry.answer}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
