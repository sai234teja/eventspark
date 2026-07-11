export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Format rows
  const csvRows = [
    headers.join(','),
    ...data.map(row => {
      return headers.map(header => {
        let value = row[header];
        
        // Handle dates and special characters
        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        } else {
          value = String(value);
        }
        
        // Escape quotes and commas
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        
        return value;
      }).join(',');
    })
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadAnalyticsExport = (
  events: any[],
  revenue: any[],
  registrations: any[],
  categories: any[]
) => {
  const dateStr = new Date().toISOString().split('T')[0];
  
  // Create a combined JSON structure to export
  // In a real advanced app we might generate a zip with multiple CSVs or an Excel file
  // For v1.0 we will export the summary events list
  
  exportToCSV(events, `analytics-events-${dateStr}.csv`);
  
  if (revenue && revenue.length > 0) {
    exportToCSV(revenue, `analytics-revenue-${dateStr}.csv`);
  }
};
