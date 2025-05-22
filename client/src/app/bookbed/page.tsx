"use client";
import { BedDouble, Check } from "lucide-react";
import React, { useState } from "react";
import CheckoutButton from "./checkout";
import Link from "next/link";

export default function Page() {
  const [selectedBeds, setSelectedBeds] = useState<any>([]);
  const pricePerBed = 149;

  const handleBedClick = (index: any) => {
    setSelectedBeds((prev: any) =>
      prev.includes(index)
        ? prev.filter((bedIndex: any) => bedIndex !== index)
        : [...prev, index]
    );
  };

  const totalAmount = selectedBeds.length * pricePerBed;

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-xl font-medium text-slate-700">
                Available Beds
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Click to select or deselect
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
              {new Array(15).fill(0).map((_, index) => {
                const isSelected = selectedBeds.includes(index);
                return (
                  <div
                    key={index}
                    onClick={() => handleBedClick(index)}
                    className={`relative cursor-pointer transition-all duration-300 ease-in-out
                      ${
                        isSelected
                          ? "bg-blue-50 border-green-500 shadow-md transform scale-105"
                          : "bg-slate-50 border-slate-200 hover:border-green-300 hover:bg-green-50"
                      } 
                      border-2 h-36 rounded-xl flex flex-col items-center justify-center`}
                  >
                    <BedDouble
                      className={`w-12 h-12 transition-colors duration-300 ${
                        isSelected ? "text-green-500" : "text-slate-500"
                      }`}
                    />
                    <p
                      className={`mt-2 font-medium text-sm flex flex-col items-center justify-center ${
                        isSelected ? "text-green-700" : "text-slate-600"
                      }`}
                    >
                      Bed #{index + 1}
                      {isSelected && (
                        <Link
                          className="border rounded-2xl px-2 py-1 border-green-900 text-xs border-dashed mt-1"
                          href={`/bookbed/bed-details?bed_id=${index + 1}`}
                        >
                          Show Donations
                        </Link>
                      )}
                    </p>

                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-xl font-medium text-slate-700">
                Booking Summary
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Review your selection
              </p>
            </div>

            <div className="p-6 flex flex-col">
              <div className="flex-grow space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600">Selected Beds:</p>
                  <p className="font-medium text-slate-800">
                    {selectedBeds.length}
                  </p>
                </div>

                {selectedBeds.length > 0 && (
                  <div className="py-3 px-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                      Selected:{" "}
                      {selectedBeds.map((bed: any) => `#${bed + 1}`).join(", ")}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <p className="text-slate-600">Price per bed:</p>
                  <p className="font-medium text-slate-800">${pricePerBed}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <p className="text-lg font-medium text-slate-700">
                    Total Amount:
                  </p>
                  <div className="text-xl font-bold text-green-600">
                    ${totalAmount}
                  </div>
                </div>
              </div>

              <CheckoutButton selectedBeds={selectedBeds} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
