# ClarityAI 📊

> **Turn any spreadsheet into actionable insights — in seconds, not hours.**

ClarityAI is a consumer-grade data visualization and insight tool designed for non-technical users. Upload a CSV, Excel file, or paste data — and get polished, AI-powered charts with smart insights instantly. No setup, no configuration, no data analyst required.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![Recharts](https://img.shields.io/badge/Recharts-3-teal)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 📂 Flexible Data Ingestion
- **Drag-and-drop upload** — CSV, Excel (.xlsx/.xls), JSON
- **Paste from clipboard** — copy from Excel or Google Sheets, paste directly
- Client-side parsing for instant feedback — no server required

### 🧠 One-Click Intelligence
- AI auto-detects column types (numeric, text, date)
- **Smart column filtering** — automatically excludes irrelevant fields (IDs, booleans, constants)
- Generates the most relevant visualizations based on your data's shape
- **Column selector** — choose which fields to visualize and re-generate charts

### 📈 Auto-Generated Visualizations
| Chart Type | Use Case |
|---|---|
| KPI Scorecards | Key metrics at a glance with trend deltas |
| Bar Charts | Category breakdowns, rankings, comparisons |
| Donut Charts | Composition / share-of-total distribution |
| Line Charts | Trends over time |
| Multi-metric Comparisons | Side-by-side analysis |

### 💡 Smart Insight Signals
Every chart includes an AI-generated insight with **signal indicators**:
- 🟢 **Positive** — growth trends, balanced distributions, strong performance
- 🔴 **Negative** — declines, over-concentration, performance gaps
- ⚪ **Neutral** — stable metrics, informational summaries

### 💬 Plain-Language Q&A
Ask natural questions about your data:
- *"What's my best performing item?"*
- *"Show me the total"*
- *"What's the average?"*

### 📤 Share & Export
- **Copy shareable link** — send to anyone, no login required
- **Export to PNG** — high-resolution chart snapshots
- **Export to PDF** — publication-ready reports

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/zvtech89/DataClarityAI.git
cd DataClarityAI

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be running at **http://localhost:5173/**

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite 8 | Fast development, modern tooling |
| **Charts** | Recharts | React-native, composable chart library |
| **CSV Parsing** | PapaParse | Battle-tested streaming parser |
| **Excel Parsing** | SheetJS (xlsx) | Full .xlsx/.xls support |
| **Export** | html2canvas + jsPDF | Client-side PDF/PNG generation |
| **Link Sharing** | nanoid | Compact unique shareable IDs |
| **AI (optional)** | Claude API proxy | Enhanced insights when backend available |

---

## 📁 Project Structure

```
src/
├── App.jsx                    # Main app with sidebar navigation
├── index.css                  # Design system (light theme)
├── main.jsx                   # Entry point
├── components/
│   ├── DataUploader.jsx       # Drag-and-drop + paste upload
│   ├── DataPreview.jsx        # Sortable data table preview
│   ├── InsightDashboard.jsx   # Auto-generates charts + hosts column selector
│   ├── ColumnSelector.jsx     # Multi-select field picker
│   ├── ChartCard.jsx          # Individual chart + insight rendering
│   ├── QAPanel.jsx            # Natural language Q&A
│   ├── ShareBar.jsx           # Export & sharing controls
│   └── charts/
│       └── Charts.jsx         # KPI, Line, Bar, Donut chart components
├── services/
│   └── ai.js                  # AI heuristics, chart suggestions, insights
└── utils/
    └── parsers.js             # CSV, Excel, JSON parsing utilities
```

---

## 🎨 Design Philosophy

- **Light, clean, modern** — high contrast for readability, refined color palette
- **Editorial quality** — charts look publication-ready by default
- **Zero jargon** — no "axes", "dimensions", or "measures" — plain language only
- **Max 3 clicks** — from data upload to shareable insights in under 4 minutes

---

## 📋 Roadmap

- [x] File upload (CSV, Excel, JSON) + clipboard paste
- [x] AI-powered chart suggestions & auto-generation
- [x] Smart column filtering (excludes IDs, booleans, constants)
- [x] Column selector for custom chart generation
- [x] Structured insight signals (positive/negative/neutral)
- [x] Export to PDF / PNG
- [x] Shareable view-only links
- [ ] API connectors (HubSpot, Salesforce, GA4, Stripe)
- [ ] Saved dashboards
- [ ] Team collaboration & workspaces
- [ ] Predictive trend lines & goal tracking

---

## 📄 License

MIT

---

Built with ❤️ using React, Vite, and Recharts.
