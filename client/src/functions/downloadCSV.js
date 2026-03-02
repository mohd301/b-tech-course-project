// used to download audit log as CSV in the AuditLog component

// flatten nested objects into dot notation
function flattenObject(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value, newKey));
    } else {
      acc[newKey] = value;
    }
    return acc;
  }, {});
}

export default function downloadCSV(data, filename = "table.csv") {
  if (!data?.length) return;

  // flatten all rows
  const flatData = data.map(row => flattenObject(row));

  // collect all unique headers
  const headers = Array.from(
    flatData.reduce((set, row) => {
      Object.keys(row).forEach(k => set.add(k));
      return set;
    }, new Set())
  );

  // escape CSV values properly
  const escapeCSV = value => {
    if (value == null) return "";
    const str = String(value);
    if (str.includes('"')) return `"${str.replace(/"/g, '""')}"`;
    if (str.includes(",") || str.includes("\n")) return `"${str}"`;
    return str;
  };

  const csvRows = [
    headers.join(","),
    ...flatData.map(row =>
      headers.map(h => escapeCSV(row[h])).join(",")
    )
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}