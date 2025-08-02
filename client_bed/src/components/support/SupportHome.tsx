"use client";
import React, { useState } from "react";

import ViewSupporter from "./ViewSupport";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { RootState } from "@/lib/store";
import { clearSupporterId, setSupporterId } from "@/lib/slice/supporterSlice";
import SupporterForm from "./SupportAddAndUpdate";
import { clearUpdate } from "@/lib/slice/updateSlice";

export default function SupporterHome() {
  const [showViewUser, setShowViewUser] = useState(true);
  const dispatch = useDispatch();
  const url: string | null = useSelector((state: RootState) => state.update.url);
  const id: string | null = useSelector((state: RootState) => state.update.id);
  
  const toggleView = () => {
    dispatch(clearSupporterId());
    dispatch(clearUpdate())
    setShowViewUser(!showViewUser);
  };

  return (
    <div className="p-2 sm:p-4">
      <div className=" flex justify-between">
        <h1 className="text-lg font-semibold mb-2 text-bg2 flex justify-start">
        Supporters
        </h1>
        {url==='supporter' ? (
          ""
        ) : (
          <Button
            onClick={toggleView}
            className=" py-2 px-4 rounded-md hover:bg-bg2"
          >
            {showViewUser ? "Add Supporters" : "View Supporter"}
          </Button>
        )}
      </div>
      {url==='supporter' ? (
       id && <SupporterForm supporterId={id} />
      ) : showViewUser ? (
        <ViewSupporter />
      ) : (
        <SupporterForm  />
      )}
    </div>
  );
}
