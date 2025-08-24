"use client";
import { DataTable } from "@/components/dataTable/DataTable";
import { useState, useEffect, useCallback } from "react";
import { Axios } from "@/utils/api/apiAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { paymentColumns, Payment } from "./PaymentColumns";
import PaymentStatsComponent from "./PaymentStatsComponent";

export default function ViewPayments() {
  const [data, setData] = useState<Payment[]>([]);
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

  // Fetch data from API
  async function getData() {
    try {
      if (paymentId) {
        const response = await Axios.get(`/bed-payments/${paymentId}&sort=-paymentDate`);
        let items = [];
        items[0] = response.data.data;
        setTotalRows(1);
        return items;
      }

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
      
      const limit = `limit=${pageSize}&`;
      const skip = `skip=${pageIndex * pageSize}&`;

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

      const response = await Axios.post(
        `/bed-payments?${limit}${skip}${statusParam}${paymentModeParam}${searchParam}sort=-paymentDate`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response);
      const items = response.data.data;

      setTotalRows(items.total || items.length);
      return items.items || items;
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

  return (
    <div className="flex flex-col items-center p-4">
      <PaymentStatsComponent />
      <div className="container mx-auto py-10">
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
{/* 
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Statuses</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPageIndex(0);
                }}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
                <option value="partially_refunded">Partially Refunded</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Payment Modes</label>
              <select
                value={paymentModeFilter}
                onChange={(e) => {
                  setPaymentModeFilter(e.target.value);
                  setPageIndex(0);
                }}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="all">All Payment Modes</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div> */}
          </div>
        </div>

        <DataTable
          url="generous-payments"
          columns={paymentColumns}
          data={data}
          totalRows={totalRows}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          actions={{ delete: false, edit: false }}
        />
      </div>
    </div>
  );
}