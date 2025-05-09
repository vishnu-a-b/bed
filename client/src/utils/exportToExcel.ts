import * as XLSX from "xlsx";

export const exportToExcel = (data: any[], fileName: string) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data, {
    skipHeader: true, // We'll handle headers manually
  });

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");

  // Generate Excel file and download
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};