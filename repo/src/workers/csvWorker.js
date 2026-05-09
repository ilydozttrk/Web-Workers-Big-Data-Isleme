import Papa from 'papaparse'

self.onmessage = (event) => {
  const { file } = event.data

  self.postMessage({ type: 'progress', progress: 0 })

  let processedRows = 0
  let estimatedTotal = 0
  const rows = []

  // Dosya boyutuna göre satır sayısı tahmini (ortalama ~50 byte/satır varsayımı)
  estimatedTotal = Math.max(Math.round(file.size / 50), 1000)

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,

    step: (results) => {
      processedRows++
      rows.push(results.data)

      // Her 1000 satırda bir progress gönder (spam önleme)
      if (processedRows % 1000 !== 0) return

      const progress = Math.min(
        Math.floor((processedRows / estimatedTotal) * 100),
        99
      )

      self.postMessage({ type: 'progress', progress })
    },

    complete: () => {
      if (rows.length === 0) {
        self.postMessage({
          type: 'error',
          message: 'Dataset is empty or could not be parsed.',
        })
        return
      }

      // Sayısal sütunları tespit et
      const numericColumns = []
      const firstRow = rows[0]

      for (const key in firstRow) {
        const value = parseFloat(firstRow[key])
        if (!isNaN(value)) {
          numericColumns.push(key)
        }
      }

      if (numericColumns.length === 0) {
        self.postMessage({
          type: 'error',
          message: 'No numeric columns found in dataset.',
        })
        return
      }

      // Her sayısal sütun için istatistik hesapla
      const stats = {}

      numericColumns.forEach((column) => {
        const values = rows
          .map((row) => parseFloat(row[column]))
          .filter((v) => !isNaN(v))

        if (values.length === 0) return

        // Ortalama (Average)
        const sum = values.reduce((acc, v) => acc + v, 0)
        const average = sum / values.length

        // Medyan (Median)
        const sorted = [...values].sort((a, b) => a - b)
        const midIndex = Math.floor(sorted.length / 2)
        const median =
          sorted.length % 2 === 0
            ? (sorted[midIndex - 1] + sorted[midIndex]) / 2
            : sorted[midIndex]

        // Standart Sapma (Standard Deviation)
        const variance = values.reduce(
          (acc, v) => acc + Math.pow(v - average, 2), 0
        ) / values.length
        const standardDeviation = Math.sqrt(variance)

        // Min / Max
        const min = Math.min(...values)
        const max = Math.max(...values)

        stats[column] = {
          average: average.toFixed(2),
          median: median.toFixed(2),
          standardDeviation: standardDeviation.toFixed(2),
          min,
          max,
        }
      })

      self.postMessage({ type: 'progress', progress: 100 })

      self.postMessage({
        type: 'complete',
        rows,
        totalRows: rows.length,
        stats,
      })
    },

    error: (error) => {
      self.postMessage({
        type: 'error',
        message: error.message || 'CSV parsing failed.',
      })
    },
  })
}