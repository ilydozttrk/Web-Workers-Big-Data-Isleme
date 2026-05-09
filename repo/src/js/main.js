import Chart from 'chart.js/auto'
import '../styles/style.css'

const worker = new Worker(
  new URL('../workers/csvWorker.js', import.meta.url),
  { type: 'module' }
)

document.querySelector('#app').innerHTML = `
  <main class="container">
    <header class="header">
      <h1>Web Workers Big Data Analyzer</h1>

      <p>
        Analyze large CSV datasets in the browser using Web Workers
      </p>
    </header>

    <section class="upload-section">
      <div class="upload-box" id="drop-zone">
        <p>Drag & Drop CSV File Here</p>

        <span>or</span>

        <input type="file" id="file-input" accept=".csv" />
      </div>
    </section>

    <section class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" id="progress-fill"></div>
      </div>

      <p id="progress-text">Waiting for file...</p>
    </section>

    <section class="controls-section">
  <select id="column-select">
    <option value="">Select Numeric Column</option>
  </select>

  <input
    type="number"
    id="min-filter"
    placeholder="Min Value"
  />

  <input
    type="number"
    id="max-filter"
    placeholder="Max Value"
  />

  <button id="apply-filter-btn">
  Apply Filter
</button>

</section>
   <p id="range-info"></p>
    <section class="chart-section">
  <canvas id="histogram-chart"></canvas>
</section>

<section class="stats-section" id="stats-section">
</section>
  </main>
`

const fileInput = document.querySelector('#file-input')
const progressFill = document.querySelector('#progress-fill')
const progressText = document.querySelector('#progress-text')
const statsSection = document.querySelector('#stats-section')

const columnSelect = document.querySelector('#column-select')
const chartCanvas = document.querySelector('#histogram-chart')
const minFilterInput =
  document.querySelector('#min-filter')

const maxFilterInput =
  document.querySelector('#max-filter')

const applyFilterBtn =
 document.querySelector('#apply-filter-btn')

const rangeInfo =
  document.querySelector('#range-info')
  
let chartInstance = null
let parsedRows = []

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0]

  if (!file) return

  progressFill.style.width = '0%'

  progressText.textContent = 'Processing CSV file...'

  worker.postMessage({
    file,
  })
})

worker.onmessage = (event) => {
  const data = event.data

  if (data.type === 'progress') {
    progressFill.style.width = `${data.progress}%`

    progressText.textContent =
      `Processing... ${data.progress}%`
  }

  if (data.type === 'complete') {
    progressFill.style.width = '100%'

    progressText.textContent =
      `${data.totalRows} rows processed successfully`

    statsSection.innerHTML = ''

    for (const column in data.stats) {
      const stat = data.stats[column]

      statsSection.innerHTML += `
        <div class="stat-card">
          <h3>${column}</h3>

          <p>Average: ${stat.average}</p>
          <p>Median: ${stat.median}</p>
          <p>Std Dev: ${stat.standardDeviation}</p>
          <p>Min: ${stat.min}</p>
          <p>Max: ${stat.max}</p>
        </div>
      `
    }

    parsedRows = data.rows

    columnSelect.innerHTML =
      '<option value="">Select Numeric Column</option>'

    for (const column in data.stats) {
      columnSelect.innerHTML += `
        <option value="${column}">
          ${column}
        </option>
      `
    }
  }
}

function renderChart() {
  const selectedColumn = columnSelect.value

  if (!selectedColumn) return

  const minValue =
    parseFloat(minFilterInput.value)

  const maxValue =
    parseFloat(maxFilterInput.value)

  let values = parsedRows
    .map((row) =>
      parseFloat(row[selectedColumn])
    )
    .filter((value) => !isNaN(value))


const actualMin = Math.min(...values)
const actualMax = Math.max(...values)

rangeInfo.textContent =
  `Available Range → Min: ${actualMin} | Max: ${actualMax}`

if (!isNaN(minValue)) {
    values = values.filter(
      (value) => value >= minValue
    )
  }

  if (!isNaN(maxValue)) {
    values = values.filter(
      (value) => value <= maxValue
    )
  }

if (values.length === 0) {
  alert('No data found in this range.')
  return
}

if (chartInstance) {
    chartInstance.destroy()
}

  chartInstance = new Chart(chartCanvas, {
    type: 'bar',

    data: {
      labels: values.map((_, index) => index + 1),

      datasets: [
        {
          label: selectedColumn,
          data: values,
        },
      ],
    },
  })
}

columnSelect.addEventListener(
  'change',
  renderChart
)

applyFilterBtn.addEventListener(
  'click',
  renderChart
)

minFilterInput.addEventListener(
  'keydown',
  (event) => {
    if (event.key === 'Enter') {
      renderChart()
    }
  }
)

maxFilterInput.addEventListener(
  'keydown',
  (event) => {
    if (event.key === 'Enter') {
      renderChart()
    }
  }
)