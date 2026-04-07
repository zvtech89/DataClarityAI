/**
 * AI Service — generates chart suggestions and insights.
 *
 * Uses intelligent heuristics to auto-detect the best charts for a dataset.
 * Filters out irrelevant columns (IDs, booleans, constants).
 * Generates structured insights with positive/negative/neutral signals.
 */

const API_BASE = 'http://localhost:3001'

/**
 * Check if the AI backend is available.
 */
async function isBackendAvailable() {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET', signal: AbortSignal.timeout(1500) })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Determine if a column is analytically meaningful.
 * Filters out IDs, UUIDs, booleans, constants, and high-cardinality text.
 */
function isAnalyticallyMeaningful(column, rows) {
  const name = column.name.toLowerCase().trim()

  // Skip ID-like columns
  const idPatterns = /^(id|_id|uuid|guid|key|index|row|row_?num|row_?id|record_?id|entry_?id|#)$/i
  if (idPatterns.test(name) || name.endsWith('_id') || name.endsWith('id') && name.length <= 6) {
    return false
  }

  // Get non-null values
  const values = rows.map(r => r[column.name]).filter(v => v !== null && v !== undefined && v !== '')

  if (values.length === 0) return false

  // Skip constant columns (fewer than 2 unique values)
  const uniqueValues = new Set(values.map(v => String(v).toLowerCase()))
  if (uniqueValues.size < 2) return false

  // Skip boolean-like columns
  const booleanPatterns = new Set(['true', 'false', 'yes', 'no', '0', '1', 'y', 'n'])
  const booleanCount = values.filter(v => booleanPatterns.has(String(v).toLowerCase())).length
  if (booleanCount / values.length > 0.9) return false

  // Skip high-cardinality text (likely names, emails, addresses)
  if (column.type === 'text') {
    const uniqueRatio = uniqueValues.size / values.length
    // If almost every value is unique AND there are many values, it's probably an identifier
    if (uniqueRatio > 0.85 && values.length > 20) return false
  }

  // Skip numeric columns that look like IDs (sequential integers with high cardinality)
  if (column.type === 'number') {
    const numValues = values.map(Number).filter(v => !isNaN(v))
    const allIntegers = numValues.every(v => Number.isInteger(v))
    const uniqueNumRatio = new Set(numValues).size / numValues.length
    if (allIntegers && uniqueNumRatio > 0.9 && numValues.length > 20) {
      // Check if sequential
      const sorted = [...numValues].sort((a, b) => a - b)
      const diffs = sorted.slice(1).map((v, i) => v - sorted[i])
      const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length
      if (avgDiff <= 1.5 && avgDiff > 0) return false
    }
  }

  return true
}

/**
 * Get the list of meaningful columns for charting.
 */
export function getMeaningfulColumns(columns, rows) {
  return columns.filter(c => isAnalyticallyMeaningful(c, rows))
}

/**
 * Suggest charts based on dataset structure.
 * Returns an array of chart configs.
 */
export async function suggestCharts(columns, rows, selectedColumns = null) {
  const backendUp = await isBackendAvailable()

  if (backendUp) {
    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columns: selectedColumns || columns,
          sampleRows: rows.slice(0, 30),
          totalRows: rows.length,
        }),
      })
      const data = await res.json()
      return data.charts || []
    } catch {
      // Fallback to heuristics
    }
  }

  // Filter to selected or meaningful columns
  const effectiveCols = selectedColumns || getMeaningfulColumns(columns, rows)
  return generateHeuristicCharts(effectiveCols, rows, columns)
}

/**
 * Generate an AI insight for a specific chart's data.
 */
export async function generateInsight(chartConfig, data) {
  const backendUp = await isBackendAvailable()

  if (backendUp) {
    try {
      const res = await fetch(`${API_BASE}/api/insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart: chartConfig, data: data.slice(0, 50) }),
      })
      const result = await res.json()
      return result.insight || null
    } catch {
      // Fallback
    }
  }

  return generateHeuristicInsight(chartConfig, data)
}

/**
 * Ask a plain-language question about the data.
 */
export async function askQuestion(question, columns, rows) {
  const backendUp = await isBackendAvailable()

  if (backendUp) {
    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          columns,
          sampleRows: rows.slice(0, 50),
          totalRows: rows.length,
        }),
      })
      return await res.json()
    } catch {
      // Fallback
    }
  }

  return generateHeuristicAnswer(question, columns, rows)
}

/* ─── Heuristic Fallbacks ─── */

function generateHeuristicCharts(columns, rows, allColumns) {
  const charts = []
  const dateCol = columns.find((c) => c.type === 'date')
  const numericCols = columns.filter((c) => c.type === 'number')
  const textCols = columns.filter((c) => c.type === 'text')

  // 1. KPI scorecards — smart totals (e.g. "Total Leads Received")
  numericCols.slice(0, 3).forEach((col) => {
    const values = rows.map((r) => Number(r[col.name])).filter((v) => !isNaN(v))
    if (values.length === 0) return

    const total = values.reduce((a, b) => a + b, 0)
    const avg = total / values.length
    const mid = Math.floor(values.length / 2)
    const firstHalf = values.slice(0, mid)
    const secondHalf = values.slice(mid)
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0
    const delta = firstAvg > 0 ? Number(((secondAvg - firstAvg) / firstAvg * 100).toFixed(1)) : 0

    // Determine signal
    let signal = 'neutral'
    if (delta > 5) signal = 'positive'
    else if (delta < -5) signal = 'negative'

    charts.push({
      id: `kpi-${col.name}`,
      type: 'kpi',
      title: `Total ${col.name}`,
      subtitle: `${values.length} records`,
      config: {
        value: total > 10000 ? formatLargeNumber(total) : total.toLocaleString(),
        rawValue: total,
        delta,
        label: `Total ${col.name}`,
      },
      insight: {
        text: delta > 0
          ? `${col.name} shows a ${Math.abs(delta)}% increase in recent data compared to earlier records. Average per entry is ${avg >= 1000 ? formatLargeNumber(avg) : avg.toFixed(1)}.`
          : delta < 0
          ? `${col.name} shows a ${Math.abs(delta)}% decline in recent data. Average per entry is ${avg >= 1000 ? formatLargeNumber(avg) : avg.toFixed(1)}.`
          : `${col.name} is stable at ${total.toLocaleString()} total. Average per entry is ${avg >= 1000 ? formatLargeNumber(avg) : avg.toFixed(1)}.`,
        signal,
      },
    })
  })

  // 2. Bar chart — breakdown by category (e.g. "Leads by Program", "Leads by Status")
  if (textCols.length > 0 && numericCols.length > 0) {
    // Generate a chart for each text column (up to 2)
    textCols.slice(0, 2).forEach((catCol, idx) => {
      const valCol = numericCols[0]
      const aggregated = aggregateByCategory(rows, catCol.name, valCol.name)
      if (aggregated.length === 0) return

      const topItem = aggregated[0]
      const totalSum = aggregated.reduce((a, r) => a + r[valCol.name], 0)
      const topPercentage = totalSum > 0 ? ((topItem[valCol.name] / totalSum) * 100).toFixed(0) : 0

      // Determine signal — flag concentration risk
      const signal = topPercentage > 60 ? 'negative' : topPercentage > 40 ? 'neutral' : 'positive'

      charts.push({
        id: `bar-${catCol.name}-${valCol.name}`,
        type: 'bar',
        title: `${valCol.name} by ${catCol.name}`,
        subtitle: `Top ${Math.min(aggregated.length, 10)} ${catCol.name.toLowerCase()}s`,
        config: {
          xKey: catCol.name,
          yKeys: [valCol.name],
          data: aggregated.slice(0, 10),
        },
        insight: {
          text: topPercentage > 50
            ? `"${topItem[catCol.name]}" dominates with ${topPercentage}% of total ${valCol.name} (${topItem[valCol.name].toLocaleString()}). Consider diversifying across other ${catCol.name.toLowerCase()}s.`
            : `"${topItem[catCol.name]}" leads with ${topItem[valCol.name].toLocaleString()} ${valCol.name} (${topPercentage}%). Distribution is relatively balanced across ${aggregated.length} ${catCol.name.toLowerCase()}s.`,
          signal,
        },
      })
    })
  }

  // 3. Top performers chart — if we have category + numeric
  if (textCols.length > 0 && numericCols.length > 0) {
    const catCol = textCols[0]
    const valCol = numericCols[0]
    const aggregated = aggregateByCategory(rows, catCol.name, valCol.name)

    if (aggregated.length > 3) {
      const topItems = aggregated.slice(0, 5)
      const bottomItems = aggregated.slice(-2)
      const spread = topItems[0][valCol.name] - bottomItems[0]?.[valCol.name]
      const spreadSignal = spread > topItems[0][valCol.name] * 0.8 ? 'negative' : 'positive'

      charts.push({
        id: `top-${catCol.name}-${valCol.name}`,
        type: 'bar',
        title: `Top ${catCol.name}s`,
        subtitle: `Ranked by ${valCol.name}`,
        config: {
          xKey: catCol.name,
          yKeys: [valCol.name],
          data: topItems,
        },
        insight: {
          text: spreadSignal === 'negative'
            ? `Large performance gap between top and bottom ${catCol.name.toLowerCase()}s. Top performer ("${topItems[0][catCol.name]}") has ${topItems[0][valCol.name].toLocaleString()} vs lowest at ${bottomItems[0]?.[valCol.name]?.toLocaleString() || 'N/A'}.`
            : `Top 5 ${catCol.name.toLowerCase()}s are performing well, led by "${topItems[0][catCol.name]}" with ${topItems[0][valCol.name].toLocaleString()} ${valCol.name}.`,
          signal: spreadSignal,
        },
      })
    }
  }

  // 4. Donut chart — composition view (e.g. distribution)
  if (textCols.length > 0 && numericCols.length > 0) {
    const catCol = textCols.length > 1 ? textCols[1] : textCols[0]
    const valCol = numericCols[0]
    const aggregated = aggregateByCategory(rows, catCol.name, valCol.name)

    if (aggregated.length >= 2) {
      const totalSum = aggregated.reduce((a, r) => a + r[valCol.name], 0)
      const topShare = totalSum > 0 ? ((aggregated[0][valCol.name] / totalSum) * 100).toFixed(0) : 0

      charts.push({
        id: `donut-${catCol.name}-${valCol.name}`,
        type: 'donut',
        title: `${valCol.name} Distribution`,
        subtitle: `By ${catCol.name}`,
        config: {
          nameKey: catCol.name,
          valueKey: valCol.name,
          data: aggregated.slice(0, 6),
        },
        insight: {
          text: `Top segment "${aggregated[0][catCol.name]}" accounts for ${topShare}% of total ${valCol.name}. ${aggregated.length} distinct ${catCol.name.toLowerCase()}s identified.`,
          signal: topShare > 60 ? 'negative' : 'neutral',
        },
      })
    }
  }

  // 5. Time-series line chart — trends over time
  if (dateCol && numericCols.length > 0) {
    const yCol = numericCols[0]
    const timeData = aggregateByDate(rows, dateCol.name, [yCol.name])
    if (timeData.length >= 2) {
      const insightResult = generateTimeSeriesInsightStructured(rows, dateCol.name, yCol.name)

      charts.push({
        id: `line-${dateCol.name}-${yCol.name}`,
        type: 'line',
        title: `${yCol.name} Over Time`,
        subtitle: `${timeData.length} data points`,
        config: {
          xKey: dateCol.name,
          yKeys: [yCol.name],
          data: timeData,
        },
        insight: insightResult,
      })
    }
  }

  // 6. Multi-metric comparison
  if (numericCols.length >= 2 && (dateCol || textCols.length > 0)) {
    const groupCol = dateCol || textCols[0]
    const data = dateCol
      ? aggregateByDate(rows, groupCol.name, [numericCols[0].name, numericCols[1].name])
      : aggregateByCategory(rows, groupCol.name, numericCols[0].name, numericCols[1].name).slice(0, 10)

    if (data.length >= 2) {
      charts.push({
        id: `comparison-${numericCols[0].name}-${numericCols[1].name}`,
        type: 'bar',
        title: `${numericCols[0].name} vs ${numericCols[1].name}`,
        subtitle: `Compared by ${groupCol.name}`,
        config: {
          xKey: groupCol.name,
          yKeys: [numericCols[0].name, numericCols[1].name],
          data,
        },
        insight: {
          text: `Comparing ${numericCols[0].name} and ${numericCols[1].name} across ${data.length} ${groupCol.name} segments. Look for areas where one metric outpaces the other.`,
          signal: 'neutral',
        },
      })
    }
  }

  return charts.slice(0, 8) // up to 8 charts
}

function generateTimeSeriesInsightStructured(rows, dateCol, valCol) {
  const sorted = [...rows]
    .filter((r) => r[dateCol] && r[valCol] != null)
    .sort((a, b) => new Date(a[dateCol]) - new Date(b[dateCol]))

  if (sorted.length < 2) return { text: 'Insufficient data for trend analysis.', signal: 'neutral' }

  const first = Number(sorted[0][valCol])
  const last = Number(sorted[sorted.length - 1][valCol])
  const change = first > 0 ? ((last - first) / first * 100).toFixed(1) : 0

  if (change > 5) {
    return {
      text: `${valCol} grew by ${change}% from the earliest to the latest data point, indicating a positive upward trend.`,
      signal: 'positive',
    }
  } else if (change < -5) {
    return {
      text: `${valCol} declined by ${Math.abs(change)}% over the observed period. This warrants closer investigation into what's driving the downturn.`,
      signal: 'negative',
    }
  }
  return {
    text: `${valCol} remained relatively stable over the period with ${Math.abs(change)}% change.`,
    signal: 'neutral',
  }
}

function generateHeuristicInsight(chartConfig, data) {
  if (!data || data.length === 0) return { text: 'No data available for insight.', signal: 'neutral' }
  if (chartConfig.insight) return chartConfig.insight
  return { text: `Showing ${data.length} data points for ${chartConfig.title}.`, signal: 'neutral' }
}

function generateHeuristicAnswer(question, columns, rows) {
  const q = question.toLowerCase()
  const numericCols = columns.filter((c) => c.type === 'number')
  const textCols = columns.filter((c) => c.type === 'text')

  // "best", "top", "highest"
  if ((q.includes('best') || q.includes('top') || q.includes('highest')) && textCols.length > 0 && numericCols.length > 0) {
    const catCol = textCols[0]
    const valCol = numericCols[0]
    const aggregated = aggregateByCategory(rows, catCol.name, valCol.name)

    return {
      answer: aggregated.length > 0
        ? `The top ${catCol.name} is "${aggregated[0][catCol.name]}" with ${aggregated[0][valCol.name].toLocaleString()} ${valCol.name}.`
        : 'Unable to determine from the data.',
      chart: {
        id: 'qa-bar',
        type: 'bar',
        title: `Top ${catCol.name} by ${valCol.name}`,
        subtitle: `Top 5 results`,
        config: {
          xKey: catCol.name,
          yKeys: [valCol.name],
          data: aggregated.slice(0, 5),
        },
      },
    }
  }

  // "total", "sum"
  if ((q.includes('total') || q.includes('sum')) && numericCols.length > 0) {
    const col = numericCols[0]
    const total = rows.reduce((s, r) => s + (Number(r[col.name]) || 0), 0)
    return {
      answer: `The total ${col.name} is ${total.toLocaleString()}.`,
      chart: null,
    }
  }

  // "average", "mean"
  if ((q.includes('average') || q.includes('mean') || q.includes('avg')) && numericCols.length > 0) {
    const col = numericCols[0]
    const values = rows.map((r) => Number(r[col.name])).filter((v) => !isNaN(v))
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    return {
      answer: `The average ${col.name} is ${avg.toFixed(2)}.`,
      chart: null,
    }
  }

  return {
    answer: `I analyzed your data with ${rows.length} rows and ${columns.length} columns. Try asking about your "best" or "top" items, totals, or averages.`,
    chart: null,
  }
}

/* ─── Helpers ─── */

function aggregateByCategory(rows, catCol, ...valCols) {
  const map = {}
  rows.forEach((r) => {
    const key = r[catCol] || 'Unknown'
    if (!map[key]) {
      map[key] = { [catCol]: key }
      valCols.forEach((vc) => { map[key][vc] = 0 })
    }
    valCols.forEach((vc) => {
      map[key][vc] += Number(r[vc]) || 0
    })
  })
  return Object.values(map).sort((a, b) => b[valCols[0]] - a[valCols[0]])
}

function aggregateByDate(rows, dateCol, valCols) {
  const map = {}
  rows.forEach((r) => {
    if (!r[dateCol]) return
    const key = new Date(r[dateCol]).toISOString().split('T')[0]
    if (!map[key]) {
      map[key] = { [dateCol]: key }
      valCols.forEach((vc) => { map[key][vc] = 0 })
    }
    valCols.forEach((vc) => {
      map[key][vc] += Number(r[vc]) || 0
    })
  })
  return Object.values(map).sort((a, b) => a[dateCol].localeCompare(b[dateCol]))
}

function formatLargeNumber(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}
