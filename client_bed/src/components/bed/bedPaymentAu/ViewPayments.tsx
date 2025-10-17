"use client";
import { DataTable } from "@/components/dataTable/DataTable";
import { useState, useEffect, useCallback } from "react";
import { Axios } from "@/utils/api/apiAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { paymentColumns, Payment } from "./PaymentColumns";
import PaymentStatsComponent from "./PaymentStatsComponent";
import { selectRole } from "@/lib/slice/authSlice";

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
  const role = useSelector(selectRole);
  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set time to 23:59:59.999
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
        const response = await Axios.get(
          `/bed-payments/${paymentId}&sort=-paymentDate`
        );
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
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          endDate: endDate
            ? (() => {
                const date = new Date(endDate);
                date.setHours(23, 59, 59, 999);
                return date.toISOString();
              })()
            : undefined,
        },
      };
      console.log(`/bed-payments?${limit}${skip}${statusParam}${paymentModeParam}${searchParam}sort=-paymentDate`)
      const response = await Axios.post(
        `/bed-payments?${limit}${skip}${statusParam}${paymentModeParam}${searchParam}sort=-paymentDate`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("hai",response);

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
        <div className="flex flex-col gap-4 mb-6">
          {/* Search Input Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col flex-grow">
              <label className="text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="Search by supporter name, mobile, bed number, email..."
                className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <span className="text-xs text-gray-500 mt-1">
                Search in: Supporter name, mobile number, bed number, email,
                receipt number
              </span>
            </div>
          </div>

          {/* Filter Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPageIndex(0);
                }}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPageIndex(0);
                }}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="completed">✅ Completed</option>
                <option value="pending">⏳ Pending</option>
                <option value="failed">❌ Failed</option>
                <option value="cancelled">🚫 Cancelled</option>
                <option value="refunded">💰 Refunded</option>
                <option value="partially_refunded">
                  💸 Partially Refunded
                </option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Payment Mode</label>
              <select
                value={paymentModeFilter}
                onChange={(e) => {
                  setPaymentModeFilter(e.target.value);
                  setPageIndex(0);
                }}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="all">All Payment Modes</option>
                <option value="online">💻 Online</option>
                <option value="offline">🏪 Offline</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setStatusFilter("completed");
                setPageIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === "completed"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => {
                setStatusFilter("pending");
                setPageIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === "pending"
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => {
                setStatusFilter("failed");
                setPageIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === "failed"
                  ? "bg-red-100 text-red-800 border border-red-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Failed
            </button>
            <button
              onClick={() => {
                setStatusFilter("all");
                setPaymentModeFilter("all");
                setSearchTerm("");
                setDebouncedSearch("");
                setStartDate(""); // Clear start date
                setEndDate(""); // Clear end date
                setPageIndex(0);
              }}
              className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        <DataTable
          url="bed-payments"
          columns={paymentColumns}
          data={data}
          totalRows={totalRows}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          actions={{
            delete: role === "superAdmin",
            edit: role === "superAdmin",
          }}
        />
      </div>
    </div>
  );
}
