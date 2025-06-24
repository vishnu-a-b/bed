"use client";
import { BedDouble, Check} from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import DonationForm from "./donationForm";
import Link from "next/link";


export default function Page() {
  
  const [selectedBeds, setSelectedBeds] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [data, setData] = React.useState<any>([]);
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const country = searchParams.get("country");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios(
          `${API_URL}/supporter/get-country-data/${country}`
        );
        console.log(response.data);
        setData(response?.data);
        setSelectedBeds(response?.data?.beds[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-full">
            <p className="text-lg font-medium text-slate-700">Loading...</p>
          </div>
        </div>
      </section>
    );
  } else {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="border-b border-slate-100 p-6">
                <h2 className="text-xl font-medium text-slate-700">
                  {data?.countryName}
                </h2>
                <p className="text-slate-500 text-sm mt-1">Click to select</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
                {data.totalBedsInCountry > 0 &&
                  data.beds.map((bed: any) => {
                    const isSelected = bed.bedNo === selectedBeds.bedNo;
                    return (
                      <div
                        key={bed.bedId}
                        onClick={() => setSelectedBeds(bed)}
                        className={`relative cursor-pointer transition-all duration-300 ease-in-out
                      ${
                        isSelected
                          ? "bg-blue-50 border-blue-500 shadow-md transform scale-105"
                          : "bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                      } 
                      border-2 h-36 rounded-xl flex flex-col items-center justify-center`}
                      >
                        <BedDouble
                          className={`w-12 h-12 transition-colors duration-300 ${
                            isSelected ? "text-blue-500" : "text-slate-500"
                          }`}
                        />
                        <p
                          className={`mt-2 font-medium text-sm ${
                            isSelected ? "text-blue-700" : "text-slate-600"
                          }`}
                        >
                          Bed #{bed.bedNo}
                        </p>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-slate-600">
                            Progress :
                          </span>
                          <span className="text-sm font-medium text-slate-600">
                            {(
                              (bed?.totalAmountFromSupporters /
                                bed?.totalAmountOfTheBed) *
                              100
                            ).toFixed(2)}
                            %
                          </span>
                        </div>
                        <div className=" w-full bg-gray-200 rounded-full h-2.5 ">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full "
                            style={{
                              width: `${(
                                (bed?.totalAmountFromSupporters /
                                  bed?.totalAmountOfTheBed) *
                                100
                              ).toFixed(2)}%`,
                            }}
                          ></div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
            {selectedBeds && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="border-b border-slate-100 p-6">
                  <h2 className="text-xl font-medium text-slate-700">
                    Donation Summary
                  </h2>
                </div>

                <div className="p-6 flex flex-col">
                  <div className="flex-grow space-y-6">
                    {selectedBeds && (
                      <div className="py-3 px-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium">
                          Selected: Bed {selectedBeds.bedNo}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <p className="text-slate-600">
                        Total Donations Received :{" "}
                        {selectedBeds.totalNoOfSupportersByBed}
                      </p>
                      <Link
                        className="bg-blue-600 py-1 text-xs rounded-lg text-white md:p-2"
                        href={`/bed?bed=${selectedBeds?.bedId}`}
                      >
                        View details
                      </Link>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <p className="text-slate-600">Target Amount:</p>
                      <p className="font-medium text-slate-800">
                        {data?.currency +
                          " " +
                          selectedBeds.totalAmountOfTheBed}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <p className="text-slate-600">Amount Collected So Far:</p>
                      <p className="font-medium text-slate-800">
                        {data?.currency +
                          " " +
                          selectedBeds.totalAmountFromSupporters}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <p className="text-lg font-medium text-slate-700">
                        Amount Still Needed:
                      </p>
                      <div className="text-xl font-bold text-blue-600">
                        {data?.currency +
                          " " +
                          (selectedBeds.totalAmountOfTheBed -
                            selectedBeds.totalAmountFromSupporters)}
                      </div>
                    </div>
                  </div>

                  <div className=" flex justify-between gap-4 items-center pt-4 text-lg">
                    <Dialog>
                      <DialogTrigger
                        className={`w-full py-4 rounded-xl font-medium transition-all duration-300
                    bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200`}
                      >
                        Commit to Care
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogDescription>
                            <DonationForm bed={selectedBeds?.bedId} />
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
}
