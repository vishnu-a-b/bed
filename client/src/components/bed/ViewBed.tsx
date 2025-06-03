"use client";
import { DataTable } from "@/components/dataTable/DataTable";
import { useState, useEffect, useCallback } from "react";
import { Axios } from "@/utils/api/apiAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { columns, Bed } from "./ColumnsBed";

export default function ViewBed() {
  const [data, setData] = useState<Bed[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const refresh: boolean = useSelector(
    (state: RootState) => state.update.refresh
  );
  const bedId: any = useSelector((state: RootState) => state.bed.id);
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
      let isActiveFilter = "";
      if (bedId) {
        const response = await Axios.get(`/bed/${bedId}`);
        let items = [];
        items[0] = response.data.data;
        setTotalRows(1);
        return items;
      }
    //   if (statusFilter === "Occupied") {
    //     isActiveFilter = "isOccupied__eq=true&";
    //   } else if (statusFilter === "Available") {
    //     isActiveFilter = "isOccupied__eq=false&";
    //   }
      
      let orgFilter = "";
    //   if (organizationId) {
    //     orgFilter = `organization__eq=${organizationId}&`;
    //   }

      const searchParam = debouncedSearch ? `search=${debouncedSearch}&` : "";
      const response = await Axios.get(
        `/bed?limit=${pageSize}&skip=${
          pageIndex * pageSize
        }&${orgFilter}${isActiveFilter}${searchParam}`
      );
      const items = response.data.data;

      setTotalRows(items.total);
      return items.items;
    } catch (error) {
      console.error("Error fetching bed data:", error);
    }
  }

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    async function fetchData() {
      const result = await getData();
      setData(result);
    }
    fetchData();
  }, [pageIndex, pageSize, debouncedSearch, statusFilter, refresh, bedId, organizationId]);

  return (
    <div className="flex flex-col items-center p-4">
      <div className="container mx-auto py-10">
        {/* Search Input */}
        <div className="flex justify-between">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search beds by patient or number..."
            className="mb-4 p-2 border rounded"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPageIndex(0);
            }}
            className={`mb-4 p-2 border border-gray-300 rounded`}
          >
            <option value="all">All Beds</option>
            <option value="Occupied">Occupied</option>
            <option value="Available">Available</option>
          </select>
        </div>
        <DataTable
          url="bed"
          columns={columns}
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