"use client";
import React, { useState } from "react";
import ViewBed from "./ViewBed";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { RootState } from "@/lib/store";
import { clearBedData, setBedId } from "@/lib/slice/bedSlice";
import AddAndUpdateBed from "./AddAndUpdateBed";
import { clearUpdate } from "@/lib/slice/updateSlice";

export default function BedHome() {
  const [showViewBed, setShowViewBed] = useState(true);
  const dispatch = useDispatch();
  const url: string | null = useSelector((state: RootState) => state.update.url);
  const id: string | null = useSelector((state: RootState) => state.update.id);
  
  const toggleView = () => {
    dispatch(clearBedData());
    dispatch(clearUpdate());
    setShowViewBed(!showViewBed);
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="flex justify-between">
        <h1 className="text-lg font-semibold mb-2 text-bg2 flex justify-start">
          Beds Management
        </h1>
        {url === 'bed' ? (
          ""
        ) : (
          <Button
            onClick={toggleView}
            className="py-2 px-4 rounded-md hover:bg-bg2"
          >
            {showViewBed ? "Add Bed" : "View Beds"}
          </Button>
        )}
      </div>
      {url === 'bed' ? (
       id && <AddAndUpdateBed bedId={id} />
      ) : showViewBed ? (
        <ViewBed />
      ) : (
        <AddAndUpdateBed />
      )}
    </div>
  );
}