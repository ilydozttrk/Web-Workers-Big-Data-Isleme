import Chart from 'chart.js/auto'
import * as XLSX from 'xlsx'
import '../styles/style.css'

// ─── Worker ────────────────────────────────────────────────────────────────────
let worker = createWorker()

function createWorker() {
  return new Worker(
    new URL('../workers/csvWorker.js', import.meta.url),
    { type: 'module' }
  )
}

// ─── HTML ──────────────────────────────────────────────────────────────────────
document.querySelector('#app').innerHTML = `
  <main class="container">


    <div id="loading-overlay">
      <div class="loader"></div>
      <span>Processing dataset in Web Worker — UI stays responsive...</span>
    </div>


    <header class="header">
      <h1>Web Workers Big Data Analyzer</h1>
      <p>Analyze large CSV datasets in the browser using Web Workers — UI never freezes</p>
    </header>

    <section class="upload-section">
      <div class="upload-box" id="drop-zone">
        <div class="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <p>Drag &amp; Drop CSV File Here</p>
        <span>or click to browse</span>
        <input type="file" id="file-input" accept=".csv" />
      </div>
    </section>

    <section id="file-info-section"></section>

    <section class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" id="progress-fill"></div>
      </div>
      <p id="progress-text">Waiting for file...</p>
      <div id="status-message"></div>
    </section>

    <section id="dataset-summary"></section>

    <section class="controls-section">

      <!-- Row 1: Primary actions -->
      <div class="ctrl-bar ctrl-actions-bar">
        <button id="process-btn" class="btn-process">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Process CSV
        </button>
        <button id="cancel-processing-btn" class="btn-danger">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Cancel
        </button>
      </div>

      <div class="ctrl-divider"></div>

      <!-- Row 2: Filter bar -->
      <div class="ctrl-bar ctrl-filter-bar">
        <div class="ctrl-field">
          <label class="ctrl-field-label">Column</label>
          <select id="column-select">
            <option value="">Select column...</option>
          </select>
        </div>
        <div class="ctrl-field">
          <label class="ctrl-field-label">Range</label>
          <div class="range-group">
            <input type="number" id="min-filter" placeholder="Min" />
            <span class="range-dash">—</span>
            <input type="number" id="max-filter" placeholder="Max" />
          </div>
        </div>
        <button id="apply-filter-btn" class="btn-apply">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Apply Filter
        </button>
      </div>

      <div class="ctrl-divider"></div>

      <!-- Row 3: Export + Search -->
      <div class="ctrl-bar ctrl-bottom-bar">
        <div class="ctrl-exports">
          <button id="export-btn" class="btn-export">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <button id="export-excel-btn" class="btn-excel">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            Export Excel
          </button>
        </div>
        <div class="ctrl-searchbar">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="search-input" placeholder="Search across all columns..." />
          <button id="search-btn" class="btn-search-inline">Search</button>
          <button id="clear-search-btn" class="btn-clear">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

    </section>

    <p id="range-info"></p>

    <section class="results-section" id="results-section"></section>

    <section class="chart-section">
      <canvas id="histogram-chart"></canvas>
    </section>

    <section class="stats-section" id="stats-section"></section>

  </main>
`

// ─── DOM References ────────────────────────────────────────────────────────────
const fileInput           = document.querySelector('#file-input')
const dropZone            = document.querySelector('#drop-zone')
const progressFill        = document.querySelector('#progress-fill')
const progressText        = document.querySelector('#progress-text')
const statusMessage       = document.querySelector('#status-message')
const statsSection        = document.querySelector('#stats-section')
const processBtn          = document.querySelector('#process-btn')
const columnSelect        = document.querySelector('#column-select')
const chartCanvas         = document.querySelector('#histogram-chart')
const minFilterInput      = document.querySelector('#min-filter')
const maxFilterInput      = document.querySelector('#max-filter')
const applyFilterBtn      = document.querySelector('#apply-filter-btn')
const cancelProcessingBtn = document.querySelector('#cancel-processing-btn')
const exportBtn           = document.querySelector('#export-btn')
const exportExcelBtn      = document.querySelector('#export-excel-btn')
const searchInput         = document.querySelector('#search-input')
const searchBtn           = document.querySelector('#search-btn')
const clearSearchBtn      = document.querySelector('#clear-search-btn')
const rangeInfo           = document.querySelector('#range-info')
const loadingOverlay      = document.querySelector('#loading-overlay')
const fileInfoSection     = document.querySelector('#file-info-section')
const datasetSummary      = document.querySelector('#dataset-summary')
const resultsSection      = document.querySelector('#results-section')

// ─── State ─────────────────────────────────────────────────────────────────────
let chartInstance = null
let parsedRows    = []

// ─── Helpers ───────────────────────────────────────────────────────────────────
function showStatus(message, type) {
  statusMessage.textContent = message
  statusMessage.className   = type
}

function showLoadingOverlay() {
  loadingOverlay.style.display = 'flex'
}

function hideLoadingOverlay() {
  loadingOverlay.style.display = 'none'
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k     = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i     = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ─── File Info ─────────────────────────────────────────────────────────────────
function displayFileInfo(file) {
  const lastModified = new Date(file.lastModified).toLocaleString('tr-TR')
  fileInfoSection.innerHTML = `
    <div class="file-info-card">
      <div class="file-info-item">
        <span class="file-info-label">📄 File Name</span>
        <span class="file-info-value">${file.name}</span>
      </div>
      <div class="file-info-item">
        <span class="file-info-label">💾 File Size</span>
        <span class="file-info-value">${formatFileSize(file.size)}</span>
      </div>
      <div class="file-info-item">
        <span class="file-info-label">🕒 Last Modified</span>
        <span class="file-info-value">${lastModified}</span>
      </div>
      <div class="file-info-item">
        <span class="file-info-label">📋 Type</span>
        <span class="file-info-value">${file.type || 'text/csv'}</span>
      </div>
    </div>
  `
}

// ─── Dataset Summary ───────────────────────────────────────────────────────────
function displayDatasetSummary(data) {
  const allColumns  = data.rows.length > 0 ? Object.keys(data.rows[0]) : []
  const numericCols = Object.keys(data.stats)
  const textCols    = allColumns.filter(c => !numericCols.includes(c))

  datasetSummary.innerHTML = `
    <div class="summary-title">Dataset Summary</div>
    <div class="summary-grid">
      <div class="summary-card">
        <span class="summary-value">${data.totalRows.toLocaleString('tr-TR')}</span>
        <span class="summary-label">Total Rows</span>
      </div>
      <div class="summary-card">
        <span class="summary-value">${allColumns.length}</span>
        <span class="summary-label">Total Columns</span>
      </div>
      <div class="summary-card">
        <span class="summary-value">${numericCols.length}</span>
        <span class="summary-label">Numeric Columns</span>
      </div>
      <div class="summary-card">
        <span class="summary-value">${textCols.length}</span>
        <span class="summary-label">Text Columns</span>
      </div>
    </div>
  `
}

// ─── Processing ────────────────────────────────────────────────────────────────
function processSelectedFile(file) {
  if (!file) {
    showStatus('Please select a CSV file.', 'error-status')
    return
  }

  displayFileInfo(file)
  showLoadingOverlay()

  progressFill.style.width  = '0%'
  progressText.textContent  = 'Processing CSV file...'

  showStatus('CSV processing started.', 'success-status')

  worker.postMessage({ file })
}

processBtn.addEventListener('click', () => {
  const file = fileInput.files[0]
  processSelectedFile(file)
})

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0]
  if (!file) return
  displayFileInfo(file)
})

// ─── Worker Listeners ──────────────────────────────────────────────────────────
function setupWorkerListeners() {
  worker.onmessage = (event) => {
    const data = event.data

    if (data.type === 'progress') {
      progressFill.style.width = `${data.progress}%`
      progressText.textContent = `Processing... ${data.progress}%`
    }

    if (data.type === 'complete') {
      hideLoadingOverlay()

      progressFill.style.width = '100%'
      progressText.textContent = `${data.totalRows.toLocaleString('tr-TR')} rows processed successfully`
      showStatus('Dataset processed successfully.', 'success-status')

      displayDatasetSummary(data)

      statsSection.innerHTML = ''
      for (const column in data.stats) {
        const stat = data.stats[column]
        statsSection.innerHTML += `
          <div class="stat-card">
            <h3>${column}</h3>
            <div class="stat-row"><span class="stat-label">Average</span><span class="stat-val">${stat.average}</span></div>
            <div class="stat-row"><span class="stat-label">Median</span><span class="stat-val">${stat.median}</span></div>
            <div class="stat-row"><span class="stat-label">Std Dev</span><span class="stat-val">${stat.standardDeviation}</span></div>
            <div class="stat-row"><span class="stat-label">Min</span><span class="stat-val">${stat.min}</span></div>
            <div class="stat-row"><span class="stat-label">Max</span><span class="stat-val">${stat.max}</span></div>
          </div>
        `
      }

      parsedRows = data.rows

      columnSelect.innerHTML = '<option value="">Select Numeric Column</option>'
      for (const column in data.stats) {
        columnSelect.innerHTML += `<option value="${column}">${column}</option>`
      }
    }

    if (data.type === 'error') {
      hideLoadingOverlay()
      showStatus(data.message, 'error-status')
      progressText.textContent = 'Processing failed.'
    }
  }
}

setupWorkerListeners()

// ─── Chart ─────────────────────────────────────────────────────────────────────
function renderChart() {
  const selectedColumn = columnSelect.value
  if (!selectedColumn) return

  const minValue = parseFloat(minFilterInput.value)
  const maxValue = parseFloat(maxFilterInput.value)

  let values = parsedRows
    .map(row => parseFloat(row[selectedColumn]))
    .filter(value => !isNaN(value))

  const actualMin = Math.min(...values)
  const actualMax = Math.max(...values)

  rangeInfo.textContent = `Available Range → Min: ${actualMin} | Max: ${actualMax}`

  if (!isNaN(minValue)) values = values.filter(v => v >= minValue)
  if (!isNaN(maxValue)) values = values.filter(v => v <= maxValue)

  if (values.length === 0) {
    alert('No data found in this range.')
    return
  }

  if (chartInstance) chartInstance.destroy()

  const bucketSize = (actualMax - actualMin || 1) / 10
  const buckets    = Array(10).fill(0)

  values.forEach(value => {
    const idx = Math.min(Math.floor((value - actualMin) / bucketSize), 9)
    buckets[idx]++
  })

  const labels = buckets.map((_, i) => {
    const start = (actualMin + i * bucketSize).toFixed(2)
    const end   = (actualMin + (i + 1) * bucketSize).toFixed(2)
    return `${start} – ${end}`
  })

  chartInstance = new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: `${selectedColumn} distribution`,
        data: buckets,
        backgroundColor: 'rgba(74,222,128,0.45)',
        borderColor: '#4ade80',
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(74,222,128,0.75)',
      }],
    },
    options: {
      responsive: true,
      animation: { duration: 600, easing: 'easeInOutQuart' },
      plugins: {
        legend: { labels: { color: '#f8fafc', font: { size: 13 } } },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.95)',
          titleColor: '#4ade80',
          bodyColor: '#f8fafc',
          borderColor: 'rgba(74,222,128,0.3)',
          borderWidth: 1,
        },
      },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      },
    },
  })
}

columnSelect.addEventListener('change', renderChart)
applyFilterBtn.addEventListener('click', renderChart)
minFilterInput.addEventListener('keydown', e => { if (e.key === 'Enter') renderChart() })
maxFilterInput.addEventListener('keydown', e => { if (e.key === 'Enter') renderChart() })

// ─── Cancel ────────────────────────────────────────────────────────────────────
cancelProcessingBtn.addEventListener('click', () => {
  worker.terminate()
  worker = createWorker()
  setupWorkerListeners()   // BUG FIX: yeni worker'a listener bağla

  hideLoadingOverlay()
  progressFill.style.width = '0%'
  progressText.textContent = 'Processing cancelled.'
  statsSection.innerHTML   = ''
  rangeInfo.textContent    = ''
  parsedRows               = []

  columnSelect.innerHTML = '<option value="">Select Numeric Column</option>'
  minFilterInput.value   = ''
  maxFilterInput.value   = ''
  datasetSummary.innerHTML  = ''
  fileInfoSection.innerHTML = ''
  resultsSection.innerHTML  = ''

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  fileInput.value = ''
  showStatus('Processing cancelled.', 'warning-status')
})

// ─── Drag & Drop ───────────────────────────────────────────────────────────────
dropZone.addEventListener('dragover', (event) => {
  event.preventDefault()
  dropZone.classList.add('drag-active')
})

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-active')
})

dropZone.addEventListener('drop', (event) => {
  event.preventDefault()
  dropZone.classList.remove('drag-active')
  const file = event.dataTransfer.files[0]
  if (!file) return
  fileInput.files = event.dataTransfer.files
  processSelectedFile(file)
})

// ─── Export CSV ────────────────────────────────────────────────────────────────
exportBtn.addEventListener('click', () => {
  const selectedColumn = columnSelect.value

  if (!selectedColumn) {
    showStatus('Select a column before exporting.', 'error-status')
    return
  }

  const minValue = parseFloat(minFilterInput.value)
  const maxValue = parseFloat(maxFilterInput.value)

  let filteredRows = parsedRows.filter(row => {
    const value = parseFloat(row[selectedColumn])
    if (isNaN(value)) return false
    if (!isNaN(minValue) && value < minValue) return false
    if (!isNaN(maxValue) && value > maxValue) return false
    return true
  })

  if (filteredRows.length === 0) {
    showStatus('No filtered data available.', 'error-status')
    return
  }

  const headers    = Object.keys(filteredRows[0])
  const csvContent = [
    headers.join(','),
    ...filteredRows.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(',')),
  ].join('\n')   // BUG FIX: '\n' değil, gerçek newline

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = 'filtered_dataset.csv'
  link.click()
  URL.revokeObjectURL(url)

  showStatus('Filtered CSV exported successfully.', 'success-status')
})

// ─── Export Excel ──────────────────────────────────────────────────────────────
exportExcelBtn.addEventListener('click', () => {
  if (parsedRows.length === 0) {
    showStatus('No data to export. Process a CSV file first.', 'error-status')
    return
  }

  const selectedColumn = columnSelect.value
  const minValue       = parseFloat(minFilterInput.value)
  const maxValue       = parseFloat(maxFilterInput.value)

  let rowsToExport = parsedRows

  if (selectedColumn) {
    rowsToExport = parsedRows.filter(row => {
      const value = parseFloat(row[selectedColumn])
      if (isNaN(value)) return false
      if (!isNaN(minValue) && value < minValue) return false
      if (!isNaN(maxValue) && value > maxValue) return false
      return true
    })
  }

  if (rowsToExport.length === 0) {
    showStatus('No data available for export.', 'error-status')
    return
  }

  const worksheet = XLSX.utils.json_to_sheet(rowsToExport)
  const workbook  = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dataset')
  XLSX.writeFile(workbook, 'filtered_dataset.xlsx')

  showStatus('Excel file exported successfully.', 'success-status')
})

// ─── Search ────────────────────────────────────────────────────────────────────
function performSearch() {
  const query = searchInput.value.trim().toLowerCase()

  if (!query) {
    showStatus('Please enter a search term.', 'error-status')
    return
  }

  if (parsedRows.length === 0) {
    showStatus('No data loaded. Process a CSV file first.', 'error-status')
    return
  }

  const results = parsedRows.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(query)
    )
  )

  renderResultsTable(results, query)

  showStatus(
    `Found ${results.length.toLocaleString('tr-TR')} matching rows.`,
    results.length > 0 ? 'success-status' : 'warning-status'
  )
}

function renderResultsTable(rows, query = '') {
  if (rows.length === 0) {
    resultsSection.innerHTML = `
      <div class="no-results">
        <p>No results found for "<strong>${query}</strong>"</p>
      </div>
    `
    return
  }

  const displayRows = rows.slice(0, 500)
  const headers     = Object.keys(displayRows[0])

  const escapeHtml = str => String(str ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const highlightMatch = (text, query) => {
    if (!query) return escapeHtml(text)
    const escaped = escapeHtml(text)
    const re      = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return escaped.replace(re, '<mark>$1</mark>')
  }

  const rowsHTML = displayRows.map(row => `
    <tr>${headers.map(h => `<td>${highlightMatch(row[h], query)}</td>`).join('')}</tr>
  `).join('')

  resultsSection.innerHTML = `
    <div class="results-header">
      <h3>Search Results</h3>
      <span class="results-count">
        ${rows.length.toLocaleString('tr-TR')} rows found
        ${rows.length > 500 ? ' — showing first 500' : ''}
      </span>
    </div>
    <div class="table-wrapper">
      <table class="results-table">
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>${rowsHTML}</tbody>
      </table>
    </div>
  `
}

searchBtn.addEventListener('click', performSearch)

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') performSearch()
})

clearSearchBtn.addEventListener('click', () => {
  searchInput.value        = ''
  resultsSection.innerHTML = ''
  showStatus('Search cleared.', 'success-status')
})
