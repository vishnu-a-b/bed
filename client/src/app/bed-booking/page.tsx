"use client";
import { BedDouble, Check } from "lucide-react";
import React, { useState } from "react";

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
              {new Array(12).fill(0).map((_, index) => {
                const isSelected = selectedBeds.includes(index);
                return (
                  <div
                    key={index}
                    onClick={() => handleBedClick(index)}
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
                      Bed #{index + 1}
                    </p>

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
                    <p className="text-sm text-blue-700 font-medium">
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
                  <div className="text-xl font-bold text-blue-600">
                    ${totalAmount}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-10">
                <button
                  className={`w-full py-4 rounded-xl font-medium transition-all duration-300
                    ${
                      selectedBeds.length > 0
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  disabled={selectedBeds.length === 0}
                >
                  Continue to Checkout
                </button>

                <p className="text-xs text-center text-slate-500 mt-4">
                  By continuing, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
