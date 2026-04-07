# ClarityAI — Product Requirements Document

**Version**: 1.0
**Date**: March 20, 2026
**Status**: In Development

---

## 1. Overview

ClarityAI is a consumer-grade data visualization and insight tool designed for non-technical users — CMOs, CEOs, board members, ops leads, and anyone who has a spreadsheet and a question they need answered visually, right now, without writing a single line of code.

**This is NOT Power BI. NOT Tableau. NOT Looker.** Those tools were built for data analysts. ClarityAI is built for humans.

### Success Metric

> A CMO uploads a CSV on Monday morning, has 6 polished charts with insights in under 4 minutes, and sends a shareable link to the board — without ever asking a data analyst for help.

---

## 2. Target Users

| Persona | Pain Point | ClarityAI Solution |
|---------|-----------|-------------------|
| **CMO** | Needs campaign performance visuals for a board meeting in 2 hours | Upload CSV → polished charts + insights in 4 min |
| **CEO** | Wants to understand revenue trends without waiting for analyst | Paste data → AI surfaces the story |
| **Ops Lead** | Tracks team performance in spreadsheets, can't make them visual | Drag-and-drop → auto-generated dashboards |
| **Board Member** | Receives a shared link, wants clarity without logging in | View-only link, no auth required |

---

## 3. Core Features

### 3.1 Data Ingestion — "Any Way You Want"

- **Drag-and-drop upload**: CSV, Excel (.xlsx/.xls), JSON
- **Paste from clipboard**: Copy from Excel or Google Sheets, paste directly
- **Future**: Direct API connectors (HubSpot, Salesforce, GA4, Stripe, Meta Ads, ClickPoint)

**Constraints**:
- No setup, no schema mapping, no data warehouse required
- File parsing happens client-side for instant feedback
- Max file size: 50MB (initial release)

### 3.2 One-Click Intelligence

- AI auto-detects dataset structure (column types, date formats, categorical vs numeric)
- Suggests **top 5 most relevant visualizations** based on the data shape
- Smart suggestion prompts: "Show me trends over time", "Compare these two campaigns", "What's my top performing segment?"
- No chart-builder menus, no axis configuration — the AI handles it

### 3.3 Visualization Types (Auto-Generated)

| Chart Type | Use Case |
|-----------|----------|
| Time-series line charts | Trends over time |
| Bar charts (vertical/horizontal) | Comparisons, rankings |
| Donut charts | Composition / share-of-total |
| KPI scorecards with delta indicators | Key metrics at a glance |
| Heatmaps | Pattern density |
| Ranking tables | Ordered performance |
| Funnel charts | Conversion stages |
| Side-by-side comparisons | A/B, month-over-month, team vs team |

### 3.4 Insight Layer

- **Per-chart AI insight**: Every chart includes a 1-sentence AI-generated takeaway
  - Example: *"Revenue is up 23% vs last month, driven by the EMEA segment"*
- **Anomaly callouts**: Automatic detection of outliers and unusual patterns
  - Example: *"This spike on March 3rd is unusual — here's why it might matter"*
- **Plain-language Q&A**: Type a natural question, get a chart + answer
  - Example: *"What's my best performing channel?"* → bar chart + insight

### 3.5 Share & Collaborate

- **One-click shareable link** (view-only or editable)
- **Export**: PDF, PNG, or live dashboard embed
- **No login required** for viewers

---

## 4. Design Direction

### Aesthetic
Clean, confident, editorial — **The Economist meets Linear**. Not a dashboard tool. A clarity tool.

### Design Principles

| Principle | Rule |
|-----------|------|
| **Max 3 clicks** | Every action from data to insight is ≤ 3 clicks |
| **Zero jargon** | No "axes", "dimensions", "measures" — plain language only |
| **Editorial quality** | Charts should look publication-ready by default |
| **Confidence through clarity** | Whitespace, typography, and restraint over feature density |

### Visual System
- **Palette**: Warm neutrals (#1a1a1a, #f5f3ef), accents in muted teal / coral
- **Typography**: Inter (Google Fonts), tight letter-spacing, strong hierarchy
- **Layout**: 8px grid, generous whitespace
- **Components**: Subtle borders, no drop-shadows, smooth transitions

---

## 5. Information Architecture

```
┌─────────────────────────────────────────────┐
│  ClarityAI                          [Menu]  │
├──────────┬──────────────────────────────────┤
│          │                                  │
│  Upload  │   Drag & drop your file here     │
│          │   or paste data below            │
│ Dashboard│                                  │
│          │   ┌──────────────────────────┐   │
│  Q&A     │   │  Data Preview Table      │   │
│          │   └──────────────────────────┘   │
│ Settings │                                  │
│ (future) │   [ Generate Insights → ]        │
│          │                                  │
│          │   ┌────────┐  ┌────────┐         │
│          │   │ Chart  │  │ Chart  │         │
│          │   │ Card 1 │  │ Card 2 │         │
│          │   └────────┘  └────────┘         │
│          │   ┌────────┐  ┌────────┐         │
│          │   │ Chart  │  │ Chart  │         │
│          │   │ Card 3 │  │ Card 4 │         │
│          │   └────────┘  └────────┘         │
└──────────┴──────────────────────────────────┘
```

---

## 6. Technical Architecture

### Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React + Vite | Fast dev, modern tooling |
| Charts | Recharts | React-native, composable |
| CSV parsing | PapaParse | Battle-tested, streaming |
| Excel parsing | SheetJS (xlsx) | Full .xlsx/.xls support |
| AI | Claude API | Best-in-class reasoning & structured output |
| AI proxy | Node.js / Express | Keeps API key server-side |
| Export | html2canvas + jspdf | Client-side PDF/PNG |
| Link sharing | nanoid | Compact unique IDs |

### Data Flow

```
User Input (file / paste)
    │
    ▼
Parser (PapaParse / SheetJS)
    │
    ▼
Normalized Dataset { columns, rows }
    │
    ├──▶ AI Analyze Endpoint ──▶ Chart Suggestions (top 5)
    │                                    │
    │                                    ▼
    │                          Chart Rendering (Recharts)
    │                                    │
    │                                    ▼
    │                          AI Insight per chart
    │
    └──▶ Data Preview Table (immediate)
```

---

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Time to first chart | < 30 seconds after file upload |
| End-to-end flow | < 4 minutes (upload → share) |
| Max file size | 50 MB |
| Browser support | Chrome, Safari, Edge (latest 2 versions) |
| Mobile | Responsive, view-only (not optimized for creation) |
| Accessibility | WCAG 2.1 AA for core flows |

---

## 8. Release Phases

### Phase 1 — MVP (Current Build)
- [x] File upload (CSV, Excel, JSON) + clipboard paste
- [x] AI-powered chart suggestions & insight generation
- [x] 6 chart types auto-generated
- [x] Export to PDF / PNG
- [x] Shareable view-only link
- [x] Navigation menu (extensibility scaffold)

### Phase 2 — API Connectors
- [ ] HubSpot, Salesforce, GA4, Stripe, Meta Ads, ClickPoint
- [ ] 3-click connection flow
- [ ] Scheduled data refresh

### Phase 3 — Collaboration
- [ ] Magic link / Google SSO auth
- [ ] Saved dashboards
- [ ] Team workspaces
- [ ] Comments & annotations on charts

### Phase 4 — Advanced Intelligence
- [ ] Cohort analysis views
- [ ] Predictive trend lines
- [ ] Goal tracking with alerts
- [ ] Automated weekly insight emails

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Claude API latency | Slow chart generation | Show skeleton loaders; generate charts progressively |
| Malformed data uploads | Parse errors, bad charts | Robust error handling; preview step before generation |
| Large files (>50MB) | Browser memory issues | Stream parsing; warn users; server-side processing in Phase 2 |
| AI hallucinated insights | Misleading takeaways | Ground insights in actual data values; show source numbers |

---

## 10. Open Questions

1. **Should shared links expire?** (e.g., 30-day TTL vs permanent)
2. **Should we support Google Sheets URL import in Phase 1?** (requires OAuth)
3. **Branding**: Is "ClarityAI" the final product name?
