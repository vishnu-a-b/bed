"use client";
import { DataTable } from "@/components/dataTable/DataTable";
import { useState, useEffect, useCallback } from "react";
import { Axios } from "@/utils/api/apiAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { columns, Employee } from "./ColumnsSupport";
import AsyncSelect from "react-select/async";
import { loadBedOptions } from "@/utils/api/loadSelectData";
import { selectRole } from "@/lib/slice/authSlice";

interface BedData {
  country: any;
  id: string;
  bedNo: string;
  fixedAmount: number;
  currency: string;
  amount: number;
}

export default function ViewSupporter() {
  const [data, setData] = useState<Employee[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [bed, setBed] = useState<any>();
  const [bedData, setBedData] = useState<BedData | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const refresh: boolean = useSelector(
    (state: RootState) => state.update.refresh
  );
  const supporterId: any = useSelector(
    (state: RootState) => state.supporter.id
  );
  const role=useSelector(selectRole);
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

  const handleBedChange = async (selectedOption: any) => {
    setBed(selectedOption);
    setPageIndex(0);
    
    if (selectedOption && selectedOption.id) {
      try {
        const response = await Axios.get(`/bed/${selectedOption.id}`);
        setBedData(response.data.data);
      } catch (error) {
        console.error("Error fetching bed data:", error);
        setBedData(null);
      }
    } else {
      setBedData(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  // Fetch data from API
  async function getData() {
    try {
      let isActiveFilter = "";
      if (supporterId) {
        const response = await Axios.get(`/supporter/${supporterId}`);
        let items = [];
        items[0] = response.data.data;
        setTotalRows(1);
        return items;
      }
      if (statusFilter === "Active") {
        isActiveFilter = "isActive__eq=true&";
      } else if (statusFilter === "InActive") {
        isActiveFilter = "isActive__eq=false&";
      }
      const searchParam = debouncedSearch && !bed ? `search=${debouncedSearch}&` : "";
      let bedFilter = "";
      if (bed && bed.id) {
        bedFilter = `bed__eq=${bed.id}&`;
      }
      const limit = bed && bed.id ? '' : `limit=${pageSize}&`;
      const skip = bed && bed.id ? '' : `skip=${pageIndex * pageSize}&`;
      
      const response = await Axios.get(
        `/supporter?${limit}${skip}${bedFilter}${isActiveFilter}${searchParam}`
      );
      const items = response.data.data;
      console.warn("Fetched items:", items);

      setTotalRows(items.total || items.length);
      return items.items || items;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  // Calculate total contribution amount
  const totalContribution = data.reduce((sum, supporter) => {
    return sum + (supporter.amount || 0);
  }, 0);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    async function fetchData() {
      const result = await getData();
      setData(Array.isArray(result) ? result : []);
    }
    fetchData();
  }, [
    pageIndex,
    pageSize,
    debouncedSearch,
    statusFilter,
    refresh,
    supporterId,
    bed
  ]);

  return (
    <div className="flex flex-col items-center p-4">
      <div className="container mx-auto py-10">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-2 flex-wrap">
          {/* Search Input */}
          

          {/* Bed Selector */}
          <div className="w-full md:flex-1 min-w-[200px]">
            <AsyncSelect
              cacheOptions
              loadOptions={loadBedOptions}
              defaultOptions
              value={bed}
              onChange={handleBedChange}
              className="w-full"
              classNamePrefix="select"
              required
              isClearable
              placeholder="Select Bed"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageIndex(0);
              }}
              className="p-2 border border-gray-300 rounded w-full md:w-[150px]"
              disabled={!!bed}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="InActive">InActive</option>
            </select>
          </div>
        </div>

        {/* Combined Bed Info Card - Only shown when a bed is selected */}
        {bedData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Bed {bed.label}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="font-medium text-gray-600 text-sm">Total Donations</h3>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {bedData.country.currency} {bedData?.fixedAmount}
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-medium text-gray-600 text-sm">Target Amount</h3>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {bedData.country.currency} {bedData.amount}
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <h3 className="font-medium text-gray-600 text-sm">Contributors ({data.length})</h3>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {bedData.country.currency} {totalContribution}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-medium text-gray-600 text-sm">Amount Needed</h3>
                <p className="text-2xl font-bold text-blue-600 mt-1">{bedData.country.currency} {bedData.amount-totalContribution}</p>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <DataTable
          url="supporter"
          columns={columns}
          data={data}
          totalRows={totalRows}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          actions={{ delete: role==='super-admin' , edit: role==='super-admin' }}
        />
      </div>
    </div>
  );
}