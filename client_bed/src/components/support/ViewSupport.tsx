"use client";
import { DataTable } from "@/components/dataTable/DataTable";
import { useState, useEffect, useCallback } from "react";
import { Axios } from "@/utils/api/apiAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { columns, Employee } from "./ColumnsSupport";
import AsyncSelect from "react-select/async";
import { loadBedOptions, loadCountryOptions } from "@/utils/api/loadSelectData";
import { selectRole } from "@/lib/slice/authSlice";
import { Label } from "../ui/label";

interface BedData {
  country: any;
  id: string;
  bedNo: string;
  fixedAmount: number;
  currency: string;
  amount: number;
}

interface CountryData {
  country: string;
  currency: string;
  totalSupporters: number;
  activeSupporters: number;
  thisDaySupporters: number;
  thisMonthSupporters: number;
  thisWeekSupporters: number;
  totalAmount: number;
  thisDayAmount: number;
  thisMonthAmount: number;
  thisWeekAmount: number;
}

interface OrganizationData {
  organizationId: string;
  organizationName: string;
  data: CountryData[];
  totalSupporters: number;
  activeSupporters: number;
  thisDaySupporters: number;
  thisMonthSupporters: number;
  thisWeekSupporters: number;
  totalAmount: number;
  thisDayAmount: number;
  thisMonthAmount: number;
  thisWeekAmount: number;
}

interface SupporterHeadData {
  success: boolean;
  data: OrganizationData[];
  totalSupporters?: number;
  activeSupporters?: number;
  thisMonthSupporters?: number;
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
  const [country, setCountry] = useState<any>();
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 2);
    return firstDayOfMonth.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [supporterHeadData, setSupporterHeadData] =
    useState<SupporterHeadData | null>(null);

  const refresh: boolean = useSelector(
    (state: RootState) => state.update.refresh
  );
  const supporterId: any = useSelector(
    (state: RootState) => state.supporter.id
  );
  const role = useSelector(selectRole);

  const handleCountryChange = (selectedOption: any) => {
    if (!selectedOption) {
      setCountry(null);
    } else {
      setCountry({ value: selectedOption.id, label: selectedOption.label });
    }
  };

  // Reusable Stat Card Component
  type StatCardColor = "blue" | "green" | "purple" | "yellow";
  interface StatCardProps {
    title: string;
    value: number | string;
    color: StatCardColor;
    icon: "users" | "user-check" | "calendar" | "clock";
  }
  const StatCard = ({ title, value, color, icon }: StatCardProps) => {
    const colors: Record<
      StatCardColor,
      { bg: string; text: string; border: string }
    > = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-100",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-600",
        border: "border-green-100",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-100",
      },
      yellow: {
        bg: "bg-yellow-50",
        text: "text-yellow-600",
        border: "border-yellow-100",
      },
    };

    const icons = {
      users: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      ),
      "user-check": (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      calendar: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      ),
      clock: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    };

    return (
      <div
        className={`${colors[color].bg} p-3 rounded-lg border ${colors[color].border} flex items-start`}
      >
        <div className="mr-2 mt-0.5">
          <svg
            className={`w-5 h-5 ${colors[color].text}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {icons[icon]}
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-gray-600 text-xs">{title}</h3>
          <p className={`text-xl font-bold ${colors[color].text}`}>{value}</p>
        </div>
      </div>
    );
  };

  // Compact Country Card Component
  const CountryCard = ({ country }: any) => (
    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800">
          {country.country}{" "}
          <span className="text-gray-500 text-xs">({country.currency})</span>
        </h4>
        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
          {country.totalSupporters} total
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1 text-xs">
        <StatItem label="Active" value={country.activeSupporters} />
        <StatItem label="Month" value={country.thisMonthSupporters} />
        <StatItem label="Week" value={country.thisWeekSupporters} />
        <StatItem label="Today" value={country.thisDaySupporters} />
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-2 gap-1 text-xs">
        <StatItem
          label="Total"
          value={`${country.currency} ${country.totalAmount}`}
        />
        <StatItem
          label="Month"
          value={`${country.currency} ${country.thisMonthAmount}`}
        />
        <StatItem
          label="Week"
          value={`${country.currency} ${country.thisWeekAmount}`}
        />
        <StatItem
          label="Today"
          value={`${country.currency} ${country.thisDayAmount}`}
        />
      </div>
    </div>
  );

  // Reusable Stat Item Component
  const StatItem = ({ label, value }: any) => (
    <div className="truncate">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium ml-1">{value}</span>
    </div>
  );

  // Fetch supporter head data
  const fetchSupporterHeadData = useCallback(async () => {
    try {
      const response = await Axios.get("supporter/supporter-head");
      console.log("Supporter Head Data:", response.data);
      const headData = response.data as SupporterHeadData;

      // Calculate totals across all organizations and countries
      let totalSupporters = 0;
      let activeSupporters = 0;
      let thisMonthSupporters = 0;
      let thisWeekSupporters = 0;
      let totalAmount = 0;
      let thisMonthAmount = 0;
      let thisWeekAmount = 0;

      headData.data.forEach((org) => {
        totalSupporters += org.totalSupporters;
        activeSupporters += org.activeSupporters;
        thisMonthSupporters += org.thisMonthSupporters;
        thisWeekSupporters += org.thisWeekSupporters;
        totalAmount += org.totalAmount;
        thisMonthAmount += org.thisMonthAmount;
        thisWeekAmount += org.thisWeekAmount;

        org.data.forEach((countryData) => {
          // These are already included in the organization totals
        });
      });

      setSupporterHeadData({
        ...headData,
        totalSupporters,
        activeSupporters,
        thisMonthSupporters,
      });
    } catch (error) {
      console.error("Error fetching supporter head data:", error);
    }
  }, []);

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
      const searchParam =
        debouncedSearch && !bed ? `search=${debouncedSearch}&` : "";
      let bedFilter = "";
      if (bed && bed.id) {
        bedFilter = `bed__eq=${bed.id}&`;
      }
      const limit = bed && bed.id ? "" : `limit=${pageSize}&`;
      const skip = bed && bed.id ? "" : `skip=${pageIndex * pageSize}&`;

      // Only include dates in filters if no bed is selected
      const requestBody = {
        filters: {
          ...(!bed && {
            startDate: startDate
              ? new Date(startDate).toISOString()
              : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
          }),
        },
      };

      const response = await Axios.post(
        `/supporter/get?limit=Infinity&${skip}${bedFilter}${isActiveFilter}${searchParam}sortBy=createdAt`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let items = response.data.data.items || response.data.data;
      let bedI = items.map((i:any)=>{
       return {name:i.name,
        bedNo:i.bed.bedNo,
        amount:i.amount}
      })
      console.log(bedI)
      // Apply country filter if country is selected
      if (country && country.value) {
        items = items.filter(
          (supporter:any) =>
            supporter.bed &&
            supporter.bed.country &&
            supporter.bed.country._id === country.value
        );
      }
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
    fetchSupporterHeadData();
  }, [
    pageIndex,
    pageSize,
    debouncedSearch,
    statusFilter,
    refresh,
    supporterId,
    bed,
    startDate,
    endDate,
    country,
  ]);

  return (
    <div className="flex flex-col items-center p-4">
      <div className="container mx-auto py-10">
        {/* Supporter Head Stats - Only shown when no bed is selected */}
        {!bed && supporterHeadData && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100">
            <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Supporter Overview
            </h2>

            {/* Compact Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <StatCard
                title="Total Supporters"
                value={supporterHeadData.totalSupporters ?? 0}
                color="blue"
                icon="users"
              />
              <StatCard
                title="Active Supporters"
                value={supporterHeadData.activeSupporters ?? 0}
                color="green"
                icon="user-check"
              />
              <StatCard
                title="New This Month"
                value={supporterHeadData.thisMonthSupporters ?? 0}
                color="purple"
                icon="calendar"
              />
              <StatCard
                title="New This Week"
                value={supporterHeadData.data.reduce(
                  (weekSum, org) => weekSum + org.thisWeekSupporters,
                  0
                )}
                color="yellow"
                icon="clock"
              />
            </div>

            {/* Accordion-style Organization Breakdown */}
            <div className="space-y-3">
              {supporterHeadData.data.map((org) => (
                <details key={org.organizationId} className="group">
                  <summary className="flex justify-between items-center p-2 cursor-pointer bg-gray-50 rounded-lg hover:bg-gray-100">
                    <h3 className="text-md font-medium text-gray-700">
                      {org.organizationName} Summary
                    </h3>
                    <svg
                      className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                    {org.data.map((country, index) => (
                      <CountryCard key={index} country={country} />
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-2 flex-wrap">
          {/* Date Range Filters - Only show when no bed is selected */}
          {!bed && (
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPageIndex(0);
                  }}
                  className="p-2 border border-gray-300 rounded w-full"
                  max={endDate}
                />
              </div>
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPageIndex(0);
                  }}
                  className="p-2 border border-gray-300 rounded w-full"
                  min={startDate}
                />
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="country">Country</Label>
            <AsyncSelect
              cacheOptions
              loadOptions={loadCountryOptions}
              defaultOptions
              value={country}
              onChange={handleCountryChange}
              classNamePrefix="select"
              isClearable
            />
          </div>
          {/* Bed Selector */}
          <div className="w-full md:flex-1 min-w-[200px]">
            <Label htmlFor="bed">Bed</Label>
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
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Bed {bed.label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="font-medium text-gray-600 text-sm">
                  Total Donations
                </h3>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {bedData.country.currency} {bedData?.fixedAmount}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-medium text-gray-600 text-sm">
                  Target Amount
                </h3>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {bedData.country.currency} {bedData.amount}
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <h3 className="font-medium text-gray-600 text-sm">
                  Contributors ({data.length})
                </h3>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {bedData.country.currency} {totalContribution}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-medium text-gray-600 text-sm">
                  Amount Needed
                </h3>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {bedData.country.currency}{" "}
                  {bedData.amount - totalContribution}
                </p>
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
          actions={{
            delete: role === "superAdmin",
            edit: role === "superAdmin",
          }}
        />
      </div>
    </div>
  );
}
