// used to download audit log as CSV in the AuditLog component

// flatten nested objects into dot notation
function flattenObject(obj, prefix = "") {
  // "acc" is the accumulated flattened result, "key" is the current property key
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key; // if prefix exists, combine with the current key using dot notation, otherwise just use the key

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value, newKey)); //if the value is also an object, recursively flatten it with the new prefix
    } else {
      acc[newKey] = value;
    }
    return acc;
  }, {} /* Defines acc as an empty object */ );
}

export default function downloadCSV(data, filename = "table.csv") {
  if (!data?.length) return;

  // flatten all rows
  const flatData = data.map(row => flattenObject(row));

  // collect all unique headers
  const headers = Array.from(
    flatData.reduce((set, row) => {
      Object.keys(row).forEach(k => set.add(k)); // add eack key to the set as a column header, set will automatically handle duplicates
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
    headers.join(","), // join array of headers into a comma-separated string for the first row
    ...flatData.map(row =>
      headers.map(h => escapeCSV(row[h])).join(",") // for each row, map headers to their corresponding values, escape them, and join into a CSV line
    )
  ];

  // blob = file in memory
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" }); // array of rows is joined by new lines to create a vaid .csv format
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}