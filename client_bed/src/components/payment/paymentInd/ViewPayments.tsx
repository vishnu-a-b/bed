"use client";
import { DataTable } from "@/components/dataTable/DataTable";
import { useState, useEffect, useCallback } from "react";
import { Axios } from "@/utils/api/apiAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { paymentColumns, Payment } from "./PaymentColumns";

export default function ViewPayments() {
  const [data, setData] = useState<Payment[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentModeFilter, setPaymentModeFilter] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const refresh: boolean = useSelector(
    (state: RootState) => state.update.refresh
  );
  const paymentId: any = useSelector((state: RootState) => state.payment.id);
  const organizationId: any = useSelector(
    (state: RootState) => state.organization.id
  );

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
        const response = await Axios.get(`/payment/${paymentId}`);
        let items = [];
        items[0] = response.data.data;
        setTotalRows(1);
        return items;
      }

      let statusParam = "";
      if (statusFilter !== "all") {
        statusParam = `status__eq=${statusFilter.toLowerCase()}&`;
      }

      let paymentModeParam = "";
      if (paymentModeFilter !== "all") {
        paymentModeParam = `paymentMode__eq=${paymentModeFilter}&`;
      }

      const searchParam = debouncedSearch ? `search=${debouncedSearch}&` : "";
      const response = await Axios.get(
        `/payment?limit=${pageSize}&skip=${
          pageIndex * pageSize
        }&${statusParam}${paymentModeParam}${searchParam}`
      );
      const items = response.data.data;

      setTotalRows(items.total);
      return items.items;
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
  }, [pageIndex, pageSize, debouncedSearch, statusFilter, paymentModeFilter, refresh, paymentId]);

  return (
    <div className="flex flex-col items-center p-4">
      <div className="container mx-auto py-10">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search payments..."
            className="p-2 border rounded flex-grow max-w-md"
          />
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageIndex(0);
              }}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="all">All Statuses</option>
              <option value="captured">Captured</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={paymentModeFilter}
              onChange={(e) => {
                setPaymentModeFilter(e.target.value);
                setPageIndex(0);
              }}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="all">All Modes</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        <DataTable
          url="payment"
          columns={paymentColumns}
          data={data}
          totalRows={totalRows}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          actions={{ delete: true, edit: true }}
        />
      </div>
    </div>
  );
}