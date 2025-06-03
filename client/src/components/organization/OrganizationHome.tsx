"use client";
import React, { useState } from "react";

import ViewOrganization from "./ViewOrganization";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { RootState } from "@/lib/store";
import { clearOrganizationId, setOrganizationId } from "@/lib/slice/organizationSlice";

import { clearUpdate } from "@/lib/slice/updateSlice";
import OrganizationForm from "./OrganizationAddAndUpdate";

export default function OrganizationHome() {
  const [showViewOrganization, setShowViewOrganization] = useState(true);
  const dispatch = useDispatch();
  const url: string | null = useSelector((state: RootState) => state.update.url);
  const id: string | null = useSelector((state: RootState) => state.update.id);
  
  const toggleView = () => {
    dispatch(clearOrganizationId());
    dispatch(clearUpdate());
    setShowViewOrganization(!showViewOrganization);
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="flex justify-between">
        <h1 className="text-lg font-semibold mb-2 text-bg2 flex justify-start">
          Organizations
        </h1>
        {url === 'organization' ? (
          ""
        ) : (
          <Button
            onClick={toggleView}
            className="py-2 px-4 rounded-md hover:bg-bg2"
          >
            {showViewOrganization ? "Add Organization" : "View Organizations"}
          </Button>
        )}
      </div>
      {url === 'organization' ? (
       id && <OrganizationForm organizationId={id} />
      ) : showViewOrganization ? (
        <ViewOrganization />
      ) : (
        <OrganizationForm />
      )}
    </div>
  );
}