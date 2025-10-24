"use client";
import { DataTable } from "@/components/dataTable/DataTable";
import { useState, useEffect, useCallback } from "react";
import { Axios } from "@/utils/api/apiAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { paymentColumns, Payment } from "./PaymentColumns";
import PaymentStatsComponent from "./PaymentStatsComponent";
import * as XLSX from "xlsx";

// Define the supporter type with payments array
interface SupporterWithPayments {
  _id: string;
  user: {
    _id: string;
    name: string;
    mobileNo: string;
    email: string;
    roles: any[];
    isActive: boolean;
    isSuperAdmin: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  name: string;
  nameVisible: boolean;
  bed: any;
  role: string;
  type: string;
  isActive: boolean;
  amount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  payments: Payment[];
  completedPayments: number;
  totalPayments: number;
}

export default function PaymentFollowUp() {
  const [data, setData] = useState<SupporterWithPayments[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentModeFilter, setPaymentModeFilter] = useState("all");
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 2);
    return firstDayOfMonth.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const refresh: boolean = useSelector(
    (state: RootState) => state.update.refresh
  );
  const paymentId: any = useSelector((state: RootState) => state.payment.id);

  // Debounce the search input
  const debounce = (func: Function, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const handleSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearch(value);
      setPageIndex(0);
    }, 500),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  // Function to merge supporters with their payments
  const mergeSupportersWithPayments = (supporters: any[], payments: Payment[]) => {
    return supporters.map(supporter => {
      // Find all payments for this supporter
      const supporterPayments = payments.filter(payment => 
        payment.supporter._id === supporter._id
      );

      // Count completed payments
      const completedPayments = supporterPayments.filter(payment => 
        payment.status === 'completed'
      ).length;

      return {
        ...supporter,
        payments: supporterPayments,
        completedPayments: completedPayments,
        totalPayments: supporterPayments.length
      };
    });
  };

  // Fetch data from API
  async function getData() {
    try {
      // Build filter parameters
      let statusParam = "";
      if (statusFilter !== "all") {
        statusParam = `status__eq=${statusFilter}&`;
      }

      let paymentModeParam = "";
      if (paymentModeFilter !== "all") {
        paymentModeParam = `paymentMode__eq=${paymentModeFilter}&`;
      }

      const searchParam = debouncedSearch ? `search=${debouncedSearch}&` : "";
      
      const limit = `limit=Infinity&`;
     

      // Prepare request body for date filters
      const requestBody = {
        filters: {
          startDate: startDate
            ? new Date(startDate).toISOString()
            : undefined,
          endDate: endDate 
            ? new Date(endDate).toISOString() 
            : undefined,
        },
      };

      // Fetch payments data
      const response = await Axios.post(
        `/bed-payments?${limit}${statusParam}${paymentModeParam}${searchParam}sort=-paymentDate`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Fetch supporters data
      const responseSupporter = await Axios.post(
        `/supporter/get?limit=Infinity&`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Payments:", response.data.data);
      console.log("Supporters:", responseSupporter.data.data);

      const paymentsData = response.data.data;
      const supportersData = responseSupporter.data.data;

      // Extract payments array from the response
      const payments = paymentsData.items || paymentsData;
      const supporters = supportersData.items || supportersData;

      // Merge supporters with their payments
      const mergedData = mergeSupportersWithPayments(supporters, payments);

      // Filter merged data based on search and other criteria if needed
      let filteredData = mergedData;

      // Apply search filter to supporter data
      if (debouncedSearch) {
        filteredData = mergedData.filter(supporter =>
          supporter.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          supporter.user.mobileNo.includes(debouncedSearch) ||
          supporter.user.email.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      }

      // Apply pagination to the filtered data
      const startIndex = pageIndex * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      console.log(paginatedData)
      setTotalRows(filteredData.length);
      return paginatedData;
    } catch (error) {
      console.error("Error fetching payment data:", error);
      return [];
    }
  }

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    async function fetchData() {
      const result = await getData();
      if (result) {
        setData(result);
      }
    }
    fetchData();
  }, [
    pageIndex,
    pageSize,
    debouncedSearch,
    statusFilter,
    paymentModeFilter,
    startDate,
    endDate,
    refresh,
    paymentId,
  ]);

  // Function to fetch all payment data for export
  const fetchAllPaymentsForExport = async (endpoint: string) => {
    try {
      const requestBody = {
        filters: {
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
        },
      };

      // Fetch all payments
      const paymentsResponse = await Axios.post(
        `/${endpoint}?limit=Infinity&sort=-paymentDate`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Fetch all supporters
      const supportersResponse = await Axios.post(
        `/supporter/get?limit=Infinity`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const payments = paymentsResponse.data.data.items || paymentsResponse.data.data;
      const supporters = supportersResponse.data.data.items || supportersResponse.data.data;

      return { payments, supporters };
    } catch (error) {
      console.error("Error fetching data for export:", error);
      return { payments: [], supporters: [] };
    }
  };

  // Function to group payments by supporter and month/year
  const processDataForExport = (supporters: any[], payments: Payment[]) => {
    // Get all unique months/years from payments
    const monthYearSet = new Set<string>();
    payments.forEach(payment => {
      if (payment.paymentDate) {
        const date = new Date(payment.paymentDate);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthYearSet.add(monthYear);
      }
    });

    // Sort months chronologically
    const sortedMonthYears = Array.from(monthYearSet).sort();

    // Process each supporter
    const exportData = supporters.map((supporter, index) => {
      // Find all payments for this supporter
      const supporterPayments = payments.filter(
        payment => payment.supporter?._id === supporter._id
      );

      // Create base row data
      const rowData: any = {
        'No': index + 1, // Add row number
        'Supporter Name': supporter.name || 'N/A',
        'Mobile No': supporter.user?.mobileNo || 'N/A',
        'Bed No': supporter.bed?.bedNo || 'N/A',
        '': '', // Empty column after bed number
        'Fixed Amount': supporter.amount || 0,
      };

      // Add payment data for each month
      sortedMonthYears.forEach(monthYear => {
        const [year, month] = monthYear.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short', year: 'numeric' });

        // Find payment for this month
        const monthPayment = supporterPayments.find(payment => {
          if (!payment.paymentDate) return false;
          const paymentDate = new Date(payment.paymentDate);
          const paymentMonthYear = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
          return paymentMonthYear === monthYear;
        });

        if (monthPayment && monthPayment.paymentDate) {
          const paymentDate = new Date(monthPayment.paymentDate).toLocaleDateString();
          const amount = monthPayment.amount || 0;
          // Amount first, then date on new line
          rowData[monthName] = `$${amount}\n${paymentDate}`;
        } else {
          rowData[monthName] = '-';
        }
      });

      return rowData;
    });

    // Sort by bed number
    exportData.sort((a, b) => {
      const bedA = a['Bed No'];
      const bedB = b['Bed No'];

      // Handle N/A values
      if (bedA === 'N/A') return 1;
      if (bedB === 'N/A') return -1;

      // Compare bed numbers (assuming they might be numeric or alphanumeric)
      return String(bedA).localeCompare(String(bedB), undefined, { numeric: true });
    });

    // Renumber based on bed number - restart at 1 for each bed
    // And add blank rows after each bed group
    let currentBed: string | null = null;
    let bedCounter = 0;
    const finalData: any[] = [];

    exportData.forEach((row) => {
      const bedNo = row['Bed No'];

      // If bed number changes, restart counter
      if (bedNo !== currentBed) {
        // Add blank row before new bed group (except for the first group)
        if (currentBed !== null) {
          finalData.push({}); // Add blank row
        }
        currentBed = bedNo;
        bedCounter = 1;
      } else {
        bedCounter++;
      }

      row['No'] = bedCounter;
      finalData.push(row);
    });

    return finalData;
  };

  // Export function for Australia
  const handleExportAustralia = async () => {
    try {
      const { payments, supporters } = await fetchAllPaymentsForExport('bed-payments');
      const exportData = processDataForExport(supporters, payments);

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Apply styling to cells with different amounts
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

      // Get all month column headers
      const headers = Object.keys(exportData[0] || {});
      const monthColumns = headers.filter(h =>
        !['No', 'Supporter Name', 'Mobile No', 'Bed No', '', 'Fixed Amount'].includes(h)
      );

      // Style header row (row 0) - light blue background
      for (let C = 0; C <= range.e.c; C++) {
        const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[headerCell]) ws[headerCell] = { t: 's', v: '' };
        if (!ws[headerCell].s) ws[headerCell].s = {};
        ws[headerCell].s = {
          fill: {
            fgColor: { rgb: "B3D9FF" } // Light blue color for header
          },
          font: {
            bold: true
          }
        };
      }

      // Style each data row
      for (let R = 1; R <= range.e.r; R++) { // Start from 1 to skip header
        // Check if this is a blank row (all cells are empty)
        const firstCell = XLSX.utils.encode_cell({ r: R, c: 0 });
        const isBlankRow = !ws[firstCell] || !ws[firstCell].v;

        if (isBlankRow) {
          // Apply gray background to all cells in blank row
          for (let C = 0; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };
            if (!ws[cellAddress].s) ws[cellAddress].s = {};
            ws[cellAddress].s = {
              fill: {
                fgColor: { rgb: "D3D3D3" } // Gray color for blank rows
              }
            };
          }
        } else {
          // Fixed Amount is now at column index 5 (No, Name, Mobile, Bed, Empty, Fixed Amount)
          const fixedAmountCell = XLSX.utils.encode_cell({ r: R, c: 5 });
          const fixedAmount = parseFloat(ws[fixedAmountCell]?.v || 0);

          // Check each month column
          monthColumns.forEach((monthHeader) => {
            const colIndex = headers.indexOf(monthHeader);
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: colIndex });
            const cell = ws[cellAddress];

            if (cell && cell.v && cell.v !== '-') {
              // Extract amount from cell value (format: "$amount\ndate")
              const cellValue = String(cell.v);
              const amountMatch = cellValue.match(/\$(\d+\.?\d*)/);

              if (amountMatch) {
                const cellAmount = parseFloat(amountMatch[1]);

                // Compare with fixed amount - if payment amount is not equal to fixed amount, make it blue
                if (cellAmount !== fixedAmount) {
                  // Apply blue background
                  if (!cell.s) cell.s = {};
                  cell.s = {
                    fill: {
                      fgColor: { rgb: "ADD8E6" } // Light blue color
                    }
                  };
                }
              }
            }
          });
        }
      }

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Australia Payments');

      // Generate file name with date range
      const fileName = `Bed_Payments_Australia_${startDate}_to_${endDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exporting Australia data:', error);
      alert('Failed to export Australia payment data');
    }
  };

  // Export function for India
  const handleExportIndia = async () => {
    try {
      const { payments, supporters } = await fetchAllPaymentsForExport('bed-payments-ind');
      const exportData = processDataForExport(supporters, payments);

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Apply styling to cells with different amounts
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

      // Get all month column headers
      const headers = Object.keys(exportData[0] || {});
      const monthColumns = headers.filter(h =>
        !['No', 'Supporter Name', 'Mobile No', 'Bed No', '', 'Fixed Amount'].includes(h)
      );

      // Style header row (row 0) - light blue background
      for (let C = 0; C <= range.e.c; C++) {
        const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[headerCell]) ws[headerCell] = { t: 's', v: '' };
        if (!ws[headerCell].s) ws[headerCell].s = {};
        ws[headerCell].s = {
          fill: {
            fgColor: { rgb: "B3D9FF" } // Light blue color for header
          },
          font: {
            bold: true
          }
        };
      }

      // Style each data row
      for (let R = 1; R <= range.e.r; R++) { // Start from 1 to skip header
        // Check if this is a blank row (all cells are empty)
        const firstCell = XLSX.utils.encode_cell({ r: R, c: 0 });
        const isBlankRow = !ws[firstCell] || !ws[firstCell].v;

        if (isBlankRow) {
          // Apply gray background to all cells in blank row
          for (let C = 0; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };
            if (!ws[cellAddress].s) ws[cellAddress].s = {};
            ws[cellAddress].s = {
              fill: {
                fgColor: { rgb: "D3D3D3" } // Gray color for blank rows
              }
            };
          }
        } else {
          // Fixed Amount is now at column index 5 (No, Name, Mobile, Bed, Empty, Fixed Amount)
          const fixedAmountCell = XLSX.utils.encode_cell({ r: R, c: 5 });
          const fixedAmount = parseFloat(ws[fixedAmountCell]?.v || 0);

          // Check each month column
          monthColumns.forEach((monthHeader) => {
            const colIndex = headers.indexOf(monthHeader);
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: colIndex });
            const cell = ws[cellAddress];

            if (cell && cell.v && cell.v !== '-') {
              // Extract amount from cell value (format: "$amount\ndate")
              const cellValue = String(cell.v);
              const amountMatch = cellValue.match(/\$(\d+\.?\d*)/);

              if (amountMatch) {
                const cellAmount = parseFloat(amountMatch[1]);

                // Compare with fixed amount - if payment amount is not equal to fixed amount, make it blue
                if (cellAmount !== fixedAmount) {
                  // Apply blue background
                  if (!cell.s) cell.s = {};
                  cell.s = {
                    fill: {
                      fgColor: { rgb: "ADD8E6" } // Light blue color
                    }
                  };
                }
              }
            }
          });
        }
      }

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'India Payments');

      // Generate file name with date range
      const fileName = `Bed_Payments_India_${startDate}_to_${endDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exporting India data:', error);
      alert('Failed to export India payment data');
    }
  };

  return (
    <div className="flex flex-col items-center p-4">

      <div className="container mx-auto py-10">
        {/* Export Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleExportAustralia}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Export Australia Payments
          </button>
          <button
            onClick={handleExportIndia}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
          >
            Export India Payments
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-4 mb-4">
          {/* Search Input */}
          <div className="flex flex-col sm:flex-row justify-between gap-4"></div>

          {/* Date Range Filters */}
          <div className="flex gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="Search by name, phone number..."
                className="p-2 border rounded flex-grow max-w-md"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPageIndex(0);
                }}
                className="p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPageIndex(0);
                }}
                className="p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* <DataTable
          url="generous-payments"
          columns={paymentColumns}
          data={data}
          totalRows={totalRows}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          actions={{ delete: false, edit: false }}
        /> */}
      </div>
    </div>
  );
}