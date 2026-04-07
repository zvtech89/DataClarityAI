import Papa from 'papaparse'
import * as XLSX from 'xlsx'

/**
 * Detect column types from sample data.
 * Returns 'number', 'date', or 'text'.
 */
function detectColumnType(values) {
  const sample = values.filter((v) => v !== null && v !== undefined && v !== '').slice(0, 50)
  if (sample.length === 0) return 'text'

  const numericCount = sample.filter((v) => !isNaN(Number(v)) && v !== '').length
  if (numericCount / sample.length > 0.8) return 'number'

  const dateCount = sample.filter((v) => {
    if (typeof v !== 'string') return false
    const d = new Date(v)
    return !isNaN(d.getTime()) && v.length > 4
  }).length
  if (dateCount / sample.length > 0.6) return 'date'

  return 'text'
}

/**
 * Normalize raw parsed rows into { columns, rows } shape.
 * columns: [{ name, type }]
 * rows: [{ [colName]: value, ... }]
 */
function normalize(rawRows) {
  if (!rawRows || rawRows.length === 0) {
    throw new Error('No data found in file')
  }

  const columnNames = Object.keys(rawRows[0])
  const columns = columnNames.map((name) => ({
    name,
    type: detectColumnType(rawRows.map((r) => r[name])),
  }))

  return { columns, rows: rawRows }
}

/**
 * Parse CSV file or string.
 */
export function parseCSV(fileOrString) {
  return new Promise((resolve, reject) => {
    const config = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete(results) {
        try {
          resolve(normalize(results.data))
        } catch (err) {
          reject(err)
        }
      },
      error(err) {
        reject(new Error(`CSV parse error: ${err.message}`))
      },
    }

    if (typeof fileOrString === 'string') {
      Papa.parse(fileOrString, config)
    } else {
      Papa.parse(fileOrString, config)
    }
  })
}

/**
 * Parse Excel file (File or ArrayBuffer).
 */
export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const sheetName = wb.SheetNames[0]
        const sheet = wb.Sheets[sheetName]
        const rawRows = XLSX.utils.sheet_to_json(sheet)
        resolve(normalize(rawRows))
      } catch (err) {
        reject(new Error(`Excel parse error: ${err.message}`))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read Excel file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Parse JSON file.
 */
export function parseJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        let parsed = JSON.parse(e.target.result)
        // If it's an object with a data key containing an array, unwrap
        if (!Array.isArray(parsed)) {
          const arrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]))
          if (arrayKey) {
            parsed = parsed[arrayKey]
          } else {
            throw new Error('JSON must contain an array of objects')
          }
        }
        resolve(normalize(parsed))
      } catch (err) {
        reject(new Error(`JSON parse error: ${err.message}`))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read JSON file'))
    reader.readAsText(file)
  })
}

/**
 * Parse pasted text (tab- or comma-separated).
 */
export function parsePaste(text) {
  if (!text || text.trim().length === 0) {
    return Promise.reject(new Error('No data to parse'))
  }
  return parseCSV(text.trim())
}

/**
 * Auto-detect file type and parse.
 */
export function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  switch (ext) {
    case 'csv':
    case 'tsv':
      return parseCSV(file)
    case 'xlsx':
    case 'xls':
      return parseExcel(file)
    case 'json':
      return parseJSON(file)
    default:
      return Promise.reject(new Error(`Unsupported file type: .${ext}`))
  }
}
