import { BedDouble } from "lucide-react";
import React from "react";

export default function page() {
  return (
    <section className="">
      <div className="grid grid-cols-2 px-20">
        <div className="border p-8 rounded-2xl flex flex-col justify-center items-center">
          <h2 className="text-zinc-400">Click on Bed to select/deselect</h2>
          <div className="grid grid-cols-3 gap-2 w-full mt-4">
            {new Array(12).fill(0).map((_, index) => {
              return (
                <div
                  key={index}
                  className="border border-zinc-600 border-dashed h-36 rounded-2xl flex items-center justify-center"
                >
                  <BedDouble className="w-16 h-16" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-12 flex flex-col space-y-2">
          <h2 className="text-4xl font-bold">Booking Details</h2>
          <p>Selected Bed(0)</p>
          <div className="bg-zinc-200 w-48 text-center p-2">
            Total Amount: $0
          </div>
          <button className="bg-blue-600 w-48 text-center p-2 text-white rounded-2xl">
            Continue
          </button>
        </div>
      </div>
    </section>
  );
}
