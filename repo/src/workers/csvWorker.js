import Papa from 'papaparse'

self.onmessage = (event) => {
  const { file } = event.data

  self.postMessage({
    type: 'progress',
    progress: 10,
  })

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,

    complete: (results) => {
      const rows = results.data

      const numericColumns = []

      if (rows.length > 0) {
        const firstRow = rows[0]

        for (const key in firstRow) {
          const value = parseFloat(firstRow[key])

          if (!isNaN(value)) {
            numericColumns.push(key)
          }
        }
      }

      const stats = {}

      numericColumns.forEach((column) => {
        const values = rows
          .map((row) => parseFloat(row[column]))
          .filter((value) => !isNaN(value))

        const sum = values.reduce(
          (acc, value) => acc + value,
          0
        )

        const average = sum / values.length

        const sortedValues = [...values].sort(
          (a, b) => a - b
        )

        let median = 0

        const middleIndex =
          Math.floor(sortedValues.length / 2)

        if (sortedValues.length % 2 === 0) {
          median =
            (
              sortedValues[middleIndex - 1] +
              sortedValues[middleIndex]
            ) / 2
        } else {
          median = sortedValues[middleIndex]
        }

        const variance =
          values.reduce((acc, value) => {
            return (
              acc +
              Math.pow(value - average, 2)
            )
          }, 0) / values.length

        const standardDeviation =
          Math.sqrt(variance)

        const min = Math.min(...values)
        const max = Math.max(...values)

        stats[column] = {
          average: average.toFixed(2),
          median: median.toFixed(2),

          standardDeviation:
            standardDeviation.toFixed(2),

          min,
          max,
        }
      })

      self.postMessage({
        type: 'progress',
        progress: 100,
      })

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
        message: error.message,
      })
    },
  })
}