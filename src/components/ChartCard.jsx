import { KPICard, ClarityLineChart, ClarityBarChart, ClarityDonutChart } from './charts/Charts'

function renderChart(chart) {
  switch (chart.type) {
    case 'kpi':
      return <KPICard config={chart.config} />
    case 'line':
      return (
        <div className="chart-card-body">
          <ClarityLineChart config={chart.config} />
        </div>
      )
    case 'bar':
      return (
        <div className="chart-card-body">
          <ClarityBarChart config={chart.config} />
        </div>
      )
    case 'donut':
      return (
        <div className="chart-card-body">
          <ClarityDonutChart config={chart.config} />
        </div>
      )
    default:
      return <div className="chart-card-body text-secondary">Unsupported chart type</div>
  }
}

function renderInsight(insight) {
  if (!insight) return null

  // Support structured insights { text, signal } and legacy string insights
  if (typeof insight === 'string') {
    return (
      <div className="chart-card-insight neutral">
        <span className="insight-signal neutral" />
        <span>💡 {insight}</span>
      </div>
    )
  }

  const { text, signal = 'neutral' } = insight
  const icons = {
    positive: '✅',
    negative: '⚠️',
    neutral: '💡',
  }

  return (
    <div className={`chart-card-insight ${signal}`}>
      <span className={`insight-signal ${signal}`} />
      <span>{icons[signal]} {text}</span>
    </div>
  )
}

export default function ChartCard({ chart, delay = 0 }) {
  return (
    <div
      className="chart-card animate-in"
      style={{ animationDelay: `${delay * 0.06}s` }}
    >
      <div className="chart-card-header">
        <div>
          <div className="chart-card-title">{chart.title}</div>
          {chart.subtitle && (
            <div className="chart-card-subtitle">{chart.subtitle}</div>
          )}
        </div>
        <div className="chart-card-type">{chart.type}</div>
      </div>

      {renderChart(chart)}

      {renderInsight(chart.insight)}

      {chart.anomaly && (
        <div className="anomaly-callout">
          ⚠️ {chart.anomaly}
        </div>
      )}
    </div>
  )
}
