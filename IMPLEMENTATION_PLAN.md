# ClarityAI — Implementation Plan

**Version**: 1.0  
**Date**: April 7, 2026  
**Status**: Phase 1 MVP — Complete  
**PRD Reference**: [PRD.md](./PRD.md)

---

## 1. Architecture Overview

ClarityAI is a single-page React application built with Vite. It runs entirely client-side for the MVP, with an optional backend proxy for AI-enhanced features. The architecture follows a **component-driven** design with clear separation of concerns across three layers:

```
┌─────────────────────────────────────────────────────────┐
│                     Presentation Layer                  │
│  App.jsx → Sidebar navigation + view switching          │
│  ├── DataUploader.jsx     (Upload / Paste view)         │
│  ├── DataPreview.jsx      (Sortable data table)         │
│  ├── InsightDashboard.jsx (Chart orchestration)         │
│  │   ├── ColumnSelector.jsx (Field picker)              │
│  │   └── ChartCard.jsx    (Individual chart + insight)  │
│  │       └── Charts.jsx   (KPI, Line, Bar, Donut)       │
│  ├── QAPanel.jsx          (Natural language Q&A)        │
│  └── ShareBar.jsx         (Export & sharing)            │
├─────────────────────────────────────────────────────────┤
│                      Service Layer                      │
│  services/ai.js                                         │
│  ├── Column filtering (isAnalyticallyMeaningful)        │
│  ├── Chart suggestion engine (heuristic + API)          │
│  ├── Insight generation (structured signals)            │
│  └── Q&A engine (keyword-based + API fallback)          │
├─────────────────────────────────────────────────────────┤
│                      Utility Layer                      │
│  utils/parsers.js                                       │
│  ├── CSV parsing (PapaParse)                            │
│  ├── Excel parsing (SheetJS)                            │
│  ├── JSON parsing                                       │
│  ├── Clipboard paste parsing                            │
│  └── Column type detection (number / date / text)       │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Implementation Breakdown by Component

### 2.1 Data Ingestion Pipeline

**Files**: `src/utils/parsers.js`, `src/components/DataUploader.jsx`

| Step | Implementation | Status |
|------|---------------|--------|
| File drag-and-drop | HTML5 drag events → `parseFile()` auto-detect by extension | ✅ Complete |
| File browse (click) | Hidden `<input type="file">` triggered on click | ✅ Complete |
| Clipboard paste | `parsePaste()` → feeds text through PapaParse | ✅ Complete |
| CSV parsing | PapaParse with `header: true`, `dynamicTyping: true`, `skipEmptyLines: true` | ✅ Complete |
| Excel parsing | SheetJS `XLSX.read()` → `sheet_to_json()` → normalize | ✅ Complete |
| JSON parsing | `JSON.parse()` with array unwrapping for nested objects | ✅ Complete |
| Column type detection | Sample-based heuristic: >80% numeric → `number`, >60% parseable dates → `date`, else `text` | ✅ Complete |
| Data normalization | All parsers output `{ columns: [{ name, type }], rows: [{}] }` | ✅ Complete |
| Error handling | Try/catch with user-visible error messages in upload zone | ✅ Complete |
| Loading state | "Parsing your data..." indicator during async parse | ✅ Complete |

**Constraints enforced**:
- Max file size: 50MB (browser memory boundary)
- Supported formats: `.csv`, `.tsv`, `.xlsx`, `.xls`, `.json`

---

### 2.2 Column Intelligence & Filtering

**File**: `src/services/ai.js` — `isAnalyticallyMeaningful()`, `getMeaningfulColumns()`

The AI service automatically filters out columns that are not useful for visualization:

| Filter Rule | Logic | Purpose |
|-------------|-------|---------|
| ID columns | Regex match on `id`, `uuid`, `guid`, `key`, `index`, `_id` suffix | Skip row identifiers |
| Empty columns | All null/undefined/blank values | Skip no-data columns |
| Constant columns | < 2 unique values | Skip single-value fields |
| Boolean columns | >90% values are `true/false/yes/no/0/1` | Skip flags |
| High-cardinality text | >85% unique ratio with >20 rows | Skip names, emails, addresses |
| Sequential numeric IDs | All integers, >90% unique, avg diff ≤ 1.5 | Skip auto-increment IDs |

**Output**: Filtered column list used as smart defaults in `ColumnSelector.jsx`.

---

### 2.3 Chart Suggestion Engine

**File**: `src/services/ai.js` — `suggestCharts()`, `generateHeuristicCharts()`

**Flow**:
1. Check if Claude API backend is available (`/health` endpoint)
2. If backend is up → send `{ columns, sampleRows, totalRows }` to `/api/analyze`
3. If backend is down → fall back to heuristic chart generation

**Heuristic Chart Generation Rules**:

| Priority | Chart Type | Trigger Condition | Max Count |
|----------|-----------|-------------------|-----------|
| 1 | KPI Scorecards | Any numeric column exists | 3 |
| 2 | Bar Chart (breakdown) | Text column + numeric column exist | 2 |
| 3 | Top Performers Bar | Text + numeric with >3 categories | 1 |
| 4 | Donut Chart | Text + numeric (composition view) | 1 |
| 5 | Line Chart (time-series) | Date column + numeric column exist | 1 |
| 6 | Multi-metric Comparison | 2+ numeric columns + grouping column | 1 |

**Total output**: Up to 8 charts per dataset, capped by `.slice(0, 8)`.

---

### 2.4 Insight Generation

**File**: `src/services/ai.js` — `generateInsight()`, `generateHeuristicInsight()`

Every chart includes a structured insight object:

```javascript
{
  text: "Revenue grew by 23% from earliest to latest data point...",
  signal: "positive"  // "positive" | "negative" | "neutral"
}
```

**Signal determination logic**:

| Chart Type | Positive Signal | Negative Signal | Neutral Signal |
|-----------|----------------|-----------------|----------------|
| KPI | Delta > +5% | Delta < -5% | -5% ≤ delta ≤ +5% |
| Bar (breakdown) | Top item < 40% share | Top item > 60% share | 40-60% share |
| Top performers | Small spread between top & bottom | Spread > 80% of top value | — |
| Donut | Top segment < 40% | Top segment > 60% | 40-60% |
| Line (time-series) | Change > +5% | Change < -5% | |change| ≤ 5% |
| Comparison | — | — | Always neutral |

---

### 2.5 Visualization Rendering

**Files**: `src/components/charts/Charts.jsx`, `src/components/ChartCard.jsx`

| Component | Recharts Elements Used | Key Config |
|-----------|----------------------|------------|
| `KPICard` | None (pure CSS) | Hero number, delta badge, label |
| `ClarityLineChart` | `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip` | Monotone interpolation, no dots, responsive |
| `ClarityBarChart` | `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip` | Rounded corners (5px), max bar width 52px |
| `ClarityDonutChart` | `PieChart`, `Pie`, `Cell`, `Legend` | Inner radius 55%, outer 80%, center label |

**Shared config**:
- Color palette: 7 colors (`#2563eb`, `#10b981`, `#f59e0b`, `#8b5cf6`, `#ef4444`, `#06b6d4`, `#ec4899`)
- All charts wrapped in `<ResponsiveContainer width="100%" height="100%">`
- Smart tick formatters: K/M/B abbreviations for numbers, `MMM DD` for dates, 12-char truncation for text
- Chart card body height: 260px fixed

---

### 2.6 Natural Language Q&A

**File**: `src/components/QAPanel.jsx`, `src/services/ai.js` — `askQuestion()`

**Keyword-based heuristic routing**:

| Keywords | Action | Response |
|----------|--------|----------|
| `best`, `top`, `highest` | Aggregate by first text col, sort descending | Top item name + value + bar chart |
| `total`, `sum` | Sum first numeric column | Total as text |
| `average`, `mean`, `avg` | Average first numeric column | Average as text |
| _(no match)_ | — | Dataset summary + suggested question types |

**UI features**:
- Input with Enter-to-submit
- 3 suggestion chips: "What's my best performing item?", "Show me the total", "What's the average?"
- Answer card + optional chart card
- Question history (most recent first)

---

### 2.7 Column Selector (Custom Field Picker)

**File**: `src/components/ColumnSelector.jsx`

- Groups columns by type: Numeric (🔢), Text/Category (🏷️), Date (📅)
- Pre-selects smart defaults from `getMeaningfulColumns()`
- Excluded columns shown with ⊘ indicator and tooltip
- Actions: Select All, Deselect All, Reset to Smart Defaults
- "Re-generate Charts" button triggers new chart generation with selected columns

---

### 2.8 Export & Sharing

**File**: `src/components/ShareBar.jsx`

| Feature | Implementation | Library |
|---------|---------------|---------|
| Copy Link | Encodes chart metadata in URL hash via `btoa()` | native |
| Export PNG | `html2canvas` captures `.chart-grid` at 2x scale | html2canvas |
| Export PDF | `html2canvas` → canvas → `jsPDF.addImage()` | jspdf |

---

### 2.9 Design System

**File**: `src/index.css` (963 lines)

| Token Category | Details |
|---------------|---------|
| Colors | Light theme: `#f5f6fa` background, `#ffffff` cards, `#1a1d2e` text |
| Typography | Inter font, 8 size tokens (11px–48px), tight letter-spacing |
| Spacing | 8px grid system, 9 space tokens (4px–96px) |
| Borders | Subtle `rgba(0,0,0,0.07)`, hover at 0.14 |
| Shadows | 5 levels (xs → lg), plus primary glow |
| Radius | 4 levels (6px–20px) |
| Animations | `fadeIn`, `slideInLeft`, `shimmer` (skeleton loading) |
| Responsive | Mobile breakpoint at 768px: sidebar hidden, single-column grid |

---

## 3. Data Flow Diagram

```
┌──────────────────┐
│  User drops file  │
│  or pastes data   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  parsers.js       │  Auto-detect format (CSV/Excel/JSON)
│  parseFile()      │  PapaParse / SheetJS / JSON.parse
│  normalize()      │  → { columns: [{name, type}], rows: [{}] }
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  App.jsx          │  setDataset(data)
│  handleDataLoaded │  Switch to Dashboard view
└────────┬─────────┘
         │
    ┌────┴─────────────────────────┐
    │                              │
    ▼                              ▼
┌──────────────┐         ┌──────────────────┐
│ DataPreview  │         │ InsightDashboard  │
│ (table view) │         │ (auto-generates)  │
└──────────────┘         └────────┬─────────┘
                                  │
                         ┌────────┴─────────┐
                         │                  │
                         ▼                  ▼
                ┌────────────────┐  ┌──────────────────┐
                │ ColumnSelector │  │ suggestCharts()   │
                │ (field picker) │  │ ai.js heuristics  │
                └────────────────┘  └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │ ChartCard × N     │
                                    │ (KPI/Bar/Line/    │
                                    │  Donut + Insight)  │
                                    └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │ ShareBar          │
                                    │ (Link/PNG/PDF)    │
                                    └──────────────────┘
```

---

## 4. State Management

All state lives in `App.jsx` via React `useState` hooks (no external state library needed at MVP scale):

| State Variable | Type | Purpose |
|---------------|------|---------|
| `activeView` | `string` | Current sidebar view (`upload`, `dashboard`, `qa`) |
| `sidebarCollapsed` | `boolean` | Sidebar toggle state |
| `dataset` | `{ columns, rows }` | Parsed data (null until uploaded) |
| `charts` | `Array<ChartConfig>` | Generated chart configurations |
| `fileName` | `string` | Display name for uploaded file |

**Data flows down** via props. No context or reducers needed at this scale.

---

## 5. Build & Development

| Task | Command | Details |
|------|---------|---------|
| Install dependencies | `npm install` | Installs all packages from `package.json` |
| Development server | `npm run dev` | Vite dev server on `http://localhost:5173` |
| Production build | `npm run build` | Output to `dist/` directory |
| Preview production | `npm run preview` | Serves built files locally |
| Lint | `npm run lint` | ESLint with React hooks + refresh plugins |

---

## 6. Phase 1 MVP Completion Checklist

| Feature | Status | Component(s) |
|---------|--------|--------------|
| Drag-and-drop file upload (CSV, Excel, JSON) | ✅ | DataUploader, parsers.js |
| Clipboard paste ingestion | ✅ | DataUploader, parsers.js |
| Auto column type detection | ✅ | parsers.js |
| Smart column filtering (IDs, booleans, constants) | ✅ | ai.js |
| Column selector for custom charting | ✅ | ColumnSelector |
| AI chart suggestion engine (heuristic) | ✅ | ai.js |
| KPI scorecards with trend deltas | ✅ | Charts.jsx |
| Bar charts (breakdown + rankings) | ✅ | Charts.jsx |
| Donut charts (composition) | ✅ | Charts.jsx |
| Line charts (time-series) | ✅ | Charts.jsx |
| Multi-metric comparison charts | ✅ | Charts.jsx |
| Structured insight signals (positive/negative/neutral) | ✅ | ChartCard, ai.js |
| Skeleton loading animation | ✅ | InsightDashboard |
| Plain-language Q&A | ✅ | QAPanel, ai.js |
| Export to PNG | ✅ | ShareBar |
| Export to PDF | ✅ | ShareBar |
| Shareable link (view-only) | ✅ | ShareBar |
| Sidebar navigation with collapse | ✅ | App.jsx |
| Sortable data preview table | ✅ | DataPreview |
| Responsive mobile layout | ✅ | index.css |
| Light theme design system | ✅ | index.css |

---

## 7. Future Phase Implementation Notes

### Phase 2 — API Connectors
- Add connector components in `src/components/connectors/`
- OAuth flow for each service (HubSpot, Salesforce, GA4, Stripe, Meta Ads)
- New `src/services/connectors.js` to manage API authentication and data fetching
- Scheduled refresh using `setInterval` or service worker

### Phase 3 — Collaboration
- Backend required: user accounts, saved dashboards, workspace sharing
- Auth: Magic link or Google SSO via `next-auth` or custom flow
- Database: PostgreSQL or Supabase for dashboard persistence
- Comments: Real-time via WebSockets or polling

### Phase 4 — Advanced Intelligence
- Cohort analysis: new chart type in `Charts.jsx`
- Predictive trends: regression library (e.g., `simple-statistics`)
- Goal tracking: user-defined targets stored in backend
- Automated emails: cron job + email service (SendGrid/Resend)

---

## 8. Testing Strategy

| Layer | Approach | Tools |
|-------|----------|-------|
| Parser unit tests | Test each parser with fixture files | Vitest |
| AI heuristic tests | Test chart suggestions with known datasets | Vitest |
| Component rendering | Snapshot + interaction tests | Vitest + React Testing Library |
| End-to-end | Upload file → verify charts render → export | Playwright |
| Manual QA | Test with real-world CSVs of varying shapes | Browser DevTools |
