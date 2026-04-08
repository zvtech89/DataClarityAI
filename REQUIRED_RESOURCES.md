# ClarityAI — Required Resources

**Version**: 1.0  
**Date**: April 7, 2026  
**PRD Reference**: [PRD.md](./PRD.md)  
**Implementation Plan**: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

---

## 1. Technology Stack

### Production Dependencies

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| **react** | ^19.2.4 | UI component framework | MIT |
| **react-dom** | ^19.2.4 | React DOM renderer | MIT |
| **recharts** | ^3.8.0 | Chart library (Line, Bar, Pie, KPI) | MIT |
| **papaparse** | ^5.5.3 | CSV/TSV parsing with streaming support | MIT |
| **xlsx** (SheetJS) | ^0.18.5 | Excel file parsing (.xlsx, .xls) | Apache-2.0 |
| **html2canvas** | ^1.4.1 | DOM-to-canvas rendering for PNG export | MIT |
| **jspdf** | ^4.2.1 | Client-side PDF generation | MIT |
| **nanoid** | ^5.1.7 | Compact unique ID generation for shareable links | MIT |

### Development Dependencies

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| **vite** | ^8.0.1 | Build tool & dev server | MIT |
| **@vitejs/plugin-react** | ^6.0.1 | React Fast Refresh for Vite | MIT |
| **eslint** | ^9.39.4 | JavaScript linting | MIT |
| **@eslint/js** | ^9.39.4 | ESLint core rules | MIT |
| **eslint-plugin-react-hooks** | ^7.0.1 | React hooks linting | MIT |
| **eslint-plugin-react-refresh** | ^0.5.2 | React Refresh linting | MIT |
| **globals** | ^17.4.0 | Global variable definitions for ESLint | MIT |
| **@types/react** | ^19.2.14 | TypeScript type definitions (editor support) | MIT |
| **@types/react-dom** | ^19.2.3 | TypeScript type definitions (editor support) | MIT |

---

## 2. External Services

### Current (MVP)

| Service | Usage | Cost | Required? |
|---------|-------|------|-----------|
| **Google Fonts (Inter)** | Typography — loaded via CSS `@import` | Free | Yes — core design system |
| **localhost:3001 AI proxy** | Optional Claude API backend for enhanced insights | Self-hosted | No — heuristic fallback works without it |

### Future Phases

| Service | Phase | Usage | Estimated Cost |
|---------|-------|-------|----------------|
| **Anthropic Claude API** | Phase 1+ | AI-powered chart suggestions & insights | ~$0.01–0.05/request |
| **HubSpot API** | Phase 2 | CRM data connector | Free tier available |
| **Salesforce API** | Phase 2 | CRM data connector | Requires Salesforce license |
| **Google Analytics 4 API** | Phase 2 | Web analytics connector | Free with GA4 |
| **Stripe API** | Phase 2 | Payment/revenue data connector | Free |
| **Meta Ads API** | Phase 2 | Ad performance data connector | Free with Meta Business |
| **Supabase / PostgreSQL** | Phase 3 | Dashboard persistence, user accounts | Free tier / ~$25/month |
| **Auth provider** (Google SSO) | Phase 3 | User authentication | Free tier |
| **SendGrid / Resend** | Phase 4 | Automated insight emails | Free tier (100/day) |

---

## 3. Development Environment

### Prerequisites

| Requirement | Minimum Version | Recommended |
|-------------|----------------|-------------|
| **Node.js** | v18.0+ | v20 LTS or v22 |
| **npm** | v9.0+ | v10+ (bundled with Node) |
| **Browser** | Chrome 100+, Safari 16+, Edge 100+ | Latest stable Chrome |
| **OS** | macOS, Windows 10+, Linux | macOS / Linux |
| **Editor** | Any | VS Code with ESLint + Prettier extensions |

### Recommended VS Code Extensions

| Extension | Purpose |
|-----------|---------|
| ESLint | JavaScript linting integration |
| Prettier | Code formatting |
| ES7+ React/Redux/React-Native snippets | Component scaffolding shortcuts |
| Auto Rename Tag | HTML/JSX tag renaming |

---

## 4. Infrastructure

### Current (Development / MVP)

| Resource | Specification | Notes |
|----------|---------------|-------|
| **Local dev server** | Vite on `localhost:5173` | Hot module replacement, ~50ms rebuilds |
| **Static hosting** | Any CDN (Vercel, Netlify, Cloudflare Pages) | `npm run build` produces `dist/` folder |
| **AI proxy server** | Node.js/Express on `localhost:3001` | Optional — only needed for Claude API calls |

### Recommended Deployment

| Service | Tier | Monthly Cost | Purpose |
|---------|------|-------------|---------|
| **Vercel** | Free (Hobby) | $0 | Static site hosting + CDN |
| **Netlify** | Free (Starter) | $0 | Alternative static hosting |
| **Cloudflare Pages** | Free | $0 | Alternative static hosting |
| **Railway / Render** | Free / $7 | $0–$7 | AI proxy backend server |
| **Custom domain** | — | ~$12/year | `.com` or `.ai` domain |

---

## 5. File Inventory

### Project Root

| File | Size | Purpose |
|------|------|---------|
| `package.json` | 758B | Dependencies, scripts, project metadata |
| `package-lock.json` | 119KB | Locked dependency tree |
| `vite.config.js` | 161B | Vite configuration (React plugin) |
| `eslint.config.js` | 758B | ESLint flat config with React rules |
| `index.html` | 362B | HTML entry point (mounts React root) |
| `.gitignore` | 253B | Git ignore rules |
| `PRD.md` | 9KB | Product Requirements Document |
| `IMPLEMENTATION_PLAN.md` | — | Technical implementation plan |
| `REQUIRED_RESOURCES.md` | — | This document |
| `README.md` | 5KB | Project overview and quick start guide |

### Source Code (`src/`)

| File | Size | Lines | Purpose |
|------|------|-------|---------|
| `main.jsx` | 229B | ~8 | React app entry point |
| `App.jsx` | 6KB | 180 | Root component, sidebar, view routing |
| `App.css` | 93B | ~5 | Minimal app-level overrides |
| `index.css` | 22KB | 963 | Full design system |
| **Components** | | | |
| `components/DataUploader.jsx` | 4KB | 134 | File upload + paste interface |
| `components/DataPreview.jsx` | 3KB | 86 | Sortable data table |
| `components/InsightDashboard.jsx` | 3KB | 83 | Chart orchestration + auto-generation |
| `components/ColumnSelector.jsx` | 4KB | 116 | Multi-select column picker |
| `components/ChartCard.jsx` | 2KB | 86 | Individual chart wrapper + insight |
| `components/charts/Charts.jsx` | 6KB | 211 | KPI, Line, Bar, Donut chart components |
| `components/QAPanel.jsx` | 4KB | 121 | Natural language Q&A interface |
| `components/ShareBar.jsx` | 3KB | 102 | Export & sharing controls |
| **Services** | | | |
| `services/ai.js` | 18KB | 485 | AI heuristics, chart logic, insights |
| **Utilities** | | | |
| `utils/parsers.js` | 4KB | 152 | File parsing (CSV, Excel, JSON, paste) |

### Totals

| Metric | Value |
|--------|-------|
| **Total source files** | 14 files |
| **Total source lines** | ~2,533 lines |
| **Total source size** | ~77 KB |
| **Production dependencies** | 8 packages |
| **Dev dependencies** | 8 packages |
| **`node_modules` size** | ~119 MB (typical) |
| **Production build size** | ~450–600 KB (estimated, gzipped) |

---

## 6. Design Resources

### Typography

| Property | Value |
|----------|-------|
| **Primary font** | [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts) |
| **Weights used** | 300 (Light), 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extra-Bold) |
| **Fallback stack** | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| **Loading** | CSS `@import` from Google Fonts CDN |

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#f5f6fa` | Page background |
| Card / Elevated | `#ffffff` | Cards, sidebar, modals |
| Primary | `#2563eb` | Buttons, active states, links |
| Primary Hover | `#1d4ed8` | Button hover, active nav |
| Teal | `#0ea5e9` | Accent, secondary highlights |
| Coral / Danger | `#ef4444` | Errors, negative signals |
| Amber / Warning | `#f59e0b` | Warnings, anomaly callouts |
| Purple | `#8b5cf6` | Date badges, accents |
| Success | `#10b981` | Positive signals, growth |
| Text Primary | `#1a1d2e` | Body text, headings |
| Text Secondary | `#5f6580` | Subtitles, labels |
| Text Tertiary | `#9ca0b4` | Placeholders, muted text |

### Chart Colors (7-color palette)

| Index | Hex | Preview |
|-------|-----|---------|
| 1 | `#2563eb` | Blue |
| 2 | `#10b981` | Green |
| 3 | `#f59e0b` | Amber |
| 4 | `#8b5cf6` | Purple |
| 5 | `#ef4444` | Red |
| 6 | `#06b6d4` | Cyan |
| 7 | `#ec4899` | Pink |

---

## 7. Browser Compatibility

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Google Chrome | 100+ | ✅ Fully supported |
| Safari | 16+ | ✅ Fully supported |
| Microsoft Edge | 100+ | ✅ Fully supported |
| Firefox | 100+ | ⚠️ Not officially tested (likely works) |
| Mobile Safari (iOS) | 16+ | ✅ View-only (responsive) |
| Chrome for Android | 100+ | ✅ View-only (responsive) |

**Key APIs used**: Drag and Drop API, File API, FileReader API, Clipboard API, Canvas API, `AbortSignal.timeout()`, ES2020+ features.

---

## 8. Performance Targets

| Metric | Target | How |
|--------|--------|-----|
| Time to first chart | < 30 seconds | Client-side parsing, heuristic chart generation |
| End-to-end flow | < 4 minutes | Upload → charts → share |
| Initial page load | < 2 seconds | Vite code splitting, tree shaking |
| Max dataset size | 50 MB | Browser memory constraint |
| Chart render time | < 500ms | Recharts with `ResponsiveContainer` |
| Export (PNG/PDF) | < 5 seconds | `html2canvas` at 2x scale |

---

## 9. Security Considerations

| Area | Current Approach | Notes |
|------|-----------------|-------|
| **Data privacy** | All data processed client-side | No data leaves the browser in MVP |
| **API key protection** | Claude API key stored server-side in proxy | Never exposed to client |
| **File validation** | Extension-based type checking | Add MIME type validation in future |
| **XSS prevention** | React's default JSX escaping | No `dangerouslySetInnerHTML` used |
| **Shared links** | Base64-encoded metadata in URL hash | No actual data in links (metadata only) |

---

## 10. Accessibility (WCAG 2.1 AA)

| Requirement | Status | Details |
|------------|--------|---------|
| Color contrast | ✅ | Text colors meet 4.5:1 ratio on light background |
| Keyboard navigation | ⚠️ Partial | Buttons are focusable, but tab order needs review |
| Screen reader support | ⚠️ Partial | Semantic HTML used, but ARIA labels needed on charts |
| Focus indicators | ✅ | Browser default + custom glow on inputs |
| Responsive text | ✅ | Font sizes in rem units |
| Reduced motion | ❌ TODO | Add `prefers-reduced-motion` media queries |
