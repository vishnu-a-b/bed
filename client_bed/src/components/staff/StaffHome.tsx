"use client";
import React, { useState } from "react";

import ViewStaff from "./ViewStaff";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { RootState } from "@/lib/store";
import { clearStaffId, setStaffId } from "@/lib/slice/staffSlice";
import StaffForm from "./StaffAddAndUpdate";
import { clearUpdate } from "@/lib/slice/updateSlice";

export default function StaffHome() {
  const [showViewUser, setShowViewUser] = useState(true);
  const dispatch = useDispatch();
  const url: string | null = useSelector((state: RootState) => state.update.url);
  const id: string | null = useSelector((state: RootState) => state.update.id);
  
  const toggleView = () => {
    dispatch(clearStaffId());
    dispatch(clearUpdate())
    setShowViewUser(!showViewUser);
  };

  return (
    <div className="p-2 sm:p-4">
      <div className=" flex justify-between">
        <h1 className="text-lg font-semibold mb-2 text-bg2 flex justify-start">
          Staff
        </h1>
        {url==='staff' ? (
          ""
        ) : (
          <Button
            onClick={toggleView}
            className=" py-2 px-4 rounded-md hover:bg-bg2"
          >
            {showViewUser ? "Add Staff" : "View Staff"}
          </Button>
        )}
      </div>
      {url==='staff' ? (
       id && <StaffForm staffId={id} />
      ) : showViewUser ? (
        <ViewStaff />
      ) : (
        <StaffForm  />
      )}
    </div>
  );
}
