"use client";
import { DataTable } from "@/components/dataTable/DataTable";
import { useState, useEffect, useCallback } from "react";
import { Axios } from "@/utils/api/apiAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { paymentColumns, Payment } from "./PaymentColumns";
import PaymentStatsComponent from "./PaymentStatsComponent";

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

  return (
    <div className="flex flex-col items-center p-4">
      
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