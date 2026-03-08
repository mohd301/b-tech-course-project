// Helper function to parse CSV content
export default function parseCSV(content) {
    const lines = content.split("\n").filter(line => line.trim() !== "")
    if (lines.length === 0) return { rowCount: 0, columnCount: 0, columns: [] }

    const columns = lines[0].split(",").map(col => col.trim())
    const rowCount = lines.length - 1
    const columnCount = columns.length

    return { rowCount, columnCount, columns }
}