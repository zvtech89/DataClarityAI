import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  Legend
} from 'recharts'

const CHART_COLORS = [
  '#2563eb', '#10b981', '#f59e0b', '#8b5cf6',
  '#ef4444', '#06b6d4', '#ec4899',
]

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '10px',
  fontSize: '12px',
  color: '#1a1d2e',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

const axisTickStyle = { fill: '#5f6580', fontSize: 11, fontFamily: 'Inter, sans-serif' }

/* ─── Smart Tick Formatter ─── */
function formatTick(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'number') {
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}K`
    if (Number.isInteger(v)) return v
    return v.toFixed(1)
  }
  return v
}

function formatXTick(v) {
  if (typeof v === 'string' && v.match(/^\d{4}-\d{2}-\d{2}/)) {
    return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  if (typeof v === 'string' && v.length > 14) {
    return v.substring(0, 12) + '…'
  }
  return v
}

/* ─── KPI Scorecard ─── */
export function KPICard({ config }) {
  const { value, delta, label } = config
  const isPositive = delta >= 0

  return (
    <div className="kpi-card">
      <div className="kpi-value">{value}</div>
      {delta !== undefined && delta !== null && (
        <div className={`kpi-delta ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(delta)}%
        </div>
      )}
      <div className="kpi-label">{label}</div>
    </div>
  )
}

/* ─── Line Chart ─── */
export function ClarityLineChart({ config }) {
  const { xKey, yKeys, data } = config

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 40, left: 15 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={axisTickStyle}
          strokeWidth={0}
          tickFormatter={formatXTick}
          angle={-35}
          textAnchor="end"
          height={50}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={axisTickStyle}
          strokeWidth={0}
          tickFormatter={formatTick}
          width={55}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(0,0,0,0.1)' }} />
        {yKeys.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#5f6580', paddingTop: 8 }}
          />
        )}
        {yKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

/* ─── Bar Chart ─── */
export function ClarityBarChart({ config }) {
  const { xKey, yKeys, data } = config
  const showAllLabels = data.length <= 12

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 20, bottom: 40, left: 15 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={axisTickStyle}
          strokeWidth={0}
          tickFormatter={formatXTick}
          angle={-35}
          textAnchor="end"
          height={50}
          interval={showAllLabels ? 0 : 'preserveStartEnd'}
        />
        <YAxis
          tick={axisTickStyle}
          strokeWidth={0}
          tickFormatter={formatTick}
          width={55}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        {yKeys.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#5f6580', paddingTop: 8 }}
          />
        )}
        {yKeys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            radius={[5, 5, 0, 0]}
            maxBarSize={52}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ─── Donut Chart ─── */
export function ClarityDonutChart({ config }) {
  const { nameKey, valueKey, data } = config
  const total = data.reduce((s, d) => s + (d[valueKey] || 0), 0)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          formatter={(value) => (
            <span style={{ color: '#5f6580', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>{value}</span>
          )}
        />
        {/* Center label */}
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#1a1d2e"
          fontSize={22}
          fontWeight={700}
          fontFamily="Inter, sans-serif"
        >
          {total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total}
        </text>
        <text
          x="50%"
          y="56%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#5f6580"
          fontSize={11}
          fontFamily="Inter, sans-serif"
        >
          Total
        </text>
      </PieChart>
    </ResponsiveContainer>
  )
}
