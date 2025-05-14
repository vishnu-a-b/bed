import { Bed, Users } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function BookingStat() {
  return (
    <section className="mt-10 text-center md:px-60 md:mt-32 p-2">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
        Providing Care Where It's Needed Mosts
      </h2>
      <p className="text-sm text-gray-500">
        Every donation goes directly toward providing hospital beds, medical
        care, and recovery support for patients who otherwise could not afford
        it.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:mt-10">
        {/* India Card */}
        <div className="p-6 md:p-12 rounded-2xl shadow-md border">
          <div className="flex justify-between items-start text-left">
            <div>
              <div className="font-bold">India</div>
              <p className="text-sm text-gray-400">Hospital Bed Sponsership</p>
            </div>
            <div className="text-xs bg-blue-200 px-2 py-1 rounded-full text-black">
              ₹60,000
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm font-medium text-gray-700">{50}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${50}%` }}
              ></div>
            </div>

            <div className="mt-2 flex justify-between">
              <div className="text-xs text-gray-500 flex items-center justify-center">
                <Bed className="h-5 w-5 mr-1" />
                50 Beds Sponsored
              </div>
              <div className="text-xs text-gray-500 flex items-center justify-center">
                <Users className="h-5 w-5 mr-1" />
                50 beds remaining
              </div>
            </div>

            <div className="grid grid-cols-2 mt-6 gap-2">
              <button className="bg-blue-600 py-1 text-xs rounded-lg text-white md:py-2">
                View More
              </button>
              <Link
                className="bg-blue-600 py-1 text-xs rounded-lg text-white md:py-2"
                href={"/bookbed?country=ind&b_booked=50&b_rem=30"}
              >
                Donate Now
              </Link>
            </div>
          </div>
        </div>

        {/* Australia Card */}
        <div className="p-6 md:p-12 rounded-2xl shadow-md border">
          <div className="flex justify-between items-start text-left">
            <div>
              <div className="font-bold">Australia</div>
              <p className="text-sm text-gray-400">Hospital Bed Sponsership</p>
            </div>
            <div className="text-xs bg-green-200 px-2 py-1 rounded-full text-black">
              1,200 AUD
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm font-medium text-gray-700">{50}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${80}%` }}
              ></div>
            </div>

            <div className="mt-2 flex justify-between">
              <div className="text-xs text-gray-500 flex items-center justify-center">
                <Bed className="h-5 w-5 mr-1" />
                50 Beds Sponsored
              </div>
              <div className="text-xs text-gray-500 flex items-center justify-center">
                <Users className="h-5 w-5 mr-1" />
                50 beds remaining
              </div>
            </div>

            <div className="grid grid-cols-2 mt-6 gap-2">
              <button className="bg-green-600 py-1 text-xs rounded-lg text-white md:py-2">
                View More
              </button>
              <button className="bg-green-600 py-1 text-xs rounded-lg text-white md:py-2">
                Donate Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
