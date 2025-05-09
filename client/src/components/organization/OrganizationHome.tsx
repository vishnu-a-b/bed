"use client";
import { RootState } from "@/lib/store";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import OrganizationForm from "./OrganizationAddAndUpdate";
import { setUpdateId } from "@/lib/slice/updateSlice";
import Link from "next/link";

export default function OrganizationHome() {
  const [update, setUpdate] = useState(false);
  const id: string | null = useSelector(
    (state: RootState) => state.organization.id
  );
  const updateId: string | null = useSelector(
    (state: RootState) => state.update.id
  );

  const dispatch = useDispatch();

  return (
    <>
      {id && !updateId ? (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={() => {dispatch(setUpdateId(id));setUpdate(true)}}>Update Organization</Button>
          </div>

          {/* Add here */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-black">
            {/* Department */}
            <div className="p-6 bg-green-50 rounded-lg shadow  hover:bg-green-100">
              <h3 className="text-lg font-bold mb-2">Department</h3>
              <p className="text-gray-600">Manage and view departments.</p>
              <Button className="mt-4"><Link href={'/super-admin/department'}>View</Link></Button>
            </div>

            {/* Staff Present */}
            <div className="p-6 bg-green-50 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2">Staff Present</h3>
              <p className="text-gray-600">Check current staff attendance.</p>
              <Button className="mt-4"><Link href={'/super-admin/attendance'}>View</Link></Button>
            </div>

            {/* Track */}
            <div className="p-6 bg-green-50 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2">Track</h3>
              <p className="text-gray-600">Monitor staff activities.</p>
              <Button className="mt-4"><Link href={'/super-admin/geo'}>Track</Link></Button>
            </div>

            {/* Leave List */}
            <div className="p-6 bg-green-50 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2">Leave List</h3>
              <p className="text-gray-600">View staff leave requests.</p>
              <Button className="mt-4"><Link href={'/super-admin/leaves'}>View</Link></Button>
            </div>
          </div>
        </>
      ) : id && updateId ? (
        <OrganizationForm organizationId={id} />
      ) : (
        <OrganizationForm />
      )}
    </>
  );
}
