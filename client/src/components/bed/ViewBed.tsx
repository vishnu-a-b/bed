"use client";
import { DataTable } from "@/components/dataTable/DataTable";
import { useState, useEffect, useCallback } from "react";
import { Axios } from "@/utils/api/apiAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { columns, Bed } from "./ColumnsBed";
import AsyncSelect from "react-select/async";
import { loadOrganizationOptions } from "@/utils/api/loadSelectData";
import { selectRole } from "@/lib/slice/authSlice";

export default function ViewBed() {
  const [data, setData] = useState<Bed[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [organization, setOrganization] = useState<any>();
  const role=useSelector(selectRole);
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
  const handleOrganizationChange = (selectedOption: any) => {
    if (!selectedOption) {
      setOrganization(null);
    } else {
      setOrganization({
        value: selectedOption.id,
        label: selectedOption.label,
      });
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
      if (organization && organization.value) {
        orgFilter = `organization__eq=${organization.value}&`;
      }

      const searchParam = debouncedSearch ? `search=${debouncedSearch}&` : "";
      console.log(
        `/bed?limit=${pageSize}&skip=${
          pageIndex * pageSize
        }&${orgFilter}${isActiveFilter}${searchParam}`
      );
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
  }, [
    pageIndex,
    pageSize,
    debouncedSearch,
    statusFilter,
    refresh,
    bedId,
    organizationId,
    organization,
  ]);

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
          <AsyncSelect
            cacheOptions
            loadOptions={loadOrganizationOptions}
            defaultOptions
            value={organization}
            onChange={handleOrganizationChange}
            classNamePrefix="select"
            isClearable
          />
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
          actions={{ delete: role==='superAdmin' , edit: role==='superAdmin' }}
        />
      </div>
    </div>
  );
}
