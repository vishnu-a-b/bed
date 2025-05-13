"use client";
import React, { useState } from "react";

import ViewCountry from "./ViewCountry";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { RootState } from "@/lib/store";
import { clearCountryId, setCountryId } from "@/lib/slice/countrySlice";
import AddAndUpdateCountry from "./AddAndUpdateCountry";
import { clearUpdate } from "@/lib/slice/updateSlice";

export default function CountryHome() {
  const [showViewCountry, setShowViewCountry] = useState(true);
  const dispatch = useDispatch();
  const url: string | null = useSelector((state: RootState) => state.update.url);
  const id: string | null = useSelector((state: RootState) => state.update.id);
  
  const toggleView = () => {
    dispatch(clearCountryId());
    dispatch(clearUpdate());
    setShowViewCountry(!showViewCountry);
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="flex justify-between">
        <h1 className="text-lg font-semibold mb-2 text-bg2 flex justify-start">
          Countries
        </h1>
        {url === 'country' ? (
          ""
        ) : (
          <Button
            onClick={toggleView}
            className="py-2 px-4 rounded-md hover:bg-bg2"
          >
            {showViewCountry ? "Add Country" : "View Countries"}
          </Button>
        )}
      </div>
      {url === 'country' ? (
       id && <AddAndUpdateCountry countryId={id} />
      ) : showViewCountry ? (
        <ViewCountry />
      ) : (
        <AddAndUpdateCountry />
      )}
    </div>
  );
}