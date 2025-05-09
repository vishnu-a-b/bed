import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import DarkLightToggle from "../theme/DarkLightToggle";
import AsyncSelect from "react-select/async";
import { SidebarTrigger } from "../ui/sidebar";
import { fetchStaff } from "@/utils/api/fetchData";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  clearName,
  clearStaffId,
  clearUser,
  setName,
  setStaffId,
} from "@/lib/slice/staffSlice";

export default function Navbar() {
  const [staff, setStaff] = useState<any>();
  const organizationId: any = useSelector((state: RootState) => state.organization.id);
  const staffId: any = useSelector((state: RootState) => state.staff.id);
  const staffName: any = useSelector((state: RootState) => state.staff.name);
  const dispatch = useDispatch();

  const loadStaffOptions = async (inputValue: string) => {
    const response = await fetchStaff(inputValue, organizationId);
    return response.items.map((staff: any) => ({
      value: staff._id,
      label: staff.name,
    }));
  };

  // const loadStaff = async (inputValue: string) => {
  //   const response = await fetchSingleData(inputValue, "staff");
  //   console.log(response);
  //   if (response?.items?.id) {
  //     console
  //     setStaff({ value: response.items._id, label: response.items.name });
  //   } else {
  //     setStaff(null);
  //   }
  // };

  useEffect(() => {
    console.log(staffName)
    if (staffId && staffName) {
      setStaff({ value: staffId, label: staffName });
    } else {
      setStaff(null);
    }
  }, [staffId, staffName]);

  const handleStaffChange = (selectedOption: any) => {
    
    if (selectedOption) {
      dispatch(setStaffId(selectedOption.value));
      dispatch(setName(selectedOption.label));
    } else {
      dispatch(clearName());
      dispatch(clearStaffId());
    }
  };

  return (
    <div className=" bg-sidebar">
      <nav className="flex justify-between p-2 w-full items-center">
        <div className=" md:hidden sm:flex flex-nowrap">
          <SidebarTrigger />
        </div>
        <AsyncSelect
          className="min-w-60 z-50"
          cacheOptions
          loadOptions={loadStaffOptions}
          defaultOptions
          value={staff}
          placeholder="Select Staff"
          onChange={handleStaffChange}
          classNamePrefix="select"
          isClearable
        />
        <DarkLightToggle />
      </nav>
      <hr></hr>
    </div>
  );
}
